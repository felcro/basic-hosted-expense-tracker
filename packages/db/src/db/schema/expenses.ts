import {
  index,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { createSelectSchema, createInsertSchema } from 'drizzle-orm/zod'

export const expenses = pgTable(
  'expenses',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (expenses) => [index('name_idx').on(expenses.userId)],
)

export const insertExpensesSchema = createInsertSchema(expenses)
export const selectExpensesSchema = createSelectSchema(expenses)
