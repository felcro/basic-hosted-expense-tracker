import { useKindeAuth } from '@kinde/expo'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Platform, View } from 'react-native'
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
  const kinde = useKindeAuth()

  async function logout() {
    if (Platform.OS === 'web') {
      window.location.href = `${apiUrl}/api/logout`
    } else {
      // Native holds its own Kinde token in secure storage; hitting the
      // server's /api/logout would only clear the web session cookie and leave
      // the app signed in.
      await kinde.logout({ revokeToken: true })
    }
    queryClient.setQueryData(userQueryOptions.queryKey, null)
  }

  const { isPending, error, data } = useQuery(userQueryOptions)

  if (error) {
    return 'not logged in ' + error.message
  }

  // Identity claims live on the id token, which never leaves the device, so on
  // native the server only knows the user's id (see /api/me). Fall back to the
  // locally-decoded profile rather than rendering empty strings.
  const user = data?.user
  const fullName = [user?.given_name, user?.family_name]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || user?.email || 'Signed in'

  return (
    <BaseView title="Profile">
      {!isPending && (
        <>
          <View>
            <HStack space="md" className="pb-4">
              <Avatar className="bg-accent-teal">
                <AvatarFallbackText className="text-white">
                  {displayName}
                </AvatarFallbackText>
                {user?.picture && (
                  <AvatarImage src={user.picture} alt={displayName} />
                )}
              </Avatar>
              <VStack>
                <Heading size="sm">{displayName}</Heading>
                {user?.email && <Text size="sm">{user.email}</Text>}
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
