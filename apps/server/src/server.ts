import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { authRoute } from './routes/auth'
import { expensesRoute } from './routes/expenses'

// Setup
const server = new Hono()
server.use('*', logger())
server.use(
  '/api/*',
  cors({
    origin: (process.env['ALLOWED_ORIGINS'] ?? '').split(',').filter(Boolean),
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
