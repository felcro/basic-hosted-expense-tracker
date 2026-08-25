import type { ComponentProps } from 'react'

import { forwardRef } from 'react'
import { Text, TouchableRipple } from 'react-native-paper'
import {
  StyleSheet,
  UnistylesRuntime,
  withUnistyles,
} from 'react-native-unistyles'

type TabButtonProps = Omit<
  ComponentProps<typeof TouchableRipple>,
  'children'
> & {
  label: string
  focussed?: boolean
}

const Button = withUnistyles(TouchableRipple)

export const TabButton = forwardRef<
  React.ComponentRef<typeof TouchableRipple>,
  TabButtonProps
>(({ label, focussed, style, ...props }, ref) => {
  const theme = UnistylesRuntime.getTheme()

  return (
    <Button ref={ref} {...props} style={styles.button}>
      <Text
        variant="titleMedium"
        style={{
          fontWeight: focussed ? '700' : theme.fonts.titleMedium.fontWeight,
          color: focussed ? theme.colors.activeTint : theme.colors.tint,
        }}
      >
        {label}
      </Text>
    </Button>
  )
})

const styles = StyleSheet.create((theme) => ({
  button: {
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(2),
    alignItems: 'center',
    justifyContent: 'center',
    //   variants: {
    //     isFocussed: {
    //       true: {
    //         backgroundColor: theme.colors.tint,
    //       },
    //     },
    //   },
    // },
  },
}))

TabButton.displayName = 'Tab Button'
