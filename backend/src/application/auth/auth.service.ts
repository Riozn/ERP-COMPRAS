import type {
  AuthSession,
  LoginInput,
  LoginResult,
  PublicUser,
  RefreshSessionInput,
  RegisterUserInput,
  StoredRole,
  StoredUser,
  TwoFactorVerifyInput,
} from '../../domain/auth/auth.types.js'
import type { AuditRepository } from '../../domain/repositories/audit.repository.js'
import type { AuthRepository } from '../../domain/repositories/auth.repository.js'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../shared/errors/http-error.js'
import type { MailerService } from '../../infrastructure/mail/mailer.service.js'
import type { WhatsAppDeliveryService } from '../../infrastructure/notifications/twilio-whatsapp.service.js'
import type { PasswordHasher } from '../../infrastructure/security/password-hasher.js'
import type { TokenService } from '../../infrastructure/security/token.service.js'
import { mapPublicUser, normalizeIdentifier } from './auth.helpers.js'
import { createTwoFactorChallenge, issueSession, type SessionDependencies } from './auth.session.js'

type AuthServiceDependencies = SessionDependencies & {
  passwordHasher: PasswordHasher
}

function assertValidNameFields(username: string, nombreCompleto: string, email: string): void {
  if (username.length < 3) {
    throw new ValidationError('El username debe tener al menos 3 caracteres.')
  }

  if (nombreCompleto.length < 3) {
    throw new ValidationError('El nombre completo debe tener al menos 3 caracteres.')
  }

  if (!email.includes('@')) {
    throw new ValidationError('Debes ingresar un correo valido.')
  }
}

function normalizePhone(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? ''
  return normalized ? normalized : null
}

async function resolveRole(authRepository: AuthRepository, roleId: number): Promise<StoredRole> {
  const role = await authRepository.findRoleById(roleId)
  if (!role) {
    throw new NotFoundError('El rol seleccionado no existe.')
  }

  return role
}

export class AuthApplicationService {
  constructor(private readonly deps: AuthServiceDependencies) {}

  async register(input: RegisterUserInput): Promise<AuthSession> {
    const username = input.username.trim()
    const nombreCompleto = input.nombreCompleto.trim()
    const email = input.email.trim().toLowerCase()
    const telefono = normalizePhone(input.telefono)

    assertValidNameFields(username, nombreCompleto, email)

    if (input.twoFactorEnabled && !telefono) {
      throw new ValidationError('Debes registrar un numero de WhatsApp para activar 2FA.')
    }

    const existingUser = await this.deps.authRepository.findUserByIdentifier(username)
    if (existingUser) {
      throw new ConflictError('El username ya existe.')
    }

    const existingEmail = await this.deps.authRepository.findUserByIdentifier(email)
    if (existingEmail) {
      throw new ConflictError('El correo ya existe.')
    }

    const role = await resolveRole(this.deps.authRepository, input.rolId)
    const passwordHash = await this.deps.passwordHasher.hash(input.password)
    const createdUser = await this.deps.authRepository.createUser({
      username,
      nombreCompleto,
      email,
      telefono,
      passwordHash,
      googleSub: null,
      rolId: input.rolId,
      activo: true,
      twoFactorEnabled: input.twoFactorEnabled ?? true,
      twoFactorSecret: null,
      ultimoLogin: null,
    })

    await this.deps.mailerService.sendWelcomeEmail(
      createdUser.email,
      createdUser.nombreCompleto,
    )

    return issueSession(this.deps, createdUser, role, {
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
      auditAction: 'REGISTER',
    })
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const identifier = normalizeIdentifier(input.identifier)
    const user = await this.deps.authRepository.findUserByIdentifier(identifier)

    if (!user || !user.activo) {
      throw new UnauthorizedError('Credenciales invalidas.')
    }

    const passwordOk = await this.deps.passwordHasher.verify(input.password, user.passwordHash)
    if (!passwordOk) {
      throw new UnauthorizedError('Credenciales invalidas.')
    }

    const role = await resolveRole(this.deps.authRepository, user.rolId)

    if (user.twoFactorEnabled) {
      return createTwoFactorChallenge(this.deps, user, input.telefono)
    }

    return issueSession(this.deps, user, role, {
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
      auditAction: 'LOGIN',
    })
  }

  async verifyTwoFactorLogin(input: TwoFactorVerifyInput): Promise<AuthSession> {
    const challenge = await this.deps.tokenService.verifyTwoFactorChallenge(
      input.challengeToken,
    )

    const user = await this.deps.authRepository.findUserById(challenge.sub)
    if (!user || !user.activo) {
      throw new UnauthorizedError('No se pudo validar el segundo factor.')
    }

    const latestCode = await this.deps.authRepository.findLatestTwoFactorCodeByUserId(
      user.id,
    )
    if (!latestCode) {
      throw new UnauthorizedError('No hay un codigo 2FA activo.')
    }

    const expectedHash = this.deps.tokenService.hashTwoFactorCode(input.code.trim())
    if (expectedHash !== latestCode.codigoHash) {
      throw new UnauthorizedError('Codigo 2FA invalido.')
    }

    await this.deps.authRepository.markTwoFactorCodeAsUsed(latestCode.id, new Date())

    const role = await resolveRole(this.deps.authRepository, user.rolId)

    return issueSession(this.deps, user, role, {
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
      auditAction: 'LOGIN_2FA',
    })
  }

  async refreshSession(input: RefreshSessionInput): Promise<AuthSession> {
    const tokenHash = this.deps.tokenService.hashRefreshToken(input.refreshToken)
    const refreshToken = await this.deps.authRepository.findRefreshTokenByHash(tokenHash)

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token invalido o expirado.')
    }

    const user = await this.deps.authRepository.findUserById(refreshToken.usuarioId)
    if (!user || !user.activo) {
      throw new UnauthorizedError('No se pudo renovar la sesion.')
    }

    const role = await resolveRole(this.deps.authRepository, user.rolId)
    const newRefreshToken = this.deps.tokenService.createRefreshToken()

    await this.deps.authRepository.revokeRefreshToken(refreshToken.id, new Date())
    await this.deps.authRepository.createRefreshToken({
      usuarioId: user.id,
      tokenHash: this.deps.tokenService.hashRefreshToken(newRefreshToken),
      expiresAt: this.deps.tokenService.getRefreshTokenExpiresAt(),
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
    })

    const publicUser = mapPublicUser(user, role)
    const accessToken = await this.deps.tokenService.signAccessToken(publicUser, role)

    return {
      user: publicUser,
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.deps.authRepository.findUserById(userId)
    if (!user) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    const role = await resolveRole(this.deps.authRepository, user.rolId)
    return mapPublicUser(user, role)
  }

  async logout(refreshTokenValue: string): Promise<void> {
    const tokenHash = this.deps.tokenService.hashRefreshToken(refreshTokenValue)
    const storedToken = await this.deps.authRepository.findRefreshTokenByHash(tokenHash)

    if (!storedToken) {
      return
    }

    await this.deps.authRepository.revokeRefreshToken(storedToken.id, new Date())
  }
}
