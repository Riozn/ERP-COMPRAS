import {
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
  Box,
} from '@mui/material'

import type { SupplierCatalogs, SupplierFormErrors, SupplierFormValues } from '../supplier.types'

type SupplierDialogProps = {
  open: boolean
  loading: boolean
  value: SupplierFormValues
  errors: SupplierFormErrors
  catalogs: SupplierCatalogs | null
  title: string
  onChange: (next: SupplierFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function SupplierDialog({
  open,
  loading,
  value,
  errors,
  catalogs,
  title,
  onChange,
  onSubmit,
  onClose,
}: SupplierDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2.5, pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Completa los datos del proveedor para mantener el maestro comercial actualizado.
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
              value={value.cardCode}
              onChange={(event) => onChange({ ...value, cardCode: event.target.value })}
              error={Boolean(errors.cardCode)}
              helperText={errors.cardCode}
              fullWidth
            />
            <TextField
              label="Razon social"
              value={value.cardName}
              onChange={(event) => onChange({ ...value, cardName: event.target.value })}
              error={Boolean(errors.cardName)}
              helperText={errors.cardName}
              fullWidth
            />
            <TextField
              label="Nombre comercial"
              value={value.nombreComercial}
              onChange={(event) => onChange({ ...value, nombreComercial: event.target.value })}
              error={Boolean(errors.nombreComercial)}
              helperText={errors.nombreComercial}
              fullWidth
            />
            <TextField
              label="NIT / RUT"
              value={value.nitRut}
              onChange={(event) => onChange({ ...value, nitRut: event.target.value })}
              error={Boolean(errors.nitRut)}
              helperText={errors.nitRut}
              fullWidth
            />
            <TextField
              label="Correo"
              type="email"
              value={value.email}
              onChange={(event) => onChange({ ...value, email: event.target.value })}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
            />
            <TextField
              label="Telefono"
              value={value.telefono}
              onChange={(event) => onChange({ ...value, telefono: event.target.value })}
              error={Boolean(errors.telefono)}
              helperText={errors.telefono}
              fullWidth
            />
            <TextField
              label="Direccion"
              value={value.direccion}
              onChange={(event) => onChange({ ...value, direccion: event.target.value })}
              error={Boolean(errors.direccion)}
              helperText={errors.direccion}
              fullWidth
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
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
              label="Saldo cuenta"
              value={value.balanceCuenta}
              onChange={(event) => onChange({ ...value, balanceCuenta: event.target.value })}
              error={Boolean(errors.balanceCuenta)}
              helperText={errors.balanceCuenta}
              fullWidth
            />
            <TextField
              label="Linea de credito"
              value={value.lineaCredito}
              onChange={(event) => onChange({ ...value, lineaCredito: event.target.value })}
              error={Boolean(errors.lineaCredito)}
              helperText={errors.lineaCredito}
              fullWidth
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={value.activo}
                onChange={(event) => onChange({ ...value, activo: event.target.checked })}
              />
            }
            label="Proveedor activo"
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
