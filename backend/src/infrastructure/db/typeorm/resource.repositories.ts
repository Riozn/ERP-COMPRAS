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
import type {
  AuditEvent,
  CreateInventoryLedgerInput,
  CreatePayableAccountInput,
  CreatePayablePaymentInput,
  CreatePurchaseHeaderInput,
  CreatePurchaseLineInput,
  InventoryLedger,
  PayableAccount,
  PayablePayment,
  PurchaseHeader,
  PurchaseLine,
  UpdateInventoryLedgerInput,
  UpdatePayableAccountInput,
  UpdatePayablePaymentInput,
  UpdatePurchaseHeaderInput,
  UpdatePurchaseLineInput,
} from '../../../domain/operations/operation.types.js'
import { createTypeormCrudRepository, type TypeormRepositorySource } from './crud.repository.js'
import {
  AuditEventEntity,
  CurrencyEntity,
  DocumentStateEntity,
  DocumentTypeEntity,
  ItemEntity,
  ItemGroupEntity,
  ItemWarehouseEntity,
  InventoryLedgerEntity,
  PayableAccountEntity,
  PayablePaymentEntity,
  PurchaseHeaderEntity,
  PurchaseLineEntity,
  SupplierEntity,
  TaxEntity,
  WarehouseEntity,
} from './entities.js'

function mapCurrency(entity: CurrencyEntity): Currency {
  return {
    id: entity.id,
    codigo: entity.codigo,
    nombre: entity.nombre,
    tasaActual: entity.tasaActual,
  }
}

function mapWarehouse(entity: WarehouseEntity): Warehouse {
  return {
    id: entity.id,
    nombre: entity.nombre,
    ubicacion: entity.ubicacion,
    activo: entity.activo,
  }
}

function mapTax(entity: TaxEntity): Tax {
  return {
    id: entity.id,
    taxCode: entity.taxCode,
    nombre: entity.nombre,
    porcentaje: entity.porcentaje,
    activo: entity.activo,
  }
}

function mapItemGroup(entity: ItemGroupEntity): ItemGroup {
  return {
    id: entity.id,
    codigo: entity.codigo,
    nombre: entity.nombre,
  }
}

function mapDocumentState(entity: DocumentStateEntity): DocumentState {
  return {
    id: entity.id,
    codigo: entity.codigo,
    nombre: entity.nombre,
  }
}

function mapDocumentType(entity: DocumentTypeEntity): DocumentType {
  return {
    id: entity.id,
    codigo: entity.codigo,
    nombre: entity.nombre,
    afectaInventario: entity.afectaInventario,
  }
}

