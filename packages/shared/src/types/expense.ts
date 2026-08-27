import { z } from 'zod'

export const expenseSchema = z.object({
  id: z.number().int().positive().min(1),
  title: z.string().min(3).max(100),
  amount: z.coerce.number().positive(),
})

export const expensePostSchema = expenseSchema.omit({ id: true })

export type Expense = z.infer<typeof expenseSchema>
export type PostExpense = z.infer<typeof expensePostSchema>
