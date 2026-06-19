import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

import type { ArticleCatalogs, ArticleFormErrors, ArticleFormValues } from '../articles.types'

type Props = {
  open: boolean
  loading: boolean
  value: ArticleFormValues
  errors: ArticleFormErrors
  catalogs: ArticleCatalogs | null
  title: string
  onChange: (next: ArticleFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function ArticleDialog({
  open,
  loading,
  value,
  errors,
  catalogs,
  title,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2.5, pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Mantiene el catalogo de articulos listo para compras, inventario y analitica.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <TextField
              label="Codigo"
              value={value.itemCode}
              onChange={(event) => onChange({ ...value, itemCode: event.target.value })}
              error={Boolean(errors.itemCode)}
              helperText={errors.itemCode}
              fullWidth
            />
            <TextField
              label="Nombre"
              value={value.itemName}
              onChange={(event) => onChange({ ...value, itemName: event.target.value })}
              error={Boolean(errors.itemName)}
              helperText={errors.itemName}
              fullWidth
            />
            <TextField
              label="Descripcion"
              value={value.descripcion}
              onChange={(event) => onChange({ ...value, descripcion: event.target.value })}
              error={Boolean(errors.descripcion)}
              helperText={errors.descripcion}
              fullWidth
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
            <TextField
              label="Unidad de medida"
              value={value.unidadMedida}
              onChange={(event) => onChange({ ...value, unidadMedida: event.target.value })}
              error={Boolean(errors.unidadMedida)}
              helperText={errors.unidadMedida}
              fullWidth
            />
            <TextField
              label="Costo estandar"
              value={value.costoEstandar}
              onChange={(event) => onChange({ ...value, costoEstandar: event.target.value })}
              error={Boolean(errors.costoEstandar)}
              helperText={errors.costoEstandar}
              fullWidth
            />
            <TextField
              select
              label="Grupo"
              value={value.grupoId}
              onChange={(event) => onChange({ ...value, grupoId: event.target.value })}
              error={Boolean(errors.grupoId)}
              helperText={errors.grupoId}
              fullWidth
            >
              {(catalogs?.gruposArticulo ?? []).map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.codigo} - {group.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Impuesto"
              value={value.impuestoId}
              onChange={(event) => onChange({ ...value, impuestoId: event.target.value })}
              error={Boolean(errors.impuestoId)}
              helperText={errors.impuestoId}
              fullWidth
            >
              {(catalogs?.impuestos ?? []).map((tax) => (
                <MenuItem key={tax.id} value={tax.id}>
                  {tax.taxCode} - {tax.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={value.activo}
                onChange={(event) => onChange({ ...value, activo: event.target.checked })}
              />
            }
            label="Articulo activo"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
