import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import { formatCurrency, formatDate, formatNumber } from '../../../shared/utils/format'
import { fetchInventoryReport, fetchPayablesReport, fetchPurchaseReport } from '../reports.api'
import type { InventoryReport, PayablesReport, PurchaseReport } from '../reports.types'

type ReportTab = 'purchases' | 'inventory' | 'payables'

function EmptyState({ text }: { text: string }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography sx={{ color: 'text.secondary' }}>{text}</Typography>
    </Box>
  )
}

function SectionCard({
  title,
  value,
  helper,
}: {
  title: string
  value: string
  helper: string
}) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {helper}
      </Typography>
    </Paper>
  )
}

function MiniBars({
  rows,
  valueKey,
  labelKey,
  color = 'primary.main',
}: {
  rows: Array<Record<string, unknown>>
  valueKey: string
  labelKey: string
  color?: string
}) {
  const numericValues = rows.map((row) => Number(row[valueKey] ?? 0))
  const max = Math.max(...numericValues, 1)

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {rows.map((row, index) => {
        const value = Number(row[valueKey] ?? 0)
        const label = String(row[labelKey] ?? '')
        const displayLabel = labelKey === 'date' ? formatDate(label) : label
        const width = Math.max((value / max) * 100, value > 0 ? 10 : 0)

        return (
          <Box key={`${label}-${index}`}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {displayLabel}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatNumber(value)}
              </Typography>
            </Box>
            <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box sx={{ width: `${width}%`, height: '100%', bgcolor: color, borderRadius: 999 }} />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('purchases')
  const [purchaseReport, setPurchaseReport] = useState<PurchaseReport | null>(null)
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null)
  const [payablesReport, setPayablesReport] = useState<PayablesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [days, setDays] = useState('30')
  const [threshold, setThreshold] = useState('10')

  useEffect(() => {
    let active = true

    async function loadReports() {
      try {
        setLoading(true)
        const [purchases, inventory, payables] = await Promise.all([
          fetchPurchaseReport(from, to),
          fetchInventoryReport(Number(days), Number(threshold)),
          fetchPayablesReport(),
        ])

        if (!active) return
        setPurchaseReport(purchases)
        setInventoryReport(inventory)
        setPayablesReport(payables)
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los reportes.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadReports()
    return () => {
      active = false
    }
  }, [days, from, threshold, to])

  const activeTotals = useMemo(() => {
    if (tab === 'inventory' && inventoryReport) {
      return [
        {
          title: 'Movimientos',
          value: formatNumber(inventoryReport.totals.movements),
          helper: `Ultimos ${inventoryReport.windowDays} dias`,
        },
        {
          title: 'Items con alerta',
          value: formatNumber(inventoryReport.totals.lowStockItems),
          helper: `Umbral ${inventoryReport.threshold}`,
        },
        {
          title: 'Cantidad movida',
          value: formatNumber(inventoryReport.totals.quantityMoved, 2),
          helper: 'Volumen acumulado',
        },
      ]
    }

    if (tab === 'payables' && payablesReport) {
      return [
        {
          title: 'Documentos',
          value: formatNumber(payablesReport.totals.documents),
          helper: 'Cuentas activas',
        },
        {
          title: 'Saldo total',
          value: formatCurrency(payablesReport.totals.balance),
          helper: 'Pendiente por pagar',
        },
        {
          title: 'Vencido',
          value: formatCurrency(payablesReport.totals.overdue),
          helper: 'Monto atrasado',
        },
      ]
    }

    if (purchaseReport) {
      return [
        {
          title: 'Documentos',
          value: formatNumber(purchaseReport.totals.documents),
          helper: `${formatDate(purchaseReport.range.from)} - ${formatDate(purchaseReport.range.to)}`,
        },
        {
          title: 'Subtotal',
          value: formatCurrency(purchaseReport.totals.subtotal),
          helper: 'Base imponible',
        },
        {
          title: 'Total',
          value: formatCurrency(purchaseReport.totals.total),
          helper: 'Con impuestos',
        },
      ]
    }

    return []
  }, [inventoryReport, payablesReport, purchaseReport, tab])

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
          Analitica ERP
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Reportes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Visualizacion de compras, inventario y cuentas por pagar con datos reales del backend.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto">
          <Tab value="purchases" label="Compras" />
          <Tab value="inventory" label="Inventario" />
          <Tab value="payables" label="Cuentas por pagar" />
        </Tabs>
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label="Desde"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Hasta"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Dias inventario"
              type="number"
              value={days}
              onChange={(event) => setDays(event.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              label="Umbral"
              type="number"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Box>
          {loading ? <LinearProgress sx={{ width: { xs: '100%', md: 180 } }} /> : null}
        </Box>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} />
          ))}
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {activeTotals.map((item) => (
              <SectionCard key={item.title} {...item} />
            ))}
          </Box>

          {tab === 'purchases' && purchaseReport ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
              }}
            >
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Proveedores destacados
                </Typography>
                {purchaseReport.topSuppliers.length ? (
                  <MiniBars
                    rows={purchaseReport.topSuppliers}
                    labelKey="proveedorNombre"
                    valueKey="documents"
                  />
                ) : (
                  <EmptyState text="No hay proveedores con actividad en el rango seleccionado." />
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Documentos
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Documento</TableCell>
                      <TableCell>Proveedor</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseReport.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>#{doc.docNum}</TableCell>
                        <TableCell>{doc.proveedorNombre ?? 'Sin proveedor'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={doc.isCanceled ? 'default' : 'primary'}
                            label={doc.estadoNombre ?? 'Estado'}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(doc.totalDocumento)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ) : null}

          {tab === 'inventory' && inventoryReport ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              }}
            >
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Movimientos por dia
                </Typography>
                {inventoryReport.movementsByDay.length ? (
                  <MiniBars
                    rows={inventoryReport.movementsByDay}
                    labelKey="date"
                    valueKey="movements"
                    color="secondary.main"
                  />
                ) : (
                  <EmptyState text="No se encontraron movimientos en el periodo." />
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Items con alerta
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {inventoryReport.lowStockItems.length ? (
                    inventoryReport.lowStockItems.map((item) => (
                      <Paper key={`${item.articuloId}-${item.almacenId}`} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{item.articuloNombre}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.articuloCodigo} - {item.almacenNombre}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Disponible: {formatNumber(item.stockDisponible, 2)}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <EmptyState text="No hay alertas de inventario bajo." />
                  )}
                </Box>
              </Paper>
            </Box>
          ) : null}

          {tab === 'payables' && payablesReport ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' },
              }}
            >
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Aging
                </Typography>
                {payablesReport.agingBuckets.length ? (
                  <MiniBars
                    rows={payablesReport.agingBuckets}
                    labelKey="bucket"
                    valueKey="documents"
                    color="error.main"
                  />
                ) : (
                  <EmptyState text="No hay cuentas por pagar para mostrar." />
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Cuentas abiertas
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Factura</TableCell>
                      <TableCell>Proveedor</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payablesReport.accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.numeroFactura}</TableCell>
                        <TableCell>{account.proveedorNombre ?? 'Sin proveedor'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={account.estado}
                            color={account.estado === 'PAGADA' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(account.saldoPendiente)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  )
}
