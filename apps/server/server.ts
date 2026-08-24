import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { expensesRoute } from './src/routes/expenses'

const server = new Hono()

server.use('*', logger())
server.use(
  '/api/*',
  cors({
    origin: (process.env['ALLOWED_ORIGINS'] ?? '').split(',').filter(Boolean),
  }),
)

server.get('/test', (c) => {
  return c.json({ message: 'test' })
})

server.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

server.route('/api/expenses', expensesRoute)

const webRoot = './apps/app/dist'

server.use('/*', serveStatic({ root: webRoot }))
server.get('*', serveStatic({ path: 'index.html', root: webRoot }))

export default server
