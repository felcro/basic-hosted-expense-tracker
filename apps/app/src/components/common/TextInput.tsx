import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import {
  TextInput as RNPTextInput,
  type TextInputProps as RNPTextInputProps,
} from 'react-native-paper'
import { useUnistyles, withUnistyles } from 'react-native-unistyles'

const StyledTextInput = withUnistyles(RNPTextInput)

export type TextInputProps<TFieldValues extends FieldValues> =
  RNPTextInputProps & {
    label: string
    name: Path<TFieldValues>
    right?: string
    formController: ControllerProps<TFieldValues>['control']
    rules?: ControllerProps<TFieldValues>['rules']
  }

export function TextInput<TFieldValues extends FieldValues>({
  right,
  formController,
  rules,
  label,
  name,
  ...props
}: TextInputProps<TFieldValues>) {
  const { theme } = useUnistyles()

  return (
    <Controller
      name={name}
      control={formController}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <StyledTextInput
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
      )}
    />
  )
}

export const TextInputIcon = withUnistyles(RNPTextInput.Icon)
