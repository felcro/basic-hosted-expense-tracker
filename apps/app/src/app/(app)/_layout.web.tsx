import { Redirect, Slot } from 'expo-router'

import { Navbar } from '../../components/web/Navbar'
import { useSession } from '../../lib/auth'
import { RouteList } from '../../lib/routes'
import { useExpenseStream } from '../../lib/useExpenseStream'

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useSession()

  useExpenseStream(isAuthenticated)

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />
  }

  return (
    <>
      <Navbar routeList={RouteList} />
      <Slot />
    </>
  )
}
