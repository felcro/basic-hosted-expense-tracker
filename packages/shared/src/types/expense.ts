import { z } from 'zod'

export const expenseSchema = z.object({
  id: z.number().int().positive().min(1),
  userId: z.string(),
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'The username must contain only letters, numbers and underscore (_)',
    ),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a positive number',
  }),
  createdAt: z.iso.datetime().nullable(),
})

export const createExpenseSchema = expenseSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
})

export type Expense = z.infer<typeof expenseSchema>
export type PostExpense = z.infer<typeof createExpenseSchema>
