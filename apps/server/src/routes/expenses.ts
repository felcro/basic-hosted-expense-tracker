import {
  db,
  expenses as expensesTable,
  insertExpensesSchema,
} from '@basic-hosted-expense-tracker/db'
import { createExpenseSchema } from '@basic-hosted-expense-tracker/shared'
import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, sum } from 'drizzle-orm'
import { Hono } from 'hono'
import { getBunServer } from 'hono/bun'
import { type SSEStreamingApi, streamSSE } from 'hono/streaming'

import { getUser } from '../../kinde'

// Open SSE connections, keyed by user id — one entry per signed-in user, one
// stream per device they have open. `publishExpenseChange` writes to these
// after a successful insert or delete so the user's *other* devices refetch;
// the device that made the change has already updated its own cache.
//
// This registry lives in the process's memory, so it only works while the API
// runs as a single instance (which is how it is deployed today). Scale to two
// and a client connected to instance A never hears about a write handled by
// instance B — each process would only see its own subscribers. Moving to
// Postgres `LISTEN`/`NOTIFY` (or Supabase Realtime) would fix that by routing
// the notification through the database both instances already share.
const subscribers = new Map<string, Set<SSEStreamingApi>>()

async function publishExpenseChange(userId: string) {
  const set = subscribers.get(userId)
  if (!set) {
    return
  }
  for (const stream of set) {
    // 'expenses' is the shared event value that we will listen for in the client.
    await stream.writeSSE({ data: 'expenses-changed', event: 'expenses' })
  }
}

export const expensesRoute = new Hono()
  .get('/', getUser, async (c) => {
    const user = c.var.user

    const expenses = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, user.id))
      .orderBy(desc(expensesTable.createdAt))
      .limit(100)

    return c.json({ expenses: expenses })
  })

  .post('/', getUser, zValidator('json', createExpenseSchema), async (c) => {
    const user = c.var.user
    const expense = c.req.valid('json')

    const validatedExpense = insertExpensesSchema.parse({
      ...expense,
      date: new Date(expense.date),
      userId: user.id,
    })

    const result = await db
      .insert(expensesTable)
      .values(validatedExpense)
      .returning()
      .then((res) => res[0])

    await publishExpenseChange(user.id)
    c.status(201)
    return c.json(result)
  })

  .get('/total-spent', getUser, async (c) => {
    const user = c.var.user
    const result = await db
      .select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(eq(expensesTable.userId, user.id))
      .limit(1)
      .then((res) => res[0])

    return c.json({ total: result?.total ?? '0' })
  })

  .get('/stream', getUser, async (c) => {
    const user = c.var.user

    getBunServer<Bun.Server<undefined>>(c)?.timeout(c.req.raw, 0)
    return streamSSE(c, async (stream) => {
      let set = subscribers.get(user.id)
      if (!set) {
        set = new Set()
        subscribers.set(user.id, set)
      }
      set.add(stream)

      const heartbeat = setInterval(() => {
        void stream.writeSSE({ data: '', event: 'ping' })
      }, 15_000)

      await new Promise<void>((resolve) => {
        stream.onAbort(() => {
          clearInterval(heartbeat)
          const current = subscribers.get(user.id)
          current?.delete(stream)
          if (current?.size === 0) {
            subscribers.delete(user.id)
          }

          resolve()
        })
      })
    })
  })

  .get('/:id{[0-9]+}', getUser, async (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const user = c.var.user

    const expense = await db
      .select()
      .from(expensesTable)
      .where(and(eq(expensesTable.userId, user.id), eq(expensesTable.id, id)))
      .then((res) => res[0])

    if (!expense) {
      return c.notFound()
    }
    return c.json({ expense })
  })

  .delete('/:id{[0-9]+}', getUser, async (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const user = c.var.user

    const deletedExpense = await db
      .delete(expensesTable)
      .where(and(eq(expensesTable.userId, user.id), eq(expensesTable.id, id)))
      .returning()
      .then((res) => res[0])

    if (!deletedExpense) {
      return c.notFound()
    }
    await publishExpenseChange(user.id)
    return c.json({ expense: deletedExpense })
  })
