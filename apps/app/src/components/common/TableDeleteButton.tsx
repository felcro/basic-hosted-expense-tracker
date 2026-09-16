import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconButton } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { useToast } from '@/components/ui/toast'

import { deleteExpense, getAllExpensesQueryOptions } from '../../lib/api'
import { useToastContainerStyle } from '../../lib/toastInsets'
import { darkColors, lightColors } from '../../theme/themeTokens'
import { showToast } from './Toast'

export function TableDeleteButton({ id }: { id: number }) {
  const { rt } = useUnistyles()
  const toast = useToast()
  const toastContainerStyle = useToastContainerStyle()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteExpense,

    onError: () => {
      showToast({
        toast: toast,
        toastContainerStyle: toastContainerStyle,
        placement: 'bottom right',
        avoidKeyboard: true,
        action: 'error',
        description: 'Failed to delete expense: ' + id,
      })
    },
    onSuccess: () => {
      // success state
      queryClient.setQueryData(
        getAllExpensesQueryOptions.queryKey,
        (existingExpenses) => ({
          ...existingExpenses,
          expenses: existingExpenses!.expenses.filter(
            (expense) => expense.id !== id,
          ),
        }),
      )
      showToast({
        toast: toast,
        toastContainerStyle: toastContainerStyle,
        placement: 'bottom right',
        avoidKeyboard: true,
        action: 'success',
        description: 'Successfully deleted expense: ' + id,
      })
    },
  })

  return (
    <IconButton
      icon="delete-outline"
      iconColor={rt.themeName === 'light' ? lightColors.tint : darkColors.tint}
      size={20}
      disabled={mutation.isPending}
      onPress={() => {
        mutation.mutate(id)
      }}
    />
  )
}
