import { Router, type Request } from 'express'

import type { CrudApplicationService } from '../../../application/crud/crud.service.js'
import type {
  AuditEvent,
  CreateInventoryLedgerInput,
  CreatePayableAccountInput,
  CreatePayablePaymentInput,
  CreatePurchaseHeaderInput,
  CreatePurchaseLineInput,
  InventoryLedger,
  PayableAccount,
  PayablePayment,
  PurchaseHeader,
  PurchaseLine,
  UpdateInventoryLedgerInput,
  UpdatePayableAccountInput,
  UpdatePayablePaymentInput,
  UpdatePurchaseHeaderInput,
  UpdatePurchaseLineInput,
} from '../../../domain/operations/operation.types.js'
import type {
  CompletePurchaseInput,
  PurchaseWorkflowLineInput,
} from '../../../domain/operations/purchase-workflow.types.js'
import type { PurchaseWorkflowApplicationService } from '../../../application/operations/purchase-workflow.service.js'
import { NotFoundError, ValidationError } from '../../../shared/errors/http-error.js'
import { createCrudRoutes, requireValue } from './crud.routes.js'

type AdminOperationServices = {
  purchaseWorkflow: PurchaseWorkflowApplicationService
  purchases: {
    headers: CrudApplicationService<PurchaseHeader, CreatePurchaseHeaderInput, UpdatePurchaseHeaderInput, PurchaseHeader, string>
    lines: CrudApplicationService<PurchaseLine, CreatePurchaseLineInput, UpdatePurchaseLineInput, PurchaseLine, string>
  }
  inventory: {
    ledger: CrudApplicationService<InventoryLedger, CreateInventoryLedgerInput, UpdateInventoryLedgerInput, InventoryLedger, string>
  }
  payables: {
    accounts: CrudApplicationService<PayableAccount, CreatePayableAccountInput, UpdatePayableAccountInput, PayableAccount, string>
    payments: CrudApplicationService<PayablePayment, CreatePayablePaymentInput, UpdatePayablePaymentInput, PayablePayment, string>
  }
  auditEvents: CrudApplicationService<AuditEvent, {
    usuarioId: string
    entidad: string
    entidadId?: string | null
    accion: string
    datosAntes?: string | null
    datosDespues?: string | null
    ipOrigen?: string | null
  }, Partial<{
    usuarioId: string
    entidad: string
    entidadId?: string | null
    accion: string
    datosAntes?: string | null
    datosDespues?: string | null
    ipOrigen?: string | null
  }>, AuditEvent, string>
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown): string | undefined {
  const text = readString(value)
  return text.length > 0 ? text : undefined
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }

  const text = readString(value)
  return text.length > 0 ? text : undefined
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }

  return undefined
}

function readNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readAmountText(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'string') {
    const text = value.trim()
    return text.length > 0 ? text : undefined
  }

  return undefined
}

function readRequiredStringField(value: unknown, message: string): string {
  const text = readString(value)
  if (!text) {
    throw new ValidationError(message)
  }

  return text
}

