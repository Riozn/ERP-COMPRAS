import type {
  AuditEvent,
  CreateInventoryLedgerInput,
  CreatePayableAccountInput,
  InventoryLedger,
  PayableAccount,
  PurchaseHeader,
  PurchaseLine,
} from './operation.types.js'

export type PurchaseWorkflowLineInput = {
  articuloId: string
  almacenId: string
  impuestoId: number
  descripcion?: string | null | undefined
  cantidadTotal: string
  precioUnitario: string
  descuentoLinea?: string | undefined
  subtotalLinea?: string | undefined
  totalLinea?: string | undefined
  baseTipoDocId?: number | null | undefined
  baseEntry?: string | null | undefined
  baseLine?: number | null | undefined
}

export type CompletePurchaseInput = {
  createdBy: string
  tipoDocId: number
  docNum: number
  proveedorId: string
  estadoId: number
  monedaId: number
  fechaDocumento: string
  fechaVencimiento?: string | null | undefined
  comentarios?: string | null | undefined
  approvedBy?: string | null | undefined
  numeroFactura?: string | null | undefined
  registrarInventario?: boolean | undefined
  registrarCuentaPorPagar?: boolean | undefined
  lines: PurchaseWorkflowLineInput[]
}

export type PreparedPurchaseWorkflowLineInput = {
  docId: string
  lineNum: number
  articuloId: string
  almacenId: string
  impuestoId: number
  descripcion?: string | null
  cantidadTotal: string
  cantidadPendiente: string
  precioUnitario: string
  descuentoLinea: string
  subtotalLinea: string
  totalLinea: string
  baseTipoDocId?: number | null
  baseEntry?: string | null
  baseLine?: number | null
}

export type PreparedCompletePurchaseInput = {
  createdBy: string
  tipoDocId: number
  docNum: number
  proveedorId: string
  estadoId: number
  monedaId: number
  fechaDocumento: string
  fechaContabilizacion: string
  fechaVencimiento?: string | null
  subtotal: string
  descuentoTotal: string
  impuestosTotal: string
  totalDocumento: string
  comentarios?: string | null
  approvedBy?: string | null
  numeroFactura: string
  registrarInventario: boolean
  registrarCuentaPorPagar: boolean
  lines: PreparedPurchaseWorkflowLineInput[]
}

export type CompletePurchaseResult = {
  purchaseHeader: PurchaseHeader
  purchaseLines: PurchaseLine[]
  inventoryLedger: InventoryLedger[]
  payableAccount: PayableAccount | null
  auditEvent: AuditEvent | null
}

export type PreparedPurchaseLedgerInput = CreateInventoryLedgerInput

export type PreparedPurchaseAccountInput = CreatePayableAccountInput
