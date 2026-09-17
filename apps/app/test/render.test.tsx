import { expect, test } from '@jest/globals'
import { render } from '@testing-library/react-native'
import { Text, View } from 'react-native'

// Native harness smoke test. RTL 14: render/fireEvent/renderHook/act are async
// and must be awaited.
//
// This file runs only on the native projects — the web project matches
// *.web.test.tsx and uses @testing-library/react instead. See test/README.md.
test('renders and queries RN primitives', async () => {
  const view = await render(
    <View>
      <Text>hello harness</Text>
    </View>,
  )
  expect(view.getByText('hello harness')).toBeTruthy()
})
