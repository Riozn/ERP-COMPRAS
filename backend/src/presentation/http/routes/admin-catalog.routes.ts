import { Router, type Request } from 'express'

import type { CrudApplicationService } from '../../../application/crud/crud.service.js'
import type {
  CreateCurrencyInput,
  CreateDocumentStateInput,
  CreateDocumentTypeInput,
  CreateItemGroupInput,
  CreateTaxInput,
  CreateWarehouseInput,
  Currency,
  DocumentState,
  DocumentType,
  ItemGroup,
  Tax,
  UpdateCurrencyInput,
  UpdateDocumentStateInput,
  UpdateDocumentTypeInput,
  UpdateItemGroupInput,
  UpdateTaxInput,
  UpdateWarehouseInput,
  Warehouse,
} from '../../../domain/catalogs/catalog.types.js'
import { ValidationError } from '../../../shared/errors/http-error.js'
import { createCrudRoutes, requireValue } from './crud.routes.js'

type AdminCatalogServices = {
  currencies: CrudApplicationService<Currency, CreateCurrencyInput, UpdateCurrencyInput, Currency, number>
  warehouses: CrudApplicationService<Warehouse, CreateWarehouseInput, UpdateWarehouseInput, Warehouse, string>
  taxes: CrudApplicationService<Tax, CreateTaxInput, UpdateTaxInput, Tax, number>
  itemGroups: CrudApplicationService<ItemGroup, CreateItemGroupInput, UpdateItemGroupInput, ItemGroup, number>
  documentStates: CrudApplicationService<DocumentState, CreateDocumentStateInput, UpdateDocumentStateInput, DocumentState, number>
  documentTypes: CrudApplicationService<DocumentType, CreateDocumentTypeInput, UpdateDocumentTypeInput, DocumentType, number>
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown): string | undefined {
  const text = readString(value)
  return text.length > 0 ? text : undefined
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }

  return undefined
}

function readNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseCurrencyCreate(req: Request): CreateCurrencyInput {
  const payload: CreateCurrencyInput = {
    codigo: readString(req.body?.codigo),
    nombre: readString(req.body?.nombre),
  }

  const tasaActual = readOptionalString(req.body?.tasaActual)
  if (tasaActual !== undefined) {
    payload.tasaActual = tasaActual
  }

  return payload
}

function parseCurrencyUpdate(req: Request): UpdateCurrencyInput {
  const payload: UpdateCurrencyInput = {}
  const codigo = readOptionalString(req.body?.codigo)
  const nombre = readOptionalString(req.body?.nombre)
  const tasaActual = readOptionalString(req.body?.tasaActual)

  if (codigo !== undefined) payload.codigo = codigo
  if (nombre !== undefined) payload.nombre = nombre
  if (tasaActual !== undefined) payload.tasaActual = tasaActual

  return payload
}

