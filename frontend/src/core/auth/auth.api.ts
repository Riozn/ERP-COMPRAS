import { requestJson } from '../http/apiClient'
import type {
  AuthSession,
  LoginInput,
  LoginResult,
  RegisterInput,
  ReferenceCatalogs,
  TwoFactorVerifyInput,
} from './auth.types'

export function login(input: LoginInput): Promise<LoginResult> {
  return requestJson<LoginResult>('/auth/login', {
    method: 'POST',
    body: input,
    authenticated: false,
  })
}

export function verifyTwoFactor(input: TwoFactorVerifyInput): Promise<AuthSession> {
  return requestJson<AuthSession>('/auth/2fa/verify', {
    method: 'POST',
    body: input,
    authenticated: false,
  })
}

export function register(input: RegisterInput): Promise<AuthSession> {
  return requestJson<AuthSession>('/auth/register', {
    method: 'POST',
    body: input,
    authenticated: false,
  })
}

export function logout(refreshToken: string): Promise<void> {
  return requestJson<void>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}

export function me(): Promise<{ user: AuthSession['user'] }> {
  return requestJson<{ user: AuthSession['user'] }>('/auth/me')
}

export function referenceData(): Promise<ReferenceCatalogs> {
  return requestJson<ReferenceCatalogs>('/catalogs/reference-data', {
    authenticated: false,
  })
}
