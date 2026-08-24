import { Stack } from 'expo-router'
// import { StyleSheet } from 'react-native-unistyles'
import { PaperProvider } from 'react-native-paper'

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ddd' },
          headerTintColor: '#333',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
      </Stack>
    </PaperProvider>
  )
}

// const styles = StyleSheet.create((theme) => ({
//   rootLayout: {
//     alignItems: 'center',
//     backgroundColor: theme.colors.background,
//     flex: 1,
//     justifyContent: 'center',
//   },
// }))
