import { randomBytes, createHash, randomInt } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

import { env } from '../config/env.js'
import { UnauthorizedError } from '../../shared/errors/http-error.js'
import type { PublicUser, StoredRole } from '../../domain/auth/auth.types.js'

const encoder = new TextEncoder()

export interface TokenService {
  signAccessToken(user: PublicUser, role: StoredRole): Promise<string>
  verifyAccessToken(token: string): Promise<AccessTokenPayload>
  signTwoFactorChallenge(userId: string): Promise<string>
  verifyTwoFactorChallenge(token: string): Promise<TwoFactorChallengePayload>
  createRefreshToken(): string
  hashRefreshToken(refreshToken: string): string
  getRefreshTokenExpiresAt(reference?: Date): Date
  hashTwoFactorCode(code: string): string
  generateTwoFactorCode(): string
}

export type AccessTokenPayload = {
  sub: string
  username: string
  email: string
  roleId: number
  roleCode: string
  roleName: string
}

export type TwoFactorChallengePayload = {
  sub: string
  purpose: '2fa'
}

function getSigningKey(): Uint8Array {
  if (!env.auth.jwtSecret.trim()) {
    throw new UnauthorizedError('JWT_SECRET no esta configurado.')
  }

  return encoder.encode(env.auth.jwtSecret)
}

export class JoseTokenService implements TokenService {
  async signAccessToken(user: PublicUser, role: StoredRole): Promise<string> {
    return new SignJWT({
      username: user.username,
      email: user.email,
      roleId: role.id,
      roleCode: role.codigo,
      roleName: role.nombre,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(env.auth.accessTokenExpiresIn)
      .sign(getSigningKey())
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, getSigningKey())

    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedError('Token invalido.')
    }

    return {
      sub: payload.sub,
      username: typeof payload.username === 'string' ? payload.username : '',
      email: typeof payload.email === 'string' ? payload.email : '',
      roleId: typeof payload.roleId === 'number' ? payload.roleId : 0,
      roleCode: typeof payload.roleCode === 'string' ? payload.roleCode : '',
      roleName: typeof payload.roleName === 'string' ? payload.roleName : '',
    }
  }

  async signTwoFactorChallenge(userId: string): Promise<string> {
    return new SignJWT({ purpose: '2fa' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${env.auth.twoFactorChallengeExpiresMinutes}m`)
      .sign(getSigningKey())
  }

  async verifyTwoFactorChallenge(token: string): Promise<TwoFactorChallengePayload> {
    const { payload } = await jwtVerify(token, getSigningKey())

    if (typeof payload.sub !== 'string' || payload.purpose !== '2fa') {
      throw new UnauthorizedError('Challenge 2FA invalido.')
    }

    return {
      sub: payload.sub,
      purpose: '2fa',
    }
  }

  createRefreshToken(): string {
    return randomBytes(48).toString('base64url')
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }

  getRefreshTokenExpiresAt(reference = new Date()): Date {
    return new Date(
      reference.getTime() + env.auth.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
    )
  }

  hashTwoFactorCode(code: string): string {
    return createHash('sha256').update(code).digest('hex')
  }

  generateTwoFactorCode(): string {
    return String(randomInt(100000, 1000000))
  }
}