function parsePurchaseHeaderCreate(req: Request): CreatePurchaseHeaderInput {
  const tipoDocId = readNumber(req.body?.tipoDocId)
  const docNum = readNumber(req.body?.docNum)
  const estadoId = readNumber(req.body?.estadoId)
  const monedaId = readNumber(req.body?.monedaId)

  if (tipoDocId === undefined) throw new ValidationError('tipoDocId es obligatorio.')
  if (docNum === undefined) throw new ValidationError('docNum es obligatorio.')
  if (estadoId === undefined) throw new ValidationError('estadoId es obligatorio.')
  if (monedaId === undefined) throw new ValidationError('monedaId es obligatorio.')

  const payload: CreatePurchaseHeaderInput = {
    tipoDocId,
    docNum,
    estadoId,
    monedaId,
    fechaDocumento: readRequiredStringField(req.body?.fechaDocumento, 'fechaDocumento es obligatorio.'),
    createdBy: readRequiredStringField(req.body?.createdBy, 'createdBy es obligatorio.'),
  }

  const proveedorId = readNullableString(req.body?.proveedorId)
  const fechaContabilizacion = readOptionalString(req.body?.fechaContabilizacion)
  const fechaVencimiento = readNullableString(req.body?.fechaVencimiento)
  const subtotal = readOptionalString(req.body?.subtotal)
  const descuentoTotal = readOptionalString(req.body?.descuentoTotal)
  const impuestosTotal = readOptionalString(req.body?.impuestosTotal)
  const totalDocumento = readOptionalString(req.body?.totalDocumento)
  const comentarios = readNullableString(req.body?.comentarios)
  const isCanceled = readBoolean(req.body?.isCanceled)
  const docCanceladoId = readNullableString(req.body?.docCanceladoId)
  const approvedBy = readNullableString(req.body?.approvedBy)

  if (proveedorId !== undefined) payload.proveedorId = proveedorId
  if (fechaContabilizacion !== undefined) payload.fechaContabilizacion = fechaContabilizacion
  if (fechaVencimiento !== undefined) payload.fechaVencimiento = fechaVencimiento
  if (subtotal !== undefined) payload.subtotal = subtotal
  if (descuentoTotal !== undefined) payload.descuentoTotal = descuentoTotal
  if (impuestosTotal !== undefined) payload.impuestosTotal = impuestosTotal
  if (totalDocumento !== undefined) payload.totalDocumento = totalDocumento
  if (comentarios !== undefined) payload.comentarios = comentarios
  if (isCanceled !== undefined) payload.isCanceled = isCanceled
  if (docCanceladoId !== undefined) payload.docCanceladoId = docCanceladoId
  if (approvedBy !== undefined) payload.approvedBy = approvedBy

  return payload
}

function parsePurchaseHeaderUpdate(req: Request): UpdatePurchaseHeaderInput {
  const payload: UpdatePurchaseHeaderInput = {}
  const tipoDocId = readNumber(req.body?.tipoDocId)
  const docNum = readNumber(req.body?.docNum)
  const estadoId = readNumber(req.body?.estadoId)
  const monedaId = readNumber(req.body?.monedaId)

  if (tipoDocId !== undefined) payload.tipoDocId = tipoDocId
  if (docNum !== undefined) payload.docNum = docNum
  if (estadoId !== undefined) payload.estadoId = estadoId
  if (monedaId !== undefined) payload.monedaId = monedaId

  const fechaDocumento = readOptionalString(req.body?.fechaDocumento)
  const createdBy = readOptionalString(req.body?.createdBy)
  const fechaContabilizacion = readOptionalString(req.body?.fechaContabilizacion)

  if (fechaDocumento !== undefined) payload.fechaDocumento = fechaDocumento
  if (createdBy !== undefined) payload.createdBy = createdBy
  if (fechaContabilizacion !== undefined) payload.fechaContabilizacion = fechaContabilizacion

  const proveedorId = readNullableString(req.body?.proveedorId)
  const fechaVencimiento = readNullableString(req.body?.fechaVencimiento)
  const subtotal = readOptionalString(req.body?.subtotal)
  const descuentoTotal = readOptionalString(req.body?.descuentoTotal)
  const impuestosTotal = readOptionalString(req.body?.impuestosTotal)
  const totalDocumento = readOptionalString(req.body?.totalDocumento)
  const comentarios = readNullableString(req.body?.comentarios)
  const isCanceled = readBoolean(req.body?.isCanceled)
  const docCanceladoId = readNullableString(req.body?.docCanceladoId)
  const approvedBy = readNullableString(req.body?.approvedBy)

  if (proveedorId !== undefined) payload.proveedorId = proveedorId
  if (fechaVencimiento !== undefined) payload.fechaVencimiento = fechaVencimiento
  if (subtotal !== undefined) payload.subtotal = subtotal
  if (descuentoTotal !== undefined) payload.descuentoTotal = descuentoTotal
  if (impuestosTotal !== undefined) payload.impuestosTotal = impuestosTotal
  if (totalDocumento !== undefined) payload.totalDocumento = totalDocumento
  if (comentarios !== undefined) payload.comentarios = comentarios
  if (isCanceled !== undefined) payload.isCanceled = isCanceled
  if (docCanceladoId !== undefined) payload.docCanceladoId = docCanceladoId
  if (approvedBy !== undefined) payload.approvedBy = approvedBy

  return payload
}

