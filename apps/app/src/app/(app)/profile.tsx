import { useQuery } from '@tanstack/react-query'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

import { BaseView } from '../../components/common/BaseView'
import { LinkText } from '../../components/common/Text'
import { userQueryOptions } from '../../lib/api'
import { routes } from '../../lib/routes'

export default function Profile() {
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
    </BaseView>
  )
}
