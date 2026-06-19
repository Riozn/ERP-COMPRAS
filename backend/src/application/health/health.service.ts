import { env, isDatabaseConfigured } from '../../infrastructure/config/env.js'
import { AppDataSource } from '../../infrastructure/db/typeorm/data-source.js'

export class HealthApplicationService {
  getStatus() {
    return {
      status: 'ok',
      service: env.app.name,
      timestamp: new Date().toISOString(),
      environment: env.app.nodeEnv,
      database: {
        configured: isDatabaseConfigured(),
        initialized: AppDataSource.isInitialized,
      },
      integrations: {
        mailer: Boolean(process.env.SMTP_HOST ?? env.integrations.googleClientId),
        twilio: Boolean(
          env.integrations.twilio.accountSid && env.integrations.twilio.authToken,
        ),
        powerbi: Boolean(env.integrations.powerbiApiKey),
      },
    }
  }
}
