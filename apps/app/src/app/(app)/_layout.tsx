import { Redirect } from 'expo-router'
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui'
import { StyleSheet } from 'react-native-unistyles'

import { TabButton } from '../../components/common/TabButton'
import { NativeHeader } from '../../components/native/NativeHeader'
import { useSession } from '../../lib/auth'
import { routes } from '../../lib/routes'

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useSession()

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/sign-in" />
  }

  return (
    <>
      <NativeHeader title="Expense Tracker" />
      <Tabs style={styles.tabs}>
        <TabSlot />
        <TabList style={styles.tabList}>
          <TabTrigger name={routes.home.name} href={routes.home.href} asChild>
            <TabButton label={routes.home.label} />
          </TabTrigger>
          <TabTrigger name={routes.about.name} href={routes.about.href} asChild>
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
}))
