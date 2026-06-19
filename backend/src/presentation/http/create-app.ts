import cors from 'cors'
import express from 'express'

import { env } from '../../infrastructure/config/env.js'
import { AppDataSource } from '../../infrastructure/db/typeorm/data-source.js'
import { TypeormAuthRepository } from '../../infrastructure/db/typeorm/auth.repository.js'
import { TypeormAuditRepository } from '../../infrastructure/db/typeorm/audit.repository.js'
import { TypeormAnalyticsRepository } from '../../infrastructure/db/typeorm/analytics.repository.js'
import { TypeormCatalogRepository } from '../../infrastructure/db/typeorm/catalog.repository.js'
import {
  createCatalogCrudRepositories,
  createAuditEventRepository,
  createMasterCrudRepositories,
  createInventoryLedgerRepository,
  createPayableAccountRepository,
  createPayablePaymentRepository,
  createPurchaseHeaderRepository,
  createPurchaseLineRepository,
} from '../../infrastructure/db/typeorm/resource.repositories.js'
import { TypeormPurchaseWorkflowRepository } from '../../infrastructure/db/typeorm/purchase-workflow.repository.js'
import { NodemailerMailerService } from '../../infrastructure/mail/mailer.service.js'
import { TwilioWhatsAppService } from '../../infrastructure/notifications/twilio-whatsapp.service.js'
import { ScryptPasswordHasher } from '../../infrastructure/security/password-hasher.js'
import { JoseTokenService } from '../../infrastructure/security/token.service.js'
import { AuthApplicationService } from '../../application/auth/auth.service.js'
import { AnalyticsApplicationService } from '../../application/analytics/analytics.service.js'
import { CrudApplicationService } from '../../application/crud/crud.service.js'
import { CatalogApplicationService } from '../../application/catalogs/catalog.service.js'
import { PurchaseWorkflowApplicationService } from '../../application/operations/purchase-workflow.service.js'
import { HealthApplicationService } from '../../application/health/health.service.js'
import { UserApplicationService } from '../../application/users/user.service.js'
import { createAdminCatalogRoutes } from './routes/admin-catalog.routes.js'
import { createAdminDashboardRoutes } from './routes/admin-dashboard.routes.js'
import { createAdminOperationsRoutes } from './routes/admin-operations.routes.js'
import { createAdminReportsRoutes } from './routes/admin-reports.routes.js'
import { createAdminMasterRoutes } from './routes/admin-master.routes.js'
import { createAuthRoutes } from './routes/auth.routes.js'
import { createCatalogRoutes } from './routes/catalog.routes.js'
import { createHealthRoutes } from './routes/health.routes.js'
import { createUsersRoutes } from './routes/users.routes.js'
import { createAuthMiddleware } from './middlewares/auth.middleware.js'
import { createRoleGuard } from './middlewares/role.middleware.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'

export function createApp() {
  const authRepository = new TypeormAuthRepository(AppDataSource)
  const catalogRepository = new TypeormCatalogRepository(AppDataSource)
  const catalogCrudRepositories = createCatalogCrudRepositories(AppDataSource)
  const masterCrudRepositories = createMasterCrudRepositories(AppDataSource)
  const purchaseHeaderRepository = createPurchaseHeaderRepository(AppDataSource)
  const purchaseLineRepository = createPurchaseLineRepository(AppDataSource)
  const inventoryLedgerRepository = createInventoryLedgerRepository(AppDataSource)
  const payableAccountRepository = createPayableAccountRepository(AppDataSource)
  const payablePaymentRepository = createPayablePaymentRepository(AppDataSource)
  const auditEventRepository = createAuditEventRepository(AppDataSource)
  const purchaseWorkflowRepository = new TypeormPurchaseWorkflowRepository(AppDataSource)
  const analyticsRepository = new TypeormAnalyticsRepository(AppDataSource)
  const auditRepository = new TypeormAuditRepository(AppDataSource)
  const passwordHasher = new ScryptPasswordHasher()
  const tokenService = new JoseTokenService()
  const mailerService = new NodemailerMailerService()
  const whatsappService = new TwilioWhatsAppService()

  const authService = new AuthApplicationService({
    authRepository,
    auditRepository,
    passwordHasher,
    tokenService,
    mailerService,
    whatsappService,
  })
  const analyticsService = new AnalyticsApplicationService(analyticsRepository)
  const catalogService = new CatalogApplicationService(catalogRepository)
  const adminCatalogServices = {
    currencies: new CrudApplicationService(catalogCrudRepositories.currencies),
    warehouses: new CrudApplicationService(catalogCrudRepositories.warehouses),
    taxes: new CrudApplicationService(catalogCrudRepositories.taxes),
    itemGroups: new CrudApplicationService(catalogCrudRepositories.itemGroups),
    documentStates: new CrudApplicationService(catalogCrudRepositories.documentStates),
    documentTypes: new CrudApplicationService(catalogCrudRepositories.documentTypes),
  }
  const adminMasterServices = {
    suppliers: new CrudApplicationService(masterCrudRepositories.suppliers),
    items: new CrudApplicationService(masterCrudRepositories.items),
    itemWarehouses: new CrudApplicationService(masterCrudRepositories.itemWarehouses),
  }
  const adminOperationServices = {
    purchaseWorkflow: new PurchaseWorkflowApplicationService(purchaseWorkflowRepository),
    purchases: {
      headers: new CrudApplicationService(purchaseHeaderRepository),
      lines: new CrudApplicationService(purchaseLineRepository),
    },
    inventory: {
      ledger: new CrudApplicationService(inventoryLedgerRepository),
    },
    payables: {
      accounts: new CrudApplicationService(payableAccountRepository),
      payments: new CrudApplicationService(payablePaymentRepository),
    },
    auditEvents: new CrudApplicationService(auditEventRepository),
  }
  const userService = new UserApplicationService({
    authRepository,
    auditRepository,
    passwordHasher,
    mailerService,
  })
  const healthService = new HealthApplicationService()
  const authMiddleware = createAuthMiddleware(tokenService)
  const adminGuard = createRoleGuard(['ADMIN', 'SUPERADMIN'])

  const app = express()

  app.use(
    cors({
      origin: env.cors.origins,
      credentials: env.cors.allowCredentials,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'ERP1 API',
      status: 'ok',
      health: '/api/health',
    })
  })

  app.use('/api', createHealthRoutes(healthService))
  app.use('/api/auth', createAuthRoutes(authService, tokenService))
  app.use('/api/catalogs', createCatalogRoutes(catalogService))
  app.use('/api/admin/catalogs', authMiddleware, adminGuard, createAdminCatalogRoutes(adminCatalogServices))
  app.use('/api/admin/dashboard', authMiddleware, adminGuard, createAdminDashboardRoutes({ analytics: analyticsService }))
  app.use('/api/admin/reports', authMiddleware, adminGuard, createAdminReportsRoutes({ analytics: analyticsService }))
  app.use('/api/admin/masters', authMiddleware, adminGuard, createAdminMasterRoutes(adminMasterServices))
  app.use('/api/admin/operations', authMiddleware, adminGuard, createAdminOperationsRoutes(adminOperationServices))
  app.use('/api/users', createUsersRoutes(userService, tokenService))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
