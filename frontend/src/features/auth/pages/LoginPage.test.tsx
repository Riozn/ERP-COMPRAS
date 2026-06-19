import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { renderWithTheme } from '../../../test/render'
import type { AuthSession, LoginResult } from '../../../core/auth/auth.types'

const authMock = vi.hoisted(() => ({
  isAuthenticated: false,
  login: vi.fn(),
  verifyTwoFactor: vi.fn(),
}))

vi.mock('../../../core/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: authMock.isAuthenticated,
    login: authMock.login,
    verifyTwoFactor: authMock.verifyTwoFactor,
  }),
}))

import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    authMock.isAuthenticated = false
    authMock.login.mockReset()
    authMock.verifyTwoFactor.mockReset()
  })

  it('walks through login and 2FA verification', async () => {
    const user = userEvent.setup()
    const sessionUser = {
      id: 'user-1',
      username: 'admin',
      nombreCompleto: 'Admin ERP',
      email: 'admin@erp.test',
      rolId: 1,
      roleCode: 'ADMIN',
      roleName: 'Administrador',
      activo: true,
      twoFactorEnabled: true,
      ultimoLogin: null,
      createdAt: '2026-06-17T00:00:00.000Z',
      updatedAt: '2026-06-17T00:00:00.000Z',
    }

    authMock.login.mockResolvedValueOnce({
      requiresTwoFactor: true,
      challengeToken: 'challenge-1',
      deliveryChannel: 'WHATSAPP',
      maskedDestination: '+591 *** 123',
      expiresAt: '2026-06-17T12:00:00.000Z',
    })
    authMock.verifyTwoFactor.mockResolvedValueOnce({
      user: sessionUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    const { findByLabelText, findByText, getByRole } = renderWithTheme(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>,
    )

    const identifierField = await findByLabelText('Usuario o correo')
    const passwordField = await findByLabelText('Contrasena')
    const phoneField = await findByLabelText('Numero de celular')
    const rememberField = await findByLabelText(/Recordarme en este equipo/i)

    await user.type(identifierField, 'admin')
    await user.type(passwordField, 'secret123')
    await user.type(phoneField, '70000123')
    expect(rememberField).toBeChecked()
    await user.click(getByRole('button', { name: 'Continuar' }))

    await findByText('Verifica tu identidad')
    const code1 = await findByLabelText(/Codigo 1/i)
    const code2 = await findByLabelText(/Codigo 2/i)
    const code3 = await findByLabelText(/Codigo 3/i)
    const code4 = await findByLabelText(/Codigo 4/i)
    const code5 = await findByLabelText(/Codigo 5/i)
    const code6 = await findByLabelText(/Codigo 6/i)
    await user.type(code1, '6')
    await user.type(code2, '5')
    await user.type(code3, '4')
    await user.type(code4, '3')
    await user.type(code5, '2')
    await user.type(code6, '1')
    await user.click(getByRole('button', { name: 'Verificar codigo' }))

    await findByText('Verifica tu identidad')

    expect(authMock.login).toHaveBeenCalledWith(
      {
        identifier: 'admin',
        password: 'secret123',
        telefono: '+59170000123',
      },
      {
        rememberSession: true,
      },
    )
    expect(authMock.verifyTwoFactor).toHaveBeenCalledWith(
      {
        challengeToken: 'challenge-1',
        code: '654321',
      },
      {
        rememberSession: true,
      },
    )
  })
})
