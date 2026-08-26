import { useQuery } from '@tanstack/react-query'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { Table } from '../components/common/Table'
import { api } from '../lib/api'

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pageContent: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  title: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
  },
}))

async function getColumnNames() {
  const res = await api.expenses.columns.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

async function getExpenses() {
  const res = await api.expenses.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

export default function Expenses() {
  const {
    isPending: dataPending,
    error,
    data,
  } = useQuery({
    queryKey: ['get-expenses'],
    queryFn: getExpenses,
  })
  const { data: columnData, isPending: columnsPending } = useQuery({
    queryKey: ['get-columns'],
    queryFn: getColumnNames,
  })

  if (error) {
    return 'An error has occurred: ' + error.message
  }
  return (
    <View style={styles.screen}>
      <View style={styles.title}>
        <Text variant="headlineLarge">Expenses</Text>
      </View>
      <View style={styles.pageContent}>
        <Table
          data={data?.expenses ?? []}
          dataPending={dataPending}
          columns={columnData?.columnNames ?? []}
          columnsPending={columnsPending}
        />
      </View>
    </View>
  )
}
