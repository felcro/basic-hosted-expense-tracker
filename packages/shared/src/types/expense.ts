import { z } from 'zod'

export const expenseSchema = z.object({
  id: z.number().int().positive().min(1),
  userId: z.string(),
  title: z
    .string()
    .trim()
    .min(3, { message: 'Title must be at least 3 characters' })
    .regex(/^[A-Za-z0-9 _-]+$/, 'The title must only contain valid characters'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid monetary value',
  }),
  date: z.iso.datetime(),
  createdAt: z.iso.datetime().nullable(),
})

export const createExpenseSchema = expenseSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
})

export type Expense = z.infer<typeof expenseSchema>
export type PostExpense = z.infer<typeof createExpenseSchema>

export const defaultPostExpenseValues: PostExpense = {
  title: '',
  amount: '',
  date: new Date().toISOString(),
}
