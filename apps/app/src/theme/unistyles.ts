import { StyleSheet } from 'react-native-unistyles'

import {
  breakpoints,
  darkColors,
  fonts,
  gap,
  lightColors,
  roundness,
} from './themeTokens'

export const lightTheme = {
  colors: lightColors,
  fonts,
  roundness,
  gap,
} as const

export const darkTheme = {
  colors: darkColors,
  fonts,
  roundness,
  gap,
} as const

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
}

type AppBreakpoints = typeof breakpoints
type AppThemes = typeof appThemes

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    // adaptiveThemes: true,
    initialTheme: 'light',
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
})
