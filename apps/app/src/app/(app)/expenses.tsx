import { expenseSchema } from '@basic-hosted-expense-tracker/shared'
import { useQuery } from '@tanstack/react-query'

import { BaseView } from '../../components/common/BaseView'
import { Table } from '../../components/common/Table'
import { LinkText } from '../../components/common/Text'
import { getExpensesQueryOptions } from '../../lib/api'
import { routes } from '../../lib/routes'

export default function Expenses() {
  const {
    isPending: dataPending,
    error,
    data,
  } = useQuery(getExpensesQueryOptions)

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
      />
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
