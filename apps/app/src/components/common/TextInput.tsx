import {
  Controller,
  get,
  useFormContext,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { StyleSheet as TextStyleSheet, View } from 'react-native'
import {
  TextInput as RNPTextInput,
  Text,
  type TextInputProps as RNPTextInputProps,
} from 'react-native-paper'
import { StyleSheet, useUnistyles, withUnistyles } from 'react-native-unistyles'
const StyledTextInput = withUnistyles(RNPTextInput)

const textStyles = TextStyleSheet.create({
  errorText: {
    color: 'red',
    paddingTop: 4,
  },
})

const styles = StyleSheet.create(() => ({
  container: {
    flexDirection: 'column',
    width: 300,
  },
}))

export type TextInputProps<TextInputFieldValues extends FieldValues> =
  RNPTextInputProps & {
    name: Path<TextInputFieldValues>
    right?: string
  }

export function TextInput<TextInputFieldValues extends FieldValues>({
  right,
  label,
  name,
  ...props
}: TextInputProps<TextInputFieldValues>) {
  const { theme } = useUnistyles()
  const resolvedLabel = label
    ? label
    : name.charAt(0).toUpperCase() + name.slice(1)

  const {
    control,
    formState: { errors },
  } = useFormContext<TextInputFieldValues>()

  const getErrors = get(errors, name)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.container}>
          <StyledTextInput
            label={resolvedLabel}
            placeholderTextColor={theme.colors.typographyWashed}
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            right={
              right && (
                <RNPTextInput.Affix
                  text={right}
                  textStyle={{
                    ...theme.fonts.bodyMedium,
                    color: theme.colors.typographyWashed,
                  }}
                />
              )
            }
            {...props}
          />
          {getErrors && (
            <Text style={textStyles.errorText}>{getErrors.message + ''}</Text>
          )}
        </View>
      )}
    />
  )
}

export const TextInputIcon = withUnistyles(RNPTextInput.Icon)
