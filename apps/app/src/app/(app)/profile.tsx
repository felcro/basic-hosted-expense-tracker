import { useKindeAuth } from '@kinde/expo'
import { getUserProfile } from '@kinde/expo/utils'
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

  // Identity claims (name, email, picture) live on the id token, which stays on
  // the device — the server authenticates natively with the *access* token and
  // so only knows the user's id (see /api/me). Read the local copy instead of
  // sending the id token to the API just to have it echoed back.
  const { data: localProfile } = useQuery({
    queryKey: ['kinde-user-profile'],
    queryFn: getUserProfile,
    enabled: Platform.OS !== 'web',
    staleTime: Infinity,
  })

  if (error) {
    return 'not logged in ' + error.message
  }

  // Normalise the two sources to one shape: the server returns snake_case
  // claims, `getUserProfile` returns camelCase.
  const user = data?.user
  const profile = {
    givenName: user?.given_name ?? localProfile?.givenName,
    familyName: user?.family_name ?? localProfile?.familyName,
    email: user?.email ?? localProfile?.email,
    picture: user?.picture ?? localProfile?.picture,
  }
  const fullName = [profile.givenName, profile.familyName]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || profile.email || 'Signed in'

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
                {profile.picture && (
                  <AvatarImage src={profile.picture} alt={displayName} />
                )}
              </Avatar>
              <VStack>
                <Heading size="sm">{displayName}</Heading>
                {profile.email && <Text size="sm">{profile.email}</Text>}
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
