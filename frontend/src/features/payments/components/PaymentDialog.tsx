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

import type { PaymentCatalogs, PaymentFormErrors, PaymentFormValues } from '../payments.types'

type Props = {
  open: boolean
  loading: boolean
  value: PaymentFormValues
  errors: PaymentFormErrors
  catalogs: PaymentCatalogs | null
  title: string
  onChange: (next: PaymentFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function PaymentDialog({
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
            Registra pagos contra cuentas pendientes para mantener el saldo actualizado.
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
              label="Cuenta por pagar"
              value={value.cuentaPorPagarId}
              onChange={(event) => onChange({ ...value, cuentaPorPagarId: event.target.value })}
              error={Boolean(errors.cuentaPorPagarId)}
              helperText={errors.cuentaPorPagarId}
              fullWidth
            >
              {(catalogs?.accounts ?? []).map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  #{account.numeroFactura} - {account.saldoPendiente}
                </MenuItem>
              ))}
            </TextField>
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
              label="Monto"
              value={value.monto}
              onChange={(event) => onChange({ ...value, monto: event.target.value })}
              error={Boolean(errors.monto)}
              helperText={errors.monto}
              fullWidth
            />
            <TextField
              label="Fecha pago"
              type="date"
              value={value.fechaPago}
              onChange={(event) => onChange({ ...value, fechaPago: event.target.value })}
              error={Boolean(errors.fechaPago)}
              helperText={errors.fechaPago}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Referencia"
              value={value.referencia}
              onChange={(event) => onChange({ ...value, referencia: event.target.value })}
              error={Boolean(errors.referencia)}
              helperText={errors.referencia}
              fullWidth
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
