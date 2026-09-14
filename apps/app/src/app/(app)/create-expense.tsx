import {
  createExpenseSchema,
  defaultPostExpenseValues,
  type PostExpense,
} from '@basic-hosted-expense-tracker/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import {
  Calendar,
  CalendarBody,
  CalendarGrid,
  CalendarHeader,
  CalendarHeaderMonthSelect,
  CalendarHeaderNextButton,
  CalendarHeaderPrevButton,
  CalendarHeaderYearSelect,
  CalendarWeekDaysHeader,
} from '@/components/ui/calendar'
import { HStack } from '@/components/ui/hstack'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  Icon,
} from '@/components/ui/icon'
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast'
import { VStack } from '@/components/ui/vstack'

import { BaseView } from '../../components/common/BaseView'
import { LinkText } from '../../components/common/Text'
import { TextInput } from '../../components/common/TextInput'
import {
  convertUTCToLocaleDate,
  createExpense,
  getAllExpensesQueryOptions,
  loadingCreateExpenseQueryOptions,
} from '../../lib/api'
import { getErrorMessage } from '../../lib/error'
import { routes } from '../../lib/routes'

const styles = StyleSheet.create((theme) => ({
  form: {
    flexDirection: 'column',
    gap: theme.gap(2),
    paddingBottom: theme.gap(2),
  },
  textInput: {
    minWidth: 300,
  },
}))

export default function CreateExpense() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const methods = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      ...defaultPostExpenseValues,
    },
  })
  const { control, handleSubmit, formState } = methods

  const onSubmit = async (data: PostExpense) => {
    // Ensure we have all the existing expenses before we post the new one
    // otherwise we end up duplicating it since the posted value gets added
    // to the query client both automatically and then manually.
    const existingExpenses = await queryClient.query({
      ...getAllExpensesQueryOptions,
    })

    router.navigate(routes.expenses.href)

    // loading state
    queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {
      expense: { ...data, date: convertUTCToLocaleDate(data.date) },
    })

    try {
      const newExpense = await createExpense(data)
      // success state
      queryClient.setQueryData(getAllExpensesQueryOptions.queryKey, {
        ...existingExpenses,
        expenses: [
          { ...newExpense, date: convertUTCToLocaleDate(newExpense.date) },
          ...existingExpenses.expenses,
        ],
      })
      toast.show({
        placement: 'bottom right',
        avoidKeyboard: true,
        render: ({ id }) => {
          const toastId = 'toast-' + id
          return (
            <Toast
              nativeID={toastId}
              action="success"
              variant="outline"
              className="p-4 gap-6 border-accent-lime w-full sm:min-w-96 max-w-96 bg-card shadow-hard-2 flex-row m-6"
            >
              <HStack space="md">
                <Icon as={CheckIcon} className="mt-0.5 stroke-accent-lime" />
                <VStack space="xs">
                  <ToastTitle className="font-semibold text-accent-lime">
                    Success!
                  </ToastTitle>
                  <ToastDescription size="sm">
                    Expense created successfully.
                  </ToastDescription>
                </VStack>
              </HStack>
            </Toast>
          )
        },
      })
    } catch (error) {
      toast.show({
        placement: 'bottom right',
        avoidKeyboard: true,
        render: ({ id }) => {
          const toastId = 'toast-' + id
          return (
            <Toast
              nativeID={toastId}
              action="error"
              variant="outline"
              className="p-4 gap-6 border-destructive w-full sm:min-w-96 max-w-96 bg-card shadow-hard-2 flex-row m-6"
            >
              <HStack space="md">
                <Icon
                  as={AlertCircleIcon}
                  className="mt-0.5 stroke-destructive"
                />
                <VStack space="xs">
                  <ToastTitle className="font-semibold text-destructive">
                    Error!
                  </ToastTitle>
                  <ToastDescription size="sm">
                    {getErrorMessage(error)}
                  </ToastDescription>
                </VStack>
              </HStack>
            </Toast>
          )
        },
      })
    } finally {
      queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {})
    }
  }

  return (
    <BaseView title="Create Expense">
      <FormProvider {...methods}>
        <View style={styles.form}>
          <TextInput
            label="Title"
            placeholder="Enter expense title"
            name="title"
          />
          <TextInput
            label="Amount"
            placeholder="Enter expense amount"
            name="amount"
          />
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <Calendar
                mode="single"
                value={new Date(value)}
                onValueChange={(date) => onChange(date.toISOString())}
                enableMonthYearPicker={true}
                minYear={2000}
                maxYear={2030}
                className="min-w-min"
              >
                <CalendarHeader className="bg-primary/10 rounded-sm p-1">
                  <CalendarHeaderPrevButton>
                    <Icon as={ChevronLeftIcon} size="sm" />
                  </CalendarHeaderPrevButton>
                  <CalendarHeaderMonthSelect className="ml-1 mr-0.5" />
                  <CalendarHeaderYearSelect className="ml-0.5 mr-1" />
                  <CalendarHeaderNextButton>
                    <Icon as={ChevronRightIcon} size="sm" />
                  </CalendarHeaderNextButton>
                </CalendarHeader>

                <CalendarWeekDaysHeader />

                <CalendarBody>
                  <CalendarGrid />
                </CalendarBody>
              </Calendar>
            )}
          />
          <Button
            disabled={formState.isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            {formState?.isSubmitting ? 'Submission in progress...' : 'Submit'}
          </Button>
        </View>
      </FormProvider>
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