function mapSupplier(entity: SupplierEntity): Supplier {
  return {
    id: entity.id,
    cardCode: entity.cardCode,
    cardName: entity.cardName,
    nombreComercial: entity.nombreComercial,
    nitRut: entity.nitRut,
    email: entity.email,
    telefono: entity.telefono,
    direccion: entity.direccion,
    monedaId: entity.monedaId,
    balanceCuenta: entity.balanceCuenta,
    lineaCredito: entity.lineaCredito,
    activo: entity.activo,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

function mapItem(entity: ItemEntity): Item {
  return {
    id: entity.id,
    itemCode: entity.itemCode,
    itemName: entity.itemName,
    descripcion: entity.descripcion,
    unidadMedida: entity.unidadMedida,
    costoEstandar: entity.costoEstandar,
    grupoId: entity.grupoId,
    impuestoId: entity.impuestoId,
    activo: entity.activo,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

function mapItemWarehouse(entity: ItemWarehouseEntity): ItemWarehouse {
  return {
    id: entity.id,
    articuloId: entity.articuloId,
    almacenId: entity.almacenId,
    stockFisico: entity.stockFisico,
    comprometido: entity.comprometido,
    solicitado: entity.solicitado,
    stockDisponible: entity.stockDisponible,
  }
}

function mapPurchaseHeader(entity: PurchaseHeaderEntity): PurchaseHeader {
  return {
    id: entity.id,
    tipoDocId: entity.tipoDocId,
    docNum: entity.docNum,
    proveedorId: entity.proveedorId,
    estadoId: entity.estadoId,
    monedaId: entity.monedaId,
    fechaDocumento: entity.fechaDocumento,
    fechaContabilizacion: entity.fechaContabilizacion.toISOString(),
    fechaVencimiento: entity.fechaVencimiento,
    subtotal: entity.subtotal,
    descuentoTotal: entity.descuentoTotal,
    impuestosTotal: entity.impuestosTotal,
    totalDocumento: entity.totalDocumento,
    comentarios: entity.comentarios,
    isCanceled: entity.isCanceled,
    docCanceladoId: entity.docCanceladoId,
    createdBy: entity.createdBy,
    approvedBy: entity.approvedBy,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

function mapPurchaseLine(entity: PurchaseLineEntity): PurchaseLine {
  return {
    id: entity.id,
    docId: entity.docId,
    lineNum: entity.lineNum,
    articuloId: entity.articuloId,
    almacenId: entity.almacenId,
    impuestoId: entity.impuestoId,
    descripcion: entity.descripcion,
    cantidadTotal: entity.cantidadTotal,
    cantidadPendiente: entity.cantidadPendiente,
    precioUnitario: entity.precioUnitario,
    descuentoLinea: entity.descuentoLinea,
    subtotalLinea: entity.subtotalLinea,
    totalLinea: entity.totalLinea,
    baseTipoDocId: entity.baseTipoDocId,
    baseEntry: entity.baseEntry,
    baseLine: entity.baseLine,
  }
}

function mapInventoryLedger(entity: InventoryLedgerEntity): InventoryLedger {
  return {
    id: entity.id,
    articuloId: entity.articuloId,
    almacenId: entity.almacenId,
    docReferenciaId: entity.docReferenciaId,
    tipoMovimiento: entity.tipoMovimiento,
    cantidad: entity.cantidad,
    costoMomento: entity.costoMomento,
    usuarioId: entity.usuarioId,
    fecha: entity.fecha.toISOString(),
    comentario: entity.comentario,
  }
}

function mapPayableAccount(entity: PayableAccountEntity): PayableAccount {
  return {
    id: entity.id,
    compraId: entity.compraId,
    proveedorId: entity.proveedorId,
    numeroFactura: entity.numeroFactura,
    montoTotal: entity.montoTotal,
    saldoPendiente: entity.saldoPendiente,
    fechaVencimiento: entity.fechaVencimiento,
    estado: entity.estado,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

function mapPayablePayment(entity: PayablePaymentEntity): PayablePayment {
  return {
    id: entity.id,
    cuentaPorPagarId: entity.cuentaPorPagarId,
    proveedorId: entity.proveedorId,
    monto: entity.monto,
    fechaPago: entity.fechaPago.toISOString(),
    referencia: entity.referencia,
    createdBy: entity.createdBy,
    createdAt: entity.createdAt.toISOString(),
  }
}

function mapAuditEvent(entity: AuditEventEntity): AuditEvent {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    entidad: entity.entidad,
    entidadId: entity.entidadId,
    accion: entity.accion,
    datosAntes: entity.datosAntes,
    datosDespues: entity.datosDespues,
    ipOrigen: entity.ipOrigen,
    fecha: entity.fecha.toISOString(),
  }
}

export function createCurrencyRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<CurrencyEntity, CreateCurrencyInput, UpdateCurrencyInput, Currency, number>(
    dataSource,
    {
      entity: CurrencyEntity,
      order: { id: 'ASC' },
      map: mapCurrency,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        codigo: input.codigo,
        nombre: input.nombre,
        tasaActual: input.tasaActual ?? '1.0000',
      }),
      applyUpdate: (entity, input) => {
        entity.codigo = input.codigo ?? entity.codigo
        entity.nombre = input.nombre ?? entity.nombre
        entity.tasaActual = input.tasaActual ?? entity.tasaActual
      },
    },
  )
}

export function createWarehouseRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<WarehouseEntity, CreateWarehouseInput, UpdateWarehouseInput, Warehouse, string>(
    dataSource,
    {
      entity: WarehouseEntity,
      order: { id: 'ASC' },
      map: mapWarehouse,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        id: input.id,
        nombre: input.nombre,
        ubicacion: input.ubicacion ?? null,
        activo: input.activo ?? true,
      }),
      applyUpdate: (entity, input) => {
        entity.id = input.id ?? entity.id
        entity.nombre = input.nombre ?? entity.nombre
        entity.ubicacion = input.ubicacion ?? entity.ubicacion
        entity.activo = input.activo ?? entity.activo
      },
    },
  )
}

export function createTaxRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<TaxEntity, CreateTaxInput, UpdateTaxInput, Tax, number>(
    dataSource,
    {
      entity: TaxEntity,
      order: { id: 'ASC' },
      map: mapTax,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        taxCode: input.taxCode,
        nombre: input.nombre,
        porcentaje: input.porcentaje ?? '0.00',
        activo: input.activo ?? true,
      }),
      applyUpdate: (entity, input) => {
        entity.taxCode = input.taxCode ?? entity.taxCode
        entity.nombre = input.nombre ?? entity.nombre
        entity.porcentaje = input.porcentaje ?? entity.porcentaje
        entity.activo = input.activo ?? entity.activo
      },
    },
  )
}

