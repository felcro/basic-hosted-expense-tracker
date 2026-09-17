import { expect, test } from '@jest/globals'
import { Platform } from 'react-native'

import { useExpenseStream } from '../src/lib/useExpenseStream'

// useExpenseStream.ts (web: EventSource) vs useExpenseStream.native.ts
// (expo/fetch stream). Asserting the function's source proves each project
// resolved its own implementation rather than sharing one.
test('resolves the platform implementation of useExpenseStream', () => {
  const src = useExpenseStream.toString()
  if (Platform.OS === 'web') {
    expect(src).toContain('EventSource')
  } else {
    expect(src).not.toContain('EventSource')
  }
})
