import { describe, expect, it } from 'vitest'

import { emptySupplierFormValues } from './supplier.types'
import { validateSupplierForm } from './suppliers.validators'

describe('supplier validators', () => {
  it('flags missing required fields', () => {
    expect(validateSupplierForm(emptySupplierFormValues)).toMatchObject({
      cardCode: 'El codigo es obligatorio.',
      cardName: 'La razon social es obligatoria.',
      nitRut: 'El NIT/RUT es obligatorio.',
      monedaId: 'Selecciona una moneda valida.',
    })
  })

  it('accepts a valid supplier payload', () => {
    expect(
      validateSupplierForm({
        cardCode: 'PRV-01',
        cardName: 'Proveedor Uno',
        nombreComercial: 'Proveedor Uno',
        nitRut: '123456',
        email: 'proveedor@demo.com',
        telefono: '7777777',
        direccion: 'Calle 1',
        monedaId: '1',
        balanceCuenta: '0',
        lineaCredito: '1000',
        activo: true,
      }),
    ).toEqual({})
  })
})