export function createItemGroupRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<ItemGroupEntity, CreateItemGroupInput, UpdateItemGroupInput, ItemGroup, number>(
    dataSource,
    {
      entity: ItemGroupEntity,
      order: { id: 'ASC' },
      map: mapItemGroup,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({ codigo: input.codigo, nombre: input.nombre }),
      applyUpdate: (entity, input) => {
        entity.codigo = input.codigo ?? entity.codigo
        entity.nombre = input.nombre ?? entity.nombre
      },
    },
  )
}

export function createDocumentStateRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<DocumentStateEntity, CreateDocumentStateInput, UpdateDocumentStateInput, DocumentState, number>(
    dataSource,
    {
      entity: DocumentStateEntity,
      order: { id: 'ASC' },
      map: mapDocumentState,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({ codigo: input.codigo, nombre: input.nombre }),
      applyUpdate: (entity, input) => {
        entity.codigo = input.codigo ?? entity.codigo
        entity.nombre = input.nombre ?? entity.nombre
      },
    },
  )
}

export function createDocumentTypeRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<DocumentTypeEntity, CreateDocumentTypeInput, UpdateDocumentTypeInput, DocumentType, number>(
    dataSource,
    {
      entity: DocumentTypeEntity,
      order: { id: 'ASC' },
      map: mapDocumentType,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        codigo: input.codigo,
        nombre: input.nombre,
        afectaInventario: input.afectaInventario ?? false,
      }),
      applyUpdate: (entity, input) => {
        entity.codigo = input.codigo ?? entity.codigo
        entity.nombre = input.nombre ?? entity.nombre
        entity.afectaInventario = input.afectaInventario ?? entity.afectaInventario
      },
    },
  )
}

