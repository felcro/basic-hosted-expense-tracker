import type { ReactNode } from 'react'

import { View, type ViewProps } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  baseView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
  },
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
}))

export type BaseViewProps = {
  title: string
  children?: ReactNode
  contentStyles?: ViewProps['style']
}

export function BaseView({ title, children, contentStyles }: BaseViewProps) {
  return (
    <View style={styles.baseView}>
      <View style={styles.header}>
        <Text variant="headlineLarge">{title}</Text>
      </View>
      <View style={[styles.container, contentStyles && contentStyles]}>
        {children}
      </View>
    </View>
  )
}
