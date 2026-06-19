import assert from 'node:assert/strict'
import test from 'node:test'

import { createContext } from './test-helpers.ts'

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
