import type { Href } from 'expo-router'

type Route = {
  name: string
  href: Href
  label: string
}

export const routes = {
  home: { name: 'index', href: '/', label: 'Home' },
  about: { name: 'about', href: '/about', label: 'About' },
  expenses: { name: 'expenses', href: '/expenses', label: 'Expenses' },
  'create-expense': {
    name: 'create-expense',
    href: '/create-expense',
    label: 'Create Expense',
  },
  profile: { name: 'profile', href: '/profile', label: 'Profile' },
} as const satisfies Record<string, Route>

export type RouteName = keyof typeof routes
export const RouteList = Object.values(routes)
