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

import type { PayableCatalogs, PayableAccountFormErrors, PayableAccountFormValues } from '../payables.types'

type Props = {
  open: boolean
  loading: boolean
  value: PayableAccountFormValues
  errors: PayableAccountFormErrors
  catalogs: PayableCatalogs | null
  title: string
  onChange: (next: PayableAccountFormValues) => void
  onSubmit: () => void
  onClose: () => void
}

export function PayableAccountDialog({
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
            Mantiene las cuentas por pagar alineadas con las ordenes de compra y el saldo pendiente.
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
              label="Compra"
              value={value.compraId}
              onChange={(event) => onChange({ ...value, compraId: event.target.value })}
              error={Boolean(errors.compraId)}
              helperText={errors.compraId}
              fullWidth
            >
              {(catalogs?.orders ?? []).map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  #{order.docNum} - {order.totalDocumento}
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
              label="Numero factura"
              value={value.numeroFactura}
              onChange={(event) => onChange({ ...value, numeroFactura: event.target.value })}
              error={Boolean(errors.numeroFactura)}
              helperText={errors.numeroFactura}
              fullWidth
            />
            <TextField
              label="Monto total"
              value={value.montoTotal}
              onChange={(event) => onChange({ ...value, montoTotal: event.target.value })}
              error={Boolean(errors.montoTotal)}
              helperText={errors.montoTotal}
              fullWidth
            />
            <TextField
              label="Saldo pendiente"
              value={value.saldoPendiente}
              onChange={(event) => onChange({ ...value, saldoPendiente: event.target.value })}
              error={Boolean(errors.saldoPendiente)}
              helperText={errors.saldoPendiente}
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
              select
              label="Estado"
              value={value.estado}
              onChange={(event) =>
                onChange({
                  ...value,
                  estado: event.target.value as PayableAccountFormValues['estado'],
                })
              }
              error={Boolean(errors.estado)}
              helperText={errors.estado}
              fullWidth
            >
              <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
              <MenuItem value="PARCIAL">PARCIAL</MenuItem>
              <MenuItem value="PAGADA">PAGADA</MenuItem>
              <MenuItem value="ANULADA">ANULADA</MenuItem>
            </TextField>
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
