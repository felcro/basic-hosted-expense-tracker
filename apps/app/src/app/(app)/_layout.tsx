import { Redirect } from 'expo-router'
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui'
import { getItemAsync, setItemAsync } from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

import { TabButton } from '../../components/common/TabButton'
import { NativeHeader } from '../../components/native/NativeHeader'
import { useSession } from '../../lib/auth'
import { routes } from '../../lib/routes'
import { useSetToastBottomInset } from '../../lib/toastInsets'
import { useExpenseStream } from '../../lib/useExpenseStream.native'

function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    getItemAsync(key).then((saved) => {
      if (saved) {
        setState(JSON.parse(saved))
      }
    })
  }, [key])

  useEffect(() => {
    setItemAsync(key, JSON.stringify(state))
  }, [key, state])

  return { state, setState }
}

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useSession()
  const setToastBottomInset = useSetToastBottomInset()

  useExpenseStream(isAuthenticated)

  const { state: themeToggle, setState: setThemeToggle } = usePersistedState(
    'dark-mode',
    false,
  )
  useEffect(() => {
    UnistylesRuntime.setTheme(themeToggle ? 'dark' : 'light')
  }, [themeToggle])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />
  }

  const toggleTheme = () => setThemeToggle(!themeToggle)

  return (
    <>
      <NativeHeader title="Expense Tracker" />
      <Tabs style={styles.tabs}>
        <TabSlot />
        <TabList
          style={styles.tabList}
          onLayout={(e) => setToastBottomInset(e.nativeEvent.layout.height)}
        >
          <TabTrigger
            name={routes.home.name}
            href={routes.home.href}
            asChild
            style={styles.tabTrigger}
          >
            <TabButton label={routes.home.label} icon={routes.home.icon} />
          </TabTrigger>
          <TabTrigger
            name={routes.expenses.name}
            href={routes.expenses.href}
            asChild
            style={styles.tabTrigger}
          >
            <TabButton
              label={routes.expenses.label}
              icon={routes.expenses.icon}
            />
          </TabTrigger>
          <TabTrigger
            name={routes['create-expense'].name}
            href={routes['create-expense'].href}
            asChild
            style={styles.tabTrigger}
          >
            <TabButton
              label={routes['create-expense'].label}
              icon={routes['create-expense'].icon}
            />
          </TabTrigger>
          <TabTrigger
            name={routes.profile.name}
            href={routes.profile.href}
            asChild
            style={styles.tabTrigger}
          >
            <TabButton
              label={routes.profile.label}
              icon={routes.profile.icon}
            />
          </TabTrigger>
          <TabButton
            label={themeToggle ? 'Light' : 'Dark'}
            icon={themeToggle ? 'weather-sunny' : 'weather-night'}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Enable Dark Mode"
            style={styles.tabTrigger}
          />
        </TabList>
      </Tabs>
    </>
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
  tabTrigger: {
    flex: 1,
  },
}))
