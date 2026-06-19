import { Alert, Box, Button, Chip, Divider, MenuItem, Paper, TextField, Typography } from '@mui/material'

import type { ReferenceCatalogs } from '../../../core/auth/auth.types'
import type { RegisterFormValues, FormErrors } from '../auth.validators'

const countryCodes = ['+591', '+54', '+56', '+57', '+51', '+52', '+593', '+595', '+598']

type Props = {
  loading: boolean
  catalogs: ReferenceCatalogs | null
  value: RegisterFormValues
  errors: FormErrors<RegisterFormValues>
  error: string | null
  phoneCountryCode: string
  phoneNumber: string
  onChange: (next: RegisterFormValues) => void
  onPhoneCountryCodeChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
  onSubmit: () => void
}

export function RegisterForm({
  loading,
  catalogs,
  value,
  errors,
  error,
  phoneCountryCode,
  phoneNumber,
  onChange,
  onPhoneCountryCodeChange,
  onPhoneNumberChange,
  onSubmit,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        border: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(16px)',
        backgroundColor: 'background.paper',
        boxShadow: '0 24px 60px rgba(3, 8, 20, 0.18)',
      }}
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Registro
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Registra un nuevo usuario para acceder al sistema ERP. Pedimos WhatsApp para activar
            2FA.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Usuario"
            value={value.username}
            onChange={(event) => onChange({ ...value, username: event.target.value })}
            error={Boolean(errors.username)}
            helperText={errors.username}
            autoComplete="username"
            slotProps={{ htmlInput: { 'data-testid': 'register-username' } }}
            fullWidth
          />
          <TextField
            label="Nombre completo"
            value={value.nombreCompleto}
            onChange={(event) => onChange({ ...value, nombreCompleto: event.target.value })}
            error={Boolean(errors.nombreCompleto)}
            helperText={errors.nombreCompleto}
            autoComplete="name"
            slotProps={{ htmlInput: { 'data-testid': 'register-name' } }}
            fullWidth
          />
          <TextField
            label="Correo"
            type="email"
            value={value.email}
            onChange={(event) => onChange({ ...value, email: event.target.value })}
            error={Boolean(errors.email)}
            helperText={errors.email}
            autoComplete="email"
            slotProps={{ htmlInput: { 'data-testid': 'register-email' } }}
            fullWidth
          />
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: errors.telefono ? 'error.main' : 'divider',
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              WhatsApp para 2FA
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
              Este numero se usara para enviarte el codigo de acceso.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
                gap: 1.5,
                mt: 2,
              }}
            >
              <TextField
                select
                label="Pais"
                value={phoneCountryCode}
                onChange={(event) => onPhoneCountryCodeChange(event.target.value)}
                fullWidth
              >
                {countryCodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Numero de WhatsApp"
                value={phoneNumber}
                onChange={(event) => onPhoneNumberChange(event.target.value)}
                error={Boolean(errors.telefono)}
                helperText={errors.telefono ?? 'Ingresa solo el numero local, sin el prefijo.'}
                autoComplete="tel"
                slotProps={{ htmlInput: { 'data-testid': 'register-phone' } }}
                fullWidth
              />
            </Box>
          </Box>
          <TextField
            label="Contrasena"
            type="password"
            value={value.password}
            onChange={(event) => onChange({ ...value, password: event.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password}
            autoComplete="new-password"
            slotProps={{ htmlInput: { 'data-testid': 'register-password' } }}
            fullWidth
          />
          <TextField
            label="Confirmar contrasena"
            type="password"
            value={value.confirmPassword}
            onChange={(event) => onChange({ ...value, confirmPassword: event.target.value })}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            autoComplete="new-password"
            slotProps={{ htmlInput: { 'data-testid': 'register-confirm-password' } }}
            fullWidth
          />
          <TextField
            select
            label="Rol"
            value={value.rolId}
            onChange={(event) => onChange({ ...value, rolId: event.target.value })}
            error={Boolean(errors.rolId)}
            helperText={errors.rolId}
            fullWidth
          >
            {(catalogs?.roles ?? []).map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.codigo} - {role.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label="JWT" />
          <Chip size="small" label="WhatsApp" />
          <Chip size="small" label="Acceso ERP" />
        </Box>

        <Button variant="contained" size="large" onClick={onSubmit} disabled={loading} fullWidth>
          {loading ? 'Creando...' : 'Crear cuenta'}
        </Button>

        <Divider />
      </Box>
    </Paper>
  )
}
