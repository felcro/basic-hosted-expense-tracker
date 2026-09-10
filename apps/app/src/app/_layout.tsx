import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StrictMode, useState } from 'react'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import '@/global.css'

import { SessionProvider } from '../lib/auth'
import { SplashScreenController } from '../lib/splash'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

export default function Root() {
  // Query Client for the whole app, created once and reused across renders
  const [queryClient] = useState(() => new QueryClient())

  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <PaperProvider theme={paperTheme}>
            <GluestackUIProvider mode={rt.themeName}>
              <SplashScreenController />
              <Stack>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              </Stack>
            </GluestackUIProvider>
          </PaperProvider>
        </SessionProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
