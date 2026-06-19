import { requestJson } from '../../core/http/apiClient'
import type { DashboardBundle, DashboardSummary } from './dashboard.types'
import type { InventoryReport, PayablesReport, PurchaseReport } from '../reports/reports.types'

export function fetchDashboardSummary(days = 30): Promise<DashboardSummary> {
  return requestJson<{ dashboard: DashboardSummary }>(`/admin/dashboard/summary?days=${days}`).then(
    (response) => response.dashboard,
  )
}

export async function fetchDashboardBundle(
  days = 30,
  threshold = 10,
): Promise<DashboardBundle> {
  const [summary, purchaseReport, inventoryReport, payablesReport] = await Promise.all([
    fetchDashboardSummary(days),
    requestJson<{ purchaseReport: PurchaseReport }>(`/admin/reports/purchases?from=${getDateRange(days).from}&to=${getDateRange(days).to}`).then((response) => response.purchaseReport),
    requestJson<{ inventoryReport: InventoryReport }>(`/admin/reports/inventory?days=${days}&threshold=${threshold}`).then((response) => response.inventoryReport),
    requestJson<{ payablesReport: PayablesReport }>('/admin/reports/payables').then((response) => response.payablesReport),
  ])

  return { summary, purchaseReport, inventoryReport, payablesReport }
}

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - Math.max(days - 1, 0))

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}
