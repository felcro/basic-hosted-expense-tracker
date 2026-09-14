import { useKindeAuth } from '@kinde/expo'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'
import { Platform } from 'react-native'

import { userQueryOptions } from './api'

function useSessionQuery() {
  // On native the bearer token is read from secure storage, which is async and
  // not ready on first render. Querying before then sends an unauthenticated
  // request and caches a 401, so hold the query until Kinde has loaded — and
  // keep reporting `isLoading` meanwhile, or the route guards would redirect to
  // sign-in before the stored session has been read.
  const kinde = useKindeAuth()
  const kindeLoading = Platform.OS !== 'web' && kinde.isLoading

  const { data: user, isLoading } = useQuery({
    ...userQueryOptions,
    enabled: !kindeLoading,
  })

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: kindeLoading || isLoading,
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
