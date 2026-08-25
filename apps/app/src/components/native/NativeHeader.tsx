import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'

import {
  Appbar,
  AppbarBackAction,
  AppbarContent,
} from '../rnp-unistyles/Appbar'

type NativeHeaderProps = {
  title: string
}

export function NativeHeader({ title }: NativeHeaderProps) {
  const canGoBack = router.canGoBack()

  return (
    <Appbar style={styles.header}>
      {canGoBack && <AppbarBackAction onPress={() => router.back()} />}
      <AppbarContent title={title} />
    </Appbar>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.foreground,
  },
}))
