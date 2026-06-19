export type Currency = {
  id: number
  codigo: string
  nombre: string
  tasaActual: string
}

export type CreateCurrencyInput = {
  codigo: string
  nombre: string
  tasaActual?: string
}

export type UpdateCurrencyInput = Partial<CreateCurrencyInput>

export type Warehouse = {
  id: string
  nombre: string
  ubicacion: string | null
  activo: boolean
}

export type CreateWarehouseInput = {
  id: string
  nombre: string
  ubicacion?: string | null
  activo?: boolean
}

export type UpdateWarehouseInput = Partial<CreateWarehouseInput>

export type Tax = {
  id: number
  taxCode: string
  nombre: string
  porcentaje: string
  activo: boolean
}

export type CreateTaxInput = {
  taxCode: string
  nombre: string
  porcentaje?: string
  activo?: boolean
}

export type UpdateTaxInput = Partial<CreateTaxInput>

export type ItemGroup = {
  id: number
  codigo: string
  nombre: string
}

export type CreateItemGroupInput = {
  codigo: string
  nombre: string
}

export type UpdateItemGroupInput = Partial<CreateItemGroupInput>

export type DocumentState = {
  id: number
  codigo: string
  nombre: string
}

export type CreateDocumentStateInput = {
  codigo: string
  nombre: string
}

export type UpdateDocumentStateInput = Partial<CreateDocumentStateInput>

export type DocumentType = {
  id: number
  codigo: string
  nombre: string
  afectaInventario: boolean
}

export type CreateDocumentTypeInput = {
  codigo: string
  nombre: string
  afectaInventario?: boolean
}

export type UpdateDocumentTypeInput = Partial<CreateDocumentTypeInput>

export type ReferenceCatalogs = {
  monedas: Currency[]
  almacenes: Warehouse[]
  impuestos: Tax[]
  gruposArticulo: ItemGroup[]
  estadosDocumento: DocumentState[]
  tiposDocumento: DocumentType[]
  roles: { id: number; codigo: string; nombre: string }[]
}
