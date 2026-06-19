import type {
  DashboardSummary,
  InventoryReport,
  PayablesReport,
  PurchaseReport,
} from '../analytics/analytics.types.js'

export type PurchaseReportInput = {
  from: string
  to: string
}

export type InventoryReportInput = {
  windowDays: number
  threshold: number
}

export interface AnalyticsRepository {
  getDashboardSummary(windowDays: number): Promise<DashboardSummary>
  getPurchaseReport(input: PurchaseReportInput): Promise<PurchaseReport>
  getInventoryReport(input: InventoryReportInput): Promise<InventoryReport>
  getPayablesReport(): Promise<PayablesReport>
}
