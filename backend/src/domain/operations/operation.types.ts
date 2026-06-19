export type PurchaseHeader = {
  id: string
  tipoDocId: number
  docNum: number
  proveedorId: string | null
  estadoId: number
  monedaId: number
  fechaDocumento: string
  fechaContabilizacion: string
  fechaVencimiento: string | null
  subtotal: string
  descuentoTotal: string
  impuestosTotal: string
  totalDocumento: string
  comentarios: string | null
  isCanceled: boolean
  docCanceladoId: string | null
  createdBy: string
  approvedBy: string | null
  createdAt: string
  updatedAt: string
}

export type CreatePurchaseHeaderInput = {
  tipoDocId: number
  docNum: number
  proveedorId?: string | null
  estadoId: number
  monedaId: number
  fechaDocumento: string
  fechaContabilizacion?: string
  fechaVencimiento?: string | null
  subtotal?: string
  descuentoTotal?: string
  impuestosTotal?: string
  totalDocumento?: string
  comentarios?: string | null
  isCanceled?: boolean
  docCanceladoId?: string | null
  createdBy: string
  approvedBy?: string | null
}

export type UpdatePurchaseHeaderInput = Partial<CreatePurchaseHeaderInput>

export type PurchaseLine = {
  id: string
  docId: string
  lineNum: number
  articuloId: string
  almacenId: string
  impuestoId: number
  descripcion: string | null
  cantidadTotal: string
  cantidadPendiente: string
  precioUnitario: string
  descuentoLinea: string
  subtotalLinea: string
  totalLinea: string
  baseTipoDocId: number | null
  baseEntry: string | null
  baseLine: number | null
}

export type CreatePurchaseLineInput = {
  docId: string
  lineNum: number
  articuloId: string
  almacenId: string
  impuestoId: number
  descripcion?: string | null
  cantidadTotal?: string
  cantidadPendiente?: string
  precioUnitario?: string
  descuentoLinea?: string
  subtotalLinea?: string
  totalLinea?: string
  baseTipoDocId?: number | null
  baseEntry?: string | null
  baseLine?: number | null
}

export type UpdatePurchaseLineInput = Partial<CreatePurchaseLineInput>

export type InventoryLedger = {
  id: string
  articuloId: string
  almacenId: string
  docReferenciaId: string
  tipoMovimiento: 'IN' | 'OUT'
  cantidad: string
  costoMomento: string
  usuarioId: string
  fecha: string
  comentario: string | null
}

export type CreateInventoryLedgerInput = {
  articuloId: string
  almacenId: string
  docReferenciaId: string
  tipoMovimiento: 'IN' | 'OUT'
  cantidad: string
  costoMomento?: string
  usuarioId: string
  fecha?: string
  comentario?: string | null
}

export type UpdateInventoryLedgerInput = Partial<CreateInventoryLedgerInput>

export type PayableAccount = {
  id: string
  compraId: string
  proveedorId: string
  numeroFactura: string
  montoTotal: string
  saldoPendiente: string
  fechaVencimiento: string
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA'
  createdAt: string
  updatedAt: string
}

export type CreatePayableAccountInput = {
  compraId: string
  proveedorId: string
  numeroFactura: string
  montoTotal?: string
  saldoPendiente?: string
  fechaVencimiento: string
  estado?: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA'
}

export type UpdatePayableAccountInput = Partial<CreatePayableAccountInput>

export type PayablePayment = {
  id: string
  cuentaPorPagarId: string
  proveedorId: string
  monto: string
  fechaPago: string
  referencia: string | null
  createdBy: string
  createdAt: string
}

export type CreatePayablePaymentInput = {
  cuentaPorPagarId: string
  proveedorId: string
  monto: string
  fechaPago: string
  referencia?: string | null
  createdBy: string
}

export type UpdatePayablePaymentInput = Partial<CreatePayablePaymentInput>

export type AuditEvent = {
  id: string
  usuarioId: string
  entidad: string
  entidadId: string | null
  accion: string
  datosAntes: string | null
  datosDespues: string | null
  ipOrigen: string | null
  fecha: string
}
