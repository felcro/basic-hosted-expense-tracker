import type { ReactNode } from 'react'

import { ScrollView, View, type ViewProps } from 'react-native'
import { Text } from 'react-native-paper'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  baseView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  baseViewContent: {
    flexGrow: 1,
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
    paddingBottom: theme.gap(6),
  },
}))

export type BaseViewProps = {
  title: string
  children?: ReactNode
  contentStyles?: ViewProps['style']
}

export function BaseView({ title, children, contentStyles }: BaseViewProps) {
  return (
    <ScrollView
      style={styles.baseView}
      contentContainerStyle={styles.baseViewContent}
    >
      <View style={styles.header}>
        <Text variant="headlineLarge">{title}</Text>
      </View>
      <View style={[styles.container, contentStyles && contentStyles]}>
        {children}
      </View>
    </ScrollView>
  )
}
