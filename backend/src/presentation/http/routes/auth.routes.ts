import { Router } from 'express'

import type { AuthApplicationService } from '../../../application/auth/auth.service.js'
import { createAuthMiddleware } from '../middlewares/auth.middleware.js'
import type { TokenService } from '../../../infrastructure/security/token.service.js'
import { ValidationError } from '../../../shared/errors/http-error.js'

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function createAuthRoutes(
  authService: AuthApplicationService,
  tokenService: TokenService,
): Router {
  const router = Router()
  const authMiddleware = createAuthMiddleware(tokenService)

  router.post('/register', async (req, res) => {
    const username = readString(req.body?.username)
    const nombreCompleto = readString(req.body?.nombreCompleto)
    const email = readString(req.body?.email)
    const telefono = readString(req.body?.telefono)
    const password = readString(req.body?.password)
    const rolId = readNumber(req.body?.rolId)
    const twoFactorEnabled = typeof req.body?.twoFactorEnabled === 'boolean'
      ? req.body.twoFactorEnabled
      : req.body?.twoFactorEnabled === 'true'

    if (!username || !nombreCompleto || !email || !telefono || !password || !Number.isFinite(rolId)) {
      throw new ValidationError(
        'username, nombreCompleto, email, telefono, password y rolId son obligatorios.',
      )
    }

    const session = await authService.register({
      username,
      nombreCompleto,
      email,
      telefono,
      password,
      rolId,
      twoFactorEnabled,
      userAgent: req.headers['user-agent'] ?? null,
      ipOrigen: req.ip ?? null,
    })

    res.status(201).json(session)
  })

  router.post('/login', async (req, res) => {
    const identifier = readString(req.body?.identifier)
    const password = readString(req.body?.password)
    const telefono = readString(req.body?.telefono)

    if (!identifier || !password) {
      throw new ValidationError('identifier y password son obligatorios.')
    }

    const result = await authService.login({
      identifier,
      password,
      telefono: telefono || null,
      userAgent: req.headers['user-agent'] ?? null,
      ipOrigen: req.ip ?? null,
    })

    if ('requiresTwoFactor' in result) {
      res.status(202).json(result)
      return
    }

    res.json(result)
  })

  router.post('/2fa/verify', async (req, res) => {
    const challengeToken = readString(req.body?.challengeToken)
    const code = readString(req.body?.code)

    if (!challengeToken || !code) {
      throw new ValidationError('challengeToken y code son obligatorios.')
    }

    const session = await authService.verifyTwoFactorLogin({
      challengeToken,
      code,
      userAgent: req.headers['user-agent'] ?? null,
      ipOrigen: req.ip ?? null,
    })

    res.json(session)
  })

  router.post('/refresh', async (req, res) => {
    const refreshToken = readString(req.body?.refreshToken)

    if (!refreshToken) {
      throw new ValidationError('refreshToken es obligatorio.')
    }

    const session = await authService.refreshSession({
      refreshToken,
      userAgent: req.headers['user-agent'] ?? null,
      ipOrigen: req.ip ?? null,
    })

    res.json(session)
  })

  router.post('/logout', async (req, res) => {
    const refreshToken = readString(req.body?.refreshToken)

    if (!refreshToken) {
      throw new ValidationError('refreshToken es obligatorio.')
    }

    await authService.logout(refreshToken)
    res.status(204).send()
  })

  router.get('/me', authMiddleware, async (req, res) => {
    if (!req.auth) {
      throw new ValidationError('No se pudo resolver la sesion.')
    }

    const user = await authService.me(req.auth.sub)
    res.json({ user })
  })

  return router
}
