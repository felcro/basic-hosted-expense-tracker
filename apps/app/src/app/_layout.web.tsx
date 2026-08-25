import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Slot } from 'expo-router'
import { StrictMode } from 'react'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { Navbar } from '../components/web/Navbar'
import { RouteList } from '../lib/routes'
import { paperDarkTheme, paperLightTheme } from '../theme/paperTheme'

export default function RootLayout() {
  const { rt } = useUnistyles()
  const paperTheme = rt.themeName === 'dark' ? paperDarkTheme : paperLightTheme

  // Query Client for the whole app
  const queryClient = new QueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <Navbar routeList={RouteList} />
          <Slot />
        </PaperProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
