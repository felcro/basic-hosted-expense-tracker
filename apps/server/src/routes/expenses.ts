import { expenseSchema } from '@basic-hosted-expense-tracker/shared'
import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, sum } from 'drizzle-orm'
import { Hono } from 'hono'

import { getUser } from '../../kinde'
import { db } from '../db'
import { expenses as expensesTable } from '../db/schema/expenses'

const createPostSchema = expenseSchema.omit({ id: true })

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

  .get('/columns', getUser, (c) => {
    const columnNames = expenseSchema.keyof().options
    return c.json({ columnNames })
  })

  .post('/', getUser, zValidator('json', createPostSchema), async (c) => {
    const user = c.var.user
    const expense = c.req.valid('json')

    const result = await db
      .insert(expensesTable)
      .values({
        ...expense,
        userId: user.id,
      })
      .returning()

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
    return c.json({ expense: deletedExpense })
  })
