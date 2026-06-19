import { useMemo, useRef, type KeyboardEvent } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import type { TwoFactorChallenge } from '../../../core/auth/auth.types'

type Props = {
  mode: 'login' | 'twoFactor'
  loading: boolean
  identifier: string
  password: string
  phoneCountryCode: string
  phoneNumber: string
  code: string
  rememberSession: boolean
  challenge: TwoFactorChallenge | null
  error: string | null
  fieldErrors: {
    identifier?: string
    password?: string
    code?: string
  }
  onIdentifierChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onPhoneCountryCodeChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
  onCodeChange: (value: string) => void
  onRememberSessionChange: (value: boolean) => void
  onSubmit: () => void
  onBackToLogin: () => void
}

export function LoginForm({
  mode,
  loading,
  identifier,
  password,
  phoneCountryCode,
  phoneNumber,
  code,
  rememberSession,
  challenge,
  error,
  fieldErrors,
  onIdentifierChange,
  onPasswordChange,
  onPhoneCountryCodeChange,
  onPhoneNumberChange,
  onCodeChange,
  onRememberSessionChange,
  onSubmit,
  onBackToLogin,
}: Props) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const countryCodes = [
    '+591',
    '+54',
    '+56',
    '+57',
    '+51',
    '+52',
    '+593',
    '+595',
    '+598',
  ]

  const codeDigits = useMemo(
    () => Array.from({ length: 6 }, (_, index) => code[index] ?? ''),
    [code],
  )

  function handleDigitChange(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...codeDigits]
    nextDigits[index] = digit
    onCodeChange(nextDigits.join(''))

    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

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
            Acceso
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
            {mode === 'login' ? 'Inicia sesion' : 'Verifica tu identidad'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {mode === 'login'
              ? 'Ingresa con tu usuario o correo y el numero de WhatsApp para abrir el panel ERP.'
              : `Te enviamos un codigo por ${challenge?.deliveryChannel ?? 'el canal configurado'} a ${challenge?.maskedDestination ?? 'tu destino registrado'}.`}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.75,
            p: 0.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        >
          <Button variant="contained" disableElevation component={RouterLink} to="/login" fullWidth>
            Acceso
          </Button>
          <Button variant="text" component={RouterLink} to="/register" fullWidth>
            Registro
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {mode === 'login' ? (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Usuario o correo"
              value={identifier}
              onChange={(event) => onIdentifierChange(event.target.value)}
              error={Boolean(fieldErrors.identifier)}
              helperText={fieldErrors.identifier}
              autoComplete="username"
              fullWidth
            />
            <TextField
              label="Contrasena"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              autoComplete="current-password"
              fullWidth
            />
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'success.light',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Verificacion de dos pasos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                El codigo de acceso se enviara por WhatsApp.
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
                  label="Numero de celular"
                  value={phoneNumber}
                  onChange={(event) => onPhoneNumberChange(event.target.value)}
                  autoComplete="tel"
                  fullWidth
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                Ingresa tu numero de celular, por favor.
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1,
                py: 0.75,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <input
                id="remember-session"
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => onRememberSessionChange(event.target.checked)}
              />
              <label htmlFor="remember-session">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Recordarme en este equipo
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Mantiene el acceso abierto en este dispositivo.
                </Typography>
              </label>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={challenge?.deliveryChannel ?? '2FA'} color="primary" />
              <Chip size="small" variant="outlined" label={challenge?.maskedDestination ?? 'Destino'} />
              <Chip
                size="small"
                variant="outlined"
                label={
                  challenge?.expiresAt
                    ? `Expira ${new Date(challenge.expiresAt).toLocaleTimeString()}`
                    : 'Codigo temporal'
                }
              />
            </Box>

            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ingresa el codigo en los cuadros.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 1 }}>
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element
                    }}
                    aria-label={`Codigo ${index + 1}`}
                    value={digit}
                    onChange={(event) => handleDigitChange(index, event.target.value)}
                    onKeyDown={(event) => handleDigitKeyDown(index, event)}
                    inputMode="numeric"
                    maxLength={1}
                    style={{
                      height: 56,
                      borderRadius: 12,
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                ))}
              </Box>
              {fieldErrors.code ? (
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  {fieldErrors.code}
                </Typography>
              ) : null}
            </Box>
          </Box>
        )}

        <Button variant="contained" size="large" onClick={onSubmit} disabled={loading} fullWidth>
          {loading ? 'Procesando...' : mode === 'login' ? 'Continuar' : 'Verificar codigo'}
        </Button>

        {mode === 'twoFactor' ? (
          <>
            <Divider />
            <Button variant="text" onClick={onBackToLogin} disabled={loading}>
              Volver al inicio de sesion
            </Button>
          </>
        ) : null}
      </Box>
    </Paper>
  )
}
