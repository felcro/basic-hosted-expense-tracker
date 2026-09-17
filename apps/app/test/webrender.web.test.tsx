import { expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Pressable, Text, View } from 'react-native'

// On the web project `react-native` is aliased to `react-native-web`, so these
// compile to real DOM nodes and @testing-library/react can render them.
test('renders RN primitives as DOM via react-native-web', () => {
  render(
    <View>
      <Text>hello web harness</Text>
    </View>,
  )
  expect(screen.getByText('hello web harness')).toBeTruthy()
})

// accessibilityLabel maps to aria-label. accessibilityRole is what produces a
// real <button> element; without it Pressable renders a plain div and
// getByRole('button') finds nothing.
test('accessibility queries work against the DOM output', () => {
  render(
    <Pressable
      accessibilityLabel="Delete expense"
      accessibilityRole="button"
      onPress={() => {}}
    >
      <Text>x</Text>
    </Pressable>,
  )
  expect(screen.getByLabelText('Delete expense')).toBeTruthy()
  expect(screen.getByRole('button')).toBeTruthy()
})
