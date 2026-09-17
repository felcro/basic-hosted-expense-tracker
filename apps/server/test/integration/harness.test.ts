// Harness smoke test: proves the integration layer actually works end to end —
// real container, real migrations, real SQL through the real Hono route, with
// only the auth boundary stubbed.
//
// Keep this file. It is what will catch a harness regression before the route
// tests start failing for confusing reasons.
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'

import {
  actAs,
  actAsSignedOut,
  stubAuth,
  USER_A,
  USER_B,
} from '../helpers/auth'
import {
  closeDb,
  countExpenses,
  findExpense,
  seedExpense,
  truncateAll,
} from '../helpers/db'

// Import order is load-bearing, and getting it wrong points the suite at the
// REAL database rather than the container.
//
// A test file's module scope is evaluated BEFORE the preloaded setup's
// beforeAll runs (verified). So any import of packages/db at module scope —
// static or top-level-await — evaluates while DATABASE_URL is still whatever
// apps/server/.env holds, because Bun auto-loads that .env before --preload.
// packages/db's src/database.ts calls postgres(process.env.DATABASE_URL!) at
// module scope, so it would connect to Supabase.
//
// Hence the route is imported inside beforeAll, after the container is up.
// stubAuth() must also run before kinde.ts is first pulled in.
let app: import('hono').Hono

beforeAll(async () => {
  stubAuth()
  const { expensesRoute } = await import('../../src/routes/expenses')
  const { Hono } = await import('hono')
  // Mounted on a bare app rather than importing src/server.ts, which also
  // mounts static file serving and the brotli middleware. Same base path.
  app = new Hono().route('/api/expenses', expensesRoute)
})

beforeEach(async () => {
  await truncateAll()
  actAs(USER_A)
})

afterAll(async () => {
  await closeDb()
})

describe('harness', () => {
  test('applies the real migrations, so the expenses table exists', async () => {
    const row = await seedExpense({ userId: USER_A })
    expect(row.id).toBe(1)
    expect(row.userId).toBe(USER_A)
  })

  test('truncate resets the id sequence between tests', async () => {
    const row = await seedExpense({ userId: USER_A })
    expect(row.id).toBe(1)
  })

  test('reaches the real route through the real database', async () => {
    await seedExpense({
      userId: USER_A,
      title: 'Coffee beans',
      amount: '12.50',
    })

    const res = await app.request('/api/expenses')
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      expenses: Array<{ title: string; amount: string }>
    }
    expect(body.expenses).toHaveLength(1)
    expect(body.expenses[0]?.title).toBe('Coffee beans')
    // numeric(12,2) round-trips as a string, not a number.
    expect(body.expenses[0]?.amount).toBe('12.50')
  })

  test('answers 401 when signed out', async () => {
    actAsSignedOut()
    const res = await app.request('/api/expenses')
    expect(res.status).toBe(401)
  })
})

describe('ownership isolation (BOLA)', () => {
  test('GET / returns only the acting user rows', async () => {
    await seedExpense({ userId: USER_A, title: 'A expense' })
    await seedExpense({ userId: USER_B, title: 'B expense' })

    actAs(USER_B)
    const res = await app.request('/api/expenses')
    const body = (await res.json()) as { expenses: Array<{ title: string }> }

    expect(body.expenses).toHaveLength(1)
    expect(body.expenses[0]?.title).toBe('B expense')
  })

  test("DELETE of another user's row 404s and leaves the row intact", async () => {
    const aRow = await seedExpense({ userId: USER_A, title: 'A expense' })

    actAs(USER_B)
    const res = await app.request(`/api/expenses/${aRow.id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
    // The status code alone would pass even if the row had been deleted.
    expect(await findExpense(aRow.id)).toBeDefined()
    expect(await countExpenses(USER_A)).toBe(1)
  })

  test('POST ignores a client-supplied userId (mass assignment)', async () => {
    actAs(USER_B)
    const res = await app.request('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Mass assignment',
        amount: '5.00',
        date: '2026-02-01T00:00:00.000Z',
        userId: USER_A,
        id: 999,
      }),
    })

    expect(res.status).toBe(201)
    expect(await countExpenses(USER_A)).toBe(0)
    expect(await countExpenses(USER_B)).toBe(1)
  })
})
