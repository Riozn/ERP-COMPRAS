import { CssBaseline, ThemeProvider } from '@mui/material'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { AuthProvider } from '../core/auth/AuthContext'
import { readThemeMode, storeThemeMode, type ThemeMode } from '../core/ui/themeStorage'
import { buildTheme } from './theme'

type UiPreferencesContextValue = {
  mode: ThemeMode
  toggleMode: () => void
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | undefined>(undefined)

export function useUiPreferences() {
  const context = useContext(UiPreferencesContext)
  if (!context) {
    throw new Error('useUiPreferences must be used within AppProviders.')
  }

  return context
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => readThemeMode())

  useEffect(() => {
    storeThemeMode(mode)
  }, [mode])

  const theme = useMemo(() => buildTheme(mode), [mode])

  const value = useMemo<UiPreferencesContextValue>(
    () => ({
      mode,
      toggleMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  )

  return (
    <UiPreferencesContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </UiPreferencesContext.Provider>
  )
}
