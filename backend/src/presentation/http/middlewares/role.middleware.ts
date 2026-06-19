import type { NextFunction, Request, Response } from 'express'

import { ForbiddenError, UnauthorizedError } from '../../../shared/errors/http-error.js'

export function createRoleGuard(allowedRoleCodes: string[]) {
  return function roleGuard(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    if (!req.auth) {
      throw new UnauthorizedError('No se pudo resolver la sesion.')
    }

    if (!allowedRoleCodes.includes(req.auth.roleCode)) {
      throw new ForbiddenError('No tienes permisos para acceder a este recurso.')
    }

    next()
  }
}
