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
import { formatCurrency, formatDate } from '../../../shared/utils/format'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { fetchArticles, createArticle, updateArticle, deleteArticle } from '../articles.api'
import { ArticleDialog } from '../components/ArticleDialog'
import {
  emptyArticleFormValues,
  type Article,
  type ArticleCatalogs,
  type ArticleFormErrors,
  type ArticleFormValues,
} from '../articles.types'

type ToastState = {
  open: boolean
  message: string
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [catalogs, setCatalogs] = useState<ArticleCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState<ArticleFormValues>(emptyArticleFormValues)
  const [formErrors, setFormErrors] = useState<ArticleFormErrors>({})
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [articleList, catalogsResponse] = await Promise.all([fetchArticles(), referenceData()])
        if (!active) return
        setArticles(articleList)
        setCatalogs({
          gruposArticulo: catalogsResponse.gruposArticulo,
          impuestos: catalogsResponse.impuestos,
        })
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los articulos.')
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

  const title = useMemo(() => (editing ? 'Editar articulo' : 'Nuevo articulo'), [editing])

  const summary = useMemo(() => {
    const activeItems = articles.filter((item) => item.activo).length
    const averageCost =
      articles.length > 0
        ? articles.reduce((total, item) => total + Number(item.costoEstandar || 0), 0) / articles.length
        : 0

    return [
      { label: 'Articulos', value: articles.length.toString(), helper: 'Catalogo total' },
      { label: 'Activos', value: activeItems.toString(), helper: 'Listos para operar' },
      { label: 'Costo promedio', value: formatCurrency(averageCost), helper: 'Referencia estandar' },
    ]
  }, [articles])

  function openCreateDialog() {
    setEditing(null)
    setForm(emptyArticleFormValues)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(article: Article) {
    setEditing(article)
    setForm({
      itemCode: article.itemCode,
      itemName: article.itemName,
      descripcion: article.descripcion ?? '',
      unidadMedida: article.unidadMedida,
      costoEstandar: article.costoEstandar,
      grupoId: String(article.grupoId),
      impuestoId: String(article.impuestoId),
      activo: article.activo,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  function validateForm(values: ArticleFormValues): ArticleFormErrors {
    const next: ArticleFormErrors = {}
    if (!values.itemCode.trim()) next.itemCode = 'Codigo es obligatorio.'
    if (!values.itemName.trim()) next.itemName = 'Nombre es obligatorio.'
    if (!values.grupoId) next.grupoId = 'Grupo es obligatorio.'
    if (!values.impuestoId) next.impuestoId = 'Impuesto es obligatorio.'
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
      const saved = editing ? await updateArticle(editing.id, form) : await createArticle(form)
      setArticles((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      )
      setDialogOpen(false)
      setEditing(null)
      setToast({
        open: true,
        message: editing ? 'Articulo actualizado correctamente.' : 'Articulo creado correctamente.',
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el articulo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await deleteArticle(deleteTarget.id)
      setArticles((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ open: true, message: 'Articulo eliminado correctamente.' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el articulo.')
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
            Catalogo de compra
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Articulos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestiona el maestro de articulos usado por compras, inventario y reportes.
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
            Nuevo articulo
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
                <TableCell>Codigo</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell>Impuesto</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Actualizado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((article) => {
                const group = catalogs?.gruposArticulo.find((item) => item.id === article.grupoId)
                const tax = catalogs?.impuestos.find((item) => item.id === article.impuestoId)

                return (
                  <TableRow key={article.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{article.itemCode}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{article.itemName}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {article.descripcion ?? 'Sin descripcion'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{group ? `${group.codigo} - ${group.nombre}` : `#${article.grupoId}`}</TableCell>
                    <TableCell>{tax ? `${tax.taxCode} - ${tax.nombre}` : `#${article.impuestoId}`}</TableCell>
                    <TableCell>{article.unidadMedida}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={article.activo ? 'success' : 'default'}
                        label={article.activo ? 'Activo' : 'Inactivo'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(article.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlined />}
                          onClick={() => openEditDialog(article)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          onClick={() => setDeleteTarget(article)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}

              {!articles.length ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      No hay articulos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </Paper>

      <ArticleDialog
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
        title="Eliminar articulo"
        description={`Estas por eliminar a ${deleteTarget?.itemName ?? 'este articulo'}. Esta accion no se puede deshacer.`}
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
