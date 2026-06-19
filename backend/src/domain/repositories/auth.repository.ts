import type {
  LoginInput,
  RefreshSessionInput,
  RegisterUserInput,
  TwoFactorVerifyInput,
  StoredRefreshToken,
  StoredRole,
  StoredTwoFactorCode,
  StoredUser,
  UpdateUserInput,
} from '../auth/auth.types.js'

export type CreateRefreshTokenInput = {
  usuarioId: string
  tokenHash: string
  expiresAt: Date
  userAgent?: string | null
  ipOrigen?: string | null
}

export type CreateTwoFactorCodeInput = {
  usuarioId: string
  codigoHash: string
  canal: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE' | 'APP'
  expiresAt: Date
}

export interface AuthRepository {
  findRoleById(roleId: number): Promise<StoredRole | null>
  findRoleByCode(roleCode: string): Promise<StoredRole | null>
  findUserByIdentifier(identifier: string): Promise<StoredUser | null>
  findUserById(userId: string): Promise<StoredUser | null>
  listUsers(): Promise<StoredUser[]>
  createUser(input: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredUser>
  updateUser(userId: string, input: UpdateUserInput & { passwordHash?: string }): Promise<StoredUser>
  deleteUser(userId: string): Promise<void>
  updateLastLogin(userId: string, lastLoginAt: Date): Promise<void>
  createRefreshToken(input: CreateRefreshTokenInput): Promise<StoredRefreshToken>
  findRefreshTokenByHash(tokenHash: string): Promise<StoredRefreshToken | null>
  revokeRefreshToken(tokenId: string, revokedAt: Date): Promise<void>
  revokeUserRefreshTokens(userId: string, revokedAt: Date): Promise<void>
  createTwoFactorCode(input: CreateTwoFactorCodeInput): Promise<void>
  findLatestTwoFactorCodeByUserId(userId: string): Promise<StoredTwoFactorCode | null>
  markTwoFactorCodeAsUsed(codeId: string, usedAt: Date): Promise<void>
}