export function createSupplierRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<SupplierEntity, CreateSupplierInput, UpdateSupplierInput, Supplier, string>(
    dataSource,
    {
      entity: SupplierEntity,
      order: { createdAt: 'DESC' },
      map: mapSupplier,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        cardCode: input.cardCode,
        cardName: input.cardName,
        nombreComercial: input.nombreComercial ?? null,
        nitRut: input.nitRut,
        email: input.email ?? null,
        telefono: input.telefono ?? null,
        direccion: input.direccion ?? null,
        monedaId: input.monedaId,
        balanceCuenta: input.balanceCuenta ?? '0',
        lineaCredito: input.lineaCredito ?? '0',
        activo: input.activo ?? true,
      }),
      applyUpdate: (entity, input) => {
        entity.cardCode = input.cardCode ?? entity.cardCode
        entity.cardName = input.cardName ?? entity.cardName
        entity.nombreComercial =
          input.nombreComercial === undefined ? entity.nombreComercial : input.nombreComercial
        entity.nitRut = input.nitRut ?? entity.nitRut
        entity.email = input.email === undefined ? entity.email : input.email
        entity.telefono = input.telefono === undefined ? entity.telefono : input.telefono
        entity.direccion = input.direccion === undefined ? entity.direccion : input.direccion
        entity.monedaId = input.monedaId ?? entity.monedaId
        entity.balanceCuenta = input.balanceCuenta ?? entity.balanceCuenta
        entity.lineaCredito = input.lineaCredito ?? entity.lineaCredito
        entity.activo = input.activo ?? entity.activo
      },
    },
  )
}

export function createItemRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<ItemEntity, CreateItemInput, UpdateItemInput, Item, string>(
    dataSource,
    {
      entity: ItemEntity,
      order: { createdAt: 'DESC' },
      map: mapItem,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        itemCode: input.itemCode,
        itemName: input.itemName,
        descripcion: input.descripcion ?? null,
        unidadMedida: input.unidadMedida ?? 'UNI',
        costoEstandar: input.costoEstandar ?? '0',
        grupoId: input.grupoId,
        impuestoId: input.impuestoId,
        activo: input.activo ?? true,
      }),
      applyUpdate: (entity, input) => {
        entity.itemCode = input.itemCode ?? entity.itemCode
        entity.itemName = input.itemName ?? entity.itemName
        entity.descripcion =
          input.descripcion === undefined ? entity.descripcion : input.descripcion
        entity.unidadMedida = input.unidadMedida ?? entity.unidadMedida
        entity.costoEstandar = input.costoEstandar ?? entity.costoEstandar
        entity.grupoId = input.grupoId ?? entity.grupoId
        entity.impuestoId = input.impuestoId ?? entity.impuestoId
        entity.activo = input.activo ?? entity.activo
      },
    },
  )
}

export function createItemWarehouseRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<ItemWarehouseEntity, CreateItemWarehouseInput, UpdateItemWarehouseInput, ItemWarehouse, string>(
    dataSource,
    {
      entity: ItemWarehouseEntity,
      order: { id: 'ASC' },
      map: mapItemWarehouse,
      buildWhere: (id) => ({ id }),
      buildCreate: (input) => ({
        articuloId: input.articuloId,
        almacenId: input.almacenId,
        stockFisico: input.stockFisico ?? '0',
        comprometido: input.comprometido ?? '0',
        solicitado: input.solicitado ?? '0',
        stockDisponible: input.stockDisponible ?? '0',
      }),
      applyUpdate: (entity, input) => {
        entity.articuloId = input.articuloId ?? entity.articuloId
        entity.almacenId = input.almacenId ?? entity.almacenId
        entity.stockFisico = input.stockFisico ?? entity.stockFisico
        entity.comprometido = input.comprometido ?? entity.comprometido
        entity.solicitado = input.solicitado ?? entity.solicitado
        entity.stockDisponible = input.stockDisponible ?? entity.stockDisponible
      },
    },
  )
}

