import { type ApiRoutes } from '@basic-hosted-expense-tracker/server'
import { hc } from 'hono/client'

const client = hc<ApiRoutes>(process.env.EXPO_PUBLIC_API_URL ?? '/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, credentials: 'include' }),
})

export const api = client.api
