import assert from 'node:assert/strict'
import test from 'node:test'

import { createContext } from './test-helpers.ts'

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