export function createPurchaseHeaderRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    PurchaseHeaderEntity,
    CreatePurchaseHeaderInput,
    UpdatePurchaseHeaderInput,
    PurchaseHeader,
    string
  >(dataSource, {
    entity: PurchaseHeaderEntity,
    order: { createdAt: 'DESC' },
    map: mapPurchaseHeader,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      tipoDocId: input.tipoDocId,
      docNum: input.docNum,
      proveedorId: input.proveedorId ?? null,
      estadoId: input.estadoId,
      monedaId: input.monedaId,
      fechaDocumento: input.fechaDocumento,
      fechaContabilizacion: input.fechaContabilizacion ? new Date(input.fechaContabilizacion) : new Date(),
      fechaVencimiento: input.fechaVencimiento ?? null,
      subtotal: input.subtotal ?? '0',
      descuentoTotal: input.descuentoTotal ?? '0',
      impuestosTotal: input.impuestosTotal ?? '0',
      totalDocumento: input.totalDocumento ?? '0',
      comentarios: input.comentarios ?? null,
      isCanceled: input.isCanceled ?? false,
      docCanceladoId: input.docCanceladoId ?? null,
      createdBy: input.createdBy,
      approvedBy: input.approvedBy ?? null,
    }),
    applyUpdate: (entity, input) => {
      entity.tipoDocId = input.tipoDocId ?? entity.tipoDocId
      entity.docNum = input.docNum ?? entity.docNum
      entity.proveedorId =
        input.proveedorId === undefined ? entity.proveedorId : input.proveedorId
      entity.estadoId = input.estadoId ?? entity.estadoId
      entity.monedaId = input.monedaId ?? entity.monedaId
      entity.fechaDocumento = input.fechaDocumento ?? entity.fechaDocumento
      entity.fechaContabilizacion = input.fechaContabilizacion
        ? new Date(input.fechaContabilizacion)
        : entity.fechaContabilizacion
      entity.fechaVencimiento =
        input.fechaVencimiento === undefined ? entity.fechaVencimiento : input.fechaVencimiento
      entity.subtotal = input.subtotal ?? entity.subtotal
      entity.descuentoTotal = input.descuentoTotal ?? entity.descuentoTotal
      entity.impuestosTotal = input.impuestosTotal ?? entity.impuestosTotal
      entity.totalDocumento = input.totalDocumento ?? entity.totalDocumento
      entity.comentarios =
        input.comentarios === undefined ? entity.comentarios : input.comentarios
      entity.isCanceled = input.isCanceled ?? entity.isCanceled
      entity.docCanceladoId =
        input.docCanceladoId === undefined ? entity.docCanceladoId : input.docCanceladoId
      entity.createdBy = input.createdBy ?? entity.createdBy
      entity.approvedBy =
        input.approvedBy === undefined ? entity.approvedBy : input.approvedBy
    },
  })
}

export function createPurchaseLineRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    PurchaseLineEntity,
    CreatePurchaseLineInput,
    UpdatePurchaseLineInput,
    PurchaseLine,
    string
  >(dataSource, {
    entity: PurchaseLineEntity,
    order: { lineNum: 'ASC' },
    map: mapPurchaseLine,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      docId: input.docId,
      lineNum: input.lineNum,
      articuloId: input.articuloId,
      almacenId: input.almacenId,
      impuestoId: input.impuestoId,
      descripcion: input.descripcion ?? null,
      cantidadTotal: input.cantidadTotal ?? '0',
      cantidadPendiente: input.cantidadPendiente ?? '0',
      precioUnitario: input.precioUnitario ?? '0',
      descuentoLinea: input.descuentoLinea ?? '0',
      subtotalLinea: input.subtotalLinea ?? '0',
      totalLinea: input.totalLinea ?? '0',
      baseTipoDocId: input.baseTipoDocId ?? null,
      baseEntry: input.baseEntry ?? null,
      baseLine: input.baseLine ?? null,
    }),
    applyUpdate: (entity, input) => {
      entity.docId = input.docId ?? entity.docId
      entity.lineNum = input.lineNum ?? entity.lineNum
      entity.articuloId = input.articuloId ?? entity.articuloId
      entity.almacenId = input.almacenId ?? entity.almacenId
      entity.impuestoId = input.impuestoId ?? entity.impuestoId
      entity.descripcion =
        input.descripcion === undefined ? entity.descripcion : input.descripcion
      entity.cantidadTotal = input.cantidadTotal ?? entity.cantidadTotal
      entity.cantidadPendiente = input.cantidadPendiente ?? entity.cantidadPendiente
      entity.precioUnitario = input.precioUnitario ?? entity.precioUnitario
      entity.descuentoLinea = input.descuentoLinea ?? entity.descuentoLinea
      entity.subtotalLinea = input.subtotalLinea ?? entity.subtotalLinea
      entity.totalLinea = input.totalLinea ?? entity.totalLinea
      entity.baseTipoDocId =
        input.baseTipoDocId === undefined ? entity.baseTipoDocId : input.baseTipoDocId
      entity.baseEntry = input.baseEntry === undefined ? entity.baseEntry : input.baseEntry
      entity.baseLine = input.baseLine === undefined ? entity.baseLine : input.baseLine
    },
  })
}

