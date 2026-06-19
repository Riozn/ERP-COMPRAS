import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import test from 'node:test'

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret'
process.env.TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES =
  process.env.TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES ?? '10'
process.env.EXPOSE_2FA_CODE = process.env.EXPOSE_2FA_CODE ?? 'false'
process.env.TWO_FACTOR_DEFAULT_CHANNEL =
  process.env.TWO_FACTOR_DEFAULT_CHANNEL ?? 'WHATSAPP'

const [{ AuthApplicationService }, { UserApplicationService }] = await Promise.all([
  import('../src/application/auth/auth.service.js'),
  import('../src/application/users/user.service.js'),
])

type StoredRole = {
  id: number
  codigo: string
  nombre: string
}

type StoredUser = {
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

type StoredRefreshToken = {
  id: string
  usuarioId: string
  tokenHash: string
  issuedAt: Date
  expiresAt: Date
  revokedAt: Date | null
  userAgent: string | null
  ipOrigen: string | null
}

type StoredTwoFactorCode = {
  id: string
  usuarioId: string
  codigoHash: string
  canal: 'EMAIL' | 'WHATSAPP'
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

class MemoryPasswordHasher {
  async hash(password: string): Promise<string> {
    return `hash:${password}`
  }

  async verify(password: string, encodedPassword: string): Promise<boolean> {
    return encodedPassword === `hash:${password}`
  }
}

class MemoryMailerService {
  welcomeEmails: Array<{ to: string; nombreCompleto: string }> = []
  twoFactorEmails: Array<{ to: string; nombreCompleto: string; code: string }> = []

  async sendWelcomeEmail(to: string, nombreCompleto: string): Promise<void> {
    this.welcomeEmails.push({ to, nombreCompleto })
  }

  async sendTwoFactorCode(
    to: string,
    nombreCompleto: string,
    code: string,
  ): Promise<void> {
    this.twoFactorEmails.push({ to, nombreCompleto, code })
  }
}

class MemoryWhatsAppService {
  twoFactorMessages: Array<{ to: string; nombreCompleto: string; code: string }> = []

  async sendTwoFactorCode(
    to: string,
    nombreCompleto: string,
    code: string,
  ): Promise<void> {
    this.twoFactorMessages.push({ to, nombreCompleto, code })
  }
}

class MemoryAuditRepository {
  events: Array<Record<string, unknown>> = []

  async record(event: Record<string, unknown>): Promise<void> {
    this.events.push(event)
  }
}

class MemoryTokenService {
  private refreshCounter = 0

  async signAccessToken(user: { id: string }): Promise<string> {
    return `access:${user.id}`
  }

  async verifyAccessToken(token: string): Promise<{ sub: string }> {
    const [, sub = ''] = token.split(':')
    return { sub }
  }

  async signTwoFactorChallenge(userId: string): Promise<string> {
    return `challenge:${userId}`
  }

  async verifyTwoFactorChallenge(token: string): Promise<{
    sub: string
    purpose: '2fa'
  }> {
    const [, sub = ''] = token.split(':')
    return { sub, purpose: '2fa' }
  }

  createRefreshToken(): string {
    this.refreshCounter += 1
    return `refresh-${this.refreshCounter}`
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }

  getRefreshTokenExpiresAt(reference = new Date()): Date {
    return new Date(reference.getTime() + 30 * 24 * 60 * 60 * 1000)
  }

  hashTwoFactorCode(code: string): string {
    return `2fa:${code}`
  }

  generateTwoFactorCode(): string {
    return '123456'
  }
}

class MemoryAuthRepository {
  roles = new Map<number, StoredRole>()
  users = new Map<string, StoredUser>()
  refreshTokens = new Map<string, StoredRefreshToken>()
  twoFactorCodes = new Map<string, StoredTwoFactorCode>()

  constructor() {
    this.seedRole({ id: 1, codigo: 'ADMIN', nombre: 'Administrador' })
    this.seedRole({ id: 2, codigo: 'SUPERADMIN', nombre: 'Super Administrador' })
    this.seedRole({ id: 3, codigo: 'USER', nombre: 'Usuario' })
  }

  seedRole(role: StoredRole): void {
    this.roles.set(role.id, role)
  }

  seedUser(user: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StoredUser {
    const id = user.id ?? randomUUID()
    const now = new Date()
    const stored: StoredUser = {
      id,
      username: user.username,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      telefono: user.telefono,
      passwordHash: user.passwordHash,
      googleSub: user.googleSub,
      rolId: user.rolId,
      activo: user.activo,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      ultimoLogin: user.ultimoLogin,
      createdAt: now,
      updatedAt: now,
    }

    this.users.set(id, stored)
    return stored
  }

  async findRoleById(roleId: number): Promise<StoredRole | null> {
    return this.roles.get(roleId) ?? null
  }

  async findRoleByCode(roleCode: string): Promise<StoredRole | null> {
    for (const role of this.roles.values()) {
      if (role.codigo === roleCode) {
        return role
      }
    }

    return null
  }

  async findUserByIdentifier(identifier: string): Promise<StoredUser | null> {
    const normalized = identifier.toLowerCase()
    for (const user of this.users.values()) {
      if (
        user.username.toLowerCase() === normalized ||
        user.email.toLowerCase() === normalized
      ) {
        return user
      }
    }

    return null
  }

  async findUserById(userId: string): Promise<StoredUser | null> {
    return this.users.get(userId) ?? null
  }

  async listUsers(): Promise<StoredUser[]> {
    return [...this.users.values()]
  }

  async createUser(
    input: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StoredUser> {
    const now = new Date()
    const stored: StoredUser = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    }

    this.users.set(stored.id, stored)
    return stored
  }

  async updateUser(
    userId: string,
    input: Partial<StoredUser> & { passwordHash?: string },
  ): Promise<StoredUser> {
    const current = this.users.get(userId)
    if (!current) {
      throw new Error('Usuario no encontrado.')
    }

    if (input.username !== undefined) current.username = input.username
    if (input.nombreCompleto !== undefined) current.nombreCompleto = input.nombreCompleto
    if (input.email !== undefined) current.email = input.email
    if (input.passwordHash !== undefined) current.passwordHash = input.passwordHash
    if (input.googleSub !== undefined) current.googleSub = input.googleSub
    if (input.rolId !== undefined) current.rolId = input.rolId
    if (input.activo !== undefined) current.activo = input.activo
    if (input.twoFactorEnabled !== undefined) current.twoFactorEnabled = input.twoFactorEnabled
    if (input.twoFactorSecret !== undefined) current.twoFactorSecret = input.twoFactorSecret
    if (input.ultimoLogin !== undefined) current.ultimoLogin = input.ultimoLogin
    current.updatedAt = new Date()

    return current
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId)
    if (user) {
      user.activo = false
      user.updatedAt = new Date()
    }
  }

  async updateLastLogin(userId: string, lastLoginAt: Date): Promise<void> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('Usuario no encontrado.')
    }

    user.ultimoLogin = lastLoginAt
    user.updatedAt = new Date()
  }

  async createRefreshToken(input: {
    usuarioId: string
    tokenHash: string
    expiresAt: Date
    userAgent?: string | null
    ipOrigen?: string | null
  }): Promise<StoredRefreshToken> {
    const token: StoredRefreshToken = {
      id: randomUUID(),
      usuarioId: input.usuarioId,
      tokenHash: input.tokenHash,
      issuedAt: new Date(),
      expiresAt: input.expiresAt,
      revokedAt: null,
      userAgent: input.userAgent ?? null,
      ipOrigen: input.ipOrigen ?? null,
    }

    this.refreshTokens.set(token.tokenHash, token)
    return token
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    const token = this.refreshTokens.get(tokenHash) ?? null
    if (!token || token.revokedAt) {
      return null
    }

    return token
  }

  async revokeRefreshToken(tokenId: string, revokedAt: Date): Promise<void> {
    for (const token of this.refreshTokens.values()) {
      if (token.id === tokenId) {
        token.revokedAt = revokedAt
      }
    }
  }

  async revokeUserRefreshTokens(_userId: string, _revokedAt: Date): Promise<void> {}

  async createTwoFactorCode(input: {
    usuarioId: string
    codigoHash: string
    canal: 'EMAIL'
    expiresAt: Date
  }): Promise<void> {
    const code: StoredTwoFactorCode = {
      id: randomUUID(),
      usuarioId: input.usuarioId,
      codigoHash: input.codigoHash,
      canal: input.canal,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    }

    this.twoFactorCodes.set(code.id, code)
  }

  async findLatestTwoFactorCodeByUserId(
    userId: string,
  ): Promise<StoredTwoFactorCode | null> {
    const codes = [...this.twoFactorCodes.values()].filter(
      (code) => code.usuarioId === userId && !code.usedAt && code.expiresAt > new Date(),
    )

    codes.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    return codes[0] ?? null
  }

  async markTwoFactorCodeAsUsed(codeId: string, usedAt: Date): Promise<void> {
    const code = this.twoFactorCodes.get(codeId)
    if (code) {
      code.usedAt = usedAt
    }
  }
}

