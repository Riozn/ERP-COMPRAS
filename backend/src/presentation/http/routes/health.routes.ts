import { Router } from 'express'

import type { HealthApplicationService } from '../../../application/health/health.service.js'

export function createHealthRoutes(healthService: HealthApplicationService): Router {
  const router = Router()

  router.get('/health', (_req, res) => {
    res.json(healthService.getStatus())
  })

  return router
}
