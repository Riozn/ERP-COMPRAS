import type { PublicUser, StoredRole, StoredUser, UpdateUserInput } from '../../domain/auth/auth.types.js'
import type { AuthRepository } from '../../domain/repositories/auth.repository.js'
import { NotFoundError } from '../../shared/errors/http-error.js'

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

export async function resolveRole(
  authRepository: AuthRepository,
  roleId: number,
): Promise<StoredRole> {
  const role = await authRepository.findRoleById(roleId)
  if (!role) {
    throw new NotFoundError('El rol seleccionado no existe.')
  }

  return role
}

export function buildUpdatePayload(
  input: UpdateUserInput,
  passwordHash?: string,
): UpdateUserInput & { passwordHash?: string } {
  const payload: UpdateUserInput & { passwordHash?: string } = {}

  if (input.username !== undefined) {
    payload.username = input.username
  }

  if (input.nombreCompleto !== undefined) {
    payload.nombreCompleto = input.nombreCompleto
  }

  if (input.email !== undefined) {
    payload.email = input.email.toLowerCase()
  }

  if (input.telefono !== undefined) {
    payload.telefono = input.telefono
  }

  if (input.rolId !== undefined) {
    payload.rolId = input.rolId
  }

  if (input.activo !== undefined) {
    payload.activo = input.activo
  }

  if (input.twoFactorEnabled !== undefined) {
    payload.twoFactorEnabled = input.twoFactorEnabled
  }

  if (input.twoFactorSecret !== undefined) {
    payload.twoFactorSecret = input.twoFactorSecret
  }

  if (input.googleSub !== undefined) {
    payload.googleSub = input.googleSub
  }

  if (passwordHash !== undefined) {
    payload.passwordHash = passwordHash
  }

  return payload
}
