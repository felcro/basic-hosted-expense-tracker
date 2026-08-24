import { Link } from 'expo-router'
import { useState } from 'react'
// import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { Avatar, Button, Card, Switch, Text } from 'react-native-paper'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'

export default function Home() {
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [themeToggle, setThemeToggle] = useState(false)

  return (
    <View style={styles.container}>
      <Switch
        value={themeToggle}
        onValueChange={() => {
          setThemeToggle(!themeToggle)
          UnistylesRuntime.setTheme(themeToggle ? 'light' : 'dark')
        }}
      />
      <Text variant="headlineLarge">Home</Text>
      <Card>
        <Card.Title
          title="Total Spent"
          subtitle="The total amount you've spent"
          left={(props) => <Avatar.Icon {...props} icon="folder" />}
        />
        <Card.Content>
          <Text>{totalSpent}</Text>
        </Card.Content>
        <Card.Actions>
          <Button
            icon="arrow-down-thin"
            onPress={() => setTotalSpent((totalSpent) => totalSpent - 1)}
          >
            Down
          </Button>
          <Button
            icon="arrow-up-thin"
            onPress={() => setTotalSpent((totalSpent) => totalSpent + 1)}
          >
            Up
          </Button>
        </Card.Actions>
      </Card>
      <Text>
        <Link href="/about">About Page</Link>
      </Text>
      <Text>
        <Link href="/contact">Contact Page</Link>
      </Text>
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
