import { type Expense, expenseSchema } from '@basic-hosted-expense-tracker/shared'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'


const fakeExpenses: Array<Expense> = [
  { id: 1, title: 'Groceries', amount: 50 },
  { id: 2, title: 'Utilities', amount: 100 },
  { id: 3, title: 'Rent', amount: 1000 },
]

const createPostSchema = expenseSchema.omit({ id: true})

export const expensesRoute = new Hono()
  .get('/', (c) => {
    return c.json({ expenses: fakeExpenses })
  })
  .post('/', zValidator('json', createPostSchema), (c) => {
    const expense = c.req.valid('json')
    fakeExpenses.push({ ...expense, id: fakeExpenses.length + 1 })
    c.status(201)
    return c.json(expense)
  })
  .get('/:id{[0-9]+}', (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const expense = fakeExpenses.find((expense) => expense.id === id)
    if (!expense) {
      return c.notFound()
    }
    return c.json({ expense })
  })
  .delete('/:id{[0-9]+}', (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const index = fakeExpenses.findIndex((expense) => expense.id === id)
    if (index === -1) {
      return c.notFound()
    }
    const deletedExpense = fakeExpenses.splice(index, 1)[0]
    return c.json({ expense: deletedExpense })
  })
