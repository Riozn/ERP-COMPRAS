import type { Supplier } from '../suppliers/supplier.types'
import type { Order } from '../orders/orders.types'

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

export type PayableAccountFormValues = {
  compraId: string
  proveedorId: string
  numeroFactura: string
  montoTotal: string
  saldoPendiente: string
  fechaVencimiento: string
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA'
}

export type PayableAccountFormErrors = Partial<Record<keyof PayableAccountFormValues, string>>

export type PayableCatalogs = {
  suppliers: Supplier[]
  orders: Order[]
}

export type PayableAccountListResponse = {
  payableAccounts: PayableAccount[]
}

export type PayableAccountItemResponse = {
  payableAccount: PayableAccount
}

export const emptyPayableAccountFormValues: PayableAccountFormValues = {
  compraId: '',
  proveedorId: '',
  numeroFactura: '',
  montoTotal: '0',
  saldoPendiente: '0',
  fechaVencimiento: new Date().toISOString().slice(0, 10),
  estado: 'PENDIENTE',
}

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

export type PayablePaymentFormValues = {
  cuentaPorPagarId: string
  proveedorId: string
  monto: string
  fechaPago: string
  referencia: string
}

export type PayablePaymentFormErrors = Partial<Record<keyof PayablePaymentFormValues, string>>

export type PayablePaymentListResponse = {
  payablePayments: PayablePayment[]
}

export type PayablePaymentItemResponse = {
  payablePayment: PayablePayment
}

export const emptyPayablePaymentFormValues: PayablePaymentFormValues = {
  cuentaPorPagarId: '',
  proveedorId: '',
  monto: '0',
  fechaPago: new Date().toISOString().slice(0, 10),
  referencia: '',
}
