import { Link, type Href } from 'expo-router'
import { Text } from 'react-native-paper'
import { useUnistyles } from 'react-native-unistyles'

export type LinkTextProps = {
  href: Href
  label: string
}

export function LinkText({ href, label }: LinkTextProps) {
  const { theme } = useUnistyles()
  return (
    <Link href={href}>
      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.accents.storm,
          textDecorationLine: 'underline',
        }}
      >
        {label}
      </Text>
    </Link>
  )
}
