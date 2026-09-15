import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  apiUrl,
  getAllExpensesQueryOptions,
  getTotalSpentQueryOptions,
} from './api'

const url = `${apiUrl}/api/expenses/stream`

export function useExpenseStream(isAuthenticated: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const es = new EventSource(url, { withCredentials: true })

    const invalidate = () => {
      queryClient.invalidateQueries(getAllExpensesQueryOptions)
      queryClient.invalidateQueries(getTotalSpentQueryOptions)
    }
    es.addEventListener('expenses', invalidate)
    es.addEventListener('open', invalidate)

    return () => es.close()
  }, [isAuthenticated, queryClient])
}
