# @basic-hosted-expense-tracker/server

Hono API on `Bun.serve()`. Consumes `@basic-hosted-expense-tracker/db` (Postgres/Drizzle) and `@basic-hosted-expense-tracker/shared` (Zod schemas). Also serves `apps/app`'s built web output as static files.

## Structure

- `index.ts` — package entry point; re-exports the Hono `server` instance and `ApiRoutes` type (consumed by `apps/app` for typed API calls, if wired up).
- `serve.ts` — actual process entry point; calls `Bun.serve({ fetch: server.fetch, port })`. Run this, not `index.ts`, to start the server.
- `src/server.ts` — builds the Hono app: middleware (`logger`, `cors`, `csrf` scoped to `/api/*`), route composition (`.route()`), `/health`, and static serving of `apps/app/dist` for every other path (SPA fallback via `serveStatic({ path: 'index.html' })`).
- `src/routes/*.ts` — one file per route group, each a `new Hono()` instance composed into `server.ts` via `.route('/prefix', routeInstance)`. Follow this pattern for new route groups — don't add routes directly in `server.ts`.
- `kinde.ts` — Kinde SDK client, cookie-based `sessionManager`, and the `getUser` Hono middleware that gates a route behind authentication.

## Scripts

- `bun run server` — `bun serve.ts`
- `bun run devserver` — `bun --watch serve.ts`

## Auth (Kinde)

- `getUser` (from `kinde.ts`) is Hono middleware — add it as a handler arg (e.g. `.get('/', getUser, async (c) => ...)`) to require auth on a route. It sets `c.var.user` (typed `UserType`) and returns 401 if the session is invalid.
- Session state lives in httpOnly cookies (`id_token`, `access_token`, `refresh_token`), not a server-side session store.
- `src/routes/auth.ts` implements the full flow: `/login`, `/register`, `/callback`, `/logout`, `/me`.
- Mobile deep-link redirect: `/login`/`/register` accept an `app_redirect` query param (must start with `expenseapp://`), stashed in a cookie and consumed in `/callback` to redirect back into the app after auth completes on web.

## Adding a route

1. Create or extend a file in `src/routes/`, exporting a `new Hono()` chain.
2. Wire it into `apiRoutes` in `src/server.ts` via `.route('/prefix', yourRoute)`.
3. Validate request bodies with `zValidator` against schemas from `@basic-hosted-expense-tracker/shared` — don't hand-roll validation or use `@basic-hosted-expense-tracker/db`'s Drizzle-generated schemas for this (see `packages/db/CLAUDE.md`'s "two Zod schema layers" note).

`expenses.ts` is the reference implementation — copy its shape for a new per-user resource: `getUser` for auth, `zValidator('json', schema)` from `packages/shared` for the POST body, then `insertXSchema` from `packages/db` to validate the full row before insert, `and(eq(table.userId, user.id), eq(table.id, id))` to scope reads/deletes to the authenticated user.

## Environment variables

Declared in `env.d.ts`, all typed `string | undefined` (never asserted non-null by the type system — several call sites use `!` to assert non-null, e.g. `kinde.ts`'s `authDomain`/`clientId`/`redirectURL`, so a missing value fails at runtime, not typecheck time):

- `PORT` — defaults to `3000` if unset (`index.ts`).
- `ALLOWED_ORIGINS` — comma-separated list, used for both CORS and CSRF origin checks in `src/server.ts`.
- `APP_URL` — web fallback redirect after `/callback` if no mobile `app_redirect` cookie is present.
- `KINDE_DOMAIN`, `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_REDIRECT_URI`, `KINDE_LOGOUT_REDIRECT_URI` — Kinde app config.
- `COOKIE_SAME_SITE` — set to `"None"` to use `SameSite=None` on session cookies (needed cross-site); anything else (including unset) uses `Lax`.
- `DATABASE_URL` — see `packages/db/CLAUDE.md`.

Per the repo root `CLAUDE.md`: never read `.env` files directly. Ask the user for values if needed for debugging.