export function createInventoryLedgerRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    InventoryLedgerEntity,
    CreateInventoryLedgerInput,
    UpdateInventoryLedgerInput,
    InventoryLedger,
    string
  >(dataSource, {
    entity: InventoryLedgerEntity,
    order: { fecha: 'DESC' },
    map: mapInventoryLedger,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      articuloId: input.articuloId,
      almacenId: input.almacenId,
      docReferenciaId: input.docReferenciaId,
      tipoMovimiento: input.tipoMovimiento,
      cantidad: input.cantidad,
      costoMomento: input.costoMomento ?? '0',
      usuarioId: input.usuarioId,
      fecha: input.fecha ? new Date(input.fecha) : new Date(),
      comentario: input.comentario ?? null,
    }),
    applyUpdate: (entity, input) => {
      entity.articuloId = input.articuloId ?? entity.articuloId
      entity.almacenId = input.almacenId ?? entity.almacenId
      entity.docReferenciaId = input.docReferenciaId ?? entity.docReferenciaId
      entity.tipoMovimiento = input.tipoMovimiento ?? entity.tipoMovimiento
      entity.cantidad = input.cantidad ?? entity.cantidad
      entity.costoMomento = input.costoMomento ?? entity.costoMomento
      entity.usuarioId = input.usuarioId ?? entity.usuarioId
      entity.fecha = input.fecha ? new Date(input.fecha) : entity.fecha
      entity.comentario =
        input.comentario === undefined ? entity.comentario : input.comentario
    },
  })
}

export function createPayableAccountRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    PayableAccountEntity,
    CreatePayableAccountInput,
    UpdatePayableAccountInput,
    PayableAccount,
    string
  >(dataSource, {
    entity: PayableAccountEntity,
    order: { createdAt: 'DESC' },
    map: mapPayableAccount,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      compraId: input.compraId,
      proveedorId: input.proveedorId,
      numeroFactura: input.numeroFactura,
      montoTotal: input.montoTotal ?? '0',
      saldoPendiente: input.saldoPendiente ?? '0',
      fechaVencimiento: input.fechaVencimiento,
      estado: input.estado ?? 'PENDIENTE',
    }),
    applyUpdate: (entity, input) => {
      entity.compraId = input.compraId ?? entity.compraId
      entity.proveedorId = input.proveedorId ?? entity.proveedorId
      entity.numeroFactura = input.numeroFactura ?? entity.numeroFactura
      entity.montoTotal = input.montoTotal ?? entity.montoTotal
      entity.saldoPendiente = input.saldoPendiente ?? entity.saldoPendiente
      entity.fechaVencimiento = input.fechaVencimiento ?? entity.fechaVencimiento
      entity.estado = input.estado ?? entity.estado
    },
  })
}

