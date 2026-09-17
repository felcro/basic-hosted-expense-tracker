// Global test setup for apps/app. Keep this to concerns every test needs;
// per-test context belongs in test/helpers/render.tsx.

// jsdom (the web project's environment) implements neither matchMedia nor
// EventSource, and unistyles reads matchMedia at import time. Install this
// before the unistyles mock below pulls the library in.
//
// Plain no-op functions rather than jest.fn(): this package's tsconfig sets
// "types": [], so jest's ambient globals are not declared here and `jest.fn()`
// fails typecheck with "Cannot use namespace 'jest' as a value". Nothing
// asserts on these listeners, so stubs are sufficient. A test that needs to
// assert on them should build its own spy locally with `jest` imported from
// '@jest/globals'.
const noop = () => {}

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
      addListener: noop,
      removeListener: noop,
    }),
  })
}

// Unistyles v3 is a Nitro native module with no native runtime under Jest.
// This is the library's own supported mock entry point — it mocks both
// react-native-nitro-modules and react-native-unistyles. Do not hand-roll one.
//
// Note it registers an EMPTY theme registry, so useUnistyles() returns
// undefined and any component reading theme.colors.* throws. Registering the
// app's themes is the provider wrapper's job (test/helpers/render.tsx).
import 'react-native-unistyles/mocks'
