import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Tab,
  Tabs,
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
import { formatCurrency, formatDate, formatNumber } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { fetchArticles } from '../../articles/articles.api'
import type { Article } from '../../articles/articles.types'
import {
  createInventoryMovement,
  deleteInventoryMovement,
  fetchInventoryMovements,
  fetchInventoryStock,
  updateInventoryMovement,
} from '../inventory.api'
import { InventoryMovementDialog } from '../components/InventoryMovementDialog'
import {
  emptyInventoryMovementFormValues,
  type InventoryCatalogs,
  type InventoryMovement,
  type InventoryMovementFormErrors,
  type InventoryMovementFormValues,
  type InventoryStock,
} from '../inventory.types'

type ToastState = {
  open: boolean
  message: string
}

type InventoryTab = 'stock' | 'movements'

export function InventoryPage() {
  const { session } = useAuth()
  const [tab, setTab] = useState<InventoryTab>('stock')
  const [stock, setStock] = useState<InventoryStock[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [catalogs, setCatalogs] = useState<InventoryCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InventoryMovement | null>(null)
  const [editing, setEditing] = useState<InventoryMovement | null>(null)
  const [form, setForm] = useState<InventoryMovementFormValues>(emptyInventoryMovementFormValues)
  const [formErrors, setFormErrors] = useState<InventoryMovementFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [stockResponse, movementResponse, articlesResponse, catalogsResponse] = await Promise.all([
          fetchInventoryStock(),
          fetchInventoryMovements(),
          fetchArticles(),
          referenceData(),
        ])
        if (!active) return
        setStock(stockResponse)
        setMovements(movementResponse)
        setArticles(articlesResponse)
        setCatalogs({
          almacenes: catalogsResponse.almacenes,
          articulos: articlesResponse,
        })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar inventario.')
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
    const available = stock.reduce((total, item) => total + Number(item.stockDisponible || 0), 0)
    const movementCount = movements.length
    const inCount = movements.filter((movement) => movement.tipoMovimiento === 'IN').length
    const outCount = movements.filter((movement) => movement.tipoMovimiento === 'OUT').length

    return [
      { label: 'Items con stock', value: stock.length.toString(), helper: 'Kardex activo' },
      { label: 'Movimientos', value: movementCount.toString(), helper: 'Entradas y salidas' },
      { label: 'Entradas', value: inCount.toString(), helper: 'Tipo IN' },
      { label: 'Salidas', value: outCount.toString(), helper: 'Tipo OUT' },
      { label: 'Disponible', value: formatNumber(available, 2), helper: 'Suma total' },
    ]
  }, [movements, stock])

  function openCreateDialog() {
    setEditing(null)
    setForm(emptyInventoryMovementFormValues)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(movement: InventoryMovement) {
    setEditing(movement)
    setForm({
      articuloId: movement.articuloId,
      almacenId: movement.almacenId,
      docReferenciaId: movement.docReferenciaId,
      tipoMovimiento: movement.tipoMovimiento,
      cantidad: movement.cantidad,
      costoMomento: movement.costoMomento,
      comentario: movement.comentario ?? '',
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  function validateForm(values: InventoryMovementFormValues): InventoryMovementFormErrors {
    const next: InventoryMovementFormErrors = {}
    if (!values.articuloId) next.articuloId = 'Articulo es obligatorio.'
    if (!values.almacenId) next.almacenId = 'Almacen es obligatorio.'
    if (!values.docReferenciaId) next.docReferenciaId = 'Documento referencia es obligatorio.'
    if (!values.cantidad) next.cantidad = 'Cantidad es obligatoria.'
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
        ? await updateInventoryMovement(editing.id, form)
        : await createInventoryMovement(form, session.user.id)
      setMovements((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      )
      setDialogOpen(false)
      setEditing(null)
      setToast({
        open: true,
        message: editing ? 'Movimiento actualizado correctamente.' : 'Movimiento registrado correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el movimiento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deleteInventoryMovement(deleteTarget.id)
      setMovements((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Movimiento eliminado correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el movimiento.')
    } finally {
      setSaving(false)
    }
  }

  const activeTable = tab === 'stock'

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
            Stock y movimientos
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Inventario
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Control de stock disponible y kardex operativo por almacen.
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
            Nuevo movimiento
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto">
          <Tab value="stock" label="Stock" />
          <Tab value="movements" label="Movimientos" />
        </Tabs>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, 1fr)' },
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
        ) : activeTable ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Articulo</TableCell>
                <TableCell>Almacen</TableCell>
                <TableCell align="right">Fisico</TableCell>
                <TableCell align="right">Comprometido</TableCell>
                <TableCell align="right">Solicitado</TableCell>
                <TableCell align="right">Disponible</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((item) => {
                const article = articles.find((current) => current.id === item.articuloId)
                const warehouse = catalogs?.almacenes.find((current) => current.id === item.almacenId)

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{article?.itemName ?? 'Articulo'}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {article?.itemCode ?? item.articuloId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{warehouse ? `${warehouse.id} - ${warehouse.nombre}` : item.almacenId}</TableCell>
                    <TableCell align="right">{formatNumber(item.stockFisico, 2)}</TableCell>
                    <TableCell align="right">{formatNumber(item.comprometido, 2)}</TableCell>
                    <TableCell align="right">{formatNumber(item.solicitado, 2)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        color={Number(item.stockDisponible) < 5 ? 'warning' : 'success'}
                        label={formatNumber(item.stockDisponible, 2)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Articulo</TableCell>
                <TableCell>Almacen</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Costo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.map((movement) => {
                const article = articles.find((current) => current.id === movement.articuloId)
                const warehouse = catalogs?.almacenes.find((current) => current.id === movement.almacenId)

                return (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        color={movement.tipoMovimiento === 'IN' ? 'success' : 'error'}
                        label={movement.tipoMovimiento === 'IN' ? 'Entrada' : 'Salida'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{article?.itemName ?? 'Articulo'}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {article?.itemCode ?? movement.articuloId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{warehouse ? warehouse.nombre : movement.almacenId}</TableCell>
                    <TableCell>{movement.docReferenciaId}</TableCell>
                    <TableCell>{formatDate(movement.fecha)}</TableCell>
                    <TableCell align="right">{formatNumber(movement.cantidad, 2)}</TableCell>
                    <TableCell align="right">{formatCurrency(movement.costoMomento)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlined />}
                          onClick={() => openEditDialog(movement)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          onClick={() => setDeleteTarget(movement)}
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

      <InventoryMovementDialog
        open={dialogOpen}
        loading={saving}
        value={form}
        errors={formErrors}
        catalogs={catalogs}
        title={editing ? 'Editar movimiento' : 'Nuevo movimiento'}
        onChange={setForm}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar movimiento"
        description="Estas por eliminar este movimiento de inventario. Esta accion no se puede deshacer."
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
