import type { NextFunction, Request, Response } from 'express'

import { UnauthorizedError } from '../../../shared/errors/http-error.js'
import type { TokenService } from '../../../infrastructure/security/token.service.js'

export function createAuthMiddleware(tokenService: TokenService) {
  return async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Falta el token de acceso.')
    }

    const token = authorization.slice(7).trim()
    try {
      req.auth = await tokenService.verifyAccessToken(token)
    } catch (error) {
      const code = error instanceof Error ? (error as { code?: string }).code : undefined
      if (code === 'ERR_JWT_EXPIRED') {
        throw new UnauthorizedError('La sesion expiró. Vuelve a iniciar sesión.')
      }

      throw error
    }

    next()
  }
}
