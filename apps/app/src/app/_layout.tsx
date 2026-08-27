import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StrictMode, useState, type ReactNode } from 'react'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { SessionProvider } from '../lib/auth'
import { SplashScreenController } from '../lib/splash'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

function ThemedPaperProvider({ children }: { children: ReactNode }) {
  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme
  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>
}

export default function Root() {
  // Query Client for the whole app, created once and reused across renders
  const [queryClient] = useState(() => new QueryClient())
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemedPaperProvider>
            <SplashScreenController />
            <Stack>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            </Stack>
          </ThemedPaperProvider>
        </SessionProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
