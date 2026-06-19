import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthSession } from '../auth/auth.types'

const authStorageMock = vi.hoisted(() => {
  let session: AuthSession | null = null
  let rememberSessionPreference = true

  return {
    getSession: () => session,
    getRememberSessionPreference: () => rememberSessionPreference,
    setSession: (next: AuthSession | null) => {
      session = next
    },
    setRememberSessionPreference: (next: boolean) => {
      rememberSessionPreference = next
    },
    loadAuthSession: vi.fn(() => session),
    storeAuthSession: vi.fn((next: AuthSession) => {
      session = next
    }),
    clearAuthSession: vi.fn(() => {
      session = null
    }),
  }
})

vi.mock('../auth/auth.storage', () => ({
  loadAuthSession: authStorageMock.loadAuthSession,
  storeAuthSession: authStorageMock.storeAuthSession,
  clearAuthSession: authStorageMock.clearAuthSession,
  getRememberSessionPreference: authStorageMock.getRememberSessionPreference,
}))

import { requestJson } from './apiClient'

function jsonResponse(payload: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

describe('requestJson', () => {
  beforeEach(() => {
    authStorageMock.setSession(null)
    authStorageMock.setRememberSessionPreference(true)
    authStorageMock.loadAuthSession.mockClear()
    authStorageMock.storeAuthSession.mockClear()
    authStorageMock.clearAuthSession.mockClear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('injects the bearer token into authenticated requests', async () => {
    authStorageMock.setSession({
      user: {
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
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))

    const response = await requestJson<{ ok: boolean }>('/reports')

    expect(response).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/reports',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    )
  })

  it('refreshes the session and retries when the backend responds with 401', async () => {
    authStorageMock.setSession({
      user: {
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
      },
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
    })

    const refreshedSession: AuthSession = {
      user: {
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
      },
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    }

    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse(refreshedSession))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))

    const response = await requestJson<{ ok: boolean }>('/secure')

    expect(response).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/secure',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer old-access',
        }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ refreshToken: 'old-refresh' }),
      }),
    )
    expect(authStorageMock.storeAuthSession).toHaveBeenCalledWith(refreshedSession, true)
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/secure',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access',
        }),
      }),
    )
  })
})
