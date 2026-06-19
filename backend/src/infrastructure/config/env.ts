import dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(): void {
  const cwd = process.cwd()
  const candidates = [
    resolve(cwd, '.env'),
    resolve(cwd, '..', '.env'),
    resolve(cwd, '..', '..', '.env'),
    resolve(cwd, 'backend', '.env'),
  ]

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      dotenv.config({ path: filePath, override: false })
    }
  }
}

loadEnvFile()

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isValidOrigin(origin: string): boolean {
  try {
    const url = new URL(origin)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function defaultCorsOrigins(nodeEnv: string): string[] {
  return nodeEnv === 'production'
    ? []
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
}

function buildCorsOrigins(nodeEnv: string): string[] {
  const origins = parseCsv(
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN,
    defaultCorsOrigins(nodeEnv),
  )

  if (nodeEnv === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGINS es obligatorio en produccion.')
  }

  const invalidOrigins = origins.filter((origin) => !isValidOrigin(origin))
  if (invalidOrigins.length > 0) {
    throw new Error(`CORS_ORIGINS contiene valores invalidos: ${invalidOrigins.join(', ')}`)
  }

  if (origins.includes('*')) {
    throw new Error('CORS_ORIGINS no puede contener comodines.')
  }

  return origins
}

function buildTwoFactorChannel(): 'EMAIL' | 'WHATSAPP' {
  const channel = process.env.TWO_FACTOR_DEFAULT_CHANNEL?.trim().toUpperCase()

  if (channel === 'WHATSAPP' || channel === 'EMAIL') {
    return channel
  }

  return 'EMAIL'
}

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim()
  }

  const hasDatabaseEnv =
    process.env.DB_HOST ||
    process.env.DB_PORT ||
    process.env.DB_NAME ||
    process.env.DB_USER ||
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_DB ||
    process.env.POSTGRES_USER ||
    process.env.POSTGRES_PASSWORD ||
    process.env.POSTGRES_HOST ||
    process.env.POSTGRES_PORT

  if (!hasDatabaseEnv) {
    return ''
  }

  const host =
    process.env.DB_HOST?.trim() ?? process.env.POSTGRES_HOST?.trim() ?? 'localhost'
  const port = parseNumber(process.env.DB_PORT ?? process.env.POSTGRES_PORT, 5432)
  const database =
    process.env.DB_NAME?.trim() ?? process.env.POSTGRES_DB?.trim() ?? 'erp'
  const user =
    process.env.DB_USER?.trim() ?? process.env.POSTGRES_USER?.trim() ?? 'postgres'
  const password =
    process.env.DB_PASSWORD?.trim() ??
    process.env.POSTGRES_PASSWORD?.trim() ??
    'postgres'

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

export const env = {
  app: {
    name: process.env.APP_NAME?.trim() ?? 'ERP1 API',
    nodeEnv: process.env.NODE_ENV?.trim() ?? 'development',
  },
  server: {
    port: parseNumber(process.env.PORT ?? process.env.API_PORT, 3001),
  },
  database: {
    url: buildDatabaseUrl(),
  },
  cors: {
    origins: buildCorsOrigins(process.env.NODE_ENV?.trim() ?? 'development'),
    allowCredentials: parseBoolean(
      process.env.CORS_ALLOW_CREDENTIALS,
      (process.env.NODE_ENV?.trim() ?? 'development') !== 'production',
    ),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET?.trim() ?? '',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN?.trim() ?? '15m',
    refreshTokenExpiresDays: parseNumber(
      process.env.REFRESH_TOKEN_EXPIRES_DAYS,
      30,
    ),
    twoFactorChallengeExpiresMinutes: parseNumber(
      process.env.TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      10,
    ),
    exposeTwoFactorCode: parseBoolean(process.env.EXPOSE_2FA_CODE, false),
    defaultTwoFactorChannel: buildTwoFactorChannel(),
  },
  integrations: {
    googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? '',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? '',
      authToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? '',
      fromPhone: process.env.TWILIO_FROM_PHONE?.trim() ?? '',
      whatsappContentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID?.trim() ?? '',
      phoneOverride: process.env.TWO_FACTOR_PHONE_OVERRIDE?.trim() ?? '',
    },
    powerbiApiKey: process.env.POWERBI_API_KEY?.trim() ?? '',
  },
}

export function isDatabaseConfigured(): boolean {
  return env.database.url.trim().length > 0
}
