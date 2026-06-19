import 'reflect-metadata'

import type { Repository } from 'typeorm'
import { ScryptPasswordHasher } from '../../security/password-hasher.js'
import { getDataSource } from './data-source.js'
import {
  AuditEventEntity,
  CurrencyEntity,
  DocumentStateEntity,
  DocumentTypeEntity,
  InventoryLedgerEntity,
  ItemEntity,
  ItemGroupEntity,
  ItemWarehouseEntity,
  PayableAccountEntity,
  PayablePaymentEntity,
  PurchaseHeaderEntity,
  PurchaseLineEntity,
  RoleEntity,
  SupplierEntity,
  TaxEntity,
  UserEntity,
  WarehouseEntity,
} from './entities.js'

type RepositorySource = {
  getRepository(target: any): Repository<any>
}

type SeedRecord<T extends { id: string | number }> = T

const ids = {
  superadmin: '11111111-1111-1111-1111-111111111111',
  admin: '22222222-2222-2222-2222-222222222222',
  operator: '33333333-3333-3333-3333-333333333333',
  supplierA: '44444444-4444-4444-4444-444444444444',
  supplierB: '55555555-5555-5555-5555-555555555555',
  itemA: '66666666-6666-6666-6666-666666666666',
  itemB: '66666666-6666-6666-6666-666666666667',
  itemC: '66666666-6666-6666-6666-666666666668',
  itemWhA: '77777777-7777-7777-7777-777777777771',
  itemWhB: '77777777-7777-7777-7777-777777777772',
  itemWhC: '77777777-7777-7777-7777-777777777773',
  warehouseExtra: 'SEC',
  purchaseA: '88888888-8888-8888-8888-888888888881',
  purchaseB: '88888888-8888-8888-8888-888888888882',
  lineA1: '99999999-9999-9999-9999-999999999991',
  lineA2: '99999999-9999-9999-9999-999999999992',
  lineB1: '99999999-9999-9999-9999-999999999993',
  lineB2: '99999999-9999-9999-9999-999999999994',
  ledgerA1: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  ledgerA2: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  ledgerB1: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
  ledgerB2: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
  payableA: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  payableB: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
  paymentA: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  auditA: 'dddddddd-dddd-dddd-dddd-ddddddddddd1',
  auditB: 'dddddddd-dddd-dddd-dddd-ddddddddddd2',
  auditC: 'dddddddd-dddd-dddd-dddd-ddddddddddd3',
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function futureDate(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

async function upsertById<T extends { id: string | number }>(
  repository: Repository<any>,
  entity: SeedRecord<T>,
): Promise<void> {
  const existing = await repository.findOneBy({ id: entity.id } as any)
  if (existing) {
    await repository.save({ ...existing, ...entity })
    return
  }

  await repository.save(entity)
}

async function seedUsers(source: RepositorySource, hasher: ScryptPasswordHasher) {
  const passwordAdmin = await hasher.hash('Admin123!')
  const passwordUser = await hasher.hash('User123!')
  const repository = source.getRepository(UserEntity)

  const users: SeedRecord<UserEntity>[] = [
    {
      id: ids.superadmin,
      username: 'demo.superadmin',
      nombreCompleto: 'Super Administrador ERP',
      email: 'demo.superadmin@erp.test',
      telefono: '+59170000001',
      passwordHash: passwordAdmin,
      googleSub: null,
      rolId: 1,
      activo: true,
      twoFactorEnabled: true,
      twoFactorSecret: null,
      ultimoLogin: daysAgo(1),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    } as UserEntity,
    {
      id: ids.admin,
      username: 'demo.admin',
      nombreCompleto: 'Administrador ERP',
      email: 'demo.admin@erp.test',
      telefono: '+59170000002',
      passwordHash: passwordAdmin,
      googleSub: null,
      rolId: 2,
      activo: true,
      twoFactorEnabled: true,
      twoFactorSecret: null,
      ultimoLogin: daysAgo(2),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
    } as UserEntity,
    {
      id: ids.operator,
      username: 'demo.operaciones',
      nombreCompleto: 'Usuario Operativo',
      email: 'demo.operaciones@erp.test',
      telefono: '+59170000003',
      passwordHash: passwordUser,
      googleSub: null,
      rolId: 3,
      activo: true,
      twoFactorEnabled: true,
      twoFactorSecret: null,
      ultimoLogin: daysAgo(3),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(3),
    } as UserEntity,
  ]

  for (const user of users) {
    await upsertById(repository, user)
  }
}

async function seedCatalogs(source: RepositorySource) {
  const entries: Array<{ repository: Repository<any>; rows: any[] }> = [
    {
      repository: source.getRepository(RoleEntity),
      rows: [
        { id: 1, codigo: 'SUPERADMIN', nombre: 'Super Administrador' },
        { id: 2, codigo: 'ADMIN', nombre: 'Administrador' },
        { id: 3, codigo: 'USER', nombre: 'Usuario' },
      ],
    },
    {
      repository: source.getRepository(CurrencyEntity),
      rows: [
        { id: 1, codigo: 'BOB', nombre: 'Boliviano', tasaActual: '1.0000' },
        { id: 2, codigo: 'USD', nombre: 'Dolar estadounidense', tasaActual: '6.9600' },
      ],
    },
    {
      repository: source.getRepository(WarehouseEntity),
      rows: [
        { id: 'MAIN', nombre: 'Almacen Principal', ubicacion: 'Casa matriz', activo: true },
        { id: ids.warehouseExtra, nombre: 'Almacen Secundario', ubicacion: 'Sucursal central', activo: true },
      ],
    },
    {
      repository: source.getRepository(TaxEntity),
      rows: [
        { id: 1, taxCode: 'IVA', nombre: 'Impuesto al Valor Agregado', porcentaje: '13.00', activo: true },
      ],
    },
    {
      repository: source.getRepository(ItemGroupEntity),
      rows: [{ id: 1, codigo: 'GENERAL', nombre: 'General' }],
    },
    {
      repository: source.getRepository(DocumentStateEntity),
      rows: [
        { id: 1, codigo: 'BORRADOR', nombre: 'Borrador' },
        { id: 2, codigo: 'PENDIENTE', nombre: 'Pendiente' },
        { id: 3, codigo: 'APROBADO', nombre: 'Aprobado' },
        { id: 4, codigo: 'ANULADO', nombre: 'Anulado' },
      ],
    },
    {
      repository: source.getRepository(DocumentTypeEntity),
      rows: [
        { id: 1, codigo: 'OC', nombre: 'Orden de compra', afectaInventario: false },
        { id: 2, codigo: 'GR', nombre: 'Guia de recepcion', afectaInventario: true },
      ],
    },
  ]

  for (const { repository, rows } of entries) {
    for (const row of rows) {
      await upsertById(repository, row)
    }
  }
}

async function seedMasters(source: RepositorySource) {
  const supplierRepo = source.getRepository(SupplierEntity)
  const itemRepo = source.getRepository(ItemEntity)
  const stockRepo = source.getRepository(ItemWarehouseEntity)

  const suppliers: SeedRecord<SupplierEntity>[] = [
    {
      id: ids.supplierA,
      cardCode: 'SUP-DEMO-01',
      cardName: 'Distribuidora Andina S.R.L.',
      nombreComercial: 'Andina',
      nitRut: '10203040',
      email: 'ventas@andina.test',
      telefono: '+59170111222',
      direccion: 'Av. Ejemplo 123',
      monedaId: 1,
      balanceCuenta: '1200.00',
      lineaCredito: '15000.00',
      activo: true,
      createdAt: daysAgo(21),
      updatedAt: daysAgo(2),
    } as SupplierEntity,
    {
      id: ids.supplierB,
      cardCode: 'SUP-DEMO-02',
      cardName: 'Tecnologia del Sur S.A.',
      nombreComercial: 'TecSur',
      nitRut: '50607080',
      email: 'compras@tecsur.test',
      telefono: '+59170111223',
      direccion: 'Calle Falsa 456',
      monedaId: 1,
      balanceCuenta: '350.00',
      lineaCredito: '8000.00',
      activo: true,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(1),
    } as SupplierEntity,
  ]

  const items: SeedRecord<ItemEntity>[] = [
    {
      id: ids.itemA,
      itemCode: 'ART-DEMO-01',
      itemName: 'Laptop Lenovo ThinkPad',
      descripcion: 'Equipo para estaciones de trabajo ejecutivas.',
      unidadMedida: 'UND',
      costoEstandar: '5200.0000',
      grupoId: 1,
      impuestoId: 1,
      activo: true,
      createdAt: daysAgo(16),
      updatedAt: daysAgo(4),
    } as ItemEntity,
    {
      id: ids.itemB,
      itemCode: 'ART-DEMO-02',
      itemName: 'Mouse Inalambrico',
      descripcion: 'Accesorio de oficina para uso diario.',
      unidadMedida: 'UND',
      costoEstandar: '85.0000',
      grupoId: 1,
      impuestoId: 1,
      activo: true,
      createdAt: daysAgo(16),
      updatedAt: daysAgo(4),
    } as ItemEntity,
    {
      id: ids.itemC,
      itemCode: 'ART-DEMO-03',
      itemName: 'Teclado Mecanico',
      descripcion: 'Teclado mecanico con retroiluminacion.',
      unidadMedida: 'UND',
      costoEstandar: '320.0000',
      grupoId: 1,
      impuestoId: 1,
      activo: true,
      createdAt: daysAgo(16),
      updatedAt: daysAgo(4),
    } as ItemEntity,
  ]

  const stocks: SeedRecord<ItemWarehouseEntity>[] = [
    {
      id: ids.itemWhA,
      articuloId: ids.itemA,
      almacenId: 'MAIN',
      stockFisico: '4.0000',
      comprometido: '0.0000',
      solicitado: '0.0000',
      stockDisponible: '4.0000',
    } as ItemWarehouseEntity,
    {
      id: ids.itemWhB,
      articuloId: ids.itemB,
      almacenId: 'MAIN',
      stockFisico: '6.0000',
      comprometido: '1.0000',
      solicitado: '0.0000',
      stockDisponible: '5.0000',
    } as ItemWarehouseEntity,
    {
      id: ids.itemWhC,
      articuloId: ids.itemC,
      almacenId: 'MAIN',
      stockFisico: '2.0000',
      comprometido: '0.0000',
      solicitado: '0.0000',
      stockDisponible: '2.0000',
    } as ItemWarehouseEntity,
  ]

  for (const supplier of suppliers) {
    await upsertById(supplierRepo, supplier)
  }

  for (const item of items) {
    await upsertById(itemRepo, item)
  }

  for (const stock of stocks) {
    await upsertById(stockRepo, stock)
  }
}

async function seedOperations(source: RepositorySource) {
  const purchaseHeaderRepo = source.getRepository(PurchaseHeaderEntity)
  const purchaseLineRepo = source.getRepository(PurchaseLineEntity)
  const inventoryRepo = source.getRepository(InventoryLedgerEntity)
  const payableAccountRepo = source.getRepository(PayableAccountEntity)
  const payablePaymentRepo = source.getRepository(PayablePaymentEntity)
  const auditRepo = source.getRepository(AuditEventEntity)

  const purchaseHeaders: SeedRecord<PurchaseHeaderEntity>[] = [
    {
      id: ids.purchaseA,
      tipoDocId: 1,
      docNum: 9001,
      proveedorId: ids.supplierA,
      estadoId: 3,
      monedaId: 1,
      fechaDocumento: '2026-06-12',
      fechaContabilizacion: daysAgo(5),
      fechaVencimiento: futureDate(10),
      subtotal: '8000.00',
      descuentoTotal: '0.00',
      impuestosTotal: '1040.00',
      totalDocumento: '9040.00',
      comentarios: 'Compra demo para abastecimiento inicial.',
      isCanceled: false,
      docCanceladoId: null,
      createdBy: ids.superadmin,
      approvedBy: ids.admin,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as PurchaseHeaderEntity,
    {
      id: ids.purchaseB,
      tipoDocId: 1,
      docNum: 9002,
      proveedorId: ids.supplierB,
      estadoId: 2,
      monedaId: 1,
      fechaDocumento: '2026-06-15',
      fechaContabilizacion: daysAgo(2),
      fechaVencimiento: futureDate(18),
      subtotal: '1200.00',
      descuentoTotal: '0.00',
      impuestosTotal: '156.00',
      totalDocumento: '1356.00',
      comentarios: 'Compra demo pendiente de cierre.',
      isCanceled: false,
      docCanceladoId: null,
      createdBy: ids.admin,
      approvedBy: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as PurchaseHeaderEntity,
  ]

  const purchaseLines: SeedRecord<PurchaseLineEntity>[] = [
    {
      id: ids.lineA1,
      docId: ids.purchaseA,
      lineNum: 1,
      articuloId: ids.itemA,
      almacenId: 'MAIN',
      impuestoId: 1,
      descripcion: 'Laptop principal para gerencia',
      cantidadTotal: '1.0000',
      cantidadPendiente: '0.0000',
      precioUnitario: '5200.0000',
      descuentoLinea: '0.00',
      subtotalLinea: '5200.00',
      totalLinea: '5876.00',
      baseTipoDocId: null,
      baseEntry: null,
      baseLine: null,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as PurchaseLineEntity,
    {
      id: ids.lineA2,
      docId: ids.purchaseA,
      lineNum: 2,
      articuloId: ids.itemB,
      almacenId: 'MAIN',
      impuestoId: 1,
      descripcion: 'Perifericos de oficina',
      cantidadTotal: '20.0000',
      cantidadPendiente: '0.0000',
      precioUnitario: '140.0000',
      descuentoLinea: '0.00',
      subtotalLinea: '2800.00',
      totalLinea: '3164.00',
      baseTipoDocId: null,
      baseEntry: null,
      baseLine: null,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as PurchaseLineEntity,
    {
      id: ids.lineB1,
      docId: ids.purchaseB,
      lineNum: 1,
      articuloId: ids.itemC,
      almacenId: 'MAIN',
      impuestoId: 1,
      descripcion: 'Teclados para mesa operativa',
      cantidadTotal: '3.0000',
      cantidadPendiente: '1.0000',
      precioUnitario: '320.0000',
      descuentoLinea: '0.00',
      subtotalLinea: '960.00',
      totalLinea: '1084.80',
      baseTipoDocId: null,
      baseEntry: null,
      baseLine: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as PurchaseLineEntity,
    {
      id: ids.lineB2,
      docId: ids.purchaseB,
      lineNum: 2,
      articuloId: ids.itemB,
      almacenId: 'MAIN',
      impuestoId: 1,
      descripcion: 'Mouse complementarios',
      cantidadTotal: '3.0000',
      cantidadPendiente: '1.0000',
      precioUnitario: '80.0000',
      descuentoLinea: '0.00',
      subtotalLinea: '240.00',
      totalLinea: '271.20',
      baseTipoDocId: null,
      baseEntry: null,
      baseLine: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as PurchaseLineEntity,
  ]

  const ledgerEntries: SeedRecord<InventoryLedgerEntity>[] = [
    {
      id: ids.ledgerA1,
      articuloId: ids.itemA,
      almacenId: 'MAIN',
      docReferenciaId: ids.purchaseA,
      tipoMovimiento: 'IN',
      cantidad: '1.0000',
      costoMomento: '5876.0000',
      usuarioId: ids.superadmin,
      fecha: daysAgo(5),
      comentario: 'Ingreso por compra demo 9001',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as InventoryLedgerEntity,
    {
      id: ids.ledgerA2,
      articuloId: ids.itemB,
      almacenId: 'MAIN',
      docReferenciaId: ids.purchaseA,
      tipoMovimiento: 'IN',
      cantidad: '20.0000',
      costoMomento: '3164.0000',
      usuarioId: ids.superadmin,
      fecha: daysAgo(5),
      comentario: 'Ingreso por compra demo 9001',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as InventoryLedgerEntity,
    {
      id: ids.ledgerB1,
      articuloId: ids.itemC,
      almacenId: 'MAIN',
      docReferenciaId: ids.purchaseB,
      tipoMovimiento: 'IN',
      cantidad: '3.0000',
      costoMomento: '1084.8000',
      usuarioId: ids.admin,
      fecha: daysAgo(2),
      comentario: 'Ingreso por compra demo 9002',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as InventoryLedgerEntity,
    {
      id: ids.ledgerB2,
      articuloId: ids.itemB,
      almacenId: 'MAIN',
      docReferenciaId: ids.purchaseB,
      tipoMovimiento: 'IN',
      cantidad: '3.0000',
      costoMomento: '271.2000',
      usuarioId: ids.admin,
      fecha: daysAgo(2),
      comentario: 'Ingreso por compra demo 9002',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as InventoryLedgerEntity,
  ]

  const payables: SeedRecord<PayableAccountEntity>[] = [
    {
      id: ids.payableA,
      compraId: ids.purchaseA,
      proveedorId: ids.supplierA,
      numeroFactura: 'FAC-DEMO-9001',
      montoTotal: '9040.00',
      saldoPendiente: '6040.00',
      fechaVencimiento: futureDate(-8),
      estado: 'PARCIAL',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    } as PayableAccountEntity,
    {
      id: ids.payableB,
      compraId: ids.purchaseB,
      proveedorId: ids.supplierB,
      numeroFactura: 'FAC-DEMO-9002',
      montoTotal: '1356.00',
      saldoPendiente: '1356.00',
      fechaVencimiento: futureDate(18),
      estado: 'PENDIENTE',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    } as PayableAccountEntity,
  ]

  const payments: SeedRecord<PayablePaymentEntity>[] = [
    {
      id: ids.paymentA,
      cuentaPorPagarId: ids.payableA,
      proveedorId: ids.supplierA,
      monto: '3000.00',
      fechaPago: daysAgo(1),
      referencia: 'Transferencia demo',
      createdBy: ids.admin,
      createdAt: daysAgo(1),
    } as PayablePaymentEntity,
  ]

  const auditEvents: SeedRecord<AuditEventEntity>[] = [
    {
      id: ids.auditA,
      usuarioId: ids.superadmin,
      entidad: 'o_usuarios',
      entidadId: ids.admin,
      accion: 'REGISTER',
      datosAntes: null,
      datosDespues: JSON.stringify({ username: 'admin', rolId: 2 }),
      ipOrigen: '127.0.0.1',
      fecha: daysAgo(3),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    } as AuditEventEntity,
    {
      id: ids.auditB,
      usuarioId: ids.admin,
      entidad: 'o_proveedores',
      entidadId: ids.supplierA,
      accion: 'CREATE',
      datosAntes: null,
      datosDespues: JSON.stringify({ cardCode: 'SUP-DEMO-01' }),
      ipOrigen: '127.0.0.1',
      fecha: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as AuditEventEntity,
    {
      id: ids.auditC,
      usuarioId: ids.admin,
      entidad: 'COMPRA',
      entidadId: ids.purchaseA,
      accion: 'COMPLETE_PURCHASE',
      datosAntes: null,
      datosDespues: JSON.stringify({ docNum: 9001 }),
      ipOrigen: '127.0.0.1',
      fecha: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    } as AuditEventEntity,
  ]

  for (const purchaseHeader of purchaseHeaders) {
    await upsertById(purchaseHeaderRepo, purchaseHeader)
  }

  for (const purchaseLine of purchaseLines) {
    await upsertById(purchaseLineRepo, purchaseLine)
  }

  for (const ledgerEntry of ledgerEntries) {
    await upsertById(inventoryRepo, ledgerEntry)
  }

  for (const payable of payables) {
    await upsertById(payableAccountRepo, payable)
  }

  for (const payment of payments) {
    await upsertById(payablePaymentRepo, payment)
  }

  for (const event of auditEvents) {
    await upsertById(auditRepo, event)
  }
}

async function run(): Promise<void> {
  const dataSource = await getDataSource()
  await dataSource.runMigrations()

  const hasher = new ScryptPasswordHasher()

  await dataSource.transaction(async (manager) => {
    await seedCatalogs(manager)
    await seedUsers(manager, hasher)
    await seedMasters(manager)
    await seedOperations(manager)
  })

  console.log('[db] demo data seeded successfully')
  console.log('[db] login demo accounts: demo.superadmin@erp.test / Admin123!, demo.admin@erp.test / Admin123!, demo.operaciones@erp.test / User123!')
}

void run().catch((error: unknown) => {
  console.error('[db] seed failed', error)
  process.exit(1)
})
