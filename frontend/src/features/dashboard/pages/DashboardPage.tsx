import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {
  AddBusinessOutlined,
  AssignmentTurnedInOutlined,
  ChevronRightOutlined,
  RefreshOutlined,
  ShoppingCartCheckoutOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

import { fetchDashboardBundle } from '../dashboard.api'
import type { DashboardBundle } from '../dashboard.types'
import { formatCurrency, formatDate, formatNumber } from '../../../shared/utils/format'

function SectionPaper({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'start' }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {subtitle}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography sx={{ color: 'text.secondary' }}>{text}</Typography>
    </Box>
  )
}

function formatChartLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-BO', {
    month: 'short',
    day: '2-digit',
  }).format(date)
}

function ColumnChart({
  rows,
  valueKey,
  labelKey,
  color = '#6d5efc',
}: {
  rows: Array<Record<string, unknown>>
  valueKey: string
  labelKey: string
  color?: string
}) {
  const width = 100
  const height = 260
  const paddingX = 8
  const paddingTop = 18
  const paddingBottom = 28
  const values = rows.map((row) => Number(row[valueKey] ?? 0))
  const max = Math.max(...values, 1)
  const gap = rows.length > 1 ? 4 : 0
  const columnWidth = rows.length > 0 ? (width - paddingX * 2 - gap * (rows.length - 1)) / rows.length : 0

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(109,94,252,0.06), rgba(109,94,252,0.01))',
          overflow: 'hidden',
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="column chart">
          {Array.from({ length: 4 }).map((_, index) => {
            const y = paddingTop + ((height - paddingTop - paddingBottom) / 3) * index
            return (
              <line
                key={index}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.16)"
                strokeDasharray="2 3"
              />
            )
          })}
          {rows.map((row, index) => {
            const value = Number(row[valueKey] ?? 0)
            const label = String(row[labelKey] ?? '')
            const barHeight = ((value / max) * (height - paddingTop - paddingBottom)) || 0
            const x = paddingX + index * (columnWidth + gap)
            const y = height - paddingBottom - barHeight

            return (
              <g key={`${label}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={columnWidth}
                  height={barHeight}
                  rx="2.5"
                  fill={color}
                />
                <text
                  x={x + columnWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.9)"
                  fontSize="3.3"
                >
                  {formatChartLabel(label)}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {rows.length ? 'Comparativa del periodo actual' : 'Sin datos para graficar'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {rows.length} puntos
        </Typography>
      </Box>
    </Box>
  )
}

function LineChart({
  rows,
  valueKey,
  labelKey,
  color = '#355dfb',
}: {
  rows: Array<Record<string, unknown>>
  valueKey: string
  labelKey: string
  color?: string
}) {
  const width = 100
  const height = 220
  const values = rows.map((row) => Number(row[valueKey] ?? 0))
  const max = Math.max(...values, 1)
  const paddingX = 10
  const paddingY = 20
  const step = rows.length > 1 ? (width - paddingX * 2) / (rows.length - 1) : 0

  const points = rows.map((row, index) => {
    const value = Number(row[valueKey] ?? 0)
    const x = paddingX + index * step
    const y = height - paddingY - (value / max) * (height - paddingY * 2)
    return { x, y, value, label: String(row[labelKey] ?? '') }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const lastPoint = points[points.length - 1]
  const fillPath = `${path} L ${lastPoint?.x ?? width} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box
        sx={{
          width: '100%',
          height: 220,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(53,93,251,0.04), transparent)',
          overflow: 'hidden',
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="chart">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {Array.from({ length: 4 }).map((_, index) => {
            const y = 20 + ((height - 40) / 3) * index
            return (
              <line
                key={index}
                x1="10"
                x2="90"
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.18)"
                strokeDasharray="2 3"
              />
            )
          })}
          {points.length > 1 ? <path d={fillPath} fill="url(#lineFill)" /> : null}
          {points.length > 0 ? <path d={path} fill="none" stroke={color} strokeWidth="2.5" /> : null}
          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="2.8" fill={color} />
          ))}
        </svg>
      </Box>
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))' }}>
        {points.map((point) => (
          <Box key={`${point.label}-${point.x}`} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatDate(point.label)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatCurrency(point.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function DonutChart({
  rows,
  valueKey,
  labelKey,
  colors,
}: {
  rows: Array<Record<string, unknown>>
  valueKey: string
  labelKey: string
  colors: string[]
}) {
  const size = 220
  const radius = 72
  const strokeWidth = 18
  const center = size / 2
  const circumference = 2 * Math.PI * radius
  const values = rows.map((row) => Number(row[valueKey] ?? 0))
  const total = Math.max(values.reduce((sum, value) => sum + value, 0), 1)

  let offset = 0

  return (
    <Box sx={{ display: 'grid', gap: 2, placeItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" role="img" aria-label="donut chart">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.14)"
            strokeWidth={strokeWidth}
          />
          {rows.map((row, index) => {
            const value = Number(row[valueKey] ?? 0)
            const fraction = value / total
            const dash = circumference * fraction
            const dashOffset = circumference * (1 - offset)
            offset += fraction

            return (
              <circle
                key={`${row[labelKey] ?? index}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            )
          })}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Total
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatNumber(total)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gap: 1, width: '100%' }}>
        {rows.map((row, index) => (
          <Box key={`${row[labelKey] ?? index}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[index % colors.length] }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {String(row[labelKey] ?? '')}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatNumber(Number(row[valueKey] ?? 0))}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function DashboardSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={148} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={320} />
      <Skeleton variant="rounded" height={260} />
      <Skeleton variant="rounded" height={260} />
    </Box>
  )
}

function getPurchaseStatusCounts(bundle: DashboardBundle | null) {
  const documents = bundle?.purchaseReport.documents ?? []
  const pending = documents.filter(
    (doc) => doc.estadoNombre?.toUpperCase().includes('PEND') || doc.estadoId === 2,
  ).length
  const approved = documents.filter(
    (doc) => doc.estadoNombre?.toUpperCase().includes('APROB') || doc.estadoId === 3,
  ).length
  const canceled = documents.filter(
    (doc) => doc.isCanceled || doc.estadoNombre?.toUpperCase().includes('ANUL') || doc.estadoId === 4,
  ).length

  return {
    total: documents.length,
    pending,
    approved,
    canceled,
    received: bundle?.summary.kpis.inventoryMovements ?? 0,
  }
}

export function DashboardPage() {
  const [bundle, setBundle] = useState<DashboardBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [threshold, setThreshold] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let active = true

    async function loadBundle() {
      try {
        setLoading(true)
        const data = await fetchDashboardBundle(days, threshold)
        if (active) {
          setBundle(data)
          setError(null)
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar el dashboard.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadBundle()
    return () => {
      active = false
    }
  }, [days, refreshTick, threshold])

  const purchaseStatus = useMemo(() => getPurchaseStatusCounts(bundle), [bundle])
  const topSuppliers = bundle?.purchaseReport.topSuppliers ?? []
  const purchaseTrend = bundle?.purchaseReport.byDay ?? []
  const inventoryTrend = bundle?.inventoryReport.movementsByDay ?? []
  const inventoryAlerts = bundle?.inventoryReport.lowStockItems ?? []
  const payablesAccounts = bundle?.payablesReport.accounts ?? []
  const agingBuckets = bundle?.payablesReport.agingBuckets ?? []
  const recentOrders = bundle?.purchaseReport.documents ?? []
  const overdueAccounts = useMemo(
    () => payablesAccounts.filter((account) => account.daysOverdue > 0).slice(0, 4),
    [payablesAccounts],
  )
  const totalPurchases = bundle?.purchaseReport.totals.total ?? '0'
  const periodLabel =
    days === 7 ? 'Semanal' : days === 30 ? 'Mensual' : days === 90 ? 'Trimestral' : `${days} dias`
  const chartRows = purchaseTrend.slice(-7)
  const orderBreakdown = [
    {
      label: 'Order Completed',
      value: purchaseStatus.approved,
      tone: '#6d5efc',
    },
    {
      label: 'Order Processing',
      value: purchaseStatus.pending,
      tone: '#61d6a7',
    },
    {
      label: 'Order Cancel',
      value: purchaseStatus.canceled,
      tone: '#ef6b63',
    },
  ]
  const quickActions = [
    { label: 'Crear orden', to: '/orders', icon: <ShoppingCartCheckoutOutlined /> },
    { label: 'Registrar proveedor', to: '/suppliers', icon: <AddBusinessOutlined /> },
    { label: 'Aprobar ordenes', to: '/reports', icon: <AssignmentTurnedInOutlined /> },
    { label: 'Ver reportes', to: '/reports', icon: <TrendingUpOutlined /> },
  ]

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'start', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            Dashboard ejecutivo
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
            Resumen operativo de compras
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 780 }}>
            KPIs, alertas, flujo de ordenes, proveedores y finanzas para responder rapido a
            gastos, pendientes y riesgos.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={() => setRefreshTick((value) => value + 1)}
          >
            Actualizar
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr 0.7fr' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={days}
            onChange={(_, value) => value && setDays(value)}
            aria-label="Periodo"
          >
            <ToggleButton value={7}>Semanal</ToggleButton>
            <ToggleButton value={30}>Mensual</ToggleButton>
            <ToggleButton value={90}>Trimestral</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Umbral stock"
            type="number"
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value) || 0)}
            slotProps={{ htmlInput: { min: 0 } }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' }, flexWrap: 'wrap' }}>
            <ButtonGroup variant="outlined">
              {quickActions.map((action) => (
                <Button key={action.label} component={RouterLink} to={action.to} startIcon={action.icon}>
                  {action.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Box>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.55fr) minmax(320px, 0.9fr)' },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                display: 'grid',
                gap: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    Invoice Overview
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Resumen de compras
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Sort By: {periodLabel}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' },
                  alignItems: 'stretch',
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2.5,
                    background:
                      'linear-gradient(180deg, rgba(109,94,252,0.09) 0%, rgba(255,255,255,0.35) 100%)',
                    display: 'grid',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Total de compras:
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                      {formatCurrency(totalPurchases)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      {formatDate(bundle?.purchaseReport.range.from ?? '')} -{' '}
                      {formatDate(bundle?.purchaseReport.range.to ?? '')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip color="success" variant="outlined" label={`${formatNumber(purchaseStatus.approved)} aprobadas`} />
                    <Chip color="warning" variant="outlined" label={`${formatNumber(purchaseStatus.pending)} pendientes`} />
                    <Chip color="error" variant="outlined" label={`${formatNumber(purchaseStatus.canceled)} anuladas`} />
                  </Box>

                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    {[
                      {
                        label: 'Proveedores activos',
                        value: formatNumber(bundle?.summary.kpis.suppliers ?? 0),
                      },
                      {
                        label: 'Cuentas por pagar',
                        value: formatCurrency(bundle?.payablesReport.totals.balance ?? '0'),
                      },
                      {
                        label: 'Stock critico',
                        value: formatNumber(bundle?.summary.kpis.lowStockItems ?? 0),
                      },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gap: 1.5, alignContent: 'start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      Ordenes por periodo
                    </Typography>
                    <Chip size="small" label={`${chartRows.length} puntos`} />
                  </Box>
                  {chartRows.length ? (
                    <ColumnChart
                      rows={chartRows.map((row) => ({
                        label: row.date,
                        value: Number(row.total),
                      }))}
                      labelKey="label"
                      valueKey="value"
                      color="#6d5efc"
                    />
                  ) : (
                    <EmptyState text="Sin compras en el periodo seleccionado." />
                  )}
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                display: 'grid',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'start' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    Order Stats
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Estado de ordenes
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Monthly
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gap: 2 }}>
                <DonutChart
                  rows={orderBreakdown.map((item) => ({
                    bucket: item.label,
                    documents: item.value,
                    balance: String(item.value),
                  }))}
                  labelKey="bucket"
                  valueKey="documents"
                  colors={['#6d5efc', '#61d6a7', '#ef6b63']}
                />

                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {orderBreakdown.map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.tone }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 28, textAlign: 'right' }}>
                          {formatNumber(item.value)}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            purchaseStatus.total
                              ? `${Math.round((item.value / Math.max(purchaseStatus.total, 1)) * 100)}%`
                              : '0%'
                          }
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <SectionPaper
              subtitle="Alertas"
              title="Notificaciones prioritarias"
              action={
                <Chip
                  label={`${overdueAccounts.length + inventoryAlerts.length + purchaseStatus.pending} alertas`}
                  color="warning"
                  size="small"
                />
              }
            >
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Ordenes atrasadas
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatNumber(overdueAccounts.length)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Stock critico
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatNumber(inventoryAlerts.length)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Facturas pendientes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatCurrency(bundle?.summary.kpis.pendingPayables ?? 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {overdueAccounts.length
                    ? 'Hay cuentas vencidas listas para seguimiento.'
                    : 'No hay cuentas vencidas en este periodo.'}
                </Typography>
              </Box>
            </SectionPaper>

            <SectionPaper subtitle="Inventario" title="Movimientos diarios">
              {inventoryTrend.length ? (
                <LineChart rows={inventoryTrend} labelKey="date" valueKey="movements" color="#0f766e" />
              ) : (
                <EmptyState text="Sin movimientos de inventario en el periodo seleccionado." />
              )}
            </SectionPaper>

            <SectionPaper subtitle="Finanzas" title="Aging de cuentas">
              {agingBuckets.length ? (
                <DonutChart
                  rows={agingBuckets}
                  labelKey="bucket"
                  valueKey="documents"
                  colors={['#355dfb', '#5b7cfa', '#f59e0b', '#ef4444', '#7c3aed']}
                />
              ) : (
                <EmptyState text="No hay cuentas por pagar para mostrar." />
              )}
            </SectionPaper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr 0.95fr' },
            }}
          >
            <SectionPaper subtitle="Proveedores" title="Top por volumen" action={<Chip label={`${topSuppliers.length} activos`} size="small" />}>
              {topSuppliers.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {topSuppliers.slice(0, 6).map((supplier, index) => {
                    const total = Number(supplier.total ?? 0)
                    const maxTotal = Math.max(...topSuppliers.map((item) => Number(item.total ?? 0)), 1)
                    const width = Math.max((total / maxTotal) * 100, total > 0 ? 12 : 0)

                    return (
                      <Box key={supplier.proveedorId} sx={{ display: 'grid', gap: 0.9, pb: 1.25, borderBottom: index < 5 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                                color: 'common.white',
                              }}
                            >
                              <AddBusinessOutlined fontSize="small" />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>{supplier.proveedorNombre}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {formatNumber(Number(supplier.documents ?? 0))} ordenes
                              </Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 800 }}>{formatCurrency(supplier.total)}</Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
                          <Box sx={{ width: `${width}%`, height: '100%', bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main', borderRadius: 999 }} />
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <EmptyState text="No hay proveedores con actividad en el periodo." />
              )}
            </SectionPaper>

            <SectionPaper
              subtitle="Flujo"
              title="Estado de ordenes"
              action={<Chip label={formatNumber(purchaseStatus.total)} size="small" />}
            >
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {recentOrders.slice(0, 5).map((doc, index) => {
                  const tone =
                    doc.estadoId === 3
                      ? 'success'
                      : doc.estadoId === 4
                        ? 'error'
                        : doc.estadoId === 2
                          ? 'warning'
                          : 'default'

                  return (
                    <Box
                      key={doc.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '48px minmax(0, 1fr) auto',
                        gap: 1.5,
                        alignItems: 'center',
                        py: 1.25,
                        borderBottom: index < 4 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: tone === 'success' ? 'success.main' : tone === 'warning' ? 'warning.main' : tone === 'error' ? 'error.main' : 'primary.main',
                          color: 'common.white',
                        }}
                      >
                        <ShoppingCartCheckoutOutlined fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Orden #{doc.docNum}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {doc.proveedorNombre ?? 'Sin proveedor'} - {doc.estadoNombre ?? 'Estado'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 800 }}>{formatCurrency(doc.totalDocumento)}</Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={tone as 'default' | 'error' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'}
                          label={formatDate(doc.fechaDocumento)}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </SectionPaper>

            <SectionPaper
              subtitle="Catalogo"
              title="Articulos criticos"
              action={<Chip label={`${inventoryAlerts.length} bajos`} size="small" color="warning" />}
            >
              {inventoryAlerts.length ? (
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {inventoryAlerts.slice(0, 4).map((item, index) => (
                    <Paper
                      key={`${item.articuloId}-${item.almacenId}`}
                      variant="outlined"
                      sx={{ p: 1.5, display: 'grid', gap: 1, borderRadius: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'start' }}>
                        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: index % 2 === 0 ? 'warning.main' : 'info.main',
                              color: 'common.white',
                            }}
                          >
                            <WarningAmberOutlined fontSize="small" />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800 }}>{item.articuloNombre}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item.articuloCodigo}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          size="small"
                          color={Number(item.stockDisponible) < threshold ? 'error' : 'warning'}
                          label={`${formatNumber(item.stockDisponible, 4)} disp.`}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.almacenNombre}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <EmptyState text="No hay articulos críticos para mostrar." />
              )}
            </SectionPaper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
            }}
          >
            <SectionPaper subtitle="Actividad" title="Ultimas ordenes y pagos">
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {recentOrders.slice(0, 5).map((doc) => (
                  <Paper
                    key={doc.id}
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', gap: 2 }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Orden #{doc.docNum}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {doc.proveedorNombre ?? 'Sin proveedor'} - {doc.estadoNombre ?? 'Estado'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(doc.totalDocumento)}</Typography>
                  </Paper>
                ))}
              </Box>
            </SectionPaper>

            <SectionPaper subtitle="Atajos" title="Accesos rapidos">
              <Stack spacing={1.5}>
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    component={RouterLink}
                    to={action.to}
                    variant="outlined"
                    endIcon={<ChevronRightOutlined />}
                    startIcon={action.icon}
                    fullWidth
                    sx={{ justifyContent: 'space-between' }}
                  >
                    {action.label}
                  </Button>
                ))}
                <Button
                  component={RouterLink}
                  to="/reports"
                  variant="contained"
                  endIcon={<TrendingUpOutlined />}
                  fullWidth
                >
                  Abrir panel de reportes
                </Button>
              </Stack>
            </SectionPaper>
          </Box>

          <SectionPaper subtitle="Auditoria" title="Eventos recientes">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Entidad</TableCell>
                  <TableCell>Accion</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bundle?.summary.recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.entidad}</TableCell>
                    <TableCell>{event.accion}</TableCell>
                    <TableCell>{event.usuarioId.slice(0, 8)}</TableCell>
                    <TableCell align="right">{formatDate(event.fecha)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionPaper>
        </>
      )}
    </Box>
  )
}