export function createPayablePaymentRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    PayablePaymentEntity,
    CreatePayablePaymentInput,
    UpdatePayablePaymentInput,
    PayablePayment,
    string
  >(dataSource, {
    entity: PayablePaymentEntity,
    order: { createdAt: 'DESC' },
    map: mapPayablePayment,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      cuentaPorPagarId: input.cuentaPorPagarId,
      proveedorId: input.proveedorId,
      monto: input.monto,
      fechaPago: new Date(input.fechaPago),
      referencia: input.referencia ?? null,
      createdBy: input.createdBy,
    }),
    applyUpdate: (entity, input) => {
      entity.cuentaPorPagarId = input.cuentaPorPagarId ?? entity.cuentaPorPagarId
      entity.proveedorId = input.proveedorId ?? entity.proveedorId
      entity.monto = input.monto ?? entity.monto
      entity.fechaPago = input.fechaPago ? new Date(input.fechaPago) : entity.fechaPago
      entity.referencia = input.referencia === undefined ? entity.referencia : input.referencia
      entity.createdBy = input.createdBy ?? entity.createdBy
    },
  })
}

export function createAuditEventRepository(dataSource: TypeormRepositorySource) {
  return createTypeormCrudRepository<
    AuditEventEntity,
    {
      usuarioId: string
      entidad: string
      entidadId?: string | null
      accion: string
      datosAntes?: string | null
      datosDespues?: string | null
      ipOrigen?: string | null
    },
    Partial<{
      usuarioId: string
      entidad: string
      entidadId?: string | null
      accion: string
      datosAntes?: string | null
      datosDespues?: string | null
      ipOrigen?: string | null
    }>,
    AuditEvent,
    string
  >(dataSource, {
    entity: AuditEventEntity,
    order: { fecha: 'DESC' },
    map: mapAuditEvent,
    buildWhere: (id) => ({ id }),
    buildCreate: (input) => ({
      usuarioId: input.usuarioId,
      entidad: input.entidad,
      entidadId: input.entidadId ?? null,
      accion: input.accion,
      datosAntes: input.datosAntes ?? null,
      datosDespues: input.datosDespues ?? null,
      ipOrigen: input.ipOrigen ?? null,
    }),
    applyUpdate: (entity, input) => {
      entity.usuarioId = input.usuarioId ?? entity.usuarioId
      entity.entidad = input.entidad ?? entity.entidad
      entity.entidadId = input.entidadId === undefined ? entity.entidadId : input.entidadId
      entity.accion = input.accion ?? entity.accion
      entity.datosAntes = input.datosAntes === undefined ? entity.datosAntes : input.datosAntes
      entity.datosDespues =
        input.datosDespues === undefined ? entity.datosDespues : input.datosDespues
      entity.ipOrigen = input.ipOrigen === undefined ? entity.ipOrigen : input.ipOrigen
    },
  })
}

export type CatalogCrudRepositories = {
  currencies: ReturnType<typeof createCurrencyRepository>
  warehouses: ReturnType<typeof createWarehouseRepository>
  taxes: ReturnType<typeof createTaxRepository>
  itemGroups: ReturnType<typeof createItemGroupRepository>
  documentStates: ReturnType<typeof createDocumentStateRepository>
  documentTypes: ReturnType<typeof createDocumentTypeRepository>
}

export type MasterCrudRepositories = {
  suppliers: ReturnType<typeof createSupplierRepository>
  items: ReturnType<typeof createItemRepository>
  itemWarehouses: ReturnType<typeof createItemWarehouseRepository>
}

export function createCatalogCrudRepositories(dataSource: TypeormRepositorySource): CatalogCrudRepositories {
  return {
    currencies: createCurrencyRepository(dataSource),
    warehouses: createWarehouseRepository(dataSource),
    taxes: createTaxRepository(dataSource),
    itemGroups: createItemGroupRepository(dataSource),
    documentStates: createDocumentStateRepository(dataSource),
    documentTypes: createDocumentTypeRepository(dataSource),
  }
}

export function createMasterCrudRepositories(dataSource: TypeormRepositorySource): MasterCrudRepositories {
  return {
    suppliers: createSupplierRepository(dataSource),
    items: createItemRepository(dataSource),
    itemWarehouses: createItemWarehouseRepository(dataSource),
  }
}