function parsePurchaseLineCreate(req: Request): CreatePurchaseLineInput {
  const docId = readRequiredStringField(req.body?.docId, 'docId es obligatorio.')
  const lineNum = readNumber(req.body?.lineNum)
  const articuloId = readRequiredStringField(req.body?.articuloId, 'articuloId es obligatorio.')
  const almacenId = readRequiredStringField(req.body?.almacenId, 'almacenId es obligatorio.')
  const impuestoId = readNumber(req.body?.impuestoId)

  if (lineNum === undefined) throw new ValidationError('lineNum es obligatorio.')
  if (impuestoId === undefined) throw new ValidationError('impuestoId es obligatorio.')

  const payload: CreatePurchaseLineInput = {
    docId,
    lineNum,
    articuloId,
    almacenId,
    impuestoId,
  }

  const descripcion = readNullableString(req.body?.descripcion)
  const cantidadTotal = readOptionalString(req.body?.cantidadTotal)
  const cantidadPendiente = readOptionalString(req.body?.cantidadPendiente)
  const precioUnitario = readOptionalString(req.body?.precioUnitario)
  const descuentoLinea = readOptionalString(req.body?.descuentoLinea)
  const subtotalLinea = readOptionalString(req.body?.subtotalLinea)
  const totalLinea = readOptionalString(req.body?.totalLinea)
  const baseTipoDocId = readNumber(req.body?.baseTipoDocId)
  const baseEntry = readNullableString(req.body?.baseEntry)
  const baseLine = readNumber(req.body?.baseLine)

  if (descripcion !== undefined) payload.descripcion = descripcion
  if (cantidadTotal !== undefined) payload.cantidadTotal = cantidadTotal
  if (cantidadPendiente !== undefined) payload.cantidadPendiente = cantidadPendiente
  if (precioUnitario !== undefined) payload.precioUnitario = precioUnitario
  if (descuentoLinea !== undefined) payload.descuentoLinea = descuentoLinea
  if (subtotalLinea !== undefined) payload.subtotalLinea = subtotalLinea
  if (totalLinea !== undefined) payload.totalLinea = totalLinea
  if (baseTipoDocId !== undefined) payload.baseTipoDocId = baseTipoDocId
  if (baseEntry !== undefined) payload.baseEntry = baseEntry
  if (baseLine !== undefined) payload.baseLine = baseLine

  return payload
}

function parsePurchaseLineUpdate(req: Request): UpdatePurchaseLineInput {
  const payload: UpdatePurchaseLineInput = {}
  const docId = readOptionalString(req.body?.docId)
  const lineNum = readNumber(req.body?.lineNum)
  const articuloId = readOptionalString(req.body?.articuloId)
  const almacenId = readOptionalString(req.body?.almacenId)
  const impuestoId = readNumber(req.body?.impuestoId)
  const descripcion = readNullableString(req.body?.descripcion)
  const cantidadTotal = readOptionalString(req.body?.cantidadTotal)
  const cantidadPendiente = readOptionalString(req.body?.cantidadPendiente)
  const precioUnitario = readOptionalString(req.body?.precioUnitario)
  const descuentoLinea = readOptionalString(req.body?.descuentoLinea)
  const subtotalLinea = readOptionalString(req.body?.subtotalLinea)
  const totalLinea = readOptionalString(req.body?.totalLinea)
  const baseTipoDocId = readNumber(req.body?.baseTipoDocId)
  const baseEntry = readNullableString(req.body?.baseEntry)
  const baseLine = readNumber(req.body?.baseLine)

  if (docId !== undefined) payload.docId = docId
  if (lineNum !== undefined) payload.lineNum = lineNum
  if (articuloId !== undefined) payload.articuloId = articuloId
  if (almacenId !== undefined) payload.almacenId = almacenId
  if (impuestoId !== undefined) payload.impuestoId = impuestoId
  if (descripcion !== undefined) payload.descripcion = descripcion
  if (cantidadTotal !== undefined) payload.cantidadTotal = cantidadTotal
  if (cantidadPendiente !== undefined) payload.cantidadPendiente = cantidadPendiente
  if (precioUnitario !== undefined) payload.precioUnitario = precioUnitario
  if (descuentoLinea !== undefined) payload.descuentoLinea = descuentoLinea
  if (subtotalLinea !== undefined) payload.subtotalLinea = subtotalLinea
  if (totalLinea !== undefined) payload.totalLinea = totalLinea
  if (baseTipoDocId !== undefined) payload.baseTipoDocId = baseTipoDocId
  if (baseEntry !== undefined) payload.baseEntry = baseEntry
  if (baseLine !== undefined) payload.baseLine = baseLine

  return payload
}

