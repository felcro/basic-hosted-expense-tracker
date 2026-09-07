import { expenseSchema } from '@basic-hosted-expense-tracker/shared'
import { useQuery } from '@tanstack/react-query'

import { BaseView } from '../../components/common/BaseView'
import { Table } from '../../components/common/Table'
import { LinkText } from '../../components/common/Text'
import { api } from '../../lib/api'
import { routes } from '../../lib/routes'

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

  if (error) {
    return 'An error has occurred: ' + error.message
  }
  return (
    <BaseView title="Expenses">
      <Table
        data={data?.expenses ?? []}
        dataPending={dataPending}
        columns={
          expenseSchema
            .omit({
              userId: true,
              createdAt: true,
            })
            .keyof().options
        }
        // columnsPending={columnsPending}
      />
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
