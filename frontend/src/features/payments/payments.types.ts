import type { Supplier } from '../suppliers/supplier.types'
import type { PayableAccount } from '../payables/payables.types'

export type Payment = {
  id: string
  cuentaPorPagarId: string
  proveedorId: string
  monto: string
  fechaPago: string
  referencia: string | null
  createdBy: string
  createdAt: string
}

export type PaymentFormValues = {
  cuentaPorPagarId: string
  proveedorId: string
  monto: string
  fechaPago: string
  referencia: string
}

export type PaymentFormErrors = Partial<Record<keyof PaymentFormValues, string>>

export type PaymentCatalogs = {
  suppliers: Supplier[]
  accounts: PayableAccount[]
}

export type PaymentListResponse = {
  payablePayments: Payment[]
}

export type PaymentItemResponse = {
  payablePayment: Payment
}

export const emptyPaymentFormValues: PaymentFormValues = {
  cuentaPorPagarId: '',
  proveedorId: '',
  monto: '0',
  fechaPago: new Date().toISOString().slice(0, 10),
  referencia: '',
}
