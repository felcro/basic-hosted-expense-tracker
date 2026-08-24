import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Variant = 'default' | 'title' | 'link'

export type TextProps = RNTextProps & {
  variant?: Variant
}

export function Text({ variant = 'default', style, ...props }: TextProps) {
  return <RNText style={[styles[variant], style]} {...props} />
}

const styles = StyleSheet.create((theme) => {
  return {
    default: {
      color: theme.colors.typography,
      fontSize: 16,
    },
    title: {
      color: theme.colors.typography,
      fontSize: 28,
      fontWeight: '700',
    },
    link: {
      fontSize: 16,
      color: theme.colors.link,
      minWidth: 'auto',
    },
  }
})
