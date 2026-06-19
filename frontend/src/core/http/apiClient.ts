import {
  clearAuthSession,
  getRememberSessionPreference,
  loadAuthSession,
  storeAuthSession,
} from '../auth/auth.storage'
import type { AuthSession } from '../auth/auth.types'
import { ApiError } from './apiErrors'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  authenticated?: boolean
  retryOn401?: boolean
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '/api'

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return (await response.text()) as T
  }

  return (await response.json()) as T
}

async function refreshSession(): Promise<AuthSession | null> {
  const current = loadAuthSession()
  if (!current?.refreshToken) {
    return null
  }

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  })

  if (!response.ok) {
    return null
  }

  const session = (await response.json()) as AuthSession
  storeAuthSession(session, getRememberSessionPreference())
  return session
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const currentSession = loadAuthSession()
  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(options.authenticated !== false && currentSession?.accessToken
        ? { Authorization: `Bearer ${currentSession.accessToken}` }
        : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 401 && options.authenticated !== false && options.retryOn401 !== false) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return requestJson<T>(path, { ...options, retryOn401: false })
    }

    clearAuthSession()
  }

  const payload = await parseResponse<T | { error?: string; details?: unknown }>(response)

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' && payload && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `HTTP ${response.status}`

    throw new ApiError(
      response.status,
      errorMessage,
      typeof payload === 'object' && payload && 'details' in payload ? payload.details : undefined,
    )
  }

  return payload as T
}
