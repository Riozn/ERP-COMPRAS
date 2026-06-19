import assert from 'node:assert/strict'
import test from 'node:test'

import type {
  DashboardSummary,
  InventoryReport,
  PayablesReport,
  PurchaseReport,
} from '../src/domain/analytics/analytics.types.js'
import type {
  AnalyticsRepository,
  InventoryReportInput,
  PurchaseReportInput,
} from '../src/domain/repositories/analytics.repository.js'
import { AnalyticsApplicationService } from '../src/application/analytics/analytics.service.js'

class MemoryAnalyticsRepository implements AnalyticsRepository {
  dashboardWindowDays: number | null = null
  purchaseReportInput: PurchaseReportInput | null = null
  inventoryReportInput: InventoryReportInput | null = null
  payablesRequested = false

  async getDashboardSummary(windowDays: number): Promise<DashboardSummary> {
    this.dashboardWindowDays = windowDays
    return {
      generatedAt: '2026-06-17T00:00:00.000Z',
      windowDays,
      kpis: {
        users: 1,
        suppliers: 2,
        items: 3,
        warehouses: 4,
        purchases: 5,
        pendingPayables: 6,
        lowStockItems: 7,
        inventoryMovements: 8,
      },
      recentPurchases: [],
      lowStockItems: [],
      recentEvents: [],
    }
  }

  async getPurchaseReport(input: PurchaseReportInput): Promise<PurchaseReport> {
    this.purchaseReportInput = input
    return {
      range: input,
      totals: {
        documents: 1,
        subtotal: '10.00',
        taxes: '1.50',
        total: '11.50',
      },
      byDay: [],
      topSuppliers: [],
      documents: [],
    }
  }

  async getInventoryReport(input: InventoryReportInput): Promise<InventoryReport> {
    this.inventoryReportInput = input
    return {
      windowDays: input.windowDays,
      threshold: input.threshold.toFixed(2),
      totals: {
        lowStockItems: 0,
        movements: 0,
        quantityMoved: '0.0000',
      },
      lowStockItems: [],
      movementsByDay: [],
    }
  }

  async getPayablesReport(): Promise<PayablesReport> {
    this.payablesRequested = true
    return {
      generatedAt: '2026-06-17T00:00:00.000Z',
      totals: {
        documents: 0,
        balance: '0.00',
        overdue: '0.00',
      },
      agingBuckets: [],
      accounts: [],
    }
  }
}

test('analytics application service delegates dashboard summary requests', async () => {
  const repository = new MemoryAnalyticsRepository()
  const service = new AnalyticsApplicationService(repository)

  const summary = await service.getDashboardSummary(30)

  assert.equal(repository.dashboardWindowDays, 30)
  assert.equal(summary.kpis.users, 1)
})

test('analytics application service validates purchase report ranges', async () => {
  const repository = new MemoryAnalyticsRepository()
  const service = new AnalyticsApplicationService(repository)

  const report = await service.getPurchaseReport({ from: '2026-06-01', to: '2026-06-30' })

  assert.deepEqual(repository.purchaseReportInput, {
    from: '2026-06-01',
    to: '2026-06-30',
  })
  assert.equal(report.totals.total, '11.50')
})

test('analytics application service validates invalid ranges', async () => {
  const repository = new MemoryAnalyticsRepository()
  const service = new AnalyticsApplicationService(repository)

  await assert.rejects(async () => {
    await service.getPurchaseReport({ from: '2026-07-01', to: '2026-06-01' })
  }, /from no puede ser mayor que to/)
})

test('analytics application service delegates inventory and payables reports', async () => {
  const repository = new MemoryAnalyticsRepository()
  const service = new AnalyticsApplicationService(repository)

  const inventory = await service.getInventoryReport({ windowDays: 15, threshold: 5 })
  const payables = await service.getPayablesReport()

  assert.deepEqual(repository.inventoryReportInput, { windowDays: 15, threshold: 5 })
  assert.equal(inventory.threshold, '5.00')
  assert.equal(repository.payablesRequested, true)
  assert.equal(payables.totals.documents, 0)
})
