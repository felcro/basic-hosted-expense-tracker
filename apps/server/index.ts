import server from './server'

Bun.serve({
  fetch: server.fetch,
  port: Number(process.env['PORT'] ?? 3000),
})

console.log('Server running')
