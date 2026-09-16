import { useKindeAuth } from '@kinde/expo'
import { useQueryClient } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { maybeCompleteAuthSession } from 'expo-web-browser'
import { Platform, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { BaseView } from '../components/common/BaseView'
import { apiUrl, userQueryOptions } from '../lib/api'
import { useSession } from '../lib/auth'

maybeCompleteAuthSession()

export default function SignIn() {
  const queryClient = useQueryClient()
  // useRedirectAuth(routes.home.href)
  const { isAuthenticated, isLoading } = useSession()
  const kinde = useKindeAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Redirect href="/" />
  }

  // Web authenticates server-side: the server owns the Kinde client secret and
  // sets a session cookie. Native can't use that flow (no safe place for a
  // secret, and the browser sheet's cookie jar is not the app's), so it runs
  // PKCE in-app via @kinde/expo and sends the resulting token as a bearer
  // header instead. See src/lib/api.ts.
  async function openAuthUrl(path: '/api/login' | '/api/register') {
    if (Platform.OS === 'web') {
      window.location.href = `${apiUrl}${path}`
      return
    }

    // `audience` must match an API registered in Kinde and authorized for this
    // application, otherwise the access token comes back with no `aud` claim
    // and the server can't tell the token was meant for this API.
    const options = { audience: process.env.EXPO_PUBLIC_KINDE_API_AUDIENCE }

    const result =
      path === '/api/login'
        ? await kinde.login(options)
        : await kinde.register(options)

    if (!result.success) {
      // oxlint-disable-next-line no-console
      console.error('Kinde auth failed:', result.errorMessage)
      return
    }

    queryClient.invalidateQueries({ queryKey: userQueryOptions.queryKey })
  }

  return (
    <BaseView contentStyles={styles.baseView}>
      <View style={styles.content}>
        <Button mode="contained" onPress={() => openAuthUrl('/api/login')}>
          Sign In
        </Button>
        <Button mode="outlined" onPress={() => openAuthUrl('/api/register')}>
          Create an account
        </Button>
        <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
          Sign in or create an account to view the expense tracker.
        </Text>
      </View>
    </BaseView>
  )
}

const styles = StyleSheet.create((theme) => ({
  baseView: {
    gap: theme.gap(2),
    paddingTop: theme.gap(4),
    paddingHorizontal: theme.gap(4),
    justifyContent: 'center',
  },
  content: {
    gap: theme.gap(1),
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: theme.gap(2),
  },
}))