function parseWarehouseCreate(req: Request): CreateWarehouseInput {
  const payload: CreateWarehouseInput = {
    id: readString(req.body?.id),
    nombre: readString(req.body?.nombre),
  }

  if (req.body?.ubicacion === null) {
    payload.ubicacion = null
  } else {
    const ubicacion = readOptionalString(req.body?.ubicacion)
    if (ubicacion !== undefined) payload.ubicacion = ubicacion
  }

  const activo = readBoolean(req.body?.activo)
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseWarehouseUpdate(req: Request): UpdateWarehouseInput {
  const payload: UpdateWarehouseInput = {}
  const id = readOptionalString(req.body?.id)
  const nombre = readOptionalString(req.body?.nombre)

  if (id !== undefined) payload.id = id
  if (nombre !== undefined) payload.nombre = nombre

  if (req.body?.ubicacion === null) {
    payload.ubicacion = null
  } else {
    const ubicacion = readOptionalString(req.body?.ubicacion)
    if (ubicacion !== undefined) payload.ubicacion = ubicacion
  }

  const activo = readBoolean(req.body?.activo)
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseTaxCreate(req: Request): CreateTaxInput {
  const payload: CreateTaxInput = {
    taxCode: readString(req.body?.taxCode),
    nombre: readString(req.body?.nombre),
  }

  const porcentaje = readOptionalString(req.body?.porcentaje)
  if (porcentaje !== undefined) payload.porcentaje = porcentaje
  const activo = readBoolean(req.body?.activo)
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseTaxUpdate(req: Request): UpdateTaxInput {
  const payload: UpdateTaxInput = {}
  const taxCode = readOptionalString(req.body?.taxCode)
  const nombre = readOptionalString(req.body?.nombre)
  const porcentaje = readOptionalString(req.body?.porcentaje)
  const activo = readBoolean(req.body?.activo)

  if (taxCode !== undefined) payload.taxCode = taxCode
  if (nombre !== undefined) payload.nombre = nombre
  if (porcentaje !== undefined) payload.porcentaje = porcentaje
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseItemGroupCreate(req: Request): CreateItemGroupInput {
  return {
    codigo: readString(req.body?.codigo),
    nombre: readString(req.body?.nombre),
  }
}

function parseItemGroupUpdate(req: Request): UpdateItemGroupInput {
  const payload: UpdateItemGroupInput = {}
  const codigo = readOptionalString(req.body?.codigo)
  const nombre = readOptionalString(req.body?.nombre)

  if (codigo !== undefined) payload.codigo = codigo
  if (nombre !== undefined) payload.nombre = nombre

  return payload
}

function parseDocumentStateCreate(req: Request): CreateDocumentStateInput {
  return {
    codigo: readString(req.body?.codigo),
    nombre: readString(req.body?.nombre),
  }
}

function parseDocumentStateUpdate(req: Request): UpdateDocumentStateInput {
  const payload: UpdateDocumentStateInput = {}
  const codigo = readOptionalString(req.body?.codigo)
  const nombre = readOptionalString(req.body?.nombre)

  if (codigo !== undefined) payload.codigo = codigo
  if (nombre !== undefined) payload.nombre = nombre

  return payload
}

function parseDocumentTypeCreate(req: Request): CreateDocumentTypeInput {
  const payload: CreateDocumentTypeInput = {
    codigo: readString(req.body?.codigo),
    nombre: readString(req.body?.nombre),
  }

  const afectaInventario = readBoolean(req.body?.afectaInventario)
  if (afectaInventario !== undefined) payload.afectaInventario = afectaInventario

  return payload
}

function parseDocumentTypeUpdate(req: Request): UpdateDocumentTypeInput {
  const payload: UpdateDocumentTypeInput = {}
  const codigo = readOptionalString(req.body?.codigo)
  const nombre = readOptionalString(req.body?.nombre)
  const afectaInventario = readBoolean(req.body?.afectaInventario)

  if (codigo !== undefined) payload.codigo = codigo
  if (nombre !== undefined) payload.nombre = nombre
  if (afectaInventario !== undefined) payload.afectaInventario = afectaInventario

  return payload
}

export function createAdminCatalogRoutes(services: AdminCatalogServices): Router {
  const router = Router()

  router.use(
    '/currencies',
    createCrudRoutes(services.currencies, {
      itemKey: 'currency',
      itemsKey: 'currencies',
      parseId: (value) => {
        const id = readNumber(value)
        if (id === undefined) throw new ValidationError('El id de moneda es invalido.')
        return id
      },
      parseCreate: parseCurrencyCreate,
      parseUpdate: parseCurrencyUpdate,
      validateCreate: (input) => {
        requireValue(input.codigo, 'codigo es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  router.use(
    '/warehouses',
    createCrudRoutes(services.warehouses, {
      itemKey: 'warehouse',
      itemsKey: 'warehouses',
      parseId: (value) => value.trim(),
      parseCreate: parseWarehouseCreate,
      parseUpdate: parseWarehouseUpdate,
      validateCreate: (input) => {
        requireValue(input.id, 'id es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  router.use(
    '/taxes',
    createCrudRoutes(services.taxes, {
      itemKey: 'tax',
      itemsKey: 'taxes',
      parseId: (value) => {
        const id = readNumber(value)
        if (id === undefined) throw new ValidationError('El id del impuesto es invalido.')
        return id
      },
      parseCreate: parseTaxCreate,
      parseUpdate: parseTaxUpdate,
      validateCreate: (input) => {
        requireValue(input.taxCode, 'taxCode es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  router.use(
    '/item-groups',
    createCrudRoutes(services.itemGroups, {
      itemKey: 'itemGroup',
      itemsKey: 'itemGroups',
      parseId: (value) => {
        const id = readNumber(value)
        if (id === undefined) throw new ValidationError('El id del grupo es invalido.')
        return id
      },
      parseCreate: parseItemGroupCreate,
      parseUpdate: parseItemGroupUpdate,
      validateCreate: (input) => {
        requireValue(input.codigo, 'codigo es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  router.use(
    '/document-states',
    createCrudRoutes(services.documentStates, {
      itemKey: 'documentState',
      itemsKey: 'documentStates',
      parseId: (value) => {
        const id = readNumber(value)
        if (id === undefined) throw new ValidationError('El id del estado es invalido.')
        return id
      },
      parseCreate: parseDocumentStateCreate,
      parseUpdate: parseDocumentStateUpdate,
      validateCreate: (input) => {
        requireValue(input.codigo, 'codigo es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  router.use(
    '/document-types',
    createCrudRoutes(services.documentTypes, {
      itemKey: 'documentType',
      itemsKey: 'documentTypes',
      parseId: (value) => {
        const id = readNumber(value)
        if (id === undefined) throw new ValidationError('El id del tipo es invalido.')
        return id
      },
      parseCreate: parseDocumentTypeCreate,
      parseUpdate: parseDocumentTypeUpdate,
      validateCreate: (input) => {
        requireValue(input.codigo, 'codigo es obligatorio.')
        requireValue(input.nombre, 'nombre es obligatorio.')
      },
    }),
  )

  return router
}
