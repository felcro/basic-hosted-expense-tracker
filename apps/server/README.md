# server

Hono API server, running on `Bun.serve()`. Handles auth (via Kinde) and the `/api/expenses` routes, and also serves the built Expo web app (`apps/app/dist`) as static files.

## Env

See `.env` — needs `DATABASE_URL`, `ALLOWED_ORIGINS`, `APP_URL`, and the `KINDE_*` variables.
