import assert from 'node:assert/strict'
import test from 'node:test'

import { createContext } from './test-helpers.ts'

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
