import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { AddOutlined, DeleteOutlined, EditOutlined, RefreshOutlined } from '@mui/icons-material'

import { useAuth } from '../../../core/auth/AuthContext'
import { referenceData } from '../../../core/auth/auth.api'
import { formatCurrency, formatDate } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { fetchSuppliers } from '../../suppliers/suppliers.api'
import { type Supplier } from '../../suppliers/supplier.types'
import { createOrder, deleteOrder, fetchOrders, updateOrder } from '../orders.api'
import { OrderDialog } from '../components/OrderDialog'
import {
  emptyOrderFormValues,
  type Order,
  type OrderCatalogs,
  type OrderFormErrors,
  type OrderFormValues,
} from '../orders.types'

type ToastState = {
  open: boolean
  message: string
}

export function OrdersPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [catalogs, setCatalogs] = useState<OrderCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const [form, setForm] = useState<OrderFormValues>(emptyOrderFormValues)
  const [formErrors, setFormErrors] = useState<OrderFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [orderList, supplierList, catalogsResponse] = await Promise.all([
          fetchOrders(),
          fetchSuppliers(),
          referenceData(),
        ])
        if (!active) return
        setOrders(orderList)
        setSuppliers(supplierList)
        setCatalogs({
          tiposDocumento: catalogsResponse.tiposDocumento,
          estadosDocumento: catalogsResponse.estadosDocumento,
          monedas: catalogsResponse.monedas,
          suppliers: supplierList,
        })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar las ordenes.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reloadToken])

  const title = useMemo(() => (editing ? 'Editar orden' : 'Nueva orden'), [editing])

  const summary = useMemo(() => {
    const openOrders = orders.filter((order) => !order.isCanceled).length
    const canceledOrders = orders.filter((order) => order.isCanceled).length
    const totalValue = orders.reduce((total, order) => total + Number(order.totalDocumento || 0), 0)

    return [
      { label: 'Ordenes', value: orders.length.toString(), helper: 'Documentos registrados' },
      { label: 'Abiertas', value: openOrders.toString(), helper: 'Operativas' },
      { label: 'Anuladas', value: canceledOrders.toString(), helper: 'Documentos cerrados' },
      { label: 'Valor total', value: formatCurrency(totalValue), helper: 'Suma acumulada' },
    ]
  }, [orders])

  function openCreateDialog() {
    setEditing(null)
    setForm(emptyOrderFormValues)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(order: Order) {
    setEditing(order)
    setForm({
      tipoDocId: String(order.tipoDocId),
      docNum: String(order.docNum),
      proveedorId: order.proveedorId ?? '',
      estadoId: String(order.estadoId),
      monedaId: String(order.monedaId),
      fechaDocumento: order.fechaDocumento.slice(0, 10),
      fechaVencimiento: order.fechaVencimiento ?? '',
      subtotal: order.subtotal,
      descuentoTotal: order.descuentoTotal,
      impuestosTotal: order.impuestosTotal,
      totalDocumento: order.totalDocumento,
      comentarios: order.comentarios ?? '',
      isCanceled: order.isCanceled,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  function validateForm(values: OrderFormValues): OrderFormErrors {
    const next: OrderFormErrors = {}
    if (!values.tipoDocId) next.tipoDocId = 'Tipo documento es obligatorio.'
    if (!values.docNum) next.docNum = 'Numero de documento es obligatorio.'
    if (!values.estadoId) next.estadoId = 'Estado es obligatorio.'
    if (!values.monedaId) next.monedaId = 'Moneda es obligatoria.'
    if (!values.fechaDocumento) next.fechaDocumento = 'Fecha documento es obligatoria.'
    return next
  }

  async function handleSubmit() {
    const nextErrors = validateForm(form)
    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    if (!session?.user.id) {
      setError('No se pudo determinar el usuario actual.')
      return
    }

    setSaving(true)
    try {
      const saved = editing
        ? await updateOrder(editing.id, form)
        : await createOrder(form, session.user.id)
      setOrders((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      )
      setDialogOpen(false)
      setEditing(null)
      setToast({
        open: true,
        message: editing ? 'Orden actualizada correctamente.' : 'Orden creada correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar la orden.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deleteOrder(deleteTarget.id)
      setOrders((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Orden eliminada correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la orden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
            Gestion documental
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Ordenes
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Cabeceras de compra para operar el flujo de adquisiciones del ERP.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={() => setReloadToken((current) => current + 1)}
          >
            Refrescar
          </Button>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreateDialog}>
            Nueva orden
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, 1fr)' },
        }}
      >
        {summary.map((item) => (
          <Paper key={item.label} elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {item.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.helper}
            </Typography>
          </Paper>
        ))}
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'grid', placeItems: 'center', minHeight: 260 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Documento</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const supplier = suppliers.find((item) => item.id === order.proveedorId)
                const state = catalogs?.estadosDocumento.find((item) => item.id === order.estadoId)

                return (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{order.docNum}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{supplier?.cardName ?? 'Sin proveedor'}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {supplier?.cardCode ?? 'Sin codigo'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={order.isCanceled ? 'default' : 'primary'}
                        label={state ? state.nombre : 'Estado'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(order.fechaDocumento)}</TableCell>
                    <TableCell align="right">{formatCurrency(order.totalDocumento)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlined />}
                          onClick={() => openEditDialog(order)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          onClick={() => setDeleteTarget(order)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}

              {!orders.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      No hay ordenes registradas.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </Paper>

      <OrderDialog
        open={dialogOpen}
        loading={saving}
        value={form}
        errors={formErrors}
        catalogs={catalogs}
        title={title}
        onChange={setForm}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar orden"
        description={`Estas por eliminar la orden #${deleteTarget?.docNum ?? ''}. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="error"
        loading={saving}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
      />
    </Box>
  )
}
