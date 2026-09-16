import type { ComponentProps } from 'react'

import { forwardRef } from 'react'
import { Platform, View } from 'react-native'
import { Icon, Text, TouchableRipple } from 'react-native-paper'
import { StyleSheet, useUnistyles, withUnistyles } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  button: {
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(2),
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  },
  iconButton: {
    paddingVertical: theme.gap(1.5),
    paddingHorizontal: theme.gap(0.5),
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  },
  iconContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(0.5),
  },
}))

type TabButtonProps = Omit<
  ComponentProps<typeof TouchableRipple>,
  'children'
> & {
  label: string
  icon?: string
  focussed?: boolean
  isFocused?: boolean
}

const Button = withUnistyles(TouchableRipple)

export const TabButton = forwardRef<
  React.ComponentRef<typeof TouchableRipple>,
  TabButtonProps
>(({ label, icon, focussed, isFocused, style, ...props }, ref) => {
  const { theme } = useUnistyles()

  const active = focussed ?? isFocused
  const tintColor = active ? theme.colors.activeTint : theme.colors.tint

  // Icons are only used in native.
  if (icon) {
    return (
      <Button ref={ref} {...props} style={[styles.iconButton, style]}>
        <View style={styles.iconContent}>
          <Icon source={icon} size={24} color={tintColor} />
          <Text
            variant="labelSmall"
            numberOfLines={1}
            style={{
              fontWeight: active ? '700' : theme.fonts.labelSmall.fontWeight,
              color: tintColor,
            }}
          >
            {label}
          </Text>
        </View>
      </Button>
    )
  }

  return (
    <Button ref={ref} {...props} style={[styles.button, style]}>
      <Text
        variant="titleMedium"
        style={{
          fontWeight: active ? '700' : theme.fonts.titleMedium.fontWeight,
          color: tintColor,
        }}
      >
        {label}
      </Text>
    </Button>
  )
})

TabButton.displayName = 'Tab Button'
