import { requestJson } from '../../core/http/apiClient'
import type { Supplier, SupplierFormValues, SupplierItemResponse, SupplierListResponse } from './supplier.types'

function toPayload(values: SupplierFormValues) {
  return {
    cardCode: values.cardCode.trim(),
    cardName: values.cardName.trim(),
    nombreComercial: values.nombreComercial.trim() || null,
    nitRut: values.nitRut.trim(),
    email: values.email.trim() || null,
    telefono: values.telefono.trim() || null,
    direccion: values.direccion.trim() || null,
    monedaId: Number(values.monedaId),
    balanceCuenta: values.balanceCuenta.trim() || '0',
    lineaCredito: values.lineaCredito.trim() || '0',
    activo: values.activo,
  }
}

export function fetchSuppliers(): Promise<Supplier[]> {
  return requestJson<SupplierListResponse>('/admin/masters/suppliers').then((response) => response.suppliers)
}

export function createSupplier(values: SupplierFormValues): Promise<Supplier> {
  return requestJson<SupplierItemResponse>('/admin/masters/suppliers', {
    method: 'POST',
    body: toPayload(values),
  }).then((response) => response.supplier)
}

export function updateSupplier(id: string, values: SupplierFormValues): Promise<Supplier> {
  return requestJson<SupplierItemResponse>(`/admin/masters/suppliers/${id}`, {
    method: 'PATCH',
    body: toPayload(values),
  }).then((response) => response.supplier)
}

export function deleteSupplier(id: string): Promise<void> {
  return requestJson<void>(`/admin/masters/suppliers/${id}`, {
    method: 'DELETE',
  })
}
