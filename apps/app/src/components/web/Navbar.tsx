import { Link, usePathname } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import type { RouteList } from '@/app/lib/routes'

import { TabButton } from '../common/TabButton'

const styles = StyleSheet.create((theme) => ({
  navBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.foreground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.dimmed,
  },
}))

export type NavbarProps = {
  routeList: typeof RouteList
}

export function Navbar({ routeList }: NavbarProps) {
  const pathname = usePathname()
  return (
    <View style={styles.navBar}>
      {routeList.map((route) => (
        <Link key={route.name} href={route.href} asChild>
          <TabButton label={route.label} focussed={pathname === route.href} />
        </Link>
      ))}
    </View>
  )
}
