import type { PostExpense } from '@basic-hosted-expense-tracker/shared'

import { type ApiRoutes } from '@basic-hosted-expense-tracker/server'
import { queryOptions } from '@tanstack/react-query'
import { hc } from 'hono/client'

// Empty string when unset (same-origin deploys don't need it); never a bare '/',
// which breaks URL concatenation elsewhere (`'/' + '/path'` -> `//path`, a
// protocol-relative URL that resolves to the wrong host).
export const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? ''

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
