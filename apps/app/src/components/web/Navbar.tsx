import { Link, usePathname } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

import type { RouteList } from '@/app/lib/routes'

import { TabButton } from '../common/TabButton'
import { Switch } from '../rnp-unistyles/Switch'

const styles = StyleSheet.create((theme) => ({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.foreground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.dimmed,
    justifyContent: 'space-between',
  },
  links: {
    flexDirection: 'row',
  },
  switchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.gap(2),
    gap: theme.gap(1),
    alignItems: 'center',
  },
}))

export type NavbarProps = {
  routeList: typeof RouteList
}

export function Navbar({ routeList }: NavbarProps) {
  const pathname = usePathname()
  const [themeToggle, setThemeToggle] = useState(false)

  const toggleTheme = () => {
    setThemeToggle(!themeToggle)
    UnistylesRuntime.setTheme(themeToggle ? 'light' : 'dark')
  }

  return (
    <View style={styles.navBar}>
      <View style={styles.links}>
        {routeList.map((route) => (
          <Link key={route.name} href={route.href} asChild>
            <TabButton label={route.label} focussed={pathname === route.href} />
          </Link>
        ))}
      </View>
      <Pressable
        style={styles.switchContainer}
        onPress={toggleTheme}
        accessibilityRole="switch"
        accessibilityState={{ checked: themeToggle }}
        accessibilityLabel="Enable Dark Mode"
      >
        <Text variant="labelMedium">Enable Dark Mode</Text>
        <Switch
          value={themeToggle}
          onValueChange={toggleTheme}
          importantForAccessibility="no"
        />
      </Pressable>
    </View>
  )
}
