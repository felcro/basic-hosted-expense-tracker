import { KindeAuthProvider } from '@kinde/expo'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StrictMode, useState } from 'react'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import '@/global.css'

import { UnauthorisedError, userQueryOptions } from '../lib/api'
import { SessionProvider } from '../lib/auth'
import { SplashScreenController } from '../lib/splash'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

/**
 * A session can lapse on any request, not just the one that loads it — on
 * native the access token expires and, if it can't be refreshed, every
 * subsequent call is rejected. Clearing the cached user here makes the route
 * guards redirect to sign-in, rather than each screen rendering its own
 * "an error has occurred" dead end.
 */
function createQueryClient() {
  // `onError` only runs after a request settles, by which point `client` is
  // assigned — so the closure can capture it before the constructor returns.
  const onError = (error: unknown) => {
    if (error instanceof UnauthorisedError) {
      client.setQueryData(userQueryOptions.queryKey, null)
    }
  }

  const client = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
  })

  return client
}

export default function Root() {
  // Query Client for the whole app, created once and reused across renders
  const [queryClient] = useState(createQueryClient)

  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme

  return (
    <StrictMode>
      <KindeAuthProvider
        config={{
          domain: process.env.EXPO_PUBLIC_KINDE_DOMAIN,
          clientId: process.env.EXPO_PUBLIC_KINDE_CLIENT_ID,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <PaperProvider theme={paperTheme}>
              <GluestackUIProvider mode={rt.themeName}>
                <SplashScreenController />
                <Stack>
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="sign-in"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </GluestackUIProvider>
            </PaperProvider>
          </SessionProvider>
        </QueryClientProvider>
      </KindeAuthProvider>
    </StrictMode>
  )
}
