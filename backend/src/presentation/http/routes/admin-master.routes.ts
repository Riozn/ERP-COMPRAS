import { Router, type Request } from 'express'

import type { CrudApplicationService } from '../../../application/crud/crud.service.js'
import type {
  CreateItemInput,
  CreateItemWarehouseInput,
  CreateSupplierInput,
  Item,
  ItemWarehouse,
  Supplier,
  UpdateItemInput,
  UpdateItemWarehouseInput,
  UpdateSupplierInput,
} from '../../../domain/masters/master.types.js'
import { ValidationError } from '../../../shared/errors/http-error.js'
import { createCrudRoutes, requireValue } from './crud.routes.js'

type AdminMasterServices = {
  suppliers: CrudApplicationService<Supplier, CreateSupplierInput, UpdateSupplierInput, Supplier, string>
  items: CrudApplicationService<Item, CreateItemInput, UpdateItemInput, Item, string>
  itemWarehouses: CrudApplicationService<ItemWarehouse, CreateItemWarehouseInput, UpdateItemWarehouseInput, ItemWarehouse, string>
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }

  const text = readString(value)
  return text.length > 0 ? text : undefined
}

function readOptionalText(value: unknown): string | undefined {
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

function parseSupplierCreate(req: Request): CreateSupplierInput {
  const payload: CreateSupplierInput = {
    cardCode: readString(req.body?.cardCode),
    cardName: readString(req.body?.cardName),
    nitRut: readString(req.body?.nitRut),
    monedaId: 0,
  }

  const nombreComercial = readOptionalString(req.body?.nombreComercial)
  const email = readOptionalString(req.body?.email)
  const telefono = readOptionalString(req.body?.telefono)
  const direccion = readOptionalString(req.body?.direccion)
  const monedaId = readNumber(req.body?.monedaId)
  const balanceCuenta = readOptionalText(req.body?.balanceCuenta)
  const lineaCredito = readOptionalText(req.body?.lineaCredito)
  const activo = readBoolean(req.body?.activo)

  if (nombreComercial !== undefined) payload.nombreComercial = nombreComercial
  if (email !== undefined) payload.email = email
  if (telefono !== undefined) payload.telefono = telefono
  if (direccion !== undefined) payload.direccion = direccion
  if (monedaId !== undefined) payload.monedaId = monedaId
  if (balanceCuenta !== undefined) payload.balanceCuenta = balanceCuenta
  if (lineaCredito !== undefined) payload.lineaCredito = lineaCredito
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseSupplierUpdate(req: Request): UpdateSupplierInput {
  const payload: UpdateSupplierInput = {}
  const cardCode = readOptionalText(req.body?.cardCode)
  const cardName = readOptionalText(req.body?.cardName)
  const nombreComercial = readOptionalString(req.body?.nombreComercial)
  const nitRut = readOptionalText(req.body?.nitRut)
  const email = readOptionalString(req.body?.email)
  const telefono = readOptionalString(req.body?.telefono)
  const direccion = readOptionalString(req.body?.direccion)
  const monedaId = readNumber(req.body?.monedaId)
  const balanceCuenta = readOptionalText(req.body?.balanceCuenta)
  const lineaCredito = readOptionalText(req.body?.lineaCredito)
  const activo = readBoolean(req.body?.activo)

  if (cardCode !== undefined) payload.cardCode = cardCode
  if (cardName !== undefined) payload.cardName = cardName
  if (nombreComercial !== undefined) payload.nombreComercial = nombreComercial
  if (nitRut !== undefined) payload.nitRut = nitRut
  if (email !== undefined) payload.email = email
  if (telefono !== undefined) payload.telefono = telefono
  if (direccion !== undefined) payload.direccion = direccion
  if (monedaId !== undefined) payload.monedaId = monedaId
  if (balanceCuenta !== undefined) payload.balanceCuenta = balanceCuenta
  if (lineaCredito !== undefined) payload.lineaCredito = lineaCredito
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseItemCreate(req: Request): CreateItemInput {
  const payload: CreateItemInput = {
    itemCode: readString(req.body?.itemCode),
    itemName: readString(req.body?.itemName),
    grupoId: 0,
    impuestoId: 0,
  }

  const descripcion = readOptionalString(req.body?.descripcion)
  const unidadMedida = readOptionalText(req.body?.unidadMedida)
  const costoEstandar = readOptionalText(req.body?.costoEstandar)
  const grupoId = readNumber(req.body?.grupoId)
  const impuestoId = readNumber(req.body?.impuestoId)
  const activo = readBoolean(req.body?.activo)

  if (descripcion !== undefined) payload.descripcion = descripcion
  if (unidadMedida !== undefined) payload.unidadMedida = unidadMedida
  if (costoEstandar !== undefined) payload.costoEstandar = costoEstandar
  if (grupoId !== undefined) payload.grupoId = grupoId
  if (impuestoId !== undefined) payload.impuestoId = impuestoId
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseItemUpdate(req: Request): UpdateItemInput {
  const payload: UpdateItemInput = {}
  const itemCode = readOptionalText(req.body?.itemCode)
  const itemName = readOptionalText(req.body?.itemName)
  const descripcion = readOptionalString(req.body?.descripcion)
  const unidadMedida = readOptionalText(req.body?.unidadMedida)
  const costoEstandar = readOptionalText(req.body?.costoEstandar)
  const grupoId = readNumber(req.body?.grupoId)
  const impuestoId = readNumber(req.body?.impuestoId)
  const activo = readBoolean(req.body?.activo)

  if (itemCode !== undefined) payload.itemCode = itemCode
  if (itemName !== undefined) payload.itemName = itemName
  if (descripcion !== undefined) payload.descripcion = descripcion
  if (unidadMedida !== undefined) payload.unidadMedida = unidadMedida
  if (costoEstandar !== undefined) payload.costoEstandar = costoEstandar
  if (grupoId !== undefined) payload.grupoId = grupoId
  if (impuestoId !== undefined) payload.impuestoId = impuestoId
  if (activo !== undefined) payload.activo = activo

  return payload
}

function parseItemWarehouseCreate(req: Request): CreateItemWarehouseInput {
  const payload: CreateItemWarehouseInput = {
    articuloId: readString(req.body?.articuloId),
    almacenId: readString(req.body?.almacenId),
  }

  const stockFisico = readOptionalText(req.body?.stockFisico)
  const comprometido = readOptionalText(req.body?.comprometido)
  const solicitado = readOptionalText(req.body?.solicitado)
  const stockDisponible = readOptionalText(req.body?.stockDisponible)

  if (stockFisico !== undefined) payload.stockFisico = stockFisico
  if (comprometido !== undefined) payload.comprometido = comprometido
  if (solicitado !== undefined) payload.solicitado = solicitado
  if (stockDisponible !== undefined) payload.stockDisponible = stockDisponible

  return payload
}

function parseItemWarehouseUpdate(req: Request): UpdateItemWarehouseInput {
  const payload: UpdateItemWarehouseInput = {}
  const articuloId = readOptionalText(req.body?.articuloId)
  const almacenId = readOptionalText(req.body?.almacenId)
  const stockFisico = readOptionalText(req.body?.stockFisico)
  const comprometido = readOptionalText(req.body?.comprometido)
  const solicitado = readOptionalText(req.body?.solicitado)
  const stockDisponible = readOptionalText(req.body?.stockDisponible)

  if (articuloId !== undefined) payload.articuloId = articuloId
  if (almacenId !== undefined) payload.almacenId = almacenId
  if (stockFisico !== undefined) payload.stockFisico = stockFisico
  if (comprometido !== undefined) payload.comprometido = comprometido
  if (solicitado !== undefined) payload.solicitado = solicitado
  if (stockDisponible !== undefined) payload.stockDisponible = stockDisponible

  return payload
}

export function createAdminMasterRoutes(services: AdminMasterServices): Router {
  const router = Router()

  router.use(
    '/suppliers',
    createCrudRoutes(services.suppliers, {
      itemKey: 'supplier',
      itemsKey: 'suppliers',
      parseId: (value) => value.trim(),
      parseCreate: parseSupplierCreate,
      parseUpdate: parseSupplierUpdate,
      validateCreate: (input) => {
        requireValue(input.cardCode, 'cardCode es obligatorio.')
        requireValue(input.cardName, 'cardName es obligatorio.')
        requireValue(input.nitRut, 'nitRut es obligatorio.')
        requireValue(input.monedaId, 'monedaId es obligatorio.')
      },
    }),
  )

  router.use(
    '/items',
    createCrudRoutes(services.items, {
      itemKey: 'item',
      itemsKey: 'items',
      parseId: (value) => value.trim(),
      parseCreate: parseItemCreate,
      parseUpdate: parseItemUpdate,
      validateCreate: (input) => {
        requireValue(input.itemCode, 'itemCode es obligatorio.')
        requireValue(input.itemName, 'itemName es obligatorio.')
        requireValue(input.grupoId, 'grupoId es obligatorio.')
        requireValue(input.impuestoId, 'impuestoId es obligatorio.')
      },
    }),
  )

  router.use(
    '/item-warehouses',
    createCrudRoutes(services.itemWarehouses, {
      itemKey: 'itemWarehouse',
      itemsKey: 'itemWarehouses',
      parseId: (value) => value.trim(),
      parseCreate: parseItemWarehouseCreate,
      parseUpdate: parseItemWarehouseUpdate,
      validateCreate: (input) => {
        requireValue(input.articuloId, 'articuloId es obligatorio.')
        requireValue(input.almacenId, 'almacenId es obligatorio.')
      },
    }),
  )

  return router
}
