import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { renderWithTheme } from '../../../test/render'
import type { AuthSession, ReferenceCatalogs } from '../../../core/auth/auth.types'

const authMock = vi.hoisted(() => ({
  isAuthenticated: false,
  register: vi.fn(),
  referenceData: vi.fn(),
}))

vi.mock('../../../core/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: authMock.isAuthenticated,
    register: authMock.register,
  }),
}))

vi.mock('../../../core/auth/auth.api', () => ({
  referenceData: authMock.referenceData,
}))

import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    authMock.isAuthenticated = false
    authMock.register.mockReset()
    authMock.referenceData.mockReset()
  })

  it('loads the role catalog and submits a valid registration', async () => {
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

    authMock.referenceData.mockResolvedValue({
      monedas: [],
      almacenes: [],
      impuestos: [],
      gruposArticulo: [],
      estadosDocumento: [],
      tiposDocumento: [],
      roles: [{ id: 1, codigo: 'ADMIN', nombre: 'Administrador' }],
    })

    authMock.register.mockResolvedValueOnce({
      user: sessionUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    const { findByTestId, getByTestId, getByRole } = renderWithTheme(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>,
    )

    const userField = await findByTestId('register-username')
    const nameField = getByTestId('register-name')
    const emailField = getByTestId('register-email')
    const phoneField = getByTestId('register-phone')
    const passwordField = getByTestId('register-password')
    const confirmField = getByTestId('register-confirm-password')

    await user.type(userField, 'admin')
    await user.type(nameField, 'Admin ERP')
    await user.type(emailField, 'admin@erp.test')
    await user.type(phoneField, '70000123')
    await user.type(passwordField, 'secret123')
    await user.type(confirmField, 'secret123')
    await user.click(getByRole('button', { name: 'Crear cuenta' }))

    expect(authMock.referenceData).toHaveBeenCalledTimes(1)
    expect(authMock.register).toHaveBeenCalledWith({
      username: 'admin',
      nombreCompleto: 'Admin ERP',
      email: 'admin@erp.test',
      telefono: '+59170000123',
      password: 'secret123',
      rolId: 1,
      twoFactorEnabled: true,
    })
  })

  it('shows validation when WhatsApp number is missing', async () => {
    const user = userEvent.setup()

    authMock.referenceData.mockResolvedValue({
      monedas: [],
      almacenes: [],
      impuestos: [],
      gruposArticulo: [],
      estadosDocumento: [],
      tiposDocumento: [],
      roles: [{ id: 1, codigo: 'ADMIN', nombre: 'Administrador' }],
    })

    const { findByTestId, getByTestId, getByRole, findByText } = renderWithTheme(
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>,
    )

    const nameField = getByTestId('register-name')
    const emailField = getByTestId('register-email')
    const passwordField = getByTestId('register-password')
    const confirmField = getByTestId('register-confirm-password')

    
    await user.type(nameField, 'Admin ERP')
    await user.type(emailField, 'admin@erp.test')
    await user.type(passwordField, 'secret123')
    await user.type(confirmField, 'secret123')
    await user.click(getByRole('button', { name: 'Crear cuenta' }))

    await findByText('Ingresa tu numero de WhatsApp.')
    expect(authMock.register).not.toHaveBeenCalled()
  })
})
