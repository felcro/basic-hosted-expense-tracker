import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper'

import { darkTheme, lightTheme } from './unistyles'

// Builds a Paper MD3 theme from a Unistyles theme. Spreading `base` first means
// any Paper color/property we don't set here keeps Paper's own default.
function toPaperTheme(base: MD3Theme, theme: typeof lightTheme | typeof darkTheme): MD3Theme {
  return {
    ...base,
    roundness: theme.roundness,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      surface: theme.colors.foreground,
      surfaceVariant: theme.colors.foreground,
      onBackground: theme.colors.typography,
      onSurface: theme.colors.typography,
      onSurfaceVariant: theme.colors.typography,
      primary: theme.colors.tint,
      onPrimary: theme.colors.background,
      secondary: theme.colors.activeTint,
      onSecondary: theme.colors.background,
      surfaceDisabled: theme.colors.dimmed,
      outline: theme.colors.dimmed,
    },
  }
}

export const paperLightTheme = toPaperTheme(MD3LightTheme, lightTheme)
export const paperDarkTheme = toPaperTheme(MD3DarkTheme, darkTheme)
