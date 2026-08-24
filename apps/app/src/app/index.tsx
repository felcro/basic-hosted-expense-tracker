import { useState } from 'react'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '../components/Text'

export default function Home() {
  const [count, setCount] = useState<number>(0)

  return (
    <View style={styles.container}>
      <Text variant="title">Home</Text>
      {/* <StatusBar style="auto" /> */}
      <Text>{count}</Text>
      <Button onPress={() => setCount((count) => count + 1)}>Up</Button>
      <Button onPress={() => setCount((count) => count - 1)}>Down</Button>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
}))
