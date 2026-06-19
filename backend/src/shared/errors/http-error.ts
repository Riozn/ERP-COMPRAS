export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado.') {
    super(401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción.') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado.') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe.') {
    super(409, message)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'El servicio no está disponible por ahora.') {
    super(503, message)
  }
}
