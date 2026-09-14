import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconButton } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { HStack } from '@/components/ui/hstack'
import { AlertCircleIcon, CheckIcon, Icon } from '@/components/ui/icon'
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast'
import { VStack } from '@/components/ui/vstack'

import { deleteExpense, getAllExpensesQueryOptions } from '../../lib/api'
import { darkColors, lightColors } from '../../theme/themeTokens'

export function TableDeleteButton({ id }: { id: number }) {
  const { rt } = useUnistyles()
  const toast = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteExpense,

    onError: () => {
      toast.show({
        placement: 'bottom right',
        avoidKeyboard: true,
        render: ({ id: toastInstanceId }) => {
          const toastId = 'toast-' + toastInstanceId
          return (
            <Toast
              nativeID={toastId}
              action="error"
              variant="outline"
              className="p-4 gap-6 border-destructive w-full sm:min-w-96 max-w-96 bg-card shadow-hard-2 flex-row m-3"
            >
              <HStack space="md">
                <Icon
                  as={AlertCircleIcon}
                  className="mt-0.5 stroke-destructive"
                />
                <VStack space="xs">
                  <ToastTitle className="font-semibold text-destructive">
                    Error
                  </ToastTitle>
                  <ToastDescription size="sm">
                    {'Failed to delete expense: ' + id}
                  </ToastDescription>
                </VStack>
              </HStack>
            </Toast>
          )
        },
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
      toast.show({
        placement: 'bottom right',
        avoidKeyboard: true,
        render: ({ id: toastInstanceId }) => {
          const toastId = 'toast-' + toastInstanceId
          return (
            <Toast
              nativeID={toastId}
              action="success"
              variant="outline"
              className="p-4 gap-6 border-accent-lime w-full sm:min-w-96 max-w-96 bg-card shadow-hard-2 flex-row m-3"
            >
              <HStack space="md">
                <Icon as={CheckIcon} className="mt-0.5 stroke-accent-lime" />
                <VStack space="xs">
                  <ToastTitle className="font-semibold text-accent-lime">
                    Success!
                  </ToastTitle>
                  <ToastDescription size="sm">
                    {'Successfully deleted expense: ' + id}
                  </ToastDescription>
                </VStack>
              </HStack>
            </Toast>
          )
        },
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
