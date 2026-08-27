import { Redirect, Slot } from 'expo-router'

import { Navbar } from '../../components/web/Navbar'
import { useSession } from '../../lib/auth'
import { RouteList } from '../../lib/routes'

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
