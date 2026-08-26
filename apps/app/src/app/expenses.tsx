import { useQuery } from '@tanstack/react-query'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { api } from '../lib/api'

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    minWidth: '100%',
  },
  title: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
  },
}))

async function getExpenses() {
  const res = await api.expenses.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

export default function Expenses() {
  const { isPending, error, data } = useQuery({
    queryKey: ['get-total-spent'],
    queryFn: getExpenses,
  })

  if (error) {
    return 'An error has occurred: ' + error.message
  }
  return (
    <View style={styles.screen}>
      <View style={styles.title}>
        <Text variant="headlineLarge">Expenses</Text>
      </View>
      <View style={styles.container}></View>
    </View>
  )
}
