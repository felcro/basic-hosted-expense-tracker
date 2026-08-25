import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Link, Slot, usePathname } from 'expo-router'
import { StrictMode } from 'react'
import { View } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { TabButton } from '../components/TabButton'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

const routes = [
  { name: 'index', href: '/', label: 'Home' },
  { name: 'about', href: '/about', label: 'About' },
  { name: 'contact', href: '/contact', label: 'Contact' },
] as const

export default function RootLayout() {
  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme
  const pathname = usePathname()

  // Query Client for the whole app
  const queryClient = new QueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <View style={styles.navBar}>
            {routes.map((route) => (
              <Link key={route.name} href={route.href} asChild>
                <TabButton
                  label={route.label}
                  focussed={pathname === route.href}
                />
              </Link>
            ))}
          </View>
          <Slot />
        </PaperProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

const styles = StyleSheet.create((theme) => ({
  navBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.foreground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.dimmed,
  },
}))
