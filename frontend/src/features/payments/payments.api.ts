import { requestJson } from '../../core/http/apiClient'
import type {
  Payment,
  PaymentFormValues,
  PaymentItemResponse,
  PaymentListResponse,
} from './payments.types'

function toPayload(values: PaymentFormValues, createdBy?: string) {
  return {
    cuentaPorPagarId: values.cuentaPorPagarId.trim(),
    proveedorId: values.proveedorId.trim(),
    monto: values.monto.trim() || '0',
    fechaPago: values.fechaPago,
    referencia: values.referencia.trim() || null,
    createdBy,
  }
}

export function fetchPayments(): Promise<Payment[]> {
  return requestJson<PaymentListResponse>('/admin/operations/payables/payments').then(
    (response) => response.payablePayments,
  )
}

export function createPayment(values: PaymentFormValues, createdBy: string): Promise<Payment> {
  return requestJson<PaymentItemResponse>('/admin/operations/payables/payments', {
    method: 'POST',
    body: toPayload(values, createdBy),
  }).then((response) => response.payablePayment)
}

export function updatePayment(id: string, values: PaymentFormValues): Promise<Payment> {
  return requestJson<PaymentItemResponse>(`/admin/operations/payables/payments/${id}`, {
    method: 'PATCH',
    body: toPayload(values),
  }).then((response) => response.payablePayment)
}

export function deletePayment(id: string): Promise<void> {
  return requestJson<void>(`/admin/operations/payables/payments/${id}`, {
    method: 'DELETE',
  })
}
