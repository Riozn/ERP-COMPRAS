import type { DataSource } from 'typeorm'

import type { PurchaseWorkflowRepository } from '../../../domain/repositories/purchase-workflow.repository.js'
import type {
  CompletePurchaseResult,
  PreparedCompletePurchaseInput,
} from '../../../domain/operations/purchase-workflow.types.js'
import {
  createAuditEventRepository,
  createInventoryLedgerRepository,
  createPayableAccountRepository,
  createPurchaseHeaderRepository,
  createPurchaseLineRepository,
} from './resource.repositories.js'

export class TypeormPurchaseWorkflowRepository implements PurchaseWorkflowRepository {
  constructor(private readonly dataSource: DataSource) {}

  async completePurchase(input: PreparedCompletePurchaseInput): Promise<CompletePurchaseResult> {
    return this.dataSource.transaction(async (manager) => {
      const headerRepository = createPurchaseHeaderRepository(manager)
      const lineRepository = createPurchaseLineRepository(manager)
      const inventoryRepository = createInventoryLedgerRepository(manager)
      const payableAccountRepository = createPayableAccountRepository(manager)
      const auditRepository = createAuditEventRepository(manager)

      const purchaseHeader = await headerRepository.create({
        tipoDocId: input.tipoDocId,
        docNum: input.docNum,
        proveedorId: input.proveedorId,
        estadoId: input.estadoId,
        monedaId: input.monedaId,
        fechaDocumento: input.fechaDocumento,
        fechaContabilizacion: input.fechaContabilizacion,
        fechaVencimiento: input.fechaVencimiento ?? null,
        subtotal: input.subtotal,
        descuentoTotal: input.descuentoTotal,
        impuestosTotal: input.impuestosTotal,
        totalDocumento: input.totalDocumento,
        comentarios: input.comentarios ?? null,
        isCanceled: false,
        docCanceladoId: null,
        createdBy: input.createdBy,
        approvedBy: input.approvedBy ?? null,
      })

      const purchaseLines: CompletePurchaseResult['purchaseLines'] = []
      const inventoryLedger: CompletePurchaseResult['inventoryLedger'] = []

      for (const line of input.lines) {
        const createdLine = await lineRepository.create({
          ...line,
          docId: purchaseHeader.id,
        })
        purchaseLines.push(createdLine)

        if (input.registrarInventario) {
          const createdLedger = await inventoryRepository.create({
            articuloId: line.articuloId,
            almacenId: line.almacenId,
            docReferenciaId: purchaseHeader.id,
            tipoMovimiento: 'IN',
            cantidad: line.cantidadTotal,
            costoMomento: line.totalLinea,
            usuarioId: input.createdBy,
            fecha: input.fechaContabilizacion,
            comentario: line.descripcion ?? input.comentarios ?? null,
          })
          inventoryLedger.push(createdLedger)
        }
      }

      let payableAccount: CompletePurchaseResult['payableAccount'] = null
      if (input.registrarCuentaPorPagar) {
        payableAccount = await payableAccountRepository.create({
          compraId: purchaseHeader.id,
          proveedorId: input.proveedorId,
          numeroFactura: input.numeroFactura,
          montoTotal: input.totalDocumento,
          saldoPendiente: input.totalDocumento,
          fechaVencimiento: input.fechaVencimiento ?? input.fechaDocumento,
          estado: 'PENDIENTE',
        })
      }

      const auditEvent = await auditRepository.create({
        usuarioId: input.createdBy,
        entidad: 'COMPRA',
        entidadId: purchaseHeader.id,
        accion: 'COMPLETE_PURCHASE',
        datosAntes: null,
        datosDespues: JSON.stringify({
          purchaseHeader,
          purchaseLines,
          inventoryLedger,
          payableAccount,
        }),
        ipOrigen: null,
      })

      return {
        purchaseHeader,
        purchaseLines,
        inventoryLedger,
        payableAccount,
        auditEvent,
      }
    })
  }
}
