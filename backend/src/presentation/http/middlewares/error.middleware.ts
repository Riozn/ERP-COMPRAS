import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../shared/errors/http-error.js'

export function notFoundHandler(
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(404).json({
    error: 'Ruta no encontrada.',
  })
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details ?? null,
    })
    return
  }

  console.error('[api] unhandled error', error)

  res.status(500).json({
    error: 'Error interno del servidor.',
  })
}
