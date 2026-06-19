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

import type { OrderCatalogs, OrderFormErrors, OrderFormValues } from '../orders.types'

type Props = {
  open: boolean
  loading: boolean
  value: OrderFormValues
  errors: OrderFormErrors
  catalogs: OrderCatalogs | null
  title: string
  onChange: (next: OrderFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function OrderDialog({
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
            Captura la cabecera de la orden de compra y deja el documento listo para el flujo operativo.
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
              label="Tipo documento"
              value={value.tipoDocId}
              onChange={(event) => onChange({ ...value, tipoDocId: event.target.value })}
              error={Boolean(errors.tipoDocId)}
              helperText={errors.tipoDocId}
              fullWidth
            >
              {(catalogs?.tiposDocumento ?? []).map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.codigo} - {docType.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Numero documento"
              value={value.docNum}
              onChange={(event) => onChange({ ...value, docNum: event.target.value })}
              error={Boolean(errors.docNum)}
              helperText={errors.docNum}
              fullWidth
            />
            <TextField
              select
              label="Proveedor"
              value={value.proveedorId}
              onChange={(event) => onChange({ ...value, proveedorId: event.target.value })}
              error={Boolean(errors.proveedorId)}
              helperText={errors.proveedorId}
              fullWidth
            >
              {(catalogs?.suppliers ?? []).map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.cardCode} - {supplier.cardName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Estado"
              value={value.estadoId}
              onChange={(event) => onChange({ ...value, estadoId: event.target.value })}
              error={Boolean(errors.estadoId)}
              helperText={errors.estadoId}
              fullWidth
            >
              {(catalogs?.estadosDocumento ?? []).map((state) => (
                <MenuItem key={state.id} value={state.id}>
                  {state.codigo} - {state.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Moneda"
              value={value.monedaId}
              onChange={(event) => onChange({ ...value, monedaId: event.target.value })}
              error={Boolean(errors.monedaId)}
              helperText={errors.monedaId}
              fullWidth
            >
              {(catalogs?.monedas ?? []).map((currency) => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.codigo} - {currency.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha documento"
              type="date"
              value={value.fechaDocumento}
              onChange={(event) => onChange({ ...value, fechaDocumento: event.target.value })}
              error={Boolean(errors.fechaDocumento)}
              helperText={errors.fechaDocumento}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Fecha vencimiento"
              type="date"
              value={value.fechaVencimiento}
              onChange={(event) => onChange({ ...value, fechaVencimiento: event.target.value })}
              error={Boolean(errors.fechaVencimiento)}
              helperText={errors.fechaVencimiento}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Subtotal"
              value={value.subtotal}
              onChange={(event) => onChange({ ...value, subtotal: event.target.value })}
              error={Boolean(errors.subtotal)}
              helperText={errors.subtotal}
              fullWidth
            />
            <TextField
              label="Descuento total"
              value={value.descuentoTotal}
              onChange={(event) => onChange({ ...value, descuentoTotal: event.target.value })}
              error={Boolean(errors.descuentoTotal)}
              helperText={errors.descuentoTotal}
              fullWidth
            />
            <TextField
              label="Impuestos total"
              value={value.impuestosTotal}
              onChange={(event) => onChange({ ...value, impuestosTotal: event.target.value })}
              error={Boolean(errors.impuestosTotal)}
              helperText={errors.impuestosTotal}
              fullWidth
            />
            <TextField
              label="Total documento"
              value={value.totalDocumento}
              onChange={(event) => onChange({ ...value, totalDocumento: event.target.value })}
              error={Boolean(errors.totalDocumento)}
              helperText={errors.totalDocumento}
              fullWidth
            />
            <TextField
              label="Comentarios"
              value={value.comentarios}
              onChange={(event) => onChange({ ...value, comentarios: event.target.value })}
              error={Boolean(errors.comentarios)}
              helperText={errors.comentarios}
              fullWidth
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={value.isCanceled}
                onChange={(event) => onChange({ ...value, isCanceled: event.target.checked })}
              />
            }
            label="Documento anulado"
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
