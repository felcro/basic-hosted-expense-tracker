# db

Drizzle ORM schema and Postgres client, shared by the server. Row/insert Zod schemas are derived from the Drizzle tables with `drizzle-zod`.

## Env

Needs `DATABASE_URL` in `.env`.

## Commands

```bash
bun run generate          # generate a migration from schema changes
bun run migrate           # apply migrations
bun run generate:migrate  # both
bun run studio            # Drizzle Studio
```
