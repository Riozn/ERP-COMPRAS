import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { renderWithTheme } from '../../../test/render'

const dashboardMock = vi.hoisted(() => ({
  fetchDashboardBundle: vi.fn(),
}))

vi.mock('../dashboard.api', () => ({
  fetchDashboardBundle: dashboardMock.fetchDashboardBundle,
}))

import { DashboardPage } from './DashboardPage'

describe('DashboardPage', () => {
  beforeEach(() => {
    dashboardMock.fetchDashboardBundle.mockReset()
  })

  it('renders the executive summary with charts and operational panels', async () => {
    dashboardMock.fetchDashboardBundle.mockResolvedValueOnce({
      summary: {
        generatedAt: '2026-06-17T00:00:00.000Z',
        windowDays: 30,
        kpis: {
          users: 12,
          suppliers: 8,
          items: 42,
          warehouses: 3,
          purchases: 9,
          pendingPayables: 3500,
          lowStockItems: 2,
          inventoryMovements: 25,
        },
        recentPurchases: [
          {
            id: 'purchase-1',
            fechaDocumento: '2026-06-17T00:00:00.000Z',
            docNum: 1001,
            proveedorId: '1',
            proveedorNombre: 'Proveedor Uno',
            totalDocumento: '1120.00',
            estadoId: 1,
          },
        ],
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
        recentEvents: [
          {
            id: 'event-1',
            entidad: 'Compra',
            accion: 'Creada',
            usuarioId: 'user-1',
            fecha: '2026-06-17T00:00:00.000Z',
          },
        ],
      },
      purchaseReport: {
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
            estadoId: 2,
            estadoNombre: 'Pendiente',
            totalDocumento: '1120.00',
            isCanceled: false,
          },
        ],
      },
      inventoryReport: {
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
      },
      payablesReport: {
        generatedAt: '2026-06-17T00:00:00.000Z',
        totals: {
          documents: 2,
          balance: '250.00',
          overdue: '80.00',
        },
        agingBuckets: [
          { bucket: 'Vigente', documents: 1, balance: '170.00' },
          { bucket: '1-30', documents: 1, balance: '80.00' },
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
      },
    })

    const screen = renderWithTheme(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Resumen operativo de compras')).toBeInTheDocument()
    expect(screen.getByText('Total de compras:')).toBeInTheDocument()
    expect(screen.getByText('Proveedor Uno')).toBeInTheDocument()
    expect(screen.getByText('Articulo Uno')).toBeInTheDocument()
    expect(screen.getByText('Eventos recientes')).toBeInTheDocument()
    expect(screen.getAllByText('Estado de ordenes').length).toBeGreaterThan(0)
    expect(dashboardMock.fetchDashboardBundle).toHaveBeenCalledWith(30, 10)
  })
})
