import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'

import { userQueryOptions } from './api'

function useSessionQuery() {
  const { data: user, isLoading } = useQuery(userQueryOptions)
  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
  }
}

type SessionContextValue = ReturnType<typeof useSessionQuery>

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const value = useSessionQuery()

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
