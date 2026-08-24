import { StyleSheet } from 'react-native-unistyles'

// Mirrors react-native-paper's MD3 type scale (react-native-paper/src/styles/themes/v3/tokens.tsx)
// so custom Unistyles text styles line up with Paper's <Text variant="..."> sizes.
const fonts = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const

const roundness = 2

export const lightTheme = {
  colors: {
    background: '#FCFAF8',
    foreground: '#EDEAE6',
    typography: '#1B140C',
    dimmed: '#ECE8E4',
    tint: '#9A734C',
    activeTint: '#1B140C',
    link: '#1E3799',
    accents: {
      banana: '#F6E58D',
      pumpkin: '#FFBE76',
      apple: '#FF7979',
      grass: '#BADC58',
      storm: '#686DE0',
    },
  },
  fonts,
  roundness,
  gap: (v: number) => v * 8,
} as const

export const darkTheme = {
  colors: {
    background: '#221A11',
    foreground: '#332618',
    typography: '#FFFFFF',
    dimmed: '#A8A198',
    tint: '#C9AD92',
    activeTint: '#FFFFFF',
    link: '#0C2461',
    accents: {
      banana: '#f9CA24',
      pumpkin: '#F0932B',
      apple: '#EB4D4B',
      grass: '#6AB04C',
      storm: '#4834D4',
    },
  },
  fonts,
  roundness,
  gap: (v: number) => v * 8,
} as const

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
}

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
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
