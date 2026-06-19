import { requestJson } from '../../core/http/apiClient'
import type {
  InventoryMovement,
  InventoryMovementFormValues,
  InventoryMovementItemResponse,
  InventoryMovementListResponse,
  InventoryStock,
  InventoryStockResponse,
} from './inventory.types'

function toMovementPayload(values: InventoryMovementFormValues, usuarioId?: string) {
  return {
    articuloId: values.articuloId.trim(),
    almacenId: values.almacenId.trim(),
    docReferenciaId: values.docReferenciaId.trim(),
    tipoMovimiento: values.tipoMovimiento,
    cantidad: values.cantidad.trim(),
    costoMomento: values.costoMomento.trim() || '0',
    usuarioId,
    comentario: values.comentario.trim() || null,
  }
}

export function fetchInventoryStock(): Promise<InventoryStock[]> {
  return requestJson<InventoryStockResponse>('/admin/masters/item-warehouses').then(
    (response) => response.itemWarehouses,
  )
}

export function fetchInventoryMovements(): Promise<InventoryMovement[]> {
  return requestJson<InventoryMovementListResponse>('/admin/operations/inventory/ledger').then(
    (response) => response.inventoryLedger,
  )
}

export function createInventoryMovement(
  values: InventoryMovementFormValues,
  usuarioId: string,
): Promise<InventoryMovement> {
  return requestJson<InventoryMovementItemResponse>('/admin/operations/inventory/ledger', {
    method: 'POST',
    body: toMovementPayload(values, usuarioId),
  }).then((response) => response.inventoryLedger)
}

export function updateInventoryMovement(id: string, values: InventoryMovementFormValues): Promise<InventoryMovement> {
  return requestJson<InventoryMovementItemResponse>(`/admin/operations/inventory/ledger/${id}`, {
    method: 'PATCH',
    body: toMovementPayload(values),
  }).then((response) => response.inventoryLedger)
}

export function deleteInventoryMovement(id: string): Promise<void> {
  return requestJson<void>(`/admin/operations/inventory/ledger/${id}`, {
    method: 'DELETE',
  })
}
