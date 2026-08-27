import { Slot } from 'expo-router'

import { Navbar } from '../../components/web/Navbar'
import { RouteList } from '../../lib/routes'

export default function RootLayout() {
  return (
    <>
      <Navbar routeList={RouteList} />
      <Slot />
    </>
  )
}
