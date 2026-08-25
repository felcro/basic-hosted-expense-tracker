import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Switch, Text } from 'react-native-paper'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

import { Card, CardContent, CardTitle } from '../components/rnp-unistyles/Card'
import { api } from '../lib/api'

async function getTotalSpent() {
  const res = await api.expenses['total-spent'].$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

export default function Home() {
  const [themeToggle, setThemeToggle] = useState(false)

  const { isPending, error, data } = useQuery({
    queryKey: ['get-total-spent'],
    queryFn: getTotalSpent,
  })

  if (error) {
    return 'An error has occurred: ' + error.message
  }

  return (
    <View style={styles.container}>
      <Switch
        value={themeToggle}
        onValueChange={() => {
          setThemeToggle(!themeToggle)
          UnistylesRuntime.setTheme(themeToggle ? 'light' : 'dark')
        }}
      />
      <Text variant="headlineLarge">Home</Text>
      <Card>
        <CardTitle
          titleVariant="titleLarge"
          title="Total Spent"
          subtitle="The total amount you've spent"
          subtitleVariant="bodyMedium"
        />
        <CardContent style={styles.cardContent}>
          <Text variant="bodyLarge">{isPending ? '...' : data.total}</Text>
        </CardContent>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardContent: {
    marginTop: 10,
  },
}))
