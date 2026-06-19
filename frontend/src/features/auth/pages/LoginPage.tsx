import { useEffect, useState } from 'react'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../../core/auth/AuthContext'
import type { TwoFactorChallenge } from '../../../core/auth/auth.types'
import { validateLoginForm, validateTwoFactorForm } from '../auth.validators'
import { LoginForm } from '../components/LoginForm'

const metrics = [
  { label: 'Autenticacion', value: 'JWT + 2FA' },
  { label: 'ERP', value: 'Operativo' },
  { label: 'Backend', value: 'Node + TS' },
]

export function LoginPage() {
  const { login, verifyTwoFactor, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = (location.state as
    | { prefill?: { identifier?: string; password?: string } }
    | null)?.prefill

  const [identifier, setIdentifier] = useState(prefill?.identifier ?? '')
  const [password, setPassword] = useState(prefill?.password ?? '')
  const [phoneCountryCode, setPhoneCountryCode] = useState('+591')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [rememberSession, setRememberSession] = useState(true)
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string
    password?: string
    code?: string
  }>({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit() {
    setError(null)

    if (!challenge) {
      const nextErrors = validateLoginForm({ identifier, password })
      setFieldErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        return
      }

      setLoading(true)
      try {
        const telefono = phoneNumber.trim()
          ? `${phoneCountryCode}${phoneNumber.trim().replace(/[^\d]/g, '')}`
          : null

        const result = await login({ identifier, password, telefono }, { rememberSession })
        if ('requiresTwoFactor' in result) {
          setChallenge(result)
          setCode('')
          setFieldErrors({})
          return
        }

        navigate((location.state as { from?: string } | null)?.from ?? '/dashboard', {
          replace: true,
        })
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesion.')
      } finally {
        setLoading(false)
      }
      return
    }

    const nextErrors = validateTwoFactorForm({ code })
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      await verifyTwoFactor(
        { challengeToken: challenge.challengeToken, code },
        { rememberSession },
      )
      navigate((location.state as { from?: string } | null)?.from ?? '/dashboard', {
        replace: true,
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo validar el codigo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', alignItems: 'stretch' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, flex: 1 }}>
        <Box
          sx={{
            minHeight: { md: 'calc(100vh - 64px)' },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.35fr 0.9fr' },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(53,93,251,0.12), rgba(93,225,200,0.08))',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'grid', gap: 3, maxWidth: 560 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main' }}>
                ERP1
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: 34, md: 56 }, lineHeight: 1.02, fontWeight: 800 }}
              >
                Control operativo para compras, inventario y finanzas.
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
                Una interfaz limpia, rapida y preparada para conectar el backend real:
                autenticacion segura, dashboard ejecutivo, CRUD y reportes de gestion.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {metrics.map((metric) => (
                  <Chip key={metric.label} label={`${metric.label}: ${metric.value}`} />
                ))}
              </Box>

              <Button component={RouterLink} to="/register" variant="text" sx={{ justifySelf: 'start' }}>
                Crear cuenta
              </Button>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <LoginForm
                mode={challenge ? 'twoFactor' : 'login'}
                loading={loading}
                identifier={identifier}
                password={password}
                phoneCountryCode={phoneCountryCode}
                phoneNumber={phoneNumber}
                code={code}
                rememberSession={rememberSession}
                challenge={challenge}
                error={error}
                fieldErrors={fieldErrors}
                onIdentifierChange={setIdentifier}
                onPasswordChange={setPassword}
                onPhoneCountryCodeChange={setPhoneCountryCode}
                onPhoneNumberChange={setPhoneNumber}
                onCodeChange={setCode}
                onRememberSessionChange={setRememberSession}
                onSubmit={handleSubmit}
                onBackToLogin={() => {
                  setChallenge(null)
                  setCode('')
                  setError(null)
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
