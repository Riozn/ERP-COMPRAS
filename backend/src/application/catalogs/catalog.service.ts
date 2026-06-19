import type { ReferenceCatalogs } from '../../domain/catalogs/catalog.types.js'
import type { CatalogRepository } from '../../domain/repositories/catalog.repository.js'

export class CatalogApplicationService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listReferenceCatalogs(): Promise<ReferenceCatalogs> {
    return this.catalogRepository.listReferenceCatalogs()
  }
}
