import 'reflect-metadata'

import { DataSource, type DataSourceOptions } from 'typeorm'

import { env, isDatabaseConfigured } from '../../config/env.js'
import { ServiceUnavailableError } from '../../../shared/errors/http-error.js'
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
  RefreshTokenEntity,
  RoleEntity,
  SupplierEntity,
  TaxEntity,
  TwoFactorCodeEntity,
  UserEntity,
  WarehouseEntity,
} from './entities.js'
import { CoreSchema1700000000000 } from './migrations/1700000000000-core-schema.js'
import { UserPhone1700000001000 } from './migrations/1700000001000-user-phone.js'
import { UserTwoFactorDefault1700000002000 } from './migrations/1700000002000-user-two-factor-default.js'

const entities = [
  RoleEntity,
  UserEntity,
  RefreshTokenEntity,
  TwoFactorCodeEntity,
  CurrencyEntity,
  WarehouseEntity,
  TaxEntity,
  ItemGroupEntity,
  DocumentStateEntity,
  DocumentTypeEntity,
  SupplierEntity,
  ItemEntity,
  ItemWarehouseEntity,
  PurchaseHeaderEntity,
  PurchaseLineEntity,
  InventoryLedgerEntity,
  PayableAccountEntity,
  PayablePaymentEntity,
  AuditEventEntity,
]

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  entities,
  migrations: [
    CoreSchema1700000000000,
    UserPhone1700000001000,
    UserTwoFactorDefault1700000002000,
  ],
  synchronize: false,
  logging: env.app.nodeEnv === 'development',
  ...(isDatabaseConfigured() ? { url: env.database.url } : {}),
}

export const AppDataSource = new DataSource(dataSourceOptions)

let initializePromise: Promise<DataSource> | null = null

export async function getDataSource(): Promise<DataSource> {
  if (!isDatabaseConfigured()) {
    throw new ServiceUnavailableError('DATABASE_URL no esta configurada.')
  }

  if (AppDataSource.isInitialized) {
    return AppDataSource
  }

  initializePromise ??= AppDataSource.initialize()
  return initializePromise
}
