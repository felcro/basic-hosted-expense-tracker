import { useQuery } from '@tanstack/react-query'
// import { StatusBar } from 'expo-status-bar'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { BaseView } from '../../components/common/BaseView'
import { Card, CardContent } from '../../components/rnp-unistyles/Card'
import { getTotalSpentQueryOptions } from '../../lib/api'

const styles = StyleSheet.create((theme) => ({
  title: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
  },
  cardContainer: {
    alignSelf: 'center',
    marginHorizontal: theme.gap(2),
  },
  cardHeader: {
    paddingHorizontal: theme.gap(2),
    paddingTop: theme.gap(2),
  },
  cardContent: {
    marginTop: 10,
  },
}))

export default function Home() {
  const { isPending, error, data } = useQuery(getTotalSpentQueryOptions)

  if (error) {
    return 'An error has occurred: ' + error.message
  }

  return (
    <BaseView title="Home">
      <Card style={styles.cardContainer}>
        <CardContent style={styles.cardHeader}>
          <Text variant="titleLarge">Total Spent</Text>
          <Text variant="bodyMedium">The total amount you&apos;ve spent</Text>
        </CardContent>
        <CardContent style={styles.cardContent}>
          <Text variant="bodyLarge">{isPending ? '...' : data?.total}</Text>
        </CardContent>
      </Card>
    </BaseView>
  )
}
