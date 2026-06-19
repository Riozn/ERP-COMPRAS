import type { PublicUser, StoredUser, UpdateUserInput } from '../../domain/auth/auth.types.js'
import type { AuditRepository } from '../../domain/repositories/audit.repository.js'
import type { AuthRepository } from '../../domain/repositories/auth.repository.js'
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/http-error.js'
import type { MailerService } from '../../infrastructure/mail/mailer.service.js'
import type { PasswordHasher } from '../../infrastructure/security/password-hasher.js'
import { buildUpdatePayload, mapPublicUser, resolveRole } from './users.helpers.js'

type UserServiceDependencies = {
  authRepository: AuthRepository
  auditRepository: AuditRepository
  passwordHasher: PasswordHasher
  mailerService: MailerService
}

export class UserApplicationService {
  constructor(private readonly deps: UserServiceDependencies) {}

  async listUsers(): Promise<PublicUser[]> {
    const users = await this.deps.authRepository.listUsers()

    const roles = await Promise.all(
      users.map((user) => this.deps.authRepository.findRoleById(user.rolId)),
    )

    return users.map((user, index) => {
      const role = roles[index]
      if (!role) {
        throw new NotFoundError(`El rol del usuario ${user.username} no existe.`)
      }

      return mapPublicUser(user, role)
    })
  }

  async getUser(userId: string): Promise<PublicUser> {
    const user = await this.deps.authRepository.findUserById(userId)
    if (!user) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    const role = await resolveRole(this.deps.authRepository, user.rolId)
    return mapPublicUser(user, role)
  }

  async createUser(input: {
    username: string
    nombreCompleto: string
    email: string
    telefono?: string | null
    password: string
    rolId: number
    twoFactorEnabled?: boolean
    active?: boolean
    userAgent?: string | null
    ipOrigen?: string | null
  }): Promise<PublicUser> {
    const username = input.username.trim()
    const nombreCompleto = input.nombreCompleto.trim()
    const email = input.email.trim().toLowerCase()

    if (username.length < 3) {
      throw new ValidationError('El username debe tener al menos 3 caracteres.')
    }

    if (nombreCompleto.length < 3) {
      throw new ValidationError('El nombre completo debe tener al menos 3 caracteres.')
    }

    if (!email.includes('@')) {
      throw new ValidationError('Debes ingresar un correo valido.')
    }

    const duplicate = await this.deps.authRepository.findUserByIdentifier(username)
    if (duplicate) {
      throw new ConflictError('El username ya existe.')
    }

    const duplicateEmail = await this.deps.authRepository.findUserByIdentifier(email)
    if (duplicateEmail) {
      throw new ConflictError('El correo ya existe.')
    }

    const role = await resolveRole(this.deps.authRepository, input.rolId)
    const passwordHash = await this.deps.passwordHasher.hash(input.password)

    const user = await this.deps.authRepository.createUser({
      username,
      nombreCompleto,
      email,
      telefono: input.telefono?.trim() || null,
      passwordHash,
      googleSub: null,
      rolId: role.id,
      activo: input.active ?? true,
      twoFactorEnabled: input.twoFactorEnabled ?? false,
      twoFactorSecret: null,
      ultimoLogin: null,
    })

    await this.deps.mailerService.sendWelcomeEmail(user.email, user.nombreCompleto)
    await this.deps.auditRepository.record({
      usuarioId: user.id,
      entidad: 'o_usuarios',
      entidadId: user.id,
      accion: 'CREATE_USER',
      datosDespues: JSON.stringify({ username: user.username, email: user.email }),
      ipOrigen: input.ipOrigen ?? null,
    })

    return mapPublicUser(user, role)
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput & { userAgent?: string | null; ipOrigen?: string | null },
  ): Promise<PublicUser> {
    const current = await this.deps.authRepository.findUserById(userId)
    if (!current) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    if (input.username && input.username !== current.username) {
      const duplicate = await this.deps.authRepository.findUserByIdentifier(input.username)
      if (duplicate && duplicate.id !== current.id) {
        throw new ConflictError('El username ya existe.')
      }
    }

    if (input.email && input.email.toLowerCase() !== current.email.toLowerCase()) {
      const duplicate = await this.deps.authRepository.findUserByIdentifier(input.email)
      if (duplicate && duplicate.id !== current.id) {
        throw new ConflictError('El correo ya existe.')
      }
    }

    const passwordHash = input.password
      ? await this.deps.passwordHasher.hash(input.password)
      : undefined

    if (input.rolId !== undefined) {
      await resolveRole(this.deps.authRepository, input.rolId)
    }

    const updatePayload = buildUpdatePayload(input, passwordHash)
    const updated = await this.deps.authRepository.updateUser(userId, updatePayload)

    const role = await resolveRole(this.deps.authRepository, updated.rolId)
    await this.deps.auditRepository.record({
      usuarioId: updated.id,
      entidad: 'o_usuarios',
      entidadId: updated.id,
      accion: 'UPDATE_USER',
      datosDespues: JSON.stringify({
        username: updated.username,
        email: updated.email,
        telefono: updated.telefono,
        rolId: updated.rolId,
        activo: updated.activo,
        twoFactorEnabled: updated.twoFactorEnabled,
      }),
      ipOrigen: input.ipOrigen ?? null,
    })

    return mapPublicUser(updated, role)
  }

  async deleteUser(userId: string, ipOrigen?: string | null): Promise<void> {
    const current = await this.deps.authRepository.findUserById(userId)
    if (!current) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    await this.deps.authRepository.deleteUser(userId)
    await this.deps.auditRepository.record({
      usuarioId: userId,
      entidad: 'o_usuarios',
      entidadId: userId,
      accion: 'DEACTIVATE_USER',
      datosDespues: JSON.stringify({ activo: false }),
      ipOrigen: ipOrigen ?? null,
    })
  }

  async setTwoFactorEnabled(
    userId: string,
    enabled: boolean,
    ipOrigen?: string | null,
  ): Promise<PublicUser> {
    const current = await this.deps.authRepository.findUserById(userId)
    if (!current) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    const updated = await this.deps.authRepository.updateUser(userId, {
      twoFactorEnabled: enabled,
      twoFactorSecret: null,
    })

    const role = await resolveRole(this.deps.authRepository, updated.rolId)
    await this.deps.auditRepository.record({
      usuarioId: userId,
      entidad: 'o_usuarios',
      entidadId: userId,
      accion: enabled ? 'ENABLE_2FA' : 'DISABLE_2FA',
      datosDespues: JSON.stringify({ twoFactorEnabled: enabled }),
      ipOrigen: ipOrigen ?? null,
    })

    return mapPublicUser(updated, role)
  }
}
