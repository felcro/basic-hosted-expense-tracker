import { OverlayProvider } from '@gluestack-ui/core/overlay/creator'
import { ToastProvider } from '@gluestack-ui/core/toast/creator'
import React, { useEffect } from 'react'
import { Appearance, View, type ViewProps } from 'react-native'
import { colorScheme } from 'react-native-css'

export type ModeType = 'light' | 'dark' | 'system'

export function GluestackUIProvider({
  mode = 'system',
  ...props
}: {
  mode?: ModeType
  children?: React.ReactNode
  style?: ViewProps['style']
}) {
  useEffect(() => {
    // `Appearance.setColorScheme` does not emit a change event back into the
    // runtime that called it, so react-native-css's `colorScheme` observable
    // (what every `dark:` variant and `prefers-color-scheme` token reads on
    // native) never sees an in-app theme toggle. Set the observable directly
    // so gluestack components re-render alongside Paper/unistyles ones.
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode)
    colorScheme.set(mode === 'system' ? null : mode)
  }, [mode])

  return (
    <View style={[{ flex: 1, height: '100%', width: '100%' }, props.style]}>
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  )
}
