export type DashboardSummary = {
  generatedAt: string
  windowDays: number
  kpis: {
    users: number
    suppliers: number
    items: number
    warehouses: number
    purchases: number
    pendingPayables: number
    lowStockItems: number
    inventoryMovements: number
  }
  recentPurchases: Array<{
    id: string
    fechaDocumento: string
    docNum: number
    proveedorId: string | null
    proveedorNombre: string | null
    totalDocumento: string
    estadoId: number
  }>
  lowStockItems: Array<{
    articuloId: string
    articuloCodigo: string
    articuloNombre: string
    almacenId: string
    almacenNombre: string
    stockFisico: string
    stockDisponible: string
  }>
  recentEvents: Array<{
    id: string
    entidad: string
    accion: string
    usuarioId: string
    fecha: string
  }>
}

export type DashboardBundle = {
  summary: DashboardSummary
  purchaseReport: import('../reports/reports.types').PurchaseReport
  inventoryReport: import('../reports/reports.types').InventoryReport
  payablesReport: import('../reports/reports.types').PayablesReport
}
