import { requestJson } from '../../core/http/apiClient'
import type { InventoryReport, PayablesReport, PurchaseReport } from './reports.types'

export function fetchPurchaseReport(from: string, to: string): Promise<PurchaseReport> {
  return requestJson<{ purchaseReport: PurchaseReport }>(`/admin/reports/purchases?from=${from}&to=${to}`).then(
    (response) => response.purchaseReport,
  )
}

export function fetchInventoryReport(days = 30, threshold = 10): Promise<InventoryReport> {
  return requestJson<{ inventoryReport: InventoryReport }>(
    `/admin/reports/inventory?days=${days}&threshold=${threshold}`,
  ).then((response) => response.inventoryReport)
}

export function fetchPayablesReport(): Promise<PayablesReport> {
  return requestJson<{ payablesReport: PayablesReport }>('/admin/reports/payables').then(
    (response) => response.payablesReport,
  )
}
