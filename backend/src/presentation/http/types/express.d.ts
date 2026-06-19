import type { AccessTokenPayload } from '../../../infrastructure/security/token.service.js'

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload
    }
  }
}

export {}
