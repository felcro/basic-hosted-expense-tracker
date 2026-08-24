import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '../components/Text'

export default function About() {
  return (
    <View style={styles.container}>
      <Text variant="title">About</Text>
      <StatusBar style="auto" />
      <Link href="/">
        <Text variant="link" numberOfLines={1}>
          Home Page
        </Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create((themes) => ({
  container: {
    alignItems: 'center',
    backgroundColor: themes.colors.background,
    flex: 1,
    justifyContent: 'center',
    minWidth: '100%',
  },
}))
