import { type ApiRoutes } from '@basic-hosted-expense-tracker/server'
import { queryOptions } from '@tanstack/react-query'
import { hc } from 'hono/client'

const client = hc<ApiRoutes>(process.env.EXPO_PUBLIC_API_URL ?? '/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, credentials: 'include' }),
})

export const api = client.api

async function getCurrentUser() {
  const res = await api.me.$get()
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  return data
}

export const userQueryOptions = queryOptions({
  queryKey: ['get-current-user'],
  queryFn: getCurrentUser,
  staleTime: Infinity,
})
