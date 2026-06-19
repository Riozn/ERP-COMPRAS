import type {
  DashboardSummary,
  InventoryReport,
  PayablesReport,
  PurchaseReport,
} from '../../domain/analytics/analytics.types.js'
import type {
  AnalyticsRepository,
  InventoryReportInput,
  PurchaseReportInput,
} from '../../domain/repositories/analytics.repository.js'
import { ValidationError } from '../../shared/errors/http-error.js'

function parseWindowDays(value: number): number {
  if (!Number.isInteger(value) || value <= 0 || value > 3650) {
    throw new ValidationError('windowDays debe estar entre 1 y 3650.')
  }

  return value
}

function parseThreshold(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError('threshold debe ser numerico y no negativo.')
  }

  return value
}

function parseDateValue(value: string, field: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ValidationError(`${field} es obligatorio.`)
  }

  const date = new Date(`${trimmed}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${field} no tiene un formato valido.`)
  }

  return trimmed.slice(0, 10)
}

export class AnalyticsApplicationService {
  constructor(private readonly repository: AnalyticsRepository) {}

  getDashboardSummary(windowDays: number): Promise<DashboardSummary> {
    return this.repository.getDashboardSummary(parseWindowDays(windowDays))
  }

  getPurchaseReport(input: PurchaseReportInput): Promise<PurchaseReport> {
    const from = parseDateValue(input.from, 'from')
    const to = parseDateValue(input.to, 'to')

    if (from > to) {
      throw new ValidationError('from no puede ser mayor que to.')
    }

    return this.repository.getPurchaseReport({ from, to })
  }

  getInventoryReport(input: InventoryReportInput): Promise<InventoryReport> {
    return this.repository.getInventoryReport({
      windowDays: parseWindowDays(input.windowDays),
      threshold: parseThreshold(input.threshold),
    })
  }

  getPayablesReport(): Promise<PayablesReport> {
    return this.repository.getPayablesReport()
  }
}
