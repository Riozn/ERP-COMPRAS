import { env } from '../../infrastructure/config/env.js'
import type {
  AuthSession,
  StoredRole,
  StoredUser,
  TwoFactorChallenge,
} from '../../domain/auth/auth.types.js'
import type { AuditRepository } from '../../domain/repositories/audit.repository.js'
import type { AuthRepository } from '../../domain/repositories/auth.repository.js'
import type { MailerService } from '../../infrastructure/mail/mailer.service.js'
import type { WhatsAppDeliveryService } from '../../infrastructure/notifications/twilio-whatsapp.service.js'
import type { TokenService } from '../../infrastructure/security/token.service.js'
import {
  mapPublicUser,
  maskEmail,
  maskPhone,
  getChallengeExpiresAt,
} from './auth.helpers.js'

export type SessionMetadata = {
  userAgent: string | null
  ipOrigen: string | null
  auditAction: string
}

export type SessionDependencies = {
  authRepository: AuthRepository
  auditRepository: AuditRepository
  tokenService: TokenService
  mailerService: MailerService
  whatsappService: WhatsAppDeliveryService
}

export async function issueSession(
  deps: SessionDependencies,
  user: StoredUser,
  role: StoredRole,
  meta: SessionMetadata,
): Promise<AuthSession> {
  const lastLoginAt = new Date()
  await deps.authRepository.updateLastLogin(user.id, lastLoginAt)

  const sessionUser = {
    ...user,
    ultimoLogin: lastLoginAt,
  }

  const accessToken = await deps.tokenService.signAccessToken(
    mapPublicUser(sessionUser, role),
    role,
  )
  const refreshToken = deps.tokenService.createRefreshToken()

  await deps.authRepository.createRefreshToken({
    usuarioId: user.id,
    tokenHash: deps.tokenService.hashRefreshToken(refreshToken),
    expiresAt: deps.tokenService.getRefreshTokenExpiresAt(),
    userAgent: meta.userAgent,
    ipOrigen: meta.ipOrigen,
  })

  await deps.auditRepository.record({
    usuarioId: user.id,
    entidad: 'o_usuarios',
    entidadId: user.id,
    accion: meta.auditAction,
    ipOrigen: meta.ipOrigen,
  })

  return {
    user: mapPublicUser(sessionUser, role),
    accessToken,
    refreshToken,
  }
}

export async function createTwoFactorChallenge(
  deps: SessionDependencies,
  user: StoredUser,
  preferredPhone?: string | null,
): Promise<TwoFactorChallenge> {
  const code = deps.tokenService.generateTwoFactorCode()
  const codeHash = deps.tokenService.hashTwoFactorCode(code)
  const expiresAt = getChallengeExpiresAt()
  const whatsappPhone = preferredPhone?.trim() || user.telefono?.trim() || ''

  const hasWhatsappConfig =
    env.integrations.twilio.accountSid.trim() &&
    env.integrations.twilio.authToken.trim() &&
    env.integrations.twilio.fromPhone.trim()

  const selectedChannel = whatsappPhone && hasWhatsappConfig ? 'WHATSAPP' : 'EMAIL'

  if (selectedChannel === 'WHATSAPP') {
    await deps.authRepository.createTwoFactorCode({
      usuarioId: user.id,
      codigoHash: codeHash,
      canal: 'WHATSAPP',
      expiresAt,
    })

    await deps.whatsappService.sendTwoFactorCode(
      whatsappPhone,
      user.nombreCompleto,
      code,
    )
  } else {
    await deps.authRepository.createTwoFactorCode({
      usuarioId: user.id,
      codigoHash: codeHash,
      canal: 'EMAIL',
      expiresAt,
    })

    await deps.mailerService.sendTwoFactorCode(
      user.email,
      user.nombreCompleto,
      code,
    )
  }

  const maskedDestination =
    selectedChannel === 'WHATSAPP'
      ? maskPhone(whatsappPhone)
      : maskEmail(user.email)

  const challengeToken = await deps.tokenService.signTwoFactorChallenge(user.id)

  return {
    requiresTwoFactor: true,
    challengeToken,
    deliveryChannel: selectedChannel,
    maskedDestination,
    expiresAt: expiresAt.toISOString(),
    ...(env.auth.exposeTwoFactorCode ? { debugCode: code } : {}),
  }
}
