import type { ReferenceCatalogs } from '../../core/auth/auth.types'
import type { Supplier } from '../suppliers/supplier.types'

export type Order = {
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

export type OrderFormValues = {
  tipoDocId: string
  docNum: string
  proveedorId: string
  estadoId: string
  monedaId: string
  fechaDocumento: string
  fechaVencimiento: string
  subtotal: string
  descuentoTotal: string
  impuestosTotal: string
  totalDocumento: string
  comentarios: string
  isCanceled: boolean
}

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>

export type OrderCatalogs = Pick<ReferenceCatalogs, 'tiposDocumento' | 'estadosDocumento' | 'monedas'> & {
  suppliers: Supplier[]
}

export type OrderListResponse = {
  purchaseHeaders: Order[]
}

export type OrderItemResponse = {
  purchaseHeader: Order
}

export const emptyOrderFormValues: OrderFormValues = {
  tipoDocId: '',
  docNum: '',
  proveedorId: '',
  estadoId: '',
  monedaId: '',
  fechaDocumento: new Date().toISOString().slice(0, 10),
  fechaVencimiento: '',
  subtotal: '0',
  descuentoTotal: '0',
  impuestosTotal: '0',
  totalDocumento: '0',
  comentarios: '',
  isCanceled: false,
}
