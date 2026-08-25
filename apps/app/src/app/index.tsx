import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useState } from 'react'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Card, Switch, Text } from 'react-native-paper'
import {
  StyleSheet,
  UnistylesRuntime,
  withUnistyles,
} from 'react-native-unistyles'

import { api } from '../lib/api'

async function getTotalSpent() {
  const res = await api.expenses['total-spent'].$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

const CardContent = withUnistyles(Card.Content)

export default function Home() {
  const [themeToggle, setThemeToggle] = useState(false)

  const { isPending, error, data, isFetching } = useQuery({
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
        <Card.Title
          titleVariant="titleLarge"
          title="Total Spent"
          subtitle="The total amount you've spent"
          subtitleVariant="bodyMedium"
        />
        <CardContent style={styles.cardContent}>
          <Text variant="bodyLarge">{isPending ? '...' : data.total}</Text>
        </CardContent>
      </Card>
      <Text>
        <Link href="/about">About Page</Link>
      </Text>
      <Text>
        <Link href="/contact">Contact Page</Link>
      </Text>
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
