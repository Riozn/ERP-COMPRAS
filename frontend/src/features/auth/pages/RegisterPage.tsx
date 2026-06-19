import { useEffect, useState } from 'react'
import { Box, Chip, Container, Paper, Typography, Button } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { referenceData } from '../../../core/auth/auth.api'
import { useAuth } from '../../../core/auth/AuthContext'
import type { ReferenceCatalogs } from '../../../core/auth/auth.types'
import { RegisterForm } from '../components/RegisterForm'
import { type RegisterFormValues, validateRegisterForm } from '../auth.validators'

const initialForm: RegisterFormValues = {
  username: '',
  nombreCompleto: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  rolId: '',
}

function composePhoneNumber(countryCode: string, phoneNumber: string): string {
  const digits = phoneNumber.trim().replace(/[^\d]/g, '')
  return digits ? `${countryCode}${digits}` : ''
}

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [catalogs, setCatalogs] = useState<ReferenceCatalogs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<RegisterFormValues>(initialForm)
  const [phoneCountryCode, setPhoneCountryCode] = useState('+591')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>(
    {},
  )

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
      return
    }

    let active = true

    async function loadCatalogs() {
      try {
        const data = await referenceData()
        if (!active) return
        setCatalogs(data)
        setValue((current) => ({
          ...current,
          rolId: current.rolId || String(data.roles[0]?.id ?? ''),
        }))
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los roles.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCatalogs()
    return () => {
      active = false
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit() {
    setError(null)
    const nextErrors = validateRegisterForm(value)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)
    try {
      await register({
        username: value.username.trim(),
        nombreCompleto: value.nombreCompleto.trim(),
        email: value.email.trim(),
        telefono: value.telefono.trim(),
        password: value.password,
        rolId: Number(value.rolId),
        twoFactorEnabled: true,
      })
      navigate('/login', {
        replace: true,
        state: {
          prefill: {
            identifier: value.email.trim(),
            password: value.password,
          },
        },
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la cuenta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', alignItems: 'stretch' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, flex: 1 }}>
        <Box
          sx={{
            minHeight: { md: 'calc(100vh - 64px)' },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.95fr' },
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
                Crea usuarios para operar el sistema.
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
                Registra administradores y usuarios internos con acceso controlado por rol.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="JWT" />
                <Chip label="2FA" />
                <Chip label="Roles" />
              </Box>

              <Button component={RouterLink} to="/login" variant="text" sx={{ justifySelf: 'start' }}>
                Volver al inicio de sesion
              </Button>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <RegisterForm
                loading={loading || saving}
                catalogs={catalogs}
                value={value}
                errors={fieldErrors}
                error={error}
                phoneCountryCode={phoneCountryCode}
                phoneNumber={phoneNumber}
                onChange={setValue}
                onPhoneCountryCodeChange={(nextCountryCode) => {
                  setPhoneCountryCode(nextCountryCode)
                  setValue((current) => ({
                    ...current,
                    telefono: composePhoneNumber(nextCountryCode, phoneNumber),
                  }))
                }}
                onPhoneNumberChange={(nextPhoneNumber) => {
                  setPhoneNumber(nextPhoneNumber)
                  setValue((current) => ({
                    ...current,
                    telefono: composePhoneNumber(phoneCountryCode, nextPhoneNumber),
                  }))
                }}
                onSubmit={handleSubmit}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
