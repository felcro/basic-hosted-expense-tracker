import { Redirect, Slot } from 'expo-router'

import { Navbar } from '../../components/web/Navbar'
import { useSession } from '../../lib/auth'
import { RouteList } from '../../lib/routes'

// TODO IMPORTANT

// ADD THESE URLS BACK INTO KINDE:
// Allowed Callback URLS: http://localhost:3000/api/callback
// Allowed logout redirect URLs: http://localhost:8081

// ALSO CONSIDER MIGRATING TO SUPABASE FROM KINDE FOR AUTH.
// Makes me more employable...

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useSession()

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/sign-in" />
  }

  return (
    <>
      <Navbar routeList={RouteList} />
      <Slot />
    </>
  )
}
