import type { AuthSession } from './auth.types'

const LOCAL_KEY = 'erp1-auth-session'
const SESSION_KEY = 'erp1-auth-session-temp'
const SESSION_EVENT = 'erp1:auth-session-updated'
let rememberSessionPreference = true

function notifySessionChange(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(SESSION_EVENT))
}

function readSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function loadAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const local = readSession(window.localStorage.getItem(LOCAL_KEY))
  if (local) {
    rememberSessionPreference = true
    return local
  }

  const session = readSession(window.sessionStorage.getItem(SESSION_KEY))
  if (session) {
    rememberSessionPreference = false
    return session
  }

  return null
}

export function storeAuthSession(session: AuthSession, rememberSession = true): void {
  if (typeof window === 'undefined') {
    return
  }

  const serialized = JSON.stringify(session)

  if (rememberSession) {
    window.localStorage.setItem(LOCAL_KEY, serialized)
    window.sessionStorage.removeItem(SESSION_KEY)
  } else {
    window.sessionStorage.setItem(SESSION_KEY, serialized)
    window.localStorage.removeItem(LOCAL_KEY)
  }

  rememberSessionPreference = rememberSession
  notifySessionChange()
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LOCAL_KEY)
  window.sessionStorage.removeItem(SESSION_KEY)
  rememberSessionPreference = true
  notifySessionChange()
}

export function onAuthSessionChanged(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  window.addEventListener(SESSION_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(SESSION_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function getRememberSessionPreference(): boolean {
  return rememberSessionPreference
}
