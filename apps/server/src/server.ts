import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'

import { authRoute } from './routes/auth'
import { expensesRoute } from './routes/expenses'

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .filter(Boolean)

// Setup
const server = new Hono()
server.use('*', logger())
server.use(
  '/api/*',
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)
// CSRF guards against a browser silently attaching *cookies* to a cross-site
// request. A bearer token is never attached automatically, so the attack it
// prevents doesn't exist for token-authenticated calls — and native clients
// send neither `Origin` nor `sec-fetch-site`, so they fail the origin check by
// default. Without this exemption every bodyless non-safe request from native
// (e.g. DELETE, which sends no Content-Type and so defaults to `text/plain`)
// is rejected with a 403 before reaching its handler.
server.use(
  '/api/*',
  csrf({
    origin: (origin, c) =>
      c.req.header('Authorization')?.startsWith('Bearer ') ||
      allowedOrigins.includes(origin),
  }),
)
server.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Routes
const apiRoutes = server
  .basePath('/api')
  .route('/expenses', expensesRoute)
  .route('/', authRoute)

// Static serving the server
const webRoot = './apps/app/dist'
server.use('/*', serveStatic({ root: webRoot }))
server.get('*', serveStatic({ path: 'index.html', root: webRoot }))

export default server
export type ApiRoutes = typeof apiRoutes
