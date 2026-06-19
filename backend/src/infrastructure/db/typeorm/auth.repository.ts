import { DataSource, IsNull, MoreThanOrEqual } from 'typeorm'

import {
  AuthRepository,
  type CreateRefreshTokenInput,
  type CreateTwoFactorCodeInput,
} from '../../../domain/repositories/auth.repository.js'
import type {
  StoredRefreshToken,
  StoredRole,
  StoredTwoFactorCode,
  StoredUser,
  UpdateUserInput,
} from '../../../domain/auth/auth.types.js'
import { NotFoundError } from '../../../shared/errors/http-error.js'
import {
  RefreshTokenEntity,
  RoleEntity,
  TwoFactorCodeEntity,
  UserEntity,
} from './entities.js'

function mapRole(entity: RoleEntity): StoredRole {
  return {
    id: entity.id,
    codigo: entity.codigo,
    nombre: entity.nombre,
  }
}

function mapUser(entity: UserEntity): StoredUser {
  return {
    id: entity.id,
    username: entity.username,
    nombreCompleto: entity.nombreCompleto,
    email: entity.email,
    telefono: entity.telefono,
    passwordHash: entity.passwordHash,
    googleSub: entity.googleSub,
    rolId: entity.rolId,
    activo: entity.activo,
    twoFactorEnabled: entity.twoFactorEnabled,
    twoFactorSecret: entity.twoFactorSecret,
    ultimoLogin: entity.ultimoLogin,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

function mapRefreshToken(entity: RefreshTokenEntity): StoredRefreshToken {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    tokenHash: entity.tokenHash,
    issuedAt: entity.issuedAt,
    expiresAt: entity.expiresAt,
    revokedAt: entity.revokedAt,
    userAgent: entity.userAgent,
    ipOrigen: entity.ipOrigen,
  }
}

function mapTwoFactorCode(entity: TwoFactorCodeEntity): StoredTwoFactorCode {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    codigoHash: entity.codigoHash,
    canal: entity.canal,
    expiresAt: entity.expiresAt,
    usedAt: entity.usedAt,
    createdAt: entity.createdAt,
  }
}

export class TypeormAuthRepository implements AuthRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findRoleById(roleId: number): Promise<StoredRole | null> {
    const role = await this.dataSource.getRepository(RoleEntity).findOne({
      where: { id: roleId },
    })

    return role ? mapRole(role) : null
  }

  async findRoleByCode(roleCode: string): Promise<StoredRole | null> {
    const role = await this.dataSource.getRepository(RoleEntity).findOne({
      where: { codigo: roleCode },
    })

    return role ? mapRole(role) : null
  }

  async findUserByIdentifier(identifier: string): Promise<StoredUser | null> {
    const user = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:identifier)', { identifier })
      .orWhere('LOWER(user.email) = LOWER(:identifier)', { identifier })
      .getOne()

    return user ? mapUser(user) : null
  }

  async findUserById(userId: string): Promise<StoredUser | null> {
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where: { id: userId },
    })

    return user ? mapUser(user) : null
  }

  async listUsers(): Promise<StoredUser[]> {
    const users = await this.dataSource.getRepository(UserEntity).find({
      order: { createdAt: 'DESC' },
    })

    return users.map(mapUser)
  }

  async createUser(
    input: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StoredUser> {
    const repository = this.dataSource.getRepository(UserEntity)
    const entity = repository.create({
      username: input.username,
      nombreCompleto: input.nombreCompleto,
      email: input.email,
      telefono: input.telefono ?? null,
      passwordHash: input.passwordHash,
      googleSub: input.googleSub,
      rolId: input.rolId,
      activo: input.activo,
      twoFactorEnabled: input.twoFactorEnabled,
      twoFactorSecret: input.twoFactorSecret,
      ultimoLogin: input.ultimoLogin,
    })

    const saved = await repository.save(entity)
    return mapUser(saved)
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput & { passwordHash?: string },
  ): Promise<StoredUser> {
    const repository = this.dataSource.getRepository(UserEntity)
    const current = await repository.findOne({ where: { id: userId } })

    if (!current) {
      throw new NotFoundError('Usuario no encontrado.')
    }

    current.username = input.username ?? current.username
    current.nombreCompleto = input.nombreCompleto ?? current.nombreCompleto
    current.email = input.email ?? current.email
    current.telefono =
      input.telefono === undefined ? current.telefono : input.telefono
    current.rolId = input.rolId ?? current.rolId
    current.activo = input.activo ?? current.activo
    current.twoFactorEnabled =
      input.twoFactorEnabled ?? current.twoFactorEnabled
    current.googleSub =
      input.googleSub === undefined ? current.googleSub : input.googleSub
    current.passwordHash = input.passwordHash ?? current.passwordHash

    const saved = await repository.save(current)
    return mapUser(saved)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.dataSource.getRepository(UserEntity).update(
      { id: userId },
      { activo: false },
    )
  }

  async updateLastLogin(userId: string, lastLoginAt: Date): Promise<void> {
    await this.dataSource.getRepository(UserEntity).update(
      { id: userId },
      { ultimoLogin: lastLoginAt },
    )
  }

  async createRefreshToken(input: CreateRefreshTokenInput): Promise<StoredRefreshToken> {
    const repository = this.dataSource.getRepository(RefreshTokenEntity)
    const entity = repository.create({
      usuarioId: input.usuarioId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
    })

    const saved = await repository.save(entity)
    return mapRefreshToken(saved)
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    const repository = this.dataSource.getRepository(RefreshTokenEntity)
    const entity = await repository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThanOrEqual(new Date()),
      },
    })

    return entity ? mapRefreshToken(entity) : null
  }

  async revokeRefreshToken(tokenId: string, revokedAt: Date): Promise<void> {
    await this.dataSource.getRepository(RefreshTokenEntity).update(
      { id: tokenId },
      { revokedAt },
    )
  }

  async revokeUserRefreshTokens(userId: string, revokedAt: Date): Promise<void> {
    await this.dataSource.getRepository(RefreshTokenEntity).update(
      { usuarioId: userId, revokedAt: IsNull() },
      { revokedAt },
    )
  }

  async createTwoFactorCode(input: CreateTwoFactorCodeInput): Promise<void> {
    const repository = this.dataSource.getRepository(TwoFactorCodeEntity)
    await repository.save(
      repository.create({
        usuarioId: input.usuarioId,
        codigoHash: input.codigoHash,
        canal: input.canal,
        expiresAt: input.expiresAt,
        usedAt: null,
      }),
    )
  }

  async findLatestTwoFactorCodeByUserId(
    userId: string,
  ): Promise<StoredTwoFactorCode | null> {
    const entity = await this.dataSource.getRepository(TwoFactorCodeEntity).findOne({
      where: {
        usuarioId: userId,
        usedAt: IsNull(),
        expiresAt: MoreThanOrEqual(new Date()),
      },
      order: { createdAt: 'DESC' },
    })

    return entity ? mapTwoFactorCode(entity) : null
  }

  async markTwoFactorCodeAsUsed(codeId: string, usedAt: Date): Promise<void> {
    await this.dataSource.getRepository(TwoFactorCodeEntity).update(
      { id: codeId },
      { usedAt },
    )
  }
}
