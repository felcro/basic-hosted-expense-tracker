import {
  createExpenseSchema,
  defaultPostExpenseValues,
  type PostExpense,
} from '@basic-hosted-expense-tracker/shared'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ChevronLeftIcon, ChevronRightIcon, Icon } from '@/components/ui/icon'

import { BaseView } from '../../components/common/BaseView'
import { LinkText } from '../../components/common/Text'
import { TextInput } from '../../components/common/TextInput'
import { api } from '../../lib/api'
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
  const methods = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      ...defaultPostExpenseValues,
    },
  })
  const { control, handleSubmit, reset, formState } = methods

  const onSubmit = async (data: PostExpense) => {
    const res = await api.expenses.$post({ json: data })
    if (!res.ok) {
      throw new Error('server error')
    }
    reset()
    router.navigate(routes.expenses.href)
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