function parseInventoryLedgerCreate(req: Request): CreateInventoryLedgerInput {
  const articuloId = readRequiredStringField(req.body?.articuloId, 'articuloId es obligatorio.')
  const almacenId = readRequiredStringField(req.body?.almacenId, 'almacenId es obligatorio.')
  const docReferenciaId = readRequiredStringField(req.body?.docReferenciaId, 'docReferenciaId es obligatorio.')
  const tipoMovimiento = readRequiredStringField(req.body?.tipoMovimiento, 'tipoMovimiento es obligatorio.')
  const cantidad = readRequiredStringField(req.body?.cantidad, 'cantidad es obligatoria.')
  const usuarioId = readRequiredStringField(req.body?.usuarioId, 'usuarioId es obligatorio.')

  if (tipoMovimiento !== 'IN' && tipoMovimiento !== 'OUT') {
    throw new ValidationError('tipoMovimiento debe ser IN o OUT.')
  }

  const payload: CreateInventoryLedgerInput = {
    articuloId,
    almacenId,
    docReferenciaId,
    tipoMovimiento,
    cantidad,
    usuarioId,
  }

  const costoMomento = readOptionalString(req.body?.costoMomento)
  const fecha = readOptionalString(req.body?.fecha)
  const comentario = readNullableString(req.body?.comentario)

  if (costoMomento !== undefined) payload.costoMomento = costoMomento
  if (fecha !== undefined) payload.fecha = fecha
  if (comentario !== undefined) payload.comentario = comentario

  return payload
}

function parseInventoryLedgerUpdate(req: Request): UpdateInventoryLedgerInput {
  const payload: UpdateInventoryLedgerInput = {}
  const articuloId = readOptionalString(req.body?.articuloId)
  const almacenId = readOptionalString(req.body?.almacenId)
  const docReferenciaId = readOptionalString(req.body?.docReferenciaId)
  const tipoMovimiento = readOptionalString(req.body?.tipoMovimiento)
  const cantidad = readOptionalString(req.body?.cantidad)
  const usuarioId = readOptionalString(req.body?.usuarioId)
  const costoMomento = readOptionalString(req.body?.costoMomento)
  const fecha = readOptionalString(req.body?.fecha)
  const comentario = readNullableString(req.body?.comentario)

  if (tipoMovimiento && tipoMovimiento !== 'IN' && tipoMovimiento !== 'OUT') {
    throw new ValidationError('tipoMovimiento debe ser IN o OUT.')
  }

  if (articuloId !== undefined) payload.articuloId = articuloId
  if (almacenId !== undefined) payload.almacenId = almacenId
  if (docReferenciaId !== undefined) payload.docReferenciaId = docReferenciaId
  if (tipoMovimiento !== undefined) payload.tipoMovimiento = tipoMovimiento as 'IN' | 'OUT'
  if (cantidad !== undefined) payload.cantidad = cantidad
  if (usuarioId !== undefined) payload.usuarioId = usuarioId
  if (costoMomento !== undefined) payload.costoMomento = costoMomento
  if (fecha !== undefined) payload.fecha = fecha
  if (comentario !== undefined) payload.comentario = comentario

  return payload
}

