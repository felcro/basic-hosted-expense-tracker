import { StyleSheet } from 'react-native-unistyles'

import { Appbar, AppbarContent } from '../rnp-unistyles/Appbar'

type NativeHeaderProps = {
  title: string
}

export function NativeHeader({ title }: NativeHeaderProps) {
  // Removed for now as it can be buggy.
  // const canGoBack = router.canGoBack()

  return (
    <Appbar style={styles.header}>
      {/* {canGoBack && <AppbarBackAction onPress={() => router.back()} />} */}
      <AppbarContent title={title} style={styles.text} />
    </Appbar>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.foreground,
  },
  text: {
    alignItems: 'center',
  },
}))
