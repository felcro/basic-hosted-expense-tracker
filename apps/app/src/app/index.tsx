import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Card, Switch, Text } from 'react-native-paper'
import {
  StyleSheet,
  UnistylesRuntime,
  withUnistyles,
} from 'react-native-unistyles'

import { api } from '../lib/api'

const CardContent = withUnistyles(Card.Content)

export default function Home() {
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [themeToggle, setThemeToggle] = useState(false)

  useEffect(() => {
    async function fetchTotal() {
      const res = await api.expenses['total-spent'].$get()
      console.log('RES: ', res)
      const data = await res.json()
      setTotalSpent(data.total)
    }
    fetchTotal()
  }, [])

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
          <Text variant="bodyLarge">{totalSpent}</Text>
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
