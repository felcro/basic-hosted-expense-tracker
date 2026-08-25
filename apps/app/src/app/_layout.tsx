import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui'
import { StrictMode } from 'react'
import { PaperProvider } from 'react-native-paper'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { NativeHeader } from '../components//native/NativeHeader'
import { TabButton } from '../components/common/TabButton'
import { routes } from '../lib/routes'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

export default function RootLayout() {
  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme

  // Query Client for the whole app
  const queryClient = new QueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <NativeHeader title="Expense Tracker" />
          <Tabs style={styles.tabs}>
            <TabSlot />
            <TabList style={styles.tabList}>
              <TabTrigger
                name={routes.home.name}
                href={routes.home.href}
                asChild
              >
                <TabButton label={routes.home.label} />
              </TabTrigger>
              <TabTrigger
                name={routes.about.name}
                href={routes.about.href}
                asChild
              >
                <TabButton label={routes.about.label} />
              </TabTrigger>
              <TabTrigger
                name={routes.expenses.name}
                href={routes.expenses.href}
                asChild
              >
                <TabButton label={routes.expenses.label} />
              </TabTrigger>
              <TabTrigger
                name={routes['create-expense'].name}
                href={routes['create-expense'].href}
                asChild
              >
                <TabButton label={routes['create-expense'].label} />
              </TabTrigger>
            </TabList>
          </Tabs>
        </PaperProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  tabs: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    backgroundColor: theme.colors.foreground,
    paddingBottom: rt.insets.bottom,
  },
}))
