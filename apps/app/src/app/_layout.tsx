import { Stack } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

export default function RootLayout() {
  const { theme, rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme

  return (
    <PaperProvider theme={paperTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.foreground },
          headerTintColor: theme.colors.typography,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact' }} />
      </Stack>
    </PaperProvider>
  )
}
