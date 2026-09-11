import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Linking, Platform, View } from 'react-native'
import { Button } from 'react-native-paper'

import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'

import { BaseView } from '../../components/common/BaseView'
import { LinkText } from '../../components/common/Text'
import { apiUrl, userQueryOptions } from '../../lib/api'
import { routes } from '../../lib/routes'

export default function Profile() {
  const queryClient = useQueryClient()
  async function logout() {
    if (Platform.OS === 'web') {
      window.location.href = `${apiUrl}/api/logout`
    } else {
      Linking.openURL(`${apiUrl}/api/logout`)
    }
    queryClient.setQueryData(userQueryOptions.queryKey, null)
  }

  const { isPending, error, data } = useQuery(userQueryOptions)

  if (error) {
    return 'not logged in ' + error.message
  }

  return (
    <BaseView title="Profile">
      {!isPending && (
        <>
          <View>
            <HStack space="md" className="pb-4">
              <Avatar className="bg-accent-teal">
                <AvatarFallbackText className="text-white">
                  {data?.user?.given_name + ' ' + data?.user?.family_name}
                </AvatarFallbackText>
                {data?.user.picture && (
                  <AvatarImage
                    src={data.user.picture}
                    alt={data.user.given_name}
                  />
                )}
              </Avatar>
              <VStack>
                <Heading size="sm">
                  {data?.user?.given_name + ' ' + data?.user?.family_name}
                </Heading>
                <Text size="sm">{data?.user.email}</Text>
              </VStack>
            </HStack>
          </View>
          <LinkText href={routes.home.href} label="Home Page" />
          <Button onPress={() => logout()}>Logout</Button>
        </>
      )}
    </BaseView>
  )
}
