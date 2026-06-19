import type { Request } from 'express'

type CommonMeta = {
  userAgent: string | null
  ipOrigen: string | null
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }
  }

  return undefined
}

function readNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function buildCreateUserRequest(req: Request) {
  const username = readString(req.body?.username)
  const nombreCompleto = readString(req.body?.nombreCompleto)
  const email = readString(req.body?.email)
  const telefono = readString(req.body?.telefono)
  const password = readString(req.body?.password)
  const rolId = readNumber(req.body?.rolId)

  return {
    username,
    nombreCompleto,
    email,
    telefono: telefono || null,
    password,
    rolId,
    twoFactorEnabled: readBoolean(req.body?.twoFactorEnabled) ?? false,
    active: readBoolean(req.body?.activo) ?? true,
    userAgent: req.headers['user-agent'] ?? null,
    ipOrigen: req.ip ?? null,
  }
}

export function buildUpdateUserRequest(req: Request): CommonMeta & {
  username?: string
  nombreCompleto?: string
  email?: string
  telefono?: string | null
  password?: string
  rolId?: number
  activo?: boolean
  twoFactorEnabled?: boolean
  googleSub?: string | null
} {
  const payload: CommonMeta & {
    username?: string
    nombreCompleto?: string
    email?: string
    telefono?: string | null
    password?: string
    rolId?: number
    activo?: boolean
    twoFactorEnabled?: boolean
    googleSub?: string | null
  } = {
    userAgent: req.headers['user-agent'] ?? null,
    ipOrigen: req.ip ?? null,
  }

  const username = readString(req.body?.username)
  const nombreCompleto = readString(req.body?.nombreCompleto)
  const email = readString(req.body?.email)
  const password = readString(req.body?.password)
  const rolId = readNumber(req.body?.rolId)
  const activo = readBoolean(req.body?.activo)
  const twoFactorEnabled = readBoolean(req.body?.twoFactorEnabled)

  if (username) payload.username = username
  if (nombreCompleto) payload.nombreCompleto = nombreCompleto
  if (email) payload.email = email
  if (req.body?.telefono === null || typeof req.body?.telefono === 'string') {
    payload.telefono = readString(req.body?.telefono) || null
  }
  if (password) payload.password = password
  if (rolId !== undefined) payload.rolId = rolId
  if (activo !== undefined) payload.activo = activo
  if (twoFactorEnabled !== undefined) payload.twoFactorEnabled = twoFactorEnabled
  if (req.body?.googleSub === null || typeof req.body?.googleSub === 'string') {
    payload.googleSub = req.body.googleSub
  }

  return payload
}

export function readTwoFactorEnabled(req: Request): boolean | undefined {
  return readBoolean(req.body?.enabled)
}
