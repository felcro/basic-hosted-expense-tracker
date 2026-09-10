import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StrictMode, useState, type ReactNode } from 'react'
import { PaperProvider } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import '@/global.css'

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
            <GluestackUIProvider mode={useUnistyles().rt.themeName}>
              <SplashScreenController />
              <Stack>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              </Stack>
            </GluestackUIProvider>
          </ThemedPaperProvider>
        </SessionProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

/*
CLAUDE.MD GENERATION PROMPT FOR THE gluestack-ui chat. 
Please now thoroughly populate the claude.md files across this project. That means a top level one, and then one in each package of the monorepo, so app, server, db, shared. I could use the /init command here, which is what's generally stated as good practice online, but I'd like you to make use of the additional context you've discovered throughout this chat so far as well. Keep the content short, concise, direct, and to the point. No fluff. the context file needs to be as clear and technical and to the point as possible, to make sure I don't have to repeat myself in the future, or spend additional tokens working on understanding the repository. 

V2
Okay, so now let's go back to populating the relevant CLAUDE.md files. Remember what you previously discovered about them and how they should be written and how they work. 
I could use the /init command here, which is what's generally stated as good practice online, but I'd like you to make use of the additional context you've discovered throughout this chat so far as well. Keep the content short, concise, direct, and to the point. No fluff. the context file needs to be as clear and technical and to the point as possible, to make sure I don't have to repeat myself in the future, or spend additional tokens working on understanding the repository. 

Let's work through these 1 at a time. Let's first start
*/
