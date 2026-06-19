import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
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
import { formatCurrency, formatDate } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { fetchPayableAccounts } from '../../payables/payables.api'
import type { PayableAccount } from '../../payables/payables.types'
import { fetchSuppliers } from '../../suppliers/suppliers.api'
import type { Supplier } from '../../suppliers/supplier.types'
import { createPayment, deletePayment, fetchPayments, updatePayment } from '../payments.api'
import { PaymentDialog } from '../components/PaymentDialog'
import {
  emptyPaymentFormValues,
  type Payment,
  type PaymentCatalogs,
  type PaymentFormErrors,
  type PaymentFormValues,
} from '../payments.types'

type ToastState = {
  open: boolean
  message: string
}

export function PaymentsPage() {
  const { session } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [accounts, setAccounts] = useState<PayableAccount[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [catalogs, setCatalogs] = useState<PaymentCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [form, setForm] = useState<PaymentFormValues>(emptyPaymentFormValues)
  const [formErrors, setFormErrors] = useState<PaymentFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [paymentList, accountList, supplierList] = await Promise.all([
          fetchPayments(),
          fetchPayableAccounts(),
          fetchSuppliers(),
        ])
        if (!active) return
        setPayments(paymentList)
        setAccounts(accountList)
        setSuppliers(supplierList)
        setCatalogs({
          accounts: accountList,
          suppliers: supplierList,
        })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los pagos.')
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
    const totalPaid = payments.reduce((total, payment) => total + Number(payment.monto || 0), 0)
    return [
      { label: 'Pagos', value: payments.length.toString(), helper: 'Movimientos registrados' },
      { label: 'Cuentas', value: accounts.length.toString(), helper: 'Cuentas relacionadas' },
      { label: 'Total pagado', value: formatCurrency(totalPaid), helper: 'Acumulado' },
    ]
  }, [accounts.length, payments])

  function openCreateDialog() {
    setEditing(null)
    setForm(emptyPaymentFormValues)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(payment: Payment) {
    setEditing(payment)
    setForm({
      cuentaPorPagarId: payment.cuentaPorPagarId,
      proveedorId: payment.proveedorId,
      monto: payment.monto,
      fechaPago: payment.fechaPago.slice(0, 10),
      referencia: payment.referencia ?? '',
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  function validateForm(values: PaymentFormValues): PaymentFormErrors {
    const next: PaymentFormErrors = {}
    if (!values.cuentaPorPagarId) next.cuentaPorPagarId = 'Cuenta es obligatoria.'
    if (!values.proveedorId) next.proveedorId = 'Proveedor es obligatorio.'
    if (!values.monto) next.monto = 'Monto es obligatorio.'
    if (!values.fechaPago) next.fechaPago = 'Fecha pago es obligatoria.'
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
      const saved = editing ? await updatePayment(editing.id, form) : await createPayment(form, session.user.id)
      setPayments((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      )
      setDialogOpen(false)
      setEditing(null)
      setToast({
        open: true,
        message: editing ? 'Pago actualizado correctamente.' : 'Pago registrado correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el pago.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deletePayment(deleteTarget.id)
      setPayments((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Pago eliminado correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el pago.')
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
            Tesoreria
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Pagos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Control de pagos aplicados a cuentas por pagar y saldo actualizado.
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
            Nuevo pago
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
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
                <TableCell>Fecha</TableCell>
                <TableCell>Cuenta</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => {
                const account = accounts.find((item) => item.id === payment.cuentaPorPagarId)
                const supplier = suppliers.find((item) => item.id === payment.proveedorId)

                return (
                  <TableRow key={payment.id} hover>
                    <TableCell>{formatDate(payment.fechaPago)}</TableCell>
                    <TableCell>#{account?.numeroFactura ?? payment.cuentaPorPagarId}</TableCell>
                    <TableCell>{supplier?.cardName ?? 'Proveedor'}</TableCell>
                    <TableCell>{payment.referencia ?? 'Sin referencia'}</TableCell>
                    <TableCell align="right">{formatCurrency(payment.monto)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlined />}
                          onClick={() => openEditDialog(payment)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          onClick={() => setDeleteTarget(payment)}
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

      <PaymentDialog
        open={dialogOpen}
        loading={saving}
        value={form}
        errors={formErrors}
        catalogs={catalogs}
        title={editing ? 'Editar pago' : 'Nuevo pago'}
        onChange={setForm}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar pago"
        description="Estas por eliminar este pago. Esta accion no se puede deshacer."
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
