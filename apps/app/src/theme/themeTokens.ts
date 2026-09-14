// Shared raw token values consumed by both react-native-unistyles
// (unistyles.ts) and the gluestack-ui / NativeWind theme (global.css).
// Edit values here, then mirror the hex -> "R G B" conversion into
// global.css's :root, @media (prefers-color-scheme: dark), .dark and .light
// blocks by hand, since global.css is static CSS and can't import this file
// directly.

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
  background: 'rgb(251, 250, 247)',
  foreground: 'rgb(255, 255, 255)',
  typography: 'rgb(21, 26, 31)',
  typographyWashed: 'rgba(21, 26, 31, 0.6)',
  dimmed: 'rgb(230, 230, 230)',
  tint: 'rgb(216, 97, 5)',
  activeTint: 'rgb(21, 26, 31)',
  link: 'rgb(0, 121, 122)',
  accents: {
    yellow: 'rgb(246, 229, 141)',
    coral: 'rgb(231, 123, 96)',
    red: 'rgb(218, 43, 42)',
    lime: 'rgb(186, 220, 88)',
    teal: 'rgb(55, 159, 149)',
  },
} as const

export const darkColors = {
  background: 'rgb(22, 22, 22)',
  foreground: 'rgb(30, 30, 30)',
  typography: 'rgb(240, 240, 240)',
  typographyWashed: 'rgba(236, 235, 231, 0.6)',
  dimmed: 'rgb(30, 34, 38)',
  tint: 'rgb(243, 130, 48)',
  activeTint: 'rgb(240, 240, 240)',
  link: 'rgb(79, 198, 198)',
  accents: {
    yellow: 'rgb(249, 202, 36)',
    coral: 'rgb(218, 110, 90)',
    red: 'rgb(233, 80, 77)',
    lime: 'rgb(106, 176, 76)',
    teal: 'rgb(56, 170, 159)',
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
