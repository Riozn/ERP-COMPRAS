export type StoredRole = {
  id: number
  codigo: string
  nombre: string
}

export type StoredUser = {
  id: string
  username: string
  nombreCompleto: string
  email: string
  telefono: string | null
  passwordHash: string
  googleSub: string | null
  rolId: number
  activo: boolean
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  ultimoLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = {
  id: string
  username: string
  nombreCompleto: string
  email: string
  rolId: number
  roleCode: string
  roleName: string
  activo: boolean
  twoFactorEnabled: boolean
  ultimoLogin: string | null
  createdAt: string
  updatedAt: string
}

export type StoredRefreshToken = {
  id: string
  usuarioId: string
  tokenHash: string
  issuedAt: Date
  expiresAt: Date
  revokedAt: Date | null
  userAgent: string | null
  ipOrigen: string | null
}

export type StoredTwoFactorCode = {
  id: string
  usuarioId: string
  codigoHash: string
  canal: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE' | 'APP'
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

export type AuthSession = {
  user: PublicUser
  accessToken: string
  refreshToken: string
}

export type TwoFactorChallenge = {
  requiresTwoFactor: true
  challengeToken: string
  deliveryChannel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE' | 'APP'
  maskedDestination: string
  expiresAt: string
  debugCode?: string
}

export type LoginResult = AuthSession | TwoFactorChallenge

export type RegisterUserInput = {
  username: string
  nombreCompleto: string
  email: string
  telefono: string
  password: string
  rolId: number
  twoFactorEnabled?: boolean
  userAgent?: string | null
  ipOrigen?: string | null
}

export type LoginInput = {
  identifier: string
  password: string
  telefono?: string | null
  userAgent?: string | null
  ipOrigen?: string | null
}

export type TwoFactorVerifyInput = {
  challengeToken: string
  code: string
  userAgent?: string | null
  ipOrigen?: string | null
}

export type UpdateUserInput = {
  username?: string
  nombreCompleto?: string
  email?: string
  telefono?: string | null
  rolId?: number
  activo?: boolean
  twoFactorEnabled?: boolean
  twoFactorSecret?: string | null
  googleSub?: string | null
  password?: string
}

export type UserListItem = PublicUser

export type RefreshSessionInput = {
  refreshToken: string
  userAgent?: string | null
  ipOrigen?: string | null
}
