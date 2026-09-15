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
// request. A bearer token is never attached automatically, so the protection is
// inert for token-authenticated calls — skip it entirely for those rather than
// exempting them via the `origin` option, which is never consulted when there
// is no Origin header (hono returns false before calling the handler). Native
// sends neither `Origin` nor `sec-fetch-site`, so without this every bodyless
// non-safe request from native is rejected with a 403 before reaching its
// handler — a DELETE sends no Content-Type, and hono defaults the missing
// header to `text/plain`, which matches its form-submission check.
const csrfProtection = csrf({ origin: allowedOrigins })

server.use('/api/*', async (c, next) => {
  if (c.req.header('Authorization')?.startsWith('Bearer ')) {
    return next()
  }
  return csrfProtection(c, next)
})
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
