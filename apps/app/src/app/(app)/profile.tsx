import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Linking, Platform, View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import { BaseView } from '../../components/common/BaseView'
import { LinkText } from '../../components/common/Text'
import { userQueryOptions } from '../../lib/api'
import { routes } from '../../lib/routes'

const logoutUrl = process.env.EXPO_PUBLIC_API_URL ?? '/'

export default function Profile() {
  const queryClient = useQueryClient()
  async function logout() {
    if (Platform.OS === 'web') {
      window.location.href = `${logoutUrl}/api/logout`
    } else {
      Linking.openURL(`${logoutUrl}/api/logout`)
    }
    queryClient.setQueryData(userQueryOptions.queryKey, null)
  }

  const { isPending, error, data } = useQuery(userQueryOptions)

  if (isPending) {
    return <Text variant="bodyMedium">Loading</Text>
  }
  if (error) {
    return 'not logged in ' + error.message
  }
  return (
    <BaseView title="Profile">
      <View>
        <Text variant="bodyMedium">
          Hello {data?.user.given_name + ' ' + data?.user.family_name}
        </Text>
      </View>
      <LinkText href={routes.home.href} label="Home Page" />
      <Button onPress={() => logout()}>Logout</Button>
    </BaseView>
  )
}
