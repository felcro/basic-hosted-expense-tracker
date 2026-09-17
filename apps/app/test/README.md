# apps/app tests

Three jest projects run from the `jest` key in `../package.json`: `ios`, `android` and
`web`. Which projects pick up a file is decided by its **filename**.

| Filename         | Runs on             | Renderer                        |
| ---------------- | ------------------- | ------------------------------- |
| `*.web.test.tsx` | `web` only          | `@testing-library/react`        |
| `*.test.tsx`     | `ios` and `android` | `@testing-library/react-native` |

The native projects ignore `*.web.test.*`, so a file never runs under both renderers.

## What each native project resolves

`jest-expo/ios` and `jest-expo/android` are separate presets with separate module
resolution, and the difference matters:

| Source file       | `ios` project | `android` project |
| ----------------- | ------------- | ----------------- |
| `foo.ios.tsx`     | resolved      | ignored           |
| `foo.android.tsx` | ignored       | resolved          |
| `foo.native.ts`   | resolved      | resolved          |
| `foo.ts`          | fallback      | fallback          |
| `Platform.OS`     | `'ios'`       | `'android'`       |

So a `*.test.tsx` file runs **twice**, once per native platform, and a `Platform.OS`
branch or an `.ios`/`.android` file is genuinely exercised on both. Running only `ios`
would silently skip every Android-specific path.

Today this codebase has no `.ios.*` or `.android.*` files and one `Platform.select` whose
`ios` and `android` values are identical, so the two native runs currently assert the same
things. The android project is configured anyway: the cost is ~0.3s, and the alternative is
an Android path that ships untested the first time someone adds one.

## Why two renderers

`jest-expo/web` aliases `react-native` to `react-native-web`, so components compile to real
DOM nodes. RNTL's renderer rejects those — a `<Text>` becomes a `<div>` and it throws
"Text strings must be rendered within a `<Text>` component". `@testing-library/react`
renders them correctly because they are just DOM.

Native has no DOM (`document is not defined`), so the reverse applies: RTL-react cannot run
there.

## Shared behaviour

A test that is genuinely platform-agnostic and does not render (pure logic, module
resolution) can live in a plain `*.test.ts` and will run on `ios` only. If it must run on
both, either duplicate it or move the logic to a package tested with `bun:test`.

## Gotchas

- **RNTL 14 is async**: `await render(...)`, `await fireEvent.press(...)`. An un-awaited
  render fails with `view.getByText is not a function`.
- **RTL-react is sync**: `render(...)` with no await. Auto-cleanup between tests is
  registered automatically; no `afterEach` needed.
- **`accessibilityRole` is what creates a real element on web.** `<Pressable>` with
  `accessibilityRole="button"` becomes `<button role="button">` and `getByRole('button')`
  finds it. Without it, `Pressable` is a plain `div` and only `getByLabelText` works.
- **Unistyles mocks register no themes.** `useUnistyles()` returns undefined, so any
  component reading `theme.colors.*` throws until the provider wrapper registers the app's
  themes.
