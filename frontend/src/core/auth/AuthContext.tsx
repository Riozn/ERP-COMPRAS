import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { clearAuthSession, loadAuthSession, onAuthSessionChanged, storeAuthSession } from './auth.storage'
import type { AuthSession, LoginInput, LoginResult, RegisterInput, TwoFactorVerifyInput } from './auth.types'
import * as authApi from './auth.api'

type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (input: LoginInput, options?: { rememberSession?: boolean }) => Promise<LoginResult>
  register: (input: RegisterInput) => Promise<AuthSession>
  verifyTwoFactor: (
    input: TwoFactorVerifyInput,
    options?: { rememberSession?: boolean },
  ) => Promise<AuthSession>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession())
  const [isHydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    const unsubscribe = onAuthSessionChanged(() => {
      setSession(loadAuthSession())
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrated,
      login: async (input, options) => {
        const result = await authApi.login(input)
        if (!('requiresTwoFactor' in result)) {
          storeAuthSession(result, options?.rememberSession ?? true)
          setSession(result)
        }

        return result
      },
      register: async (input) => {
        return authApi.register(input)
      },
      verifyTwoFactor: async (input, options) => {
        const result = await authApi.verifyTwoFactor(input)
        storeAuthSession(result, options?.rememberSession ?? true)
        setSession(result)
        return result
      },
      logout: async () => {
        if (session) {
          await authApi.logout(session.refreshToken).catch(() => undefined)
        }

        clearAuthSession()
        setSession(null)
      },
    }),
    [session, isHydrated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
