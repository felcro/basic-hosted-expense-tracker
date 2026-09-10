# @basic-hosted-expense-tracker/db

Postgres database layer hosted by Supabase: Drizzle ORM schema, client, and migrations. Consumed only by `apps/server`. `apps/app` never imports this package directly.

## Structure

- `index.ts` — entry point; re-exports `db` (the Drizzle client) and each table's schema/Zod exports. Add new exports here.
- `src/database.ts` — creates the `postgres` client and Drizzle instance from `DATABASE_URL`.
- `src/db/schema/*.ts` — one file per table. Currently: `expenses.ts`.
- `drizzle/` — generated migrations (SQL + snapshot per migration). Never hand-edit; regenerate via drizzle-kit.
- `drizzle.config.ts` — drizzle-kit config; schema glob is `./src/db/schema/*`, migrations output to `./drizzle`.

## Adding or changing a table

1. Edit/add the table definition in `src/db/schema/<table>.ts` using `drizzle-orm/pg-core` (`pgTable`, column builders).
2. Export `createInsertSchema(table)` / `createSelectSchema(table)` from `drizzle-orm/zod` alongside the table, following `expenses.ts`'s pattern.
3. `bun run generate` — generates a new migration from the schema diff.
4. `bun run migrate` — applies pending migrations to `DATABASE_URL`.
5. Or `bun run generate:migrate` to do both in one step.
6. Add the new table's exports to `index.ts`.

## Scripts

- `bun run generate` — `drizzle-kit generate`
- `bun run migrate` — `drizzle-kit migrate`
- `bun run generate:migrate` — both, in sequence
- `bun run studio` — `drizzle-kit studio`, a local GUI for inspecting the database

## Environment Variables

`DATABASE_URL` (Postgres connection string) is required — read directly via `process.env.DATABASE_URL` in `src/database.ts` and `drizzle.config.ts`, no config wrapper. `env.d.ts` types it as `string | undefined`, so it will not be flagged if missing — a missing/wrong `DATABASE_URL` fails at `postgres()` connection time, not at typecheck time.

Uses Supabase's **Session pooler** connection string, not Direct connection — the environment this runs in has no IPv6 connectivity, and Supabase's Direct connection is IPv6-only. Session pooler is IPv4-compatible. Don't switch to the Direct connection string without confirming IPv6 is available wherever this runs.

## Known issue

`src/database.ts` has prefetch enabled on the `postgres` client, with an unresolved TODO to disable it (`{ prepare: false }`). Prefetch/prepared statements are unsupported under **Transaction**-mode pooling, but the Session pooler this project uses supports them — so leaving prefetch on is correct for the current setup. Only uncomment `{ prepare: false }` if the connection ever moves to Supabase's Transaction pooler or another transaction-mode pooler (e.g. PgBouncer in transaction mode).

## Two Zod schema layers — don't confuse them

`src/db/schema/expenses.ts` defines both `insertExpensesSchema` and `selectExpensesSchema` (from `drizzle-orm/zod`, generated from the DB table shape) — but `index.ts` currently only re-exports `insertExpensesSchema`. Check `index.ts` before assuming `selectExpensesSchema` is available to consumers; add it there if you need it outside this package.

These are distinct from `packages/shared`'s `expenseSchema`/`createExpenseSchema` (hand-written, describing the API payload shape). They overlap but aren't the same schema — the API layer (`apps/server`'s routes) validates against `packages/shared`'s schemas, not these. Don't assume they're interchangeable when changing a column.
