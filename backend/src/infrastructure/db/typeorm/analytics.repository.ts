import { DataSource } from 'typeorm'

import type {
  DashboardSummary,
  InventoryReport,
  PayablesReport,
  PurchaseReport,
} from '../../../domain/analytics/analytics.types.js'
import type {
  AnalyticsRepository,
  InventoryReportInput,
  PurchaseReportInput,
} from '../../../domain/repositories/analytics.repository.js'
import {
  AuditEventEntity,
  DocumentStateEntity,
  InventoryLedgerEntity,
  ItemEntity,
  ItemWarehouseEntity,
  PayableAccountEntity,
  PurchaseHeaderEntity,
  SupplierEntity,
  UserEntity,
  WarehouseEntity,
} from './entities.js'

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toFixed(value: unknown, digits = 2): string {
  return toNumber(value).toFixed(digits)
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(Math.floor((to.getTime() - from.getTime()) / 86400000), 0)
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function endOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function bucketForDays(daysOverdue: number): string {
  if (daysOverdue <= 0) return 'Vigente'
  if (daysOverdue <= 30) return '1-30'
  if (daysOverdue <= 60) return '31-60'
  if (daysOverdue <= 90) return '61-90'
  return '90+'
}

export class TypeormAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboardSummary(windowDays: number): Promise<DashboardSummary> {
    const reference = new Date()
    const from = startOfUtcDay(new Date(reference.getTime() - (windowDays - 1) * 86400000))
    const to = endOfUtcDay(reference)

    const userRepo = this.dataSource.getRepository(UserEntity)
    const supplierRepo = this.dataSource.getRepository(SupplierEntity)
    const itemRepo = this.dataSource.getRepository(ItemEntity)
    const warehouseRepo = this.dataSource.getRepository(WarehouseEntity)
    const purchaseRepo = this.dataSource.getRepository(PurchaseHeaderEntity)
    const payableRepo = this.dataSource.getRepository(PayableAccountEntity)
    const inventoryRepo = this.dataSource.getRepository(InventoryLedgerEntity)
    const auditRepo = this.dataSource.getRepository(AuditEventEntity)

    const [
      users,
      suppliers,
      items,
      warehouses,
      purchases,
      pendingPayables,
      lowStockItems,
      inventoryMovements,
      recentPurchases,
      recentEvents,
    ] = await Promise.all([
      userRepo.count({ where: { activo: true } }),
      supplierRepo.count({ where: { activo: true } }),
      itemRepo.count({ where: { activo: true } }),
      warehouseRepo.count({ where: { activo: true } }),
      purchaseRepo
        .createQueryBuilder('purchase')
        .where('purchase.fechaDocumento BETWEEN :from AND :to', {
          from: toDateOnly(from),
          to: toDateOnly(to),
        })
        .getCount(),
      payableRepo
        .createQueryBuilder('payable')
        .where('payable.estado IN (:...states)', { states: ['PENDIENTE', 'PARCIAL'] })
        .getCount(),
      this.dataSource
        .getRepository(ItemWarehouseEntity)
        .createQueryBuilder('stock')
        .leftJoin(ItemEntity, 'item', 'item.id = stock.articuloId')
        .leftJoin(WarehouseEntity, 'warehouse', 'warehouse.id = stock.almacenId')
        .select('stock.articuloId', 'articuloId')
        .addSelect('item.itemCode', 'articuloCodigo')
        .addSelect('item.itemName', 'articuloNombre')
        .addSelect('stock.almacenId', 'almacenId')
        .addSelect('warehouse.nombre', 'almacenNombre')
        .addSelect('stock.stockFisico', 'stockFisico')
        .addSelect('stock.stockDisponible', 'stockDisponible')
        .where('CAST(stock.stockDisponible AS numeric) < :threshold', { threshold: 10 })
        .orderBy('CAST(stock.stockDisponible AS numeric)', 'ASC')
        .limit(8)
        .getRawMany(),
      inventoryRepo
        .createQueryBuilder('ledger')
        .where('ledger.fecha BETWEEN :from AND :to', { from, to })
        .getCount(),
      purchaseRepo
        .createQueryBuilder('purchase')
        .leftJoin(SupplierEntity, 'supplier', 'supplier.id = purchase.proveedorId')
        .leftJoin(DocumentStateEntity, 'state', 'state.id = purchase.estadoId')
        .select([
          'purchase.id AS id',
          'purchase.fechaDocumento AS fechaDocumento',
          'purchase.docNum AS docNum',
          'purchase.proveedorId AS proveedorId',
          'supplier.cardName AS proveedorNombre',
          'purchase.totalDocumento AS totalDocumento',
          'purchase.estadoId AS estadoId',
          'state.nombre AS estadoNombre',
        ])
        .where('purchase.fechaDocumento BETWEEN :from AND :to', {
          from: toDateOnly(from),
          to: toDateOnly(to),
        })
        .orderBy('purchase.fechaDocumento', 'DESC')
        .limit(10)
        .getRawMany(),
      auditRepo
        .createQueryBuilder('event')
        .select([
          'event.id AS id',
          'event.entidad AS entidad',
          'event.accion AS accion',
          'event.usuarioId AS usuarioId',
          'event.fecha AS fecha',
        ])
        .orderBy('event.fecha', 'DESC')
        .limit(8)
        .getRawMany(),
    ])

    return {
      generatedAt: reference.toISOString(),
      windowDays,
      kpis: {
        users,
        suppliers,
        items,
        warehouses,
        purchases,
        pendingPayables,
        lowStockItems: lowStockItems.length,
        inventoryMovements,
      },
      recentPurchases: recentPurchases.map((purchase) => ({
        id: String(purchase.id),
        fechaDocumento: String(purchase.fechaDocumento),
        docNum: toNumber(purchase.docNum),
        proveedorId: purchase.proveedorId ? String(purchase.proveedorId) : null,
        proveedorNombre: purchase.proveedorNombre ? String(purchase.proveedorNombre) : null,
        totalDocumento: toFixed(purchase.totalDocumento),
        estadoId: toNumber(purchase.estadoId),
      })),
      lowStockItems: lowStockItems.map((row) => ({
        articuloId: String(row.articuloId),
        articuloCodigo: String(row.articuloCodigo ?? ''),
        articuloNombre: String(row.articuloNombre ?? ''),
        almacenId: String(row.almacenId),
        almacenNombre: String(row.almacenNombre ?? ''),
        stockFisico: toFixed(row.stockFisico, 4),
        stockDisponible: toFixed(row.stockDisponible, 4),
      })),
      recentEvents: recentEvents.map((event) => ({
        id: String(event.id),
        entidad: String(event.entidad),
        accion: String(event.accion),
        usuarioId: String(event.usuarioId),
        fecha: String(event.fecha),
      })),
    }
  }

  async getPurchaseReport(input: PurchaseReportInput): Promise<PurchaseReport> {
    const purchaseRepo = this.dataSource.getRepository(PurchaseHeaderEntity)

    const [totals, byDay, topSuppliers, documents] = await Promise.all([
      purchaseRepo
        .createQueryBuilder('purchase')
        .select('COUNT(*)', 'documents')
        .addSelect('COALESCE(SUM(purchase.subtotal), 0)', 'subtotal')
        .addSelect('COALESCE(SUM(purchase.impuestosTotal), 0)', 'taxes')
        .addSelect('COALESCE(SUM(purchase.totalDocumento), 0)', 'total')
        .where('purchase.fechaDocumento BETWEEN :from AND :to', input)
        .getRawOne(),
      purchaseRepo
        .createQueryBuilder('purchase')
        .select('purchase.fechaDocumento', 'date')
        .addSelect('COUNT(*)', 'documents')
        .addSelect('COALESCE(SUM(purchase.totalDocumento), 0)', 'total')
        .where('purchase.fechaDocumento BETWEEN :from AND :to', input)
        .groupBy('purchase.fechaDocumento')
        .orderBy('purchase.fechaDocumento', 'ASC')
        .getRawMany(),
      purchaseRepo
        .createQueryBuilder('purchase')
        .leftJoin(SupplierEntity, 'supplier', 'supplier.id = purchase.proveedorId')
        .select('purchase.proveedorId', 'proveedorId')
        .addSelect('COALESCE(supplier.cardName, \'Sin proveedor\')', 'proveedorNombre')
        .addSelect('COUNT(*)', 'documents')
        .addSelect('COALESCE(SUM(purchase.totalDocumento), 0)', 'total')
        .where('purchase.fechaDocumento BETWEEN :from AND :to', input)
        .groupBy('purchase.proveedorId')
        .addGroupBy('supplier.cardName')
        .orderBy('COALESCE(SUM(purchase.totalDocumento), 0)', 'DESC')
        .limit(10)
        .getRawMany(),
      purchaseRepo
        .createQueryBuilder('purchase')
        .leftJoin(SupplierEntity, 'supplier', 'supplier.id = purchase.proveedorId')
        .leftJoin(DocumentStateEntity, 'state', 'state.id = purchase.estadoId')
        .select([
          'purchase.id AS id',
          'purchase.fechaDocumento AS fechaDocumento',
          'purchase.docNum AS docNum',
          'purchase.proveedorId AS proveedorId',
          'supplier.cardName AS proveedorNombre',
          'purchase.estadoId AS estadoId',
          'state.nombre AS estadoNombre',
          'purchase.totalDocumento AS totalDocumento',
          'purchase.isCanceled AS isCanceled',
        ])
        .where('purchase.fechaDocumento BETWEEN :from AND :to', input)
        .orderBy('purchase.fechaDocumento', 'DESC')
        .getRawMany(),
    ])

    return {
      range: input,
      totals: {
        documents: toNumber(totals?.documents),
        subtotal: toFixed(totals?.subtotal),
        taxes: toFixed(totals?.taxes),
        total: toFixed(totals?.total),
      },
      byDay: byDay.map((row) => ({
        date: String(row.date),
        documents: toNumber(row.documents),
        total: toFixed(row.total),
      })),
      topSuppliers: topSuppliers.map((row) => ({
        proveedorId: String(row.proveedorId ?? ''),
        proveedorNombre: String(row.proveedorNombre ?? 'Sin proveedor'),
        documents: toNumber(row.documents),
        total: toFixed(row.total),
      })),
      documents: documents.map((purchase) => ({
        id: String(purchase.id),
        fechaDocumento: String(purchase.fechaDocumento),
        docNum: toNumber(purchase.docNum),
        proveedorId: purchase.proveedorId ? String(purchase.proveedorId) : null,
        proveedorNombre: purchase.proveedorNombre ? String(purchase.proveedorNombre) : null,
        estadoId: toNumber(purchase.estadoId),
        estadoNombre: purchase.estadoNombre ? String(purchase.estadoNombre) : null,
        totalDocumento: toFixed(purchase.totalDocumento),
        isCanceled: Boolean(purchase.isCanceled),
      })),
    }
  }

  async getInventoryReport(input: InventoryReportInput): Promise<InventoryReport> {
    const reference = new Date()
    const from = startOfUtcDay(new Date(reference.getTime() - (input.windowDays - 1) * 86400000))
    const to = endOfUtcDay(reference)

    const lowStockItems = await this.dataSource
      .getRepository(ItemWarehouseEntity)
      .createQueryBuilder('stock')
      .leftJoin(ItemEntity, 'item', 'item.id = stock.articuloId')
      .leftJoin(WarehouseEntity, 'warehouse', 'warehouse.id = stock.almacenId')
      .select('stock.articuloId', 'articuloId')
      .addSelect('item.itemCode', 'articuloCodigo')
      .addSelect('item.itemName', 'articuloNombre')
      .addSelect('stock.almacenId', 'almacenId')
      .addSelect('warehouse.nombre', 'almacenNombre')
      .addSelect('stock.stockFisico', 'stockFisico')
      .addSelect('stock.stockDisponible', 'stockDisponible')
      .where('CAST(stock.stockDisponible AS numeric) < :threshold', { threshold: input.threshold })
      .orderBy('CAST(stock.stockDisponible AS numeric)', 'ASC')
      .getRawMany()

    const movementsByDay = await this.dataSource
      .getRepository(InventoryLedgerEntity)
      .createQueryBuilder('ledger')
      .select('DATE(ledger.fecha)', 'date')
      .addSelect('COUNT(*)', 'movements')
      .addSelect('COALESCE(SUM(ledger.cantidad), 0)', 'quantity')
      .where('ledger.fecha BETWEEN :from AND :to', { from, to })
      .groupBy('DATE(ledger.fecha)')
      .orderBy('DATE(ledger.fecha)', 'ASC')
      .getRawMany()

    return {
      windowDays: input.windowDays,
      threshold: input.threshold.toFixed(2),
      totals: {
        lowStockItems: lowStockItems.length,
        movements: movementsByDay.reduce((total, row) => total + toNumber(row.movements), 0),
        quantityMoved: toFixed(
          movementsByDay.reduce((total, row) => total + toNumber(row.quantity), 0),
          4,
        ),
      },
      lowStockItems: lowStockItems.map((row) => ({
        articuloId: String(row.articuloId),
        articuloCodigo: String(row.articuloCodigo ?? ''),
        articuloNombre: String(row.articuloNombre ?? ''),
        almacenId: String(row.almacenId),
        almacenNombre: String(row.almacenNombre ?? ''),
        stockFisico: toFixed(row.stockFisico, 4),
        stockDisponible: toFixed(row.stockDisponible, 4),
      })),
      movementsByDay: movementsByDay.map((row) => ({
        date: String(row.date),
        movements: toNumber(row.movements),
        quantity: toFixed(row.quantity, 4),
      })),
    }
  }

  async getPayablesReport(): Promise<PayablesReport> {
    const accounts = await this.dataSource
      .getRepository(PayableAccountEntity)
      .createQueryBuilder('payable')
      .leftJoin(SupplierEntity, 'supplier', 'supplier.id = payable.proveedorId')
      .select([
        'payable.id AS id',
        'payable.compraId AS compraId',
        'payable.proveedorId AS proveedorId',
        'supplier.cardName AS proveedorNombre',
        'payable.numeroFactura AS numeroFactura',
        'payable.montoTotal AS montoTotal',
        'payable.saldoPendiente AS saldoPendiente',
        'payable.fechaVencimiento AS fechaVencimiento',
        'payable.estado AS estado',
      ])
      .where('payable.estado IN (:...states)', {
        states: ['PENDIENTE', 'PARCIAL'],
      })
      .orderBy('payable.fechaVencimiento', 'ASC')
      .getRawMany()

    const now = startOfUtcDay(new Date())
    const normalizedAccounts = accounts.map((account) => {
      const fechaVencimiento = String(account.fechaVencimiento)
      const due = new Date(`${fechaVencimiento}T00:00:00.000Z`)
      const overdue = daysBetween(due, now)

      return {
        id: String(account.id),
        compraId: String(account.compraId),
        proveedorId: String(account.proveedorId),
        proveedorNombre: account.proveedorNombre ? String(account.proveedorNombre) : null,
        numeroFactura: String(account.numeroFactura),
        montoTotal: toFixed(account.montoTotal),
        saldoPendiente: toFixed(account.saldoPendiente),
        fechaVencimiento,
        estado: account.estado as PayablesReport['accounts'][number]['estado'],
        daysOverdue: overdue,
      }
    })

    const agingSource = normalizedAccounts.filter((account) => account.estado !== 'PAGADA')
    const agingBuckets = ['Vigente', '1-30', '31-60', '61-90', '90+'].map((bucket) => {
      const bucketAccounts = agingSource.filter((account) => bucketForDays(account.daysOverdue) === bucket)
      return {
        bucket,
        documents: bucketAccounts.length,
        balance: toFixed(bucketAccounts.reduce((total, account) => total + toNumber(account.saldoPendiente), 0)),
      }
    })

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        documents: normalizedAccounts.length,
        balance: toFixed(
          normalizedAccounts.reduce((total, account) => total + toNumber(account.saldoPendiente), 0),
        ),
        overdue: toFixed(
          normalizedAccounts
            .filter((account) => account.daysOverdue > 0)
            .reduce((total, account) => total + toNumber(account.saldoPendiente), 0),
        ),
      },
      agingBuckets,
      accounts: normalizedAccounts,
    }
  }
}
