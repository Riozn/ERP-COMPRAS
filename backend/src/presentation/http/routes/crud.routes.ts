import { Router, type Request } from 'express'

import { NotFoundError, ValidationError } from '../../../shared/errors/http-error.js'
import type { CrudApplicationService } from '../../../application/crud/crud.service.js'

type CrudRouteOptions<TCreate, TUpdate, TId extends string | number, TList> = {
  itemKey: string
  itemsKey: string
  parseId(value: string): TId
  parseCreate(req: Request): TCreate
  parseUpdate(req: Request): TUpdate
  validateCreate?(input: TCreate): void
  validateUpdate?(input: TUpdate): void
  requireAuth?: boolean
  mapList?(items: TList[]): unknown
}

function ensureDefined(value: unknown, message: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(message)
  }
}

export function createCrudRoutes<TList, TCreate, TUpdate, TId extends string | number>(
  service: CrudApplicationService<any, TCreate, TUpdate, TList, TId>,
  options: CrudRouteOptions<TCreate, TUpdate, TId, TList>,
): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    const items = await service.list()
    res.json({ [options.itemsKey]: options.mapList ? options.mapList(items) : items })
  })

  router.get('/:id', async (req, res) => {
    const id = options.parseId(req.params.id)
    const item = await service.getById(id)
    if (!item) {
      throw new NotFoundError(`${options.itemKey} no encontrado.`)
    }

    res.json({ [options.itemKey]: item })
  })

  router.post('/', async (req, res) => {
    const input = options.parseCreate(req)
    options.validateCreate?.(input)
    const item = await service.create(input)
    res.status(201).json({ [options.itemKey]: item })
  })

  router.patch('/:id', async (req, res) => {
    const id = options.parseId(req.params.id)
    const input = options.parseUpdate(req)
    options.validateUpdate?.(input)
    const item = await service.update(id, input)
    res.json({ [options.itemKey]: item })
  })

  router.delete('/:id', async (req, res) => {
    const id = options.parseId(req.params.id)
    await service.delete(id)
    res.status(204).send()
  })

  return router
}

export function requireValue(value: unknown, message: string): void {
  ensureDefined(value, message)
}
