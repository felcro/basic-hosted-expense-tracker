import type { PostExpense } from '@basic-hosted-expense-tracker/shared'

import { type ApiRoutes } from '@basic-hosted-expense-tracker/server'
import {
  getActiveStorage,
  getRawToken,
  isTokenExpired,
  refreshToken,
} from '@kinde/expo/utils'
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
const devApiUrl = Platform.select({
  android: process.env.EXPO_PUBLIC_NATIVE_DEV_API_URL,
  ios: process.env.EXPO_PUBLIC_NATIVE_DEV_API_URL,
  default: 'http://localhost:3000',
})

// Empty string in production when unset (same-origin deploys don't need it);
// never a bare '/', which breaks URL concatenation elsewhere (`'/' + '/path'`
// -> `//path`, a protocol-relative URL that resolves to the wrong host).
export const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? devApiUrl : '')

// A failed refresh means the refresh token itself is expired or revoked, and
// `refreshToken` leaves it in storage — so drop the stored session rather than
// retrying a token that can never work again. The next request then goes out
// unauthenticated, the server answers 401, and the route guards send the user
// to sign in, which is the same path as never having signed in at all.
async function clearStoredSession() {
  await getActiveStorage()?.destroySession()
}

// Shared across concurrent requests: several queries firing at once on a cold
// start would otherwise each kick off their own refresh, and all but one would
// be spending an already-rotated refresh token.
let pendingRefresh: Promise<boolean> | null = null

function refreshOnce(): Promise<boolean> {
  pendingRefresh ??= (async () => {
    const result = await refreshToken({
      domain: process.env.EXPO_PUBLIC_KINDE_DOMAIN!,
      clientId: process.env.EXPO_PUBLIC_KINDE_CLIENT_ID!,
    })
    if (!result.success) {
      await clearStoredSession()
    }
    return result.success
  })().finally(() => {
    pendingRefresh = null
  })
  return pendingRefresh
}

// Native has no cookie jar shared with the auth browser sheet, so the Kinde
// access token is read from secure storage and sent as a bearer header instead.
// Web keeps using the session cookie the server sets. `getRawToken` returns
// null until the user signs in, in which case the request goes out unauthorised
// and the server answers 401 — the same as an expired cookie on web.
async function authHeaders(): Promise<Record<string, string>> {
  if (Platform.OS === 'web') {
    return {}
  }
  // Refresh slightly ahead of expiry so a token can't lapse in flight. On
  // success the SDK schedules its own next refresh, so this mainly covers cold
  // starts and apps returning from the background.
  if (await isTokenExpired({ threshold: 60 })) {
    if (!(await refreshOnce())) {
      return {}
    }
  }
  const token = await getRawToken('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const client = hc<ApiRoutes>(apiUrl || '/', {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    // Hono's client passes `init.headers` as a Headers instance, whose entries
    // live behind an iterator rather than own properties — object-spreading it
    // silently drops every header it set, and the resulting shape is rejected
    // outright by Expo's native fetch (it wants List<Pair<String, String>>).
    // Copy through the Headers constructor instead.
    const headers = new Headers(init?.headers)
    for (const [key, value] of Object.entries(await authHeaders())) {
      headers.set(key, value)
    }
    return fetch(input, { ...init, credentials: 'include', headers })
  },
})

export const api = client.api

/**
 * Thrown when the server rejects a request as unauthenticated. Distinguishing
 * this from a generic failure lets callers send the user back to sign in rather
 * than reporting "server error" for an expired session — on native a token can
 * lapse at any point, not just on the request that first loads the session.
 */
export class UnauthorisedError extends Error {
  constructor() {
    super('Not signed in')
    this.name = 'UnauthorisedError'
  }
}

// Takes the status rather than the response: hono's `ClientResponse` is not
// assignable to the DOM `Response` type under React Native's lib settings.
// Call this before any other `!res.ok` check in every query and mutation, so an
// expired session is never reported as a generic server failure.
export function throwIfUnauthorised(res: { status: number }) {
  if (res.status === 401) {
    throw new UnauthorisedError()
  }
}

async function getCurrentUser() {
  const res = await api.me.$get()
  // A 401 here is the expected answer for a signed-out user, not an error:
  // returning null is what drives the route guards to the sign-in screen.
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
  throwIfUnauthorised(res)
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
  throwIfUnauthorised(res)
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

  throwIfUnauthorised(res)
  if (!res.ok) {
    throw new Error(
      'Server error encountered when trying to delete expense: ' +
        id.toString(),
    )
  }
}
