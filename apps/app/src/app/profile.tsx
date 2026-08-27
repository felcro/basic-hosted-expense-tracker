import { useQuery } from '@tanstack/react-query'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import { BaseView } from '../components/common/BaseView'
import { LinkText } from '../components/common/Text'
import { api } from '../lib/api'
import { routes } from '../lib/routes'

async function getCurrentUser() {
  const res = await api.me.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

export default function Profile() {
  const { isPending, error, data } = useQuery({
    queryKey: ['get-current-user'],
    queryFn: getCurrentUser,
  })

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
          Hello {data.user.given_name + ' ' + data.user.family_name}
        </Text>
      </View>
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
