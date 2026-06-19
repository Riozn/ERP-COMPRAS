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

import { formatCurrency, formatDate, formatNumber } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { fetchSuppliers } from '../../suppliers/suppliers.api'
import { fetchOrders } from '../../orders/orders.api'
import type { Supplier } from '../../suppliers/supplier.types'
import {
  createPayableAccount,
  deletePayableAccount,
  fetchPayableAccounts,
  updatePayableAccount,
} from '../payables.api'
import { PayableAccountDialog } from '../components/PayableAccountDialog'
import {
  emptyPayableAccountFormValues,
  type PayableAccount,
  type PayableAccountFormErrors,
  type PayableAccountFormValues,
  type PayableCatalogs,
} from '../payables.types'

type ToastState = {
  open: boolean
  message: string
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
  const values = rows.map((row) => Number(row[valueKey] ?? 0))
  const max = Math.max(...values, 1)

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {rows.map((row, index) => {
        const value = Number(row[valueKey] ?? 0)
        const label = String(row[labelKey] ?? '')
        const width = Math.max((value / max) * 100, value > 0 ? 10 : 0)

        return (
          <Box key={`${label}-${index}`}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {label}
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

export function PayablesPage() {
  const [accounts, setAccounts] = useState<PayableAccount[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [catalogs, setCatalogs] = useState<PayableCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PayableAccount | null>(null)
  const [editing, setEditing] = useState<PayableAccount | null>(null)
  const [form, setForm] = useState<PayableAccountFormValues>(emptyPayableAccountFormValues)
  const [formErrors, setFormErrors] = useState<PayableAccountFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [accountList, supplierList, orderList] = await Promise.all([
          fetchPayableAccounts(),
          fetchSuppliers(),
          fetchOrders(),
        ])
        if (!active) return
        setAccounts(accountList)
        setSuppliers(supplierList)
        setCatalogs({
          suppliers: supplierList,
          orders: orderList,
        })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar las cuentas.')
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

  const summary = useMemo(() => {
    const overdue = accounts.reduce(
      (total, account) => total + Number(account.estado !== 'PAGADA' ? account.saldoPendiente : 0),
      0,
    )
    const balance = accounts.reduce((total, account) => total + Number(account.saldoPendiente || 0), 0)
    const open = accounts.filter((account) => account.estado !== 'PAGADA' && account.estado !== 'ANULADA').length
    return [
      { label: 'Cuentas', value: accounts.length.toString(), helper: 'Activas en el sistema' },
      { label: 'Abiertas', value: open.toString(), helper: 'Pendientes de pago' },
      { label: 'Saldo total', value: formatCurrency(balance), helper: 'Saldo acumulado' },
      { label: 'Vencido', value: formatCurrency(overdue), helper: 'Monto en riesgo' },
    ]
  }, [accounts])

  const aging = useMemo(() => {
    const bucket = (days: number) => {
      if (days <= 0) return 'Al dia'
      if (days <= 15) return '1-15'
      if (days <= 30) return '16-30'
      if (days <= 60) return '31-60'
      return '60+'
    }

    const currentDate = new Date()
    const groups = new Map<string, number>()
    accounts.forEach((account) => {
      const overdue = Math.max(
        0,
        Math.ceil((currentDate.getTime() - new Date(account.fechaVencimiento).getTime()) / 86400000),
      )
      const key = bucket(overdue)
      groups.set(key, (groups.get(key) ?? 0) + Number(account.saldoPendiente || 0))
    })

    return Array.from(groups.entries()).map(([bucketName, balance]) => ({
      bucket: bucketName,
      balance,
    }))
  }, [accounts])

  function openCreateDialog() {
    setEditing(null)
    setForm(emptyPayableAccountFormValues)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(account: PayableAccount) {
    setEditing(account)
    setForm({
      compraId: account.compraId,
      proveedorId: account.proveedorId,
      numeroFactura: account.numeroFactura,
      montoTotal: account.montoTotal,
      saldoPendiente: account.saldoPendiente,
      fechaVencimiento: account.fechaVencimiento,
      estado: account.estado,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  function validateForm(values: PayableAccountFormValues): PayableAccountFormErrors {
    const next: PayableAccountFormErrors = {}
    if (!values.compraId) next.compraId = 'Compra es obligatoria.'
    if (!values.proveedorId) next.proveedorId = 'Proveedor es obligatorio.'
    if (!values.numeroFactura) next.numeroFactura = 'Numero factura es obligatorio.'
    if (!values.fechaVencimiento) next.fechaVencimiento = 'Fecha vencimiento es obligatoria.'
    return next
  }

  async function handleSubmit() {
    const nextErrors = validateForm(form)
    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)
    try {
      const saved = editing ? await updatePayableAccount(editing.id, form) : await createPayableAccount(form)
      setAccounts((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      )
      setDialogOpen(false)
      setEditing(null)
      setToast({
        open: true,
        message: editing ? 'Cuenta actualizada correctamente.' : 'Cuenta creada correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar la cuenta.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deletePayableAccount(deleteTarget.id)
      setAccounts((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Cuenta eliminada correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar la cuenta.')
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
            Flujo financiero
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Cuentas por pagar
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Seguimiento de saldos pendientes, vencimientos y estado de pago.
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
            Nueva cuenta
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

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
        }}
      >
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Aging
          </Typography>
          {aging.length ? <MiniBars rows={aging} labelKey="bucket" valueKey="balance" color="error.main" /> : null}
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 4, display: 'grid', placeItems: 'center', minHeight: 260 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Factura</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => {
                  const supplier = suppliers.find((item) => item.id === account.proveedorId)

                  return (
                    <TableRow key={account.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{account.numeroFactura}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'grid', gap: 0.5 }}>
                          <Typography sx={{ fontWeight: 700 }}>{supplier?.cardName ?? 'Proveedor'}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {supplier?.cardCode ?? account.proveedorId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={account.estado === 'PAGADA' ? 'success' : account.estado === 'ANULADA' ? 'default' : 'warning'}
                          label={account.estado}
                        />
                      </TableCell>
                      <TableCell>{formatDate(account.fechaVencimiento)}</TableCell>
                      <TableCell align="right">{formatCurrency(account.saldoPendiente)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<EditOutlined />}
                            onClick={() => openEditDialog(account)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            startIcon={<DeleteOutlined />}
                            onClick={() => setDeleteTarget(account)}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      <PayableAccountDialog
        open={dialogOpen}
        loading={saving}
        value={form}
        errors={formErrors}
        catalogs={catalogs}
        title={editing ? 'Editar cuenta' : 'Nueva cuenta'}
        onChange={setForm}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar cuenta"
        description="Estas por eliminar esta cuenta por pagar. Esta accion no se puede deshacer."
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
