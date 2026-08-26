import { useQuery } from '@tanstack/react-query'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { Card, CardContent, CardTitle } from '../components/rnp-unistyles/Card'
import { api } from '../lib/api'

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
  },
  cardContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardContent: {
    marginTop: 10,
  },
}))

async function getTotalSpent() {
  const res = await api.expenses['total-spent'].$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

export default function Home() {
  const { isPending, error, data } = useQuery({
    queryKey: ['get-total-spent'],
    queryFn: getTotalSpent,
  })

  if (error) {
    return 'An error has occurred: ' + error.message
  }

  return (
    <View style={styles.screen}>
      <View style={styles.title}>
        <Text variant="headlineLarge">Home</Text>
      </View>
      <View style={styles.cardContainer}>
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
    </View>
  )
}
