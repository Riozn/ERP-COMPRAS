import type { ReferenceCatalogs } from '../catalogs/catalog.types.js'

export interface CatalogRepository {
  listReferenceCatalogs(): Promise<ReferenceCatalogs>
}
