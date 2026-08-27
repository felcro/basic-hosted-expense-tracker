import { Link, usePathname } from 'expo-router'
import { useEffect, useState } from 'react'
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
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  switchContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.gap(2),
    gap: theme.gap(1),
    alignItems: 'center',
    marginLeft: 'auto',
  },
}))

export type NavbarProps = {
  routeList: typeof RouteList
}

function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return { state, setState }
}

export function Navbar({ routeList }: NavbarProps) {
  const pathname = usePathname()

  const { state: themeToggle, setState: setThemeToggle } = usePersistedState(
    'dark-mode',
    false,
  )
  useEffect(() => {
    UnistylesRuntime.setTheme(themeToggle ? 'dark' : 'light')
  }, [themeToggle])

  const toggleTheme = () => setThemeToggle(!themeToggle)

  return (
    <View style={styles.navBar}>
      {routeList.map((route) => (
        <Link key={route.name} href={route.href} asChild>
          <TabButton label={route.label} focussed={pathname === route.href} />
        </Link>
      ))}
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
          onValueChange={setThemeToggle}
          importantForAccessibility="no"
        />
      </Pressable>
    </View>
  )
}
