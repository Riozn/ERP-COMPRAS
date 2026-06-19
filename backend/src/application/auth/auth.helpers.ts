import { env } from '../../infrastructure/config/env.js'
import type { PublicUser, StoredRole, StoredUser } from '../../domain/auth/auth.types.js'

export function mapPublicUser(user: StoredUser, role: StoredRole): PublicUser {
  return {
    id: user.id,
    username: user.username,
    nombreCompleto: user.nombreCompleto,
    email: user.email,
    rolId: user.rolId,
    roleCode: role.codigo,
    roleName: role.nombre,
    activo: user.activo,
    twoFactorEnabled: user.twoFactorEnabled,
    ultimoLogin: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export function normalizeIdentifier(value: string): string {
  return value.trim()
}

export function maskEmail(email: string): string {
  const [localPart, domain = ''] = email.split('@')
  if (!localPart || !domain) {
    return '***'
  }

  const visible = localPart.slice(0, 2)
  return `${visible}***@${domain}`
}

export function maskPhone(phone: string): string {
  const normalized = phone.trim()
  if (!normalized) {
    return '***'
  }

  const visibleStart = normalized.startsWith('+') ? 4 : 2
  const visibleEnd = 2
  const start = normalized.slice(0, visibleStart)
  const end = normalized.slice(-visibleEnd)
  return `${start}${normalized.length > visibleStart + visibleEnd ? '***' : ''}${end}`
}

export function getChallengeExpiresAt(): Date {
  return new Date(
    Date.now() + env.auth.twoFactorChallengeExpiresMinutes * 60 * 1000,
  )
}
