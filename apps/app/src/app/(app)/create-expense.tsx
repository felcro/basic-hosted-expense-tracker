import {
  expensePostSchema,
  type PostExpense,
} from '@basic-hosted-expense-tracker/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

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
    resolver: zodResolver(expensePostSchema),
    defaultValues: {
      title: '',
      amount: '',
    },
  })
  const { handleSubmit, reset, formState } = methods

  const onSubmit = async (data: PostExpense) => {
    await new Promise((c) => setTimeout(c, 1000))
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