function createContext() {
  const authRepository = new MemoryAuthRepository()
  const auditRepository = new MemoryAuditRepository()
  const passwordHasher = new MemoryPasswordHasher()
  const tokenService = new MemoryTokenService()
  const mailerService = new MemoryMailerService()
  const whatsappService = new MemoryWhatsAppService()

  const authService = new AuthApplicationService({
    authRepository,
    auditRepository,
    passwordHasher,
    tokenService,
    mailerService,
    whatsappService,
  })

  const userService = new UserApplicationService({
    authRepository,
    auditRepository,
    passwordHasher,
    mailerService,
  })

  return {
    authRepository,
    auditRepository,
    passwordHasher,
    tokenService,
    mailerService,
    whatsappService,
    authService,
    userService,
  }
}

test('auth register creates a session and records onboarding side effects', async () => {
  const { authService, authRepository, auditRepository, mailerService } = createContext()

  const session = await authService.register({
    username: 'jdoe',
    nombreCompleto: 'John Doe',
    email: 'john@erp.test',
    password: 'Secret123!',
    rolId: 1,
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal(session.user.username, 'jdoe')
  assert.equal(session.user.roleCode, 'ADMIN')
  assert.match(session.accessToken, /^access:/)
  assert.match(session.refreshToken, /^refresh-/)
  assert.equal(authRepository.users.size, 1)
  assert.equal(mailerService.welcomeEmails.length, 1)
  assert.equal(auditRepository.events.length, 1)
  assert.equal(auditRepository.events[0]?.accion, 'REGISTER')
})

test('auth login can require 2fa and complete the session after verification', async () => {
  const { authService, authRepository, mailerService, whatsappService } = createContext()
  const user = authRepository.seedUser({
    username: 'maria',
    nombreCompleto: 'Maria Lopez',
    email: 'maria@erp.test',
    telefono: '+59170000123',
    passwordHash: 'hash:Secret123!',
    googleSub: null,
    rolId: 1,
    activo: true,
    twoFactorEnabled: true,
    twoFactorSecret: null,
    ultimoLogin: null,
  })

  const result = await authService.login({
    identifier: 'maria@erp.test',
    password: 'Secret123!',
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal('requiresTwoFactor' in result, true)
  if (!('requiresTwoFactor' in result)) {
    throw new Error('Expected two factor challenge.')
  }

  assert.equal(result.deliveryChannel, 'WHATSAPP')
  assert.equal(whatsappService.twoFactorMessages.length, 1)
  assert.equal(whatsappService.twoFactorMessages[0]?.code, '123456')
  assert.equal(mailerService.twoFactorEmails.length, 0)

  const session = await authService.verifyTwoFactorLogin({
    challengeToken: result.challengeToken,
    code: '123456',
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal(session.user.id, user.id)
  assert.match(session.accessToken, /^access:/)
  assert.match(session.refreshToken, /^refresh-/)
})

test('auth login can send 2fa to the phone entered on login', async () => {
  const { authService, authRepository, whatsappService } = createContext()
  authRepository.seedUser({
    username: 'pedro',
    nombreCompleto: 'Pedro Luna',
    email: 'pedro@erp.test',
    telefono: null,
    passwordHash: 'hash:Secret123!',
    googleSub: null,
    rolId: 1,
    activo: true,
    twoFactorEnabled: true,
    twoFactorSecret: null,
    ultimoLogin: null,
  })

  const result = await authService.login({
    identifier: 'pedro@erp.test',
    password: 'Secret123!',
    telefono: '+59170000999',
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal('requiresTwoFactor' in result, true)
  assert.equal(whatsappService.twoFactorMessages.length, 1)
  assert.equal(whatsappService.twoFactorMessages[0]?.to, '+59170000999')
})

test('auth verify two factor rejects an invalid code', async () => {
  const { authService, authRepository } = createContext()
  authRepository.seedUser({
    username: 'ana',
    nombreCompleto: 'Ana Torres',
    email: 'ana@erp.test',
    telefono: '+59170000124',
    passwordHash: 'hash:Secret123!',
    googleSub: null,
    rolId: 1,
    activo: true,
    twoFactorEnabled: true,
    twoFactorSecret: null,
    ultimoLogin: null,
  })

  const challenge = await authService.login({
    identifier: 'ana',
    password: 'Secret123!',
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  if (!('requiresTwoFactor' in challenge)) {
    throw new Error('Expected two factor challenge.')
  }

  await assert.rejects(
    () =>
      authService.verifyTwoFactorLogin({
        challengeToken: challenge.challengeToken,
        code: '000000',
        userAgent: 'test-agent',
        ipOrigen: '127.0.0.1',
      }),
    /Codigo 2FA invalido/,
  )
})

test('auth refresh rejects invalid refresh tokens', async () => {
  const { authService } = createContext()

  await assert.rejects(
    () =>
      authService.refreshSession({
        refreshToken: 'invalid-token',
        userAgent: 'test-agent',
        ipOrigen: '127.0.0.1',
      }),
    /Refresh token invalido o expirado/,
  )
})

test('user service creates, updates, toggles 2fa and deactivates users', async () => {
  const { userService, authRepository, auditRepository, mailerService } = createContext()

  const created = await userService.createUser({
    username: 'carla',
    nombreCompleto: 'Carla Ruiz',
    email: 'carla@erp.test',
    telefono: '+59170000125',
    password: 'Secret123!',
    rolId: 3,
    twoFactorEnabled: false,
    active: true,
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal(created.username, 'carla')
  assert.equal(mailerService.welcomeEmails.length, 1)
  assert.equal(auditRepository.events.at(-1)?.accion, 'CREATE_USER')

  const updated = await userService.updateUser(created.id, {
    email: 'carla+ventas@erp.test',
    password: 'NewSecret123!',
    twoFactorEnabled: true,
    userAgent: 'test-agent',
    ipOrigen: '127.0.0.1',
  })

  assert.equal(updated.email, 'carla+ventas@erp.test')
  assert.equal(updated.twoFactorEnabled, true)

  const protectedUser = await userService.setTwoFactorEnabled(created.id, false, '127.0.0.1')
  assert.equal(protectedUser.twoFactorEnabled, false)

  await userService.deleteUser(created.id, '127.0.0.1')
  const stored = await authRepository.findUserById(created.id)
  assert.equal(stored?.activo, false)
  assert.equal(auditRepository.events.at(-1)?.accion, 'DEACTIVATE_USER')
})
