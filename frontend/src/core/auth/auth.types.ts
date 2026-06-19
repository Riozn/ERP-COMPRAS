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

export type LoginInput = {
  identifier: string
  password: string
  telefono?: string | null
}

export type TwoFactorVerifyInput = {
  challengeToken: string
  code: string
}

export type RegisterInput = {
  username: string
  nombreCompleto: string
  email: string
  password: string
  rolId: number
  telefono?: string | null
  twoFactorEnabled?: boolean
}

export type ReferenceCatalogs = {
  monedas: Array<{ id: number; codigo: string; nombre: string; tasaActual: string }>
  almacenes: Array<{ id: string; nombre: string; ubicacion: string | null; activo: boolean }>
  impuestos: Array<{ id: number; taxCode: string; nombre: string; porcentaje: string; activo: boolean }>
  gruposArticulo: Array<{ id: number; codigo: string; nombre: string }>
  estadosDocumento: Array<{ id: number; codigo: string; nombre: string }>
  tiposDocumento: Array<{ id: number; codigo: string; nombre: string; afectaInventario: boolean }>
  roles: Array<{ id: number; codigo: string; nombre: string }>
}
