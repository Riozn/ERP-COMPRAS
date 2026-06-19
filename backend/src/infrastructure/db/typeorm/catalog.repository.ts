import { DataSource } from 'typeorm'

import type { ReferenceCatalogs } from '../../../domain/catalogs/catalog.types.js'
import { CatalogRepository } from '../../../domain/repositories/catalog.repository.js'
import {
  CurrencyEntity,
  DocumentStateEntity,
  DocumentTypeEntity,
  ItemGroupEntity,
  RoleEntity,
  TaxEntity,
  WarehouseEntity,
} from './entities.js'

export class TypeormCatalogRepository implements CatalogRepository {
  constructor(private readonly dataSource: DataSource) {}

  async listReferenceCatalogs(): Promise<ReferenceCatalogs> {
    const [
      monedas,
      almacenes,
      impuestos,
      gruposArticulo,
      estadosDocumento,
      tiposDocumento,
      roles,
    ] = await Promise.all([
      this.dataSource.getRepository(CurrencyEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(WarehouseEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(TaxEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(ItemGroupEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(DocumentStateEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(DocumentTypeEntity).find({ order: { id: 'ASC' } }),
      this.dataSource.getRepository(RoleEntity).find({ order: { id: 'ASC' } }),
    ])

    return {
      monedas: monedas.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        tasaActual: item.tasaActual,
      })),
      almacenes: almacenes.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        ubicacion: item.ubicacion,
        activo: item.activo,
      })),
      impuestos: impuestos.map((item) => ({
        id: item.id,
        taxCode: item.taxCode,
        nombre: item.nombre,
        porcentaje: item.porcentaje,
        activo: item.activo,
      })),
      gruposArticulo: gruposArticulo.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
      })),
      estadosDocumento: estadosDocumento.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
      })),
      tiposDocumento: tiposDocumento.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        afectaInventario: item.afectaInventario,
      })),
      roles: roles.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
      })),
    }
  }
}
