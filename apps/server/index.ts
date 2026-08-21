import server from './server'

Bun.serve({
  fetch: server.fetch,
})

console.log('Server running')
