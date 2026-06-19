import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

import type {
  CompletePurchaseResult,
  PreparedCompletePurchaseInput,
} from '../src/domain/operations/purchase-workflow.types.js'
import type { PurchaseWorkflowRepository } from '../src/domain/repositories/purchase-workflow.repository.js'
import { PurchaseWorkflowApplicationService } from '../src/application/operations/purchase-workflow.service.js'

class MemoryPurchaseWorkflowRepository implements PurchaseWorkflowRepository {
  captured: PreparedCompletePurchaseInput | null = null

  async completePurchase(input: PreparedCompletePurchaseInput): Promise<CompletePurchaseResult> {
    this.captured = input

    const now = new Date().toISOString()

    return {
      purchaseHeader: {
        id: randomUUID(),
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
        createdAt: now,
        updatedAt: now,
      },
      purchaseLines: input.lines.map((line) => ({
        id: randomUUID(),
        ...line,
      })),
      inventoryLedger: input.registrarInventario
        ? input.lines.map((line) => ({
            id: randomUUID(),
            articuloId: line.articuloId,
            almacenId: line.almacenId,
            docReferenciaId: 'header-id',
            tipoMovimiento: 'IN' as const,
            cantidad: line.cantidadTotal,
            costoMomento: line.totalLinea,
            usuarioId: input.createdBy,
            fecha: input.fechaContabilizacion,
            comentario: line.descripcion ?? input.comentarios ?? null,
          }))
        : [],
      payableAccount: input.registrarCuentaPorPagar
        ? {
            id: randomUUID(),
            compraId: 'header-id',
            proveedorId: input.proveedorId,
            numeroFactura: input.numeroFactura,
            montoTotal: input.totalDocumento,
            saldoPendiente: input.totalDocumento,
            fechaVencimiento: input.fechaVencimiento ?? input.fechaDocumento,
            estado: 'PENDIENTE' as const,
            createdAt: now,
            updatedAt: now,
          }
        : null,
      auditEvent: {
        id: randomUUID(),
        usuarioId: input.createdBy,
        entidad: 'COMPRA',
        entidadId: 'header-id',
        accion: 'COMPLETE_PURCHASE',
        datosAntes: null,
        datosDespues: null,
        ipOrigen: null,
        fecha: now,
      },
    }
  }
}

test('purchase workflow calculates totals and prepares the transactional plan', async () => {
  const repository = new MemoryPurchaseWorkflowRepository()
  const service = new PurchaseWorkflowApplicationService(repository)

  const result = await service.completePurchase({
    createdBy: 'user-1',
    tipoDocId: 11,
    docNum: 1001,
    proveedorId: 'supplier-1',
    estadoId: 2,
    monedaId: 1,
    fechaDocumento: '2026-06-17',
    numeroFactura: 'F-1001',
    lines: [
      {
        articuloId: 'item-1',
        almacenId: 'WH-1',
        impuestoId: 5,
        cantidadTotal: '2',
        precioUnitario: '10',
        descuentoLinea: '1',
      },
      {
        articuloId: 'item-2',
        almacenId: 'WH-1',
        impuestoId: 5,
        cantidadTotal: '1',
        precioUnitario: '5',
        subtotalLinea: '5',
        totalLinea: '6',
      },
    ],
  })

  assert.equal(result.purchaseHeader.totalDocumento, '25.00')
  assert.equal(result.purchaseHeader.subtotal, '25.00')
  assert.equal(result.inventoryLedger.length, 2)
  assert.equal(result.payableAccount?.montoTotal, '25.00')
  assert.equal(repository.captured?.registrarInventario, true)
  assert.equal(repository.captured?.registrarCuentaPorPagar, true)
  assert.equal(repository.captured?.lines[0]?.lineNum, 1)
  assert.equal(repository.captured?.lines[0]?.cantidadPendiente, '2.0000')
})

test('purchase workflow rejects empty line lists', async () => {
  const repository = new MemoryPurchaseWorkflowRepository()
  const service = new PurchaseWorkflowApplicationService(repository)

  await assert.rejects(
    () =>
      service.completePurchase({
        createdBy: 'user-1',
        tipoDocId: 11,
        docNum: 1002,
        proveedorId: 'supplier-1',
        estadoId: 2,
        monedaId: 1,
        fechaDocumento: '2026-06-17',
        lines: [],
      }),
    /al menos una linea/,
  )
})
