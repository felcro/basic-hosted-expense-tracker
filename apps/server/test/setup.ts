// Integration-test harness: starts a throwaway Postgres, applies the real
// migrations, and exposes the connection URI to the suite.
//
// Preloaded via `bun test --preload ./test/setup.ts` so this runs before any
// test module is imported. That ordering matters: `packages/db`'s src/database.ts
// reads process.env.DATABASE_URL at module scope, so it must be set here first.
//
// Requires Docker. This machine runs Colima, which needs two env vars the test
// script sets — see test/README.md.
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { afterAll, beforeAll } from 'bun:test'
import { resolve } from 'node:path'
import postgres from 'postgres'

// postgres:16 specifically. The v12 Testcontainers API has no default image, and
// postgres:17-alpine emits no stdout through Colima, which breaks the log-based
// readiness wait.
const IMAGE = 'postgres:16'

let container: Awaited<ReturnType<PostgreSqlContainer['start']>> | undefined

// SAFETY GUARD — do not remove.
//
// Bun auto-loads apps/server/.env BEFORE --preload runs, so DATABASE_URL
// already points at the real Supabase database when this file executes. Tests
// truncate tables. Without this guard a mistake here destroys production data.
//
// Clearing it now also forces the failure to be loud rather than silent: any
// module that imports packages/db before the container is ready gets undefined
// instead of quietly connecting to Supabase.
const inheritedUrl = process.env.DATABASE_URL
delete process.env.DATABASE_URL

function assertThrowawayDatabase(url: string) {
  const host = new URL(url).hostname
  const isLocal = host === '127.0.0.1' || host === 'localhost' || host === '::1'
  if (!isLocal) {
    throw new Error(
      `Refusing to run integration tests against a non-local database (${host}). ` +
        `Tests truncate tables.`,
    )
  }
  if (inheritedUrl && url === inheritedUrl) {
    throw new Error(
      'Refusing to run integration tests against the inherited DATABASE_URL.',
    )
  }
}

// Label applied to every container this harness starts, so orphans from a
// crashed run can be found and removed. Necessary because Ryuk — the reaper
// that normally does this — is disabled under Colima.
const LABEL = 'basic-hosted-expense-tracker.integration-test'

function reapOrphans() {
  const docker = Bun.which('docker')
  if (!docker) {
    return
  }
  const list = Bun.spawnSync(
    [docker, 'ps', '-aq', '--filter', `label=${LABEL}`],
    { stdout: 'pipe', stderr: 'pipe' },
  )
  const ids = list.stdout.toString().trim().split('\n').filter(Boolean)
  if (ids.length === 0) {
    return
  }
  // oxlint-disable-next-line no-console
  console.log(`[integration] removing ${ids.length} orphaned container(s)`)
  Bun.spawnSync([docker, 'rm', '-f', ...ids], {
    stdout: 'pipe',
    stderr: 'pipe',
  })
}

beforeAll(async () => {
  // Clean up after any previous run that crashed before afterAll.
  reapOrphans()

  container = await new PostgreSqlContainer(IMAGE)
    .withLabels({ [LABEL]: 'true' })
    .start()

  // Build the URI by hand rather than using getConnectionUri(): that returns a
  // `postgres://` scheme against `localhost`, and 127.0.0.1 is what reliably
  // connects through Colima's port forwarding.
  const uri = `postgresql://${container.getUsername()}:${container.getPassword()}@127.0.0.1:${container.getMappedPort(5432)}/${container.getDatabase()}`
  assertThrowawayDatabase(uri)
  process.env.DATABASE_URL = uri

  // Migrations run in a SUBPROCESS, not in-process. Drizzle's programmatic
  // migrate() from drizzle-orm/postgres-js/migrator fails with ECONNREFUSED
  // under `bun test` specifically — it works under node, under bun as a plain
  // script, and a plain second postgres() client in the same test works too.
  // drizzle-kit reads DATABASE_URL via packages/db/drizzle.config.ts.
  const dbPackage = resolve(import.meta.dir, '../../../packages/db')
  const bun = Bun.which('bun')
  if (!bun) {
    throw new Error('bun not found on PATH; cannot run migrations')
  }

  const migration = Bun.spawnSync([bun, 'drizzle-kit', 'migrate'], {
    cwd: dbPackage,
    env: { ...process.env, DATABASE_URL: uri },
    stdout: 'pipe',
    stderr: 'pipe',
  })

  if (migration.exitCode !== 0) {
    throw new Error(
      `migrations failed (exit ${migration.exitCode})\n` +
        `stdout: ${migration.stdout.toString()}\n` +
        `stderr: ${migration.stderr.toString()}`,
    )
  }
}, 180_000)

afterAll(async () => {
  // Ryuk (Testcontainers' reaper sidecar) is disabled because it never reports
  // ready through Colima, so nothing else will remove this container. Stopping
  // it here is the only cleanup.
  await container?.stop()
}, 60_000)

/** Connection URI for the throwaway database. Only valid after setup has run. */
export function testDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL unset — is test/setup.ts preloaded?')
  }
  return url
}

/** A fresh client against the test database. Callers must `end()` it. */
export function testClient() {
  return postgres(testDatabaseUrl(), { max: 1, onnotice: () => {} })
}
