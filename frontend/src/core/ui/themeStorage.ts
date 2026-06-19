export type ThemeMode = 'dark' | 'light'

const THEME_KEY = 'erp1-ui-theme'

export function readThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = window.localStorage.getItem(THEME_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

export function storeThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_KEY, mode)
}
