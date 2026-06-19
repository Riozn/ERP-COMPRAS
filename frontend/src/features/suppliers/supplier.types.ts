import type { ReferenceCatalogs } from '../../core/auth/auth.types'

export type Supplier = {
  id: string
  cardCode: string
  cardName: string
  nombreComercial: string | null
  nitRut: string
  email: string | null
  telefono: string | null
  direccion: string | null
  monedaId: number
  balanceCuenta: string
  lineaCredito: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type SupplierFormValues = {
  cardCode: string
  cardName: string
  nombreComercial: string
  nitRut: string
  email: string
  telefono: string
  direccion: string
  monedaId: string
  balanceCuenta: string
  lineaCredito: string
  activo: boolean
}

export type SupplierFormErrors = Partial<Record<keyof SupplierFormValues, string>>

export type SupplierListResponse = {
  suppliers: Supplier[]
}

export type SupplierItemResponse = {
  supplier: Supplier
}

export type SupplierCatalogs = Pick<ReferenceCatalogs, 'monedas'>

export const emptySupplierFormValues: SupplierFormValues = {
  cardCode: '',
  cardName: '',
  nombreComercial: '',
  nitRut: '',
  email: '',
  telefono: '',
  direccion: '',
  monedaId: '',
  balanceCuenta: '0',
  lineaCredito: '0',
  activo: true,
}
