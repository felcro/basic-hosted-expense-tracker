import type { PostExpense } from '@basic-hosted-expense-tracker/shared'

import { type ApiRoutes } from '@basic-hosted-expense-tracker/server'
import { queryOptions } from '@tanstack/react-query'
import { hc } from 'hono/client'
import { Platform } from 'react-native'

// Where the API lives while developing.
//
// Native points at the deployed API, not the local one. Kinde only accepts a
// plain-HTTP redirect URI on `localhost` (anything else must be HTTPS), and a
// phone or emulator can't reach the Mac's localhost — so a local native login
// has no valid callback URL. KINDE_REDIRECT_URI is a single server-wide value,
// so native and web have to share whichever origin it names; the deployed one
// is HTTPS and already registered in the Kinde dashboard.
//
// The cost: native reads and writes the deployed database, so anything created
// while testing on a device is real data.
//
// Web stays local — Metro serves the app from :8081 and the API runs on :3000,
// so it's cross-origin and needs naming explicitly; the server does not proxy.
//
// Set EXPO_PUBLIC_API_URL in apps/app/.env to override both. That value is
// inlined at bundle time, so restart with `bunx expo start --clear` to change it.
const deployedApiUrl =
  'https://app-0a0cf65d-c6fa-4bb5-86e8-0df9c595b8dc.cleverapps.io'

const devApiUrl = Platform.select({
  android: deployedApiUrl,
  ios: deployedApiUrl,
  default: 'http://localhost:3000',
})

// Empty string in production when unset (same-origin deploys don't need it);
// never a bare '/', which breaks URL concatenation elsewhere (`'/' + '/path'`
// -> `//path`, a protocol-relative URL that resolves to the wrong host).
export const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? devApiUrl : '')

const client = hc<ApiRoutes>(apiUrl || '/', {
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

export const convertUTCToLocaleDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date(date))

async function getAllExpenses() {
  const res = await api.expenses.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return {
    expenses: data.expenses.map((expense) => ({
      ...expense,
      date: convertUTCToLocaleDate(expense.date),
    })),
  }
}

export const getAllExpensesQueryOptions = queryOptions({
  queryKey: ['get-all-expenses'],
  queryFn: getAllExpenses,
  staleTime: 1000 * 60 * 5,
})

export async function createExpense(data: PostExpense) {
  const res = await api.expenses.$post({ json: data })
  if (!res.ok) {
    throw new Error('server error')
  }
  const newExpense = await res.json()
  return newExpense
}

export const loadingCreateExpenseQueryOptions = queryOptions<{
  expense?: PostExpense
}>({
  queryKey: ['loading-create-expense'],
  queryFn: async () => {
    return {}
  },
  staleTime: Infinity,
})

export async function deleteExpense(id: number) {
  const res = await api.expenses[':id{[0-9]+}'].$delete({
    param: { id: id.toString() },
  })

  if (!res.ok) {
    throw new Error(
      'Server error encountered when trying to delete expense: ' +
        id.toString(),
    )
  }
}
