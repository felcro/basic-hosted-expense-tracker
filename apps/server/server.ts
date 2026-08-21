import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { expensesRoute } from './src/routes/expenses'

const server = new Hono()

server.use('*', logger())

server.get('/test', (c) => {
  return c.json({ message: 'test' })
})

server.route('/api/expenses', expensesRoute)

export default server
