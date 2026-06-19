import { env, isDatabaseConfigured } from './infrastructure/config/env.js'
import { getDataSource } from './infrastructure/db/typeorm/data-source.js'
import { createApp } from './presentation/http/create-app.js'

async function bootstrap(): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.warn('[api] DATABASE_URL no esta configurada. El backend iniciara sin DB.')
  } else {
    await getDataSource()
    console.log('[api] database initialized')
  }

  const app = createApp()

  app.listen(env.server.port, () => {
    console.log(`[api] listening on http://localhost:${env.server.port}`)
  })
}

void bootstrap().catch((error: unknown) => {
  console.error('[api] failed to bootstrap', error)
  process.exit(1)
})
