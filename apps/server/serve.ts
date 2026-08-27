import server from './src/server'

Bun.serve({
  fetch: server.fetch,
  port: Number(process.env['PORT'] ?? 3000),
})
