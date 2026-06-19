export type LoginFormValues = {
  identifier: string
  password: string
}

export type TwoFactorFormValues = {
  code: string
}

export type RegisterFormValues = {
  username: string
  nombreCompleto: string
  email: string
  telefono: string
  password: string
  confirmPassword: string
  rolId: string
}

export type FormErrors<T> = Partial<Record<keyof T, string>>

export function validateLoginForm(values: LoginFormValues): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {}

  if (!values.identifier.trim()) {
    errors.identifier = 'Ingresa tu usuario o correo.'
  }

  if (!values.password.trim()) {
    errors.password = 'Ingresa tu contrasena.'
  }

  return errors
}

export function validateTwoFactorForm(values: TwoFactorFormValues): FormErrors<TwoFactorFormValues> {
  const errors: FormErrors<TwoFactorFormValues> = {}

  if (!/^\d{6}$/.test(values.code.trim())) {
    errors.code = 'Ingresa un codigo de 6 digitos.'
  }

  return errors
}

export function validateRegisterForm(values: RegisterFormValues): FormErrors<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {}

  if (!values.username.trim()) {
    errors.username = 'Ingresa un usuario.'
  }

  if (!values.nombreCompleto.trim()) {
    errors.nombreCompleto = 'Ingresa el nombre completo.'
  }

  if (!values.email.trim()) {
    errors.email = 'Ingresa un correo.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Ingresa un correo valido.'
  }

  if (!values.telefono.trim()) {
    errors.telefono = 'Ingresa tu numero de WhatsApp.'
  }

  if (values.password.length < 8) {
    errors.password = 'La contrasena debe tener al menos 8 caracteres.'
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contrasenas no coinciden.'
  }

  if (!values.rolId.trim() || Number.isNaN(Number(values.rolId))) {
    errors.rolId = 'Selecciona un rol.'
  }

  return errors
}
