import { Router } from 'express'

import type { UserApplicationService } from '../../../application/users/user.service.js'
import { ValidationError } from '../../../shared/errors/http-error.js'
import { createAuthMiddleware } from '../middlewares/auth.middleware.js'
import { createRoleGuard } from '../middlewares/role.middleware.js'
import type { TokenService } from '../../../infrastructure/security/token.service.js'
import {
  buildCreateUserRequest,
  buildUpdateUserRequest,
  readTwoFactorEnabled,
} from './users.request.js'

export function createUsersRoutes(
  usersService: UserApplicationService,
  tokenService: TokenService,
): Router {
  const router = Router()
  const authMiddleware = createAuthMiddleware(tokenService)
  const adminGuard = createRoleGuard(['ADMIN', 'SUPERADMIN'])

  router.use(authMiddleware)
  router.use(adminGuard)

  router.get('/', async (_req, res) => {
    const users = await usersService.listUsers()
    res.json({ users })
  })

  router.get('/:id', async (req, res) => {
    const user = await usersService.getUser(req.params.id)
    res.json({ user })
  })

  router.post('/', async (req, res) => {
    const input = buildCreateUserRequest(req)
    const rolId = input.rolId

    if (!input.username || !input.nombreCompleto || !input.email || !input.password || rolId === undefined) {
      throw new ValidationError(
        'username, nombreCompleto, email, password y rolId son obligatorios.',
      )
    }

    const user = await usersService.createUser({ ...input, rolId })
    res.status(201).json({ user })
  })

  router.patch('/:id', async (req, res) => {
    const updated = await usersService.updateUser(
      req.params.id,
      buildUpdateUserRequest(req),
    )

    res.json({ user: updated })
  })

  router.delete('/:id', async (req, res) => {
    await usersService.deleteUser(req.params.id, req.ip ?? null)
    res.status(204).send()
  })

  router.patch('/:id/two-factor', async (req, res) => {
    const enabled = readTwoFactorEnabled(req)
    if (enabled === undefined) {
      throw new ValidationError('enabled debe ser true o false.')
    }

    const user = await usersService.setTwoFactorEnabled(
      req.params.id,
      enabled,
      req.ip ?? null,
    )

    res.json({ user })
  })

  return router
}
