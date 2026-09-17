// Database helpers for integration tests. These ARRANGE and READ BACK only —
// they never assert. Assertions belong in the tests so a failure points at the
// test that caused it.
import type { Sql } from 'postgres'

import { testClient } from '../setup'

let shared: Sql | undefined

/** The suite's shared client. Closed by `closeDb()` in a global afterAll. */
export function db(): Sql {
  shared ??= testClient()
  return shared
}

export async function closeDb() {
  await shared?.end()
  shared = undefined
}

/**
 * Empties the expenses table and resets its id sequence, so `serial` ids start
 * from 1 in every test and assertions on specific ids are stable.
 */
export async function truncateAll() {
  await db()`truncate table expenses restart identity cascade`
}

export type SeedExpense = {
  userId: string
  title?: string
  amount?: string
  date?: string
  createdAt?: string | null
}

export type SeededExpense = {
  id: number
  userId: string
  title: string
  amount: string
  date: Date
  createdAt: Date | null
}

/**
 * Inserts one expense and returns the stored row.
 *
 * Every default is fixed, never generated: a helper that invents values makes a
 * failing assertion impossible to reproduce. Pass what the test varies.
 */
export async function seedExpense(seed: SeedExpense): Promise<SeededExpense> {
  const title = seed.title ?? 'Seeded expense'
  const amount = seed.amount ?? '10.00'
  const date = seed.date ?? '2026-01-15T12:00:00.000Z'
  const createdAt =
    seed.createdAt === undefined ? '2026-01-15T12:00:00.000Z' : seed.createdAt

  const rows = await db()<Array<SeededExpense>>`
    insert into expenses ${db()({
      user_id: seed.userId,
      title,
      amount,
      date,
      created_at: createdAt,
    })}
    returning id, user_id as "userId", title, amount, date, created_at as "createdAt"
  `

  const row = rows[0]
  if (!row) {
    throw new Error('seedExpense inserted no row')
  }
  return row
}

/** Reads one expense back by id, or undefined. For asserting a row survived. */
export async function findExpense(
  id: number,
): Promise<SeededExpense | undefined> {
  const rows = await db()<Array<SeededExpense>>`
    select id, user_id as "userId", title, amount, date, created_at as "createdAt"
    from expenses where id = ${id}
  `
  return rows[0]
}

/** Counts rows owned by a user. For asserting isolation. */
export async function countExpenses(userId: string): Promise<number> {
  const rows = await db()<Array<{ count: string }>>`
    select count(*)::text as count from expenses where user_id = ${userId}
  `
  return Number(rows[0]?.count ?? '0')
}
