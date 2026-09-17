# apps/server integration tests

```
bun run test:integration
```

Starts a throwaway Postgres container, applies the real migrations from
`packages/db/drizzle`, and exercises the real Hono routes against it. Only the auth
boundary is stubbed. Verified working 2026-09-17: 7 tests, stable across runs.

## Layout

| File                          | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `setup.ts`                    | Container lifecycle, migrations, safety guard, orphan reaper. Preloaded. |
| `helpers/db.ts`               | `truncateAll`, `seedExpense`, `findExpense`, `countExpenses`             |
| `helpers/auth.ts`             | `stubAuth`, `actAs`, `actAsSignedOut`, `USER_A`, `USER_B`                |
| `integration/harness.test.ts` | Harness smoke tests plus ownership-isolation coverage                    |

Integration tests are **not** in the default `bun test` run, so the fast suite stays
Docker-free.

## The one thing that can go badly wrong

Bun auto-loads `apps/server/.env` **before** `--preload` runs, so when a test file's module
scope executes, `DATABASE_URL` still points at the real Supabase database. `packages/db`'s
`src/database.ts` calls `postgres(process.env.DATABASE_URL!)` at module scope. So a static
import of `packages/db` — or of anything that imports it, such as `src/routes/expenses.ts`
— connects to **production**. These tests truncate tables.

This happened while building the harness: a static import read 20 rows from the live
database before the guard existed.

Two protections, neither of which should be removed:

1. `setup.ts` deletes `DATABASE_URL` as its first action, so a premature import fails
   loudly instead of connecting to Supabase.
2. `assertThrowawayDatabase()` refuses any host that is not `127.0.0.1`/`localhost`, and
   refuses a URL matching the inherited one.

**So: import the route under test inside `beforeAll`, never at module scope.** A test
file's module scope runs before the preloaded `beforeAll` (verified).

```ts
let app: import('hono').Hono

beforeAll(async () => {
  stubAuth()
  const { expensesRoute } = await import('../../src/routes/expenses')
  const { Hono } = await import('hono')
  app = new Hono().route('/api/expenses', expensesRoute)
})
```

## Colima specifics

This machine runs Colima rather than Docker Desktop. Three things were needed, all
established by testing:

- **`DOCKER_HOST`** must point at Colima's socket. Testcontainers' auto-detection only
  checks `/var/run/docker.sock`, which Colima does not create. Symptom: "Could not find a
  working container runtime strategy". The `test:integration` script sets it when the
  socket exists, and leaves an existing `DOCKER_HOST` alone so Docker Desktop and CI work
  unchanged.
- **`TESTCONTAINERS_RYUK_DISABLED=true`.** Ryuk, the reaper sidecar, never emits the log
  line Testcontainers waits for through Colima's log streaming, so every container start
  fails with `Log stream ended and message "/.*Started.*/" was not received`.
- **An explicit image tag.** `new PostgreSqlContainer('postgres:16')` — the v12 API has no
  default and throws `undefined is not an object (evaluating 'string.split')` without one.
  `postgres:17-alpine` starts but produces no stdout through Colima, breaking log waits.

Because Ryuk is off, nothing cleans up after a crashed run. `setup.ts` labels its
containers and reaps orphans at startup, and stops its own container in `afterAll`. If you
ever need to clear leftovers by hand:

```
docker ps -aq --filter label=basic-hosted-expense-tracker.integration-test | xargs -r docker rm -f
```

`xargs -r` skips the command when the list is empty. The `docker rm -f $(...)` form errors
with "requires at least 1 argument" when there is nothing to remove, which reads as a
failure but is not one.

Colima must be running (`colima start`).

## Migrations run in a subprocess

`migrate()` from `drizzle-orm/postgres-js/migrator` fails with `ECONNREFUSED` **under
`bun test` specifically** — it works under `node`, under `bun` as a plain script, and a
second `postgres()` client inside the same test connects fine. So `setup.ts` shells out to
`bun drizzle-kit migrate` with `DATABASE_URL` pointed at the container.

This keeps the real migrations as the schema source, which is the point: hand-written
`CREATE TABLE` DDL would silently diverge from `packages/db/drizzle`.

## Conventions

- `truncateAll()` in `beforeEach`. It resets the id sequence, so `expect(row.id).toBe(1)`
  is stable.
- Prove ownership isolation with **two real users** and real rows. `actAs(USER_B)` then
  assert A's data is untouched — and assert the row still exists, not just the status code.
- Helpers arrange and read back; they never assert. Their defaults are fixed, never
  generated, so a failure reproduces.
