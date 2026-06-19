import type { SupplierFormErrors, SupplierFormValues } from './supplier.types'

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0
}

function isEmail(value: string): boolean {
  if (!value.trim()) {
    return true
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function validateSupplierForm(values: SupplierFormValues): SupplierFormErrors {
  const errors: SupplierFormErrors = {}

  if (!values.cardCode.trim()) {
    errors.cardCode = 'El codigo es obligatorio.'
  }

  if (!values.cardName.trim()) {
    errors.cardName = 'La razon social es obligatoria.'
  }

  if (!values.nitRut.trim()) {
    errors.nitRut = 'El NIT/RUT es obligatorio.'
  }

  if (!values.monedaId.trim() || Number.isNaN(Number(values.monedaId))) {
    errors.monedaId = 'Selecciona una moneda valida.'
  }

  if (!isEmail(values.email)) {
    errors.email = 'Ingresa un correo valido.'
  }

  if (values.balanceCuenta.trim() && !isPositiveNumber(values.balanceCuenta)) {
    errors.balanceCuenta = 'El saldo debe ser un numero valido.'
  }

  if (values.lineaCredito.trim() && !isPositiveNumber(values.lineaCredito)) {
    errors.lineaCredito = 'La linea de credito debe ser numerica.'
  }

  return errors
}
