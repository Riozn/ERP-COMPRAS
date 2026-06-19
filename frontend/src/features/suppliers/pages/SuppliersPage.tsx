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

import { referenceData } from '../../../core/auth/auth.api'
import { formatDate } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { SupplierDialog } from '../components/SupplierDialog'
import { createSupplier, deleteSupplier, fetchSuppliers, updateSupplier } from '../suppliers.api'
import {
  emptySupplierFormValues,
  type Supplier,
  type SupplierCatalogs,
  type SupplierFormErrors,
  type SupplierFormValues,
} from '../supplier.types'
import { validateSupplierForm } from '../suppliers.validators'

type ToastState = {
  open: boolean
  message: string
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [catalogs, setCatalogs] = useState<SupplierCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState<SupplierFormValues>(emptySupplierFormValues)
  const [formErrors, setFormErrors] = useState<SupplierFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  function openCreateDialog() {
    setEditing(null)
    setForm({
      ...emptySupplierFormValues,
      monedaId: catalogs?.monedas[0] ? String(catalogs.monedas[0].id) : '',
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [supplierList, catalogsResponse] = await Promise.all([fetchSuppliers(), referenceData()])
        if (!active) return
        setSuppliers(supplierList)
        setCatalogs({ monedas: catalogsResponse.monedas })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los proveedores.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reloadToken])

  const title = useMemo(() => (editing ? 'Editar proveedor' : 'Nuevo proveedor'), [editing])

  function openEditDialog(supplier: Supplier) {
    setEditing(supplier)
    setForm({
      cardCode: supplier.cardCode,
      cardName: supplier.cardName,
      nombreComercial: supplier.nombreComercial ?? '',
      nitRut: supplier.nitRut,
      email: supplier.email ?? '',
      telefono: supplier.telefono ?? '',
      direccion: supplier.direccion ?? '',
      monedaId: String(supplier.monedaId),
      balanceCuenta: supplier.balanceCuenta,
      lineaCredito: supplier.lineaCredito,
      activo: supplier.activo,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  async function handleSubmit() {
    const nextErrors = validateSupplierForm(form)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)
    try {
      await (editing ? updateSupplier(editing.id, form) : createSupplier(form))
      setDialogOpen(false)
      setEditing(null)
      setReloadToken((current) => current + 1)
      setToast({
        open: true,
        message: editing ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el proveedor.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deleteSupplier(deleteTarget.id)
      setSuppliers((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Proveedor eliminado correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el proveedor.')
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
            Maestro comercial
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Proveedores
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            CRUD real conectado al backend para administrar proveedores y su moneda.
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
            Nuevo proveedor
          </Button>
        </Box>
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
                <TableCell>Codigo</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>NIT / RUT</TableCell>
                <TableCell>Moneda</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Actualizado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => {
                const currency = catalogs?.monedas.find((item) => item.id === supplier.monedaId)

                return (
                  <TableRow key={supplier.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{supplier.cardCode}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{supplier.cardName}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {supplier.nombreComercial ?? 'Sin nombre comercial'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{supplier.nitRut}</TableCell>
                    <TableCell>
                      {currency ? `${currency.codigo} - ${currency.nombre}` : `#${supplier.monedaId}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={supplier.activo ? 'success' : 'default'}
                        label={supplier.activo ? 'Activo' : 'Inactivo'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(supplier.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlined />}
                          onClick={() => openEditDialog(supplier)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          onClick={() => setDeleteTarget(supplier)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}

              {!suppliers.length ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      No hay proveedores registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </Paper>

      <SupplierDialog
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
        title="Eliminar proveedor"
        description={`Estas por eliminar a ${deleteTarget?.cardName ?? 'este proveedor'}. Esta accion no se puede deshacer.`}
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
