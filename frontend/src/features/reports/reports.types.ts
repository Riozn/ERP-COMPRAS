export type AnalyticsDateRange = {
  from: string
  to: string
}

export type PurchaseReport = {
  range: AnalyticsDateRange
  totals: {
    documents: number
    subtotal: string
    taxes: string
    total: string
  }
  byDay: Array<{
    date: string
    documents: number
    total: string
  }>
  topSuppliers: Array<{
    proveedorId: string
    proveedorNombre: string
    documents: number
    total: string
  }>
  documents: Array<{
    id: string
    fechaDocumento: string
    docNum: number
    proveedorId: string | null
    proveedorNombre: string | null
    estadoId: number
    estadoNombre: string | null
    totalDocumento: string
    isCanceled: boolean
  }>
}

export type InventoryReport = {
  windowDays: number
  threshold: string
  totals: {
    lowStockItems: number
    movements: number
    quantityMoved: string
  }
  lowStockItems: Array<{
    articuloId: string
    articuloCodigo: string
    articuloNombre: string
    almacenId: string
    almacenNombre: string
    stockFisico: string
    stockDisponible: string
  }>
  movementsByDay: Array<{
    date: string
    movements: number
    quantity: string
  }>
}

export type PayablesReport = {
  generatedAt: string
  totals: {
    documents: number
    balance: string
    overdue: string
  }
  agingBuckets: Array<{
    bucket: string
    documents: number
    balance: string
  }>
  accounts: Array<{
    id: string
    compraId: string
    proveedorId: string
    proveedorNombre: string | null
    numeroFactura: string
    montoTotal: string
    saldoPendiente: string
    fechaVencimiento: string
    estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA'
    daysOverdue: number
  }>
}
