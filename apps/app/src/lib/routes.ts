import type { Href } from 'expo-router'

type Route = {
  name: string
  href: Href
  label: string
  icon: string
}

export const routes = {
  home: { name: 'index', href: '/', label: 'Home', icon: 'home' },
  about: { name: 'about', href: '/about', label: 'About', icon: 'information' },
  expenses: {
    name: 'expenses',
    href: '/expenses',
    label: 'Expenses',
    icon: 'format-list-bulleted',
  },
  'create-expense': {
    name: 'create-expense',
    href: '/create-expense',
    label: 'Create',
    icon: 'plus-circle',
  },
  profile: {
    name: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: 'account',
  },
} as const satisfies Record<string, Route>

export type RouteName = keyof typeof routes
export const RouteList = Object.values(routes)
