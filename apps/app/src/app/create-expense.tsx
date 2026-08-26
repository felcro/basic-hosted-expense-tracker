import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { BaseView } from '../components/common/BaseView'
import { LinkText } from '../components/common/Text'
import { TextInput } from '../components/common/TextInput'
import { routes } from '../lib/routes'

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      amount: undefined,
    },
  })
  const onSubmit = (data) => {
    reset()
    console.log(data)
  }

  return (
    <BaseView title="Create Expense">
      <View style={styles.form}>
        <TextInput
          label="Title"
          style={styles.textInput}
          placeholder="Enter expense title"
          formController={control}
          rules={{ required: true }}
          name="title"
        />
        {errors.title && (
          <Text style={{ color: 'red' }}>This is required.</Text>
        )}
        <TextInput
          label="Amount"
          style={styles.textInput}
          placeholder="Enter expense amount"
          formController={control}
          rules={{ required: true }}
          name="amount"
        />
        {errors.amount && (
          <Text style={{ color: 'red' }}>This is required.</Text>
        )}
        <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
      </View>
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
