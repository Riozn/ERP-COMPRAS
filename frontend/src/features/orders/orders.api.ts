import { requestJson } from '../../core/http/apiClient'
import type { Order, OrderFormValues, OrderItemResponse, OrderListResponse } from './orders.types'

function toPayload(values: OrderFormValues, createdBy?: string) {
  return {
    tipoDocId: Number(values.tipoDocId),
    docNum: Number(values.docNum),
    proveedorId: values.proveedorId.trim() || null,
    estadoId: Number(values.estadoId),
    monedaId: Number(values.monedaId),
    fechaDocumento: values.fechaDocumento,
    fechaVencimiento: values.fechaVencimiento.trim() || null,
    subtotal: values.subtotal.trim() || '0',
    descuentoTotal: values.descuentoTotal.trim() || '0',
    impuestosTotal: values.impuestosTotal.trim() || '0',
    totalDocumento: values.totalDocumento.trim() || '0',
    comentarios: values.comentarios.trim() || null,
    isCanceled: values.isCanceled,
    createdBy,
  }
}

export function fetchOrders(): Promise<Order[]> {
  return requestJson<OrderListResponse>('/admin/operations/purchases/headers').then(
    (response) => response.purchaseHeaders,
  )
}

export function createOrder(values: OrderFormValues, createdBy: string): Promise<Order> {
  return requestJson<OrderItemResponse>('/admin/operations/purchases/headers', {
    method: 'POST',
    body: toPayload(values, createdBy),
  }).then((response) => response.purchaseHeader)
}

export function updateOrder(id: string, values: OrderFormValues): Promise<Order> {
  return requestJson<OrderItemResponse>(`/admin/operations/purchases/headers/${id}`, {
    method: 'PATCH',
    body: toPayload(values),
  }).then((response) => response.purchaseHeader)
}

export function deleteOrder(id: string): Promise<void> {
  return requestJson<void>(`/admin/operations/purchases/headers/${id}`, {
    method: 'DELETE',
  })
}
