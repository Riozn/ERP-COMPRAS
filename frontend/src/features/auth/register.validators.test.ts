import { describe, expect, it } from 'vitest'

import { validateRegisterForm } from './auth.validators'

describe('register validators', () => {
  it('flags invalid registration payloads', () => {
    expect(
      validateRegisterForm({
        username: '',
        nombreCompleto: '',
        email: 'bad',
        telefono: '',
        password: '123',
        confirmPassword: '456',
        rolId: '',
      }),
    ).toMatchObject({
      username: 'Ingresa un usuario.',
      nombreCompleto: 'Ingresa el nombre completo.',
      email: 'Ingresa un correo valido.',
      telefono: 'Ingresa tu numero de WhatsApp.',
      password: 'La contrasena debe tener al menos 8 caracteres.',
      confirmPassword: 'Las contrasenas no coinciden.',
      rolId: 'Selecciona un rol.',
    })
  })
})
