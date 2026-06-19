import type { ReferenceCatalogs } from '../../core/auth/auth.types'
import type { Article } from '../articles/articles.types'

export type InventoryStock = {
  id: string
  articuloId: string
  almacenId: string
  stockFisico: string
  comprometido: string
  solicitado: string
  stockDisponible: string
}

export type InventoryMovement = {
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

export type InventoryMovementFormValues = {
  articuloId: string
  almacenId: string
  docReferenciaId: string
  tipoMovimiento: 'IN' | 'OUT'
  cantidad: string
  costoMomento: string
  comentario: string
}

export type InventoryMovementFormErrors = Partial<Record<keyof InventoryMovementFormValues, string>>

export type InventoryCatalogs = Pick<ReferenceCatalogs, 'almacenes'> & {
  articulos: Article[]
}

export type InventoryStockResponse = {
  itemWarehouses: InventoryStock[]
}

export type InventoryMovementListResponse = {
  inventoryLedger: InventoryMovement[]
}

export type InventoryMovementItemResponse = {
  inventoryLedger: InventoryMovement
}

export const emptyInventoryMovementFormValues: InventoryMovementFormValues = {
  articuloId: '',
  almacenId: '',
  docReferenciaId: '',
  tipoMovimiento: 'IN',
  cantidad: '0',
  costoMomento: '0',
  comentario: '',
}
