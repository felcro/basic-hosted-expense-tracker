// Shared raw token values consumed by both react-native-unistyles
// (unistyles.ts) and the gluestack-ui / NativeWind theme (global.css).
// Edit values here, then mirror the hex -> "R G B" conversion into
// global.css's :root / .dark / .light blocks by hand, since global.css is
// static CSS and can't import this file directly.

export const fonts = {
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

export const roundness = 2

export const lightColors = {
  background: '#FCFAF8',
  foreground: '#EDEAE6',
  typography: '#1B140C',
  typographyWashed: '#1B140C90',
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
} as const

export const darkColors = {
  background: '#221A11',
  foreground: '#332618',
  typography: '#FFFFFF',
  typographyWashed: '#FFFFFF90',
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
} as const

export const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
} as const

export const gap = (v: number) => v * 8
