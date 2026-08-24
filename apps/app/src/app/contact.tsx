import { Link } from 'expo-router'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

export default function About() {
  return (
    <View style={styles.container}>
      <Text>Contact</Text>
      <Link href="/">
        <Text numberOfLines={1}>Home Page</Text>
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
