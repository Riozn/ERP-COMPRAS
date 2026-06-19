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

export type CreateSupplierInput = {
  cardCode: string
  cardName: string
  nombreComercial?: string | null
  nitRut: string
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  monedaId: number
  balanceCuenta?: string
  lineaCredito?: string
  activo?: boolean
}

export type UpdateSupplierInput = Partial<CreateSupplierInput>

export type Item = {
  id: string
  itemCode: string
  itemName: string
  descripcion: string | null
  unidadMedida: string
  costoEstandar: string
  grupoId: number
  impuestoId: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type CreateItemInput = {
  itemCode: string
  itemName: string
  descripcion?: string | null
  unidadMedida?: string
  costoEstandar?: string
  grupoId: number
  impuestoId: number
  activo?: boolean
}

export type UpdateItemInput = Partial<CreateItemInput>

export type ItemWarehouse = {
  id: string
  articuloId: string
  almacenId: string
  stockFisico: string
  comprometido: string
  solicitado: string
  stockDisponible: string
}

export type CreateItemWarehouseInput = {
  articuloId: string
  almacenId: string
  stockFisico?: string
  comprometido?: string
  solicitado?: string
  stockDisponible?: string
}

export type UpdateItemWarehouseInput = Partial<CreateItemWarehouseInput>
