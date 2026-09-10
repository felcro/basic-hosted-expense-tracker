# @basic-hosted-expense-tracker/shared

Zod schemas and inferred types shared between `apps/app` and `apps/server`, so request validation and TypeScript types for API payloads stay in sync across the client/server boundary. Consumed via `@basic-hosted-expense-tracker/shared`.

## Structure

- `index.ts` — the package's only entry point; re-exports everything from `src/types/*`. Add new exports here, don't import from `src/` paths directly in consumers.
- `src/types/expense.ts` — `expenseSchema` (full row shape), `createExpenseSchema` (POST payload, omits `id`/`userId`/`createdAt`), and their inferred `Expense`/`PostExpense` types.

## Conventions

- Define a Zod schema first, derive the TypeScript type with `z.infer<typeof schema>` — don't hand-write parallel interfaces.
- For a "create" variant of an existing schema, use `.omit({...})` on the base schema rather than a separate schema literal, so field changes only need to happen once.
- This package has no build step — consumers import the `.ts` source directly (`"module": "index.ts"` in `package.json`).
