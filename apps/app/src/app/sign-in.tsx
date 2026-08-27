import { useQueryClient } from '@tanstack/react-query'
import { createURL } from 'expo-linking'
import { Redirect } from 'expo-router'
import {
  maybeCompleteAuthSession,
  openAuthSessionAsync,
} from 'expo-web-browser'
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

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Redirect href="/" />
  }

  async function openAuthUrl(path: '/api/login' | '/api/register') {
    if (Platform.OS === 'web') {
      window.location.href = `${apiUrl}${path}`
      return
    }

    const appRedirect = createURL('/')
    const url = `${apiUrl}${path}?app_redirect=${encodeURIComponent(appRedirect)}`
    await openAuthSessionAsync(url, appRedirect)
    queryClient.invalidateQueries({ queryKey: userQueryOptions.queryKey })
  }

  return (
    <BaseView title="Sign In" contentStyles={styles.content}>
      <Text variant="bodyMedium">You need to sign in to view this page.</Text>
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => openAuthUrl('/api/login')}>
          Sign In
        </Button>
        <Button mode="outlined" onPress={() => openAuthUrl('/api/register')}>
          Create an account
        </Button>
      </View>
    </BaseView>
  )
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.gap(2),
    paddingTop: theme.gap(4),
  },
  actions: {
    gap: theme.gap(1),
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: theme.gap(2),
  },
}))