function parsePayableAccountCreate(req: Request): CreatePayableAccountInput {
  const compraId = readRequiredStringField(req.body?.compraId, 'compraId es obligatorio.')
  const proveedorId = readRequiredStringField(req.body?.proveedorId, 'proveedorId es obligatorio.')
  const numeroFactura = readRequiredStringField(req.body?.numeroFactura, 'numeroFactura es obligatorio.')
  const fechaVencimiento = readRequiredStringField(req.body?.fechaVencimiento, 'fechaVencimiento es obligatoria.')

  const payload: CreatePayableAccountInput = {
    compraId,
    proveedorId,
    numeroFactura,
    fechaVencimiento,
  }

  const montoTotal = readOptionalString(req.body?.montoTotal)
  const saldoPendiente = readOptionalString(req.body?.saldoPendiente)
  const estado = readOptionalString(req.body?.estado)

  if (montoTotal !== undefined) payload.montoTotal = montoTotal
  if (saldoPendiente !== undefined) payload.saldoPendiente = saldoPendiente
  if (estado && ['PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA'].includes(estado)) {
    payload.estado = estado as NonNullable<CreatePayableAccountInput['estado']>
  }

  return payload
}

function parsePayableAccountUpdate(req: Request): UpdatePayableAccountInput {
  const payload: UpdatePayableAccountInput = {}
  const compraId = readOptionalString(req.body?.compraId)
  const proveedorId = readOptionalString(req.body?.proveedorId)
  const numeroFactura = readOptionalString(req.body?.numeroFactura)
  const montoTotal = readOptionalString(req.body?.montoTotal)
  const saldoPendiente = readOptionalString(req.body?.saldoPendiente)
  const fechaVencimiento = readOptionalString(req.body?.fechaVencimiento)
  const estado = readOptionalString(req.body?.estado)

  if (compraId !== undefined) payload.compraId = compraId
  if (proveedorId !== undefined) payload.proveedorId = proveedorId
  if (numeroFactura !== undefined) payload.numeroFactura = numeroFactura
  if (montoTotal !== undefined) payload.montoTotal = montoTotal
  if (saldoPendiente !== undefined) payload.saldoPendiente = saldoPendiente
  if (fechaVencimiento !== undefined) payload.fechaVencimiento = fechaVencimiento
  if (estado && ['PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA'].includes(estado)) {
    payload.estado = estado as NonNullable<UpdatePayableAccountInput['estado']>
  }

  return payload
}

function parsePayablePaymentCreate(req: Request): CreatePayablePaymentInput {
  const cuentaPorPagarId = readRequiredStringField(req.body?.cuentaPorPagarId, 'cuentaPorPagarId es obligatorio.')
  const proveedorId = readRequiredStringField(req.body?.proveedorId, 'proveedorId es obligatorio.')
  const monto = readRequiredStringField(req.body?.monto, 'monto es obligatorio.')
  const fechaPago = readRequiredStringField(req.body?.fechaPago, 'fechaPago es obligatorio.')
  const createdBy = readRequiredStringField(req.body?.createdBy, 'createdBy es obligatorio.')

  const payload: CreatePayablePaymentInput = {
    cuentaPorPagarId,
    proveedorId,
    monto,
    fechaPago,
    createdBy,
  }

  const referencia = readNullableString(req.body?.referencia)
  if (referencia !== undefined) payload.referencia = referencia

  return payload
}

function parsePayablePaymentUpdate(req: Request): UpdatePayablePaymentInput {
  const payload: UpdatePayablePaymentInput = {}
  const cuentaPorPagarId = readOptionalString(req.body?.cuentaPorPagarId)
  const proveedorId = readOptionalString(req.body?.proveedorId)
  const monto = readOptionalString(req.body?.monto)
  const fechaPago = readOptionalString(req.body?.fechaPago)
  const createdBy = readOptionalString(req.body?.createdBy)
  const referencia = readNullableString(req.body?.referencia)

  if (cuentaPorPagarId !== undefined) payload.cuentaPorPagarId = cuentaPorPagarId
  if (proveedorId !== undefined) payload.proveedorId = proveedorId
  if (monto !== undefined) payload.monto = monto
  if (fechaPago !== undefined) payload.fechaPago = fechaPago
  if (createdBy !== undefined) payload.createdBy = createdBy
  if (referencia !== undefined) payload.referencia = referencia

  return payload
}

