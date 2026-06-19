import { Alert, Box, Button, Chip, Divider, MenuItem, Paper, TextField, Typography } from '@mui/material'

import type { ReferenceCatalogs } from '../../../core/auth/auth.types'
import type { RegisterFormValues, FormErrors } from '../auth.validators'

type Props = {
  loading: boolean
  catalogs: ReferenceCatalogs | null
  value: RegisterFormValues
  errors: FormErrors<RegisterFormValues>
  error: string | null
  onChange: (next: RegisterFormValues) => void
  onSubmit: () => void
}

export function RegisterForm({
  loading,
  catalogs,
  value,
  errors,
  error,
  onChange,
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
            Registra un nuevo usuario para acceder al sistema ERP.
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
            fullWidth
          />
          <TextField
            label="Nombre completo"
            value={value.nombreCompleto}
            onChange={(event) => onChange({ ...value, nombreCompleto: event.target.value })}
            error={Boolean(errors.nombreCompleto)}
            helperText={errors.nombreCompleto}
            autoComplete="name"
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
            fullWidth
          />
          <TextField
            label="Contrasena"
            type="password"
            value={value.password}
            onChange={(event) => onChange({ ...value, password: event.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password}
            autoComplete="new-password"
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
