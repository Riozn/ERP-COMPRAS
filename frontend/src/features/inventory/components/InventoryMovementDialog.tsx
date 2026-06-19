import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import type { InventoryCatalogs, InventoryMovementFormErrors, InventoryMovementFormValues } from '../inventory.types'

type Props = {
  open: boolean
  loading: boolean
  value: InventoryMovementFormValues
  errors: InventoryMovementFormErrors
  catalogs: InventoryCatalogs | null
  title: string
  onChange: (next: InventoryMovementFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function InventoryMovementDialog({
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
            Registra un movimiento de inventario para que el kardex quede consistente con la operacion.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <TextField
              select
              label="Articulo"
              value={value.articuloId}
              onChange={(event) => onChange({ ...value, articuloId: event.target.value })}
              error={Boolean(errors.articuloId)}
              helperText={errors.articuloId}
              fullWidth
            >
              {(catalogs?.articulos ?? []).map((article) => (
                <MenuItem key={article.id} value={article.id}>
                  {article.itemCode} - {article.itemName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Almacen"
              value={value.almacenId}
              onChange={(event) => onChange({ ...value, almacenId: event.target.value })}
              error={Boolean(errors.almacenId)}
              helperText={errors.almacenId}
              fullWidth
            >
              {(catalogs?.almacenes ?? []).map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.id} - {warehouse.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Documento referencia"
              value={value.docReferenciaId}
              onChange={(event) => onChange({ ...value, docReferenciaId: event.target.value })}
              error={Boolean(errors.docReferenciaId)}
              helperText={errors.docReferenciaId}
              fullWidth
            />
            <TextField
              select
              label="Tipo movimiento"
              value={value.tipoMovimiento}
              onChange={(event) =>
                onChange({ ...value, tipoMovimiento: event.target.value as 'IN' | 'OUT' })
              }
              error={Boolean(errors.tipoMovimiento)}
              helperText={errors.tipoMovimiento}
              fullWidth
            >
              <MenuItem value="IN">IN - Entrada</MenuItem>
              <MenuItem value="OUT">OUT - Salida</MenuItem>
            </TextField>
            <TextField
              label="Cantidad"
              value={value.cantidad}
              onChange={(event) => onChange({ ...value, cantidad: event.target.value })}
              error={Boolean(errors.cantidad)}
              helperText={errors.cantidad}
              fullWidth
            />
            <TextField
              label="Costo momento"
              value={value.costoMomento}
              onChange={(event) => onChange({ ...value, costoMomento: event.target.value })}
              error={Boolean(errors.costoMomento)}
              helperText={errors.costoMomento}
              fullWidth
            />
            <TextField
              label="Comentario"
              value={value.comentario}
              onChange={(event) => onChange({ ...value, comentario: event.target.value })}
              error={Boolean(errors.comentario)}
              helperText={errors.comentario}
              fullWidth
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
          </Box>
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
