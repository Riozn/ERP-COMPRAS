import { requestJson } from '../../core/http/apiClient'
import type {
  PayableAccount,
  PayableAccountFormValues,
  PayableAccountItemResponse,
  PayableAccountListResponse,
  PayablePayment,
  PayablePaymentFormValues,
  PayablePaymentItemResponse,
  PayablePaymentListResponse,
} from './payables.types'

function toAccountPayload(values: PayableAccountFormValues) {
  return {
    compraId: values.compraId.trim(),
    proveedorId: values.proveedorId.trim(),
    numeroFactura: values.numeroFactura.trim(),
    montoTotal: values.montoTotal.trim() || '0',
    saldoPendiente: values.saldoPendiente.trim() || '0',
    fechaVencimiento: values.fechaVencimiento,
    estado: values.estado,
  }
}

function toPaymentPayload(values: PayablePaymentFormValues, createdBy?: string) {
  return {
    cuentaPorPagarId: values.cuentaPorPagarId.trim(),
    proveedorId: values.proveedorId.trim(),
    monto: values.monto.trim() || '0',
    fechaPago: values.fechaPago,
    referencia: values.referencia.trim() || null,
    createdBy,
  }
}

export function fetchPayableAccounts(): Promise<PayableAccount[]> {
  return requestJson<PayableAccountListResponse>('/admin/operations/payables/accounts').then(
    (response) => response.payableAccounts,
  )
}

export function createPayableAccount(values: PayableAccountFormValues): Promise<PayableAccount> {
  return requestJson<PayableAccountItemResponse>('/admin/operations/payables/accounts', {
    method: 'POST',
    body: toAccountPayload(values),
  }).then((response) => response.payableAccount)
}

export function updatePayableAccount(id: string, values: PayableAccountFormValues): Promise<PayableAccount> {
  return requestJson<PayableAccountItemResponse>(`/admin/operations/payables/accounts/${id}`, {
    method: 'PATCH',
    body: toAccountPayload(values),
  }).then((response) => response.payableAccount)
}

export function deletePayableAccount(id: string): Promise<void> {
  return requestJson<void>(`/admin/operations/payables/accounts/${id}`, {
    method: 'DELETE',
  })
}

export function fetchPayablePayments(): Promise<PayablePayment[]> {
  return requestJson<PayablePaymentListResponse>('/admin/operations/payables/payments').then(
    (response) => response.payablePayments,
  )
}

export function createPayablePayment(values: PayablePaymentFormValues, createdBy: string): Promise<PayablePayment> {
  return requestJson<PayablePaymentItemResponse>('/admin/operations/payables/payments', {
    method: 'POST',
    body: toPaymentPayload(values, createdBy),
  }).then((response) => response.payablePayment)
}

export function updatePayablePayment(id: string, values: PayablePaymentFormValues): Promise<PayablePayment> {
  return requestJson<PayablePaymentItemResponse>(`/admin/operations/payables/payments/${id}`, {
    method: 'PATCH',
    body: toPaymentPayload(values),
  }).then((response) => response.payablePayment)
}

export function deletePayablePayment(id: string): Promise<void> {
  return requestJson<void>(`/admin/operations/payables/payments/${id}`, {
    method: 'DELETE',
  })
}