function parseAuditEventCreate(): never {
  throw new ValidationError('Los eventos de auditoria no se crean manualmente.')
}

function parseAuditEventUpdate(): never {
  throw new ValidationError('Los eventos de auditoria no se actualizan manualmente.')
}

function parseCompletePurchaseInput(req: Request): CompletePurchaseInput {
  if (!req.auth) {
    throw new ValidationError('La autenticacion es obligatoria.')
  }

  const lines = (Array.isArray(req.body?.lines) ? req.body.lines : []) as Record<string, unknown>[]
  if (!lines.length) {
    throw new ValidationError('La compra debe incluir al menos una linea.')
  }

  const tipoDocId = readNumber(req.body?.tipoDocId)
  const docNum = readNumber(req.body?.docNum)
  const estadoId = readNumber(req.body?.estadoId)
  const monedaId = readNumber(req.body?.monedaId)

  if (tipoDocId === undefined) throw new ValidationError('tipoDocId es obligatorio.')
  if (docNum === undefined) throw new ValidationError('docNum es obligatorio.')
  if (estadoId === undefined) throw new ValidationError('estadoId es obligatorio.')
  if (monedaId === undefined) throw new ValidationError('monedaId es obligatorio.')

  return {
    createdBy: req.auth.sub,
    tipoDocId,
    docNum,
    proveedorId: readRequiredStringField(req.body?.proveedorId, 'proveedorId es obligatorio.'),
    estadoId,
    monedaId,
    fechaDocumento: readRequiredStringField(req.body?.fechaDocumento, 'fechaDocumento es obligatorio.'),
    fechaVencimiento: readNullableString(req.body?.fechaVencimiento),
    comentarios: readNullableString(req.body?.comentarios),
    approvedBy: readNullableString(req.body?.approvedBy),
    numeroFactura: readNullableString(req.body?.numeroFactura),
    registrarInventario: readBoolean(req.body?.registrarInventario),
    registrarCuentaPorPagar: readBoolean(req.body?.registrarCuentaPorPagar),
    lines: lines.map((line): PurchaseWorkflowLineInput => {
      const articuloId = readRequiredStringField(line?.articuloId, 'articuloId es obligatorio.')
      const almacenId = readRequiredStringField(line?.almacenId, 'almacenId es obligatorio.')
      const impuestoId = readNumber(line?.impuestoId)
      const cantidadTotal = readAmountText(line?.cantidadTotal)
      const precioUnitario = readAmountText(line?.precioUnitario)

      if (impuestoId === undefined) throw new ValidationError('impuestoId es obligatorio.')
      if (!cantidadTotal) throw new ValidationError('cantidadTotal es obligatoria.')
      if (!precioUnitario) throw new ValidationError('precioUnitario es obligatorio.')

      const descripcion = readNullableString(line?.descripcion)
      const descuentoLinea = readAmountText(line?.descuentoLinea)
      const subtotalLinea = readAmountText(line?.subtotalLinea)
      const totalLinea = readAmountText(line?.totalLinea)
      const baseTipoDocId = readNumber(line?.baseTipoDocId)
      const baseEntry = readNullableString(line?.baseEntry)
      const baseLine = readNumber(line?.baseLine)

      return {
        articuloId,
        almacenId,
        impuestoId,
        descripcion,
        cantidadTotal,
        precioUnitario,
        descuentoLinea,
        subtotalLinea,
        totalLinea,
        baseTipoDocId,
        baseEntry,
        baseLine,
      }
    }),
  }
}

