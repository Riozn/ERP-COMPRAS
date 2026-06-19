import { describe, expect, it } from 'vitest'

import { validateLoginForm, validateTwoFactorForm } from './auth.validators'

describe('auth validators', () => {
  it('flags empty login fields', () => {
    expect(validateLoginForm({ identifier: '', password: '' })).toEqual({
      identifier: 'Ingresa tu usuario o correo.',
      password: 'Ingresa tu contrasena.',
    })
  })

  it('accepts a valid login payload', () => {
    expect(validateLoginForm({ identifier: 'admin', password: 'secret' })).toEqual({})
  })

  it('flags invalid 2fa codes', () => {
    expect(validateTwoFactorForm({ code: '12' })).toEqual({
      code: 'Ingresa un codigo de 6 digitos.',
    })
  })
})
