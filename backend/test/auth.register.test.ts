import assert from 'node:assert/strict'
import test from 'node:test'

import { createContext } from './test-helpers.ts'

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