export function createAdminOperationsRoutes(services: AdminOperationServices): Router {
  const router = Router()

  router.post('/purchases/complete', async (req, res) => {
    const input = parseCompletePurchaseInput(req)
    const result = await services.purchaseWorkflow.completePurchase(input)
    res.status(201).json(result)
  })

  router.use(
    '/purchases/headers',
    createCrudRoutes(services.purchases.headers, {
      itemKey: 'purchaseHeader',
      itemsKey: 'purchaseHeaders',
      parseId: (value) => value.trim(),
      parseCreate: parsePurchaseHeaderCreate,
      parseUpdate: parsePurchaseHeaderUpdate,
      validateCreate: (input) => {
        requireValue(input.tipoDocId, 'tipoDocId es obligatorio.')
        requireValue(input.docNum, 'docNum es obligatorio.')
        requireValue(input.estadoId, 'estadoId es obligatorio.')
        requireValue(input.monedaId, 'monedaId es obligatorio.')
      },
    }),
  )

  router.use(
    '/purchases/lines',
    createCrudRoutes(services.purchases.lines, {
      itemKey: 'purchaseLine',
      itemsKey: 'purchaseLines',
      parseId: (value) => value.trim(),
      parseCreate: parsePurchaseLineCreate,
      parseUpdate: parsePurchaseLineUpdate,
      validateCreate: (input) => {
        requireValue(input.docId, 'docId es obligatorio.')
        requireValue(input.lineNum, 'lineNum es obligatorio.')
        requireValue(input.articuloId, 'articuloId es obligatorio.')
        requireValue(input.almacenId, 'almacenId es obligatorio.')
        requireValue(input.impuestoId, 'impuestoId es obligatorio.')
      },
    }),
  )

  router.use(
    '/inventory/ledger',
    createCrudRoutes(services.inventory.ledger, {
      itemKey: 'inventoryLedger',
      itemsKey: 'inventoryLedger',
      parseId: (value) => value.trim(),
      parseCreate: parseInventoryLedgerCreate,
      parseUpdate: parseInventoryLedgerUpdate,
      validateCreate: (input) => {
        requireValue(input.articuloId, 'articuloId es obligatorio.')
        requireValue(input.almacenId, 'almacenId es obligatorio.')
        requireValue(input.docReferenciaId, 'docReferenciaId es obligatorio.')
        requireValue(input.tipoMovimiento, 'tipoMovimiento es obligatorio.')
        requireValue(input.cantidad, 'cantidad es obligatorio.')
        requireValue(input.usuarioId, 'usuarioId es obligatorio.')
      },
    }),
  )

  router.use(
    '/payables/accounts',
    createCrudRoutes(services.payables.accounts, {
      itemKey: 'payableAccount',
      itemsKey: 'payableAccounts',
      parseId: (value) => value.trim(),
      parseCreate: parsePayableAccountCreate,
      parseUpdate: parsePayableAccountUpdate,
      validateCreate: (input) => {
        requireValue(input.compraId, 'compraId es obligatorio.')
        requireValue(input.proveedorId, 'proveedorId es obligatorio.')
        requireValue(input.numeroFactura, 'numeroFactura es obligatorio.')
        requireValue(input.fechaVencimiento, 'fechaVencimiento es obligatorio.')
      },
    }),
  )

  router.use(
    '/payables/payments',
    createCrudRoutes(services.payables.payments, {
      itemKey: 'payablePayment',
      itemsKey: 'payablePayments',
      parseId: (value) => value.trim(),
      parseCreate: parsePayablePaymentCreate,
      parseUpdate: parsePayablePaymentUpdate,
      validateCreate: (input) => {
        requireValue(input.cuentaPorPagarId, 'cuentaPorPagarId es obligatorio.')
        requireValue(input.proveedorId, 'proveedorId es obligatorio.')
        requireValue(input.monto, 'monto es obligatorio.')
        requireValue(input.fechaPago, 'fechaPago es obligatorio.')
        requireValue(input.createdBy, 'createdBy es obligatorio.')
      },
    }),
  )

  router.get('/audit/events', async (_req, res) => {
    const events = await services.auditEvents.list()
    res.json({ auditEvents: events })
  })

  router.get('/audit/events/:id', async (req, res) => {
    const event = await services.auditEvents.getById(req.params.id.trim())
    if (!event) {
      throw new NotFoundError('Evento de auditoria no encontrado.')
    }

    res.json({ auditEvent: event })
  })

  return router
}
