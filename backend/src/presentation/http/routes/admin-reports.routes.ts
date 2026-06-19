import { Router, type Request } from 'express'

import type { AnalyticsApplicationService } from '../../../application/analytics/analytics.service.js'
import { ValidationError } from '../../../shared/errors/http-error.js'

type AdminReportsServices = {
  analytics: AnalyticsApplicationService
}

function readNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readRequiredString(value: unknown, field: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) {
    throw new ValidationError(`${field} es obligatorio.`)
  }

  return text
}

export function createAdminReportsRoutes(services: AdminReportsServices): Router {
  const router = Router()

  router.get('/purchases', async (req: Request, res) => {
    const from = readRequiredString(req.query.from, 'from')
    const to = readRequiredString(req.query.to, 'to')
    const report = await services.analytics.getPurchaseReport({ from, to })
    res.json({ purchaseReport: report })
  })

  router.get('/inventory', async (req: Request, res) => {
    const windowDays = readNumber(req.query.days) ?? 30
    const threshold = readNumber(req.query.threshold) ?? 10

    if (!Number.isInteger(windowDays) || windowDays <= 0) {
      throw new ValidationError('days debe ser un entero mayor a cero.')
    }

    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new ValidationError('threshold debe ser numerico y no negativo.')
    }

    const report = await services.analytics.getInventoryReport({ windowDays, threshold })
    res.json({ inventoryReport: report })
  })

  router.get('/payables', async (_req, res) => {
    const report = await services.analytics.getPayablesReport()
    res.json({ payablesReport: report })
  })

  return router
}
