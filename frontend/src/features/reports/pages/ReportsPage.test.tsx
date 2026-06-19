import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { renderWithTheme } from '../../../test/render'

const reportsMock = vi.hoisted(() => ({
  fetchPurchaseReport: vi.fn(),
  fetchInventoryReport: vi.fn(),
  fetchPayablesReport: vi.fn(),
}))

vi.mock('../reports.api', () => ({
  fetchPurchaseReport: reportsMock.fetchPurchaseReport,
  fetchInventoryReport: reportsMock.fetchInventoryReport,
  fetchPayablesReport: reportsMock.fetchPayablesReport,
}))

import { ReportsPage } from './ReportsPage'

describe('ReportsPage', () => {
  beforeEach(() => {
    reportsMock.fetchPurchaseReport.mockReset()
    reportsMock.fetchInventoryReport.mockReset()
    reportsMock.fetchPayablesReport.mockReset()
  })

  it('loads real report data and switches between report tabs', async () => {
    const user = userEvent.setup()
    reportsMock.fetchPurchaseReport.mockResolvedValueOnce({
      range: { from: '2026-05-18', to: '2026-06-17' },
      totals: {
        documents: 3,
        subtotal: '1000.00',
        taxes: '120.00',
        total: '1120.00',
      },
      byDay: [
        { date: '2026-06-16', documents: 2, total: '500.00' },
        { date: '2026-06-17', documents: 1, total: '620.00' },
      ],
      topSuppliers: [
        { proveedorId: '1', proveedorNombre: 'Proveedor Uno', documents: 2, total: '700.00' },
      ],
      documents: [
        {
          id: 'purchase-1',
          fechaDocumento: '2026-06-17T00:00:00.000Z',
          docNum: 1001,
          proveedorId: '1',
          proveedorNombre: 'Proveedor Uno',
          estadoId: 1,
          estadoNombre: 'Abierto',
          totalDocumento: '1120.00',
          isCanceled: false,
        },
      ],
    })
    reportsMock.fetchInventoryReport.mockResolvedValueOnce({
      windowDays: 30,
      threshold: '10',
      totals: {
        lowStockItems: 1,
        movements: 5,
        quantityMoved: '12.00',
      },
      lowStockItems: [
        {
          articuloId: 'item-1',
          articuloCodigo: 'ART-001',
          articuloNombre: 'Articulo Uno',
          almacenId: 'alm-1',
          almacenNombre: 'Central',
          stockFisico: '4.00',
          stockDisponible: '3.00',
        },
      ],
      movementsByDay: [
        { date: '2026-06-16', movements: 2, quantity: '5.00' },
        { date: '2026-06-17', movements: 3, quantity: '7.00' },
      ],
    })
    reportsMock.fetchPayablesReport.mockResolvedValueOnce({
      generatedAt: '2026-06-17T00:00:00.000Z',
      totals: {
        documents: 2,
        balance: '250.00',
        overdue: '80.00',
      },
      agingBuckets: [
        { bucket: '0-30', documents: 1, balance: '170.00' },
        { bucket: '31-60', documents: 1, balance: '80.00' },
      ],
      accounts: [
        {
          id: 'payable-1',
          compraId: 'purchase-1',
          proveedorId: '1',
          proveedorNombre: 'Proveedor Uno',
          numeroFactura: 'F-001',
          montoTotal: '250.00',
          saldoPendiente: '80.00',
          fechaVencimiento: '2026-06-20',
          estado: 'PENDIENTE',
          daysOverdue: 0,
        },
      ],
    })

    const screen = renderWithTheme(<ReportsPage />)

    await screen.findByText('Proveedores destacados')
    expect(reportsMock.fetchPurchaseReport).toHaveBeenCalledTimes(1)
    expect(reportsMock.fetchInventoryReport).toHaveBeenCalledTimes(1)
    expect(reportsMock.fetchPayablesReport).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Proveedor Uno', { selector: 'td' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Inventario' }))
    expect(screen.getByText('Articulo Uno')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Cuentas por pagar' }))
    expect(await screen.findByText('Aging')).toBeInTheDocument()
    expect(screen.getByText('F-001')).toBeInTheDocument()
  })
})
