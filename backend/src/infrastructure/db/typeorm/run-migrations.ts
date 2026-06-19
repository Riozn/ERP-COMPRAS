import 'reflect-metadata'

import { getDataSource } from './data-source.js'

async function run(): Promise<void> {
  const dataSource = await getDataSource()
  const migrations = await dataSource.runMigrations()

  console.log(`[db] applied ${migrations.length} migration(s)`)
}

void run().catch((error: unknown) => {
  console.error('[db] migration failed', error)
  process.exit(1)
})
