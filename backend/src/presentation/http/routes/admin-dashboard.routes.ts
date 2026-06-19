import { Router, type Request } from 'express'

import type { AnalyticsApplicationService } from '../../../application/analytics/analytics.service.js'
import { ValidationError } from '../../../shared/errors/http-error.js'

type AdminDashboardServices = {
  analytics: AnalyticsApplicationService
}

function readNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function createAdminDashboardRoutes(services: AdminDashboardServices): Router {
  const router = Router()

  router.get('/summary', async (req: Request, res) => {
    const days = readNumber(req.query.days) ?? 30
    if (!Number.isInteger(days) || days <= 0) {
      throw new ValidationError('days debe ser un entero mayor a cero.')
    }

    const summary = await services.analytics.getDashboardSummary(days)
    res.json({ dashboard: summary })
  })

  return router
}
