import { Router } from 'express'

import type { CatalogApplicationService } from '../../../application/catalogs/catalog.service.js'

export function createCatalogRoutes(catalogService: CatalogApplicationService): Router {
  const router = Router()

  router.get('/reference-data', async (_req, res) => {
    const catalogs = await catalogService.listReferenceCatalogs()
    res.json(catalogs)
  })

  return router
}
