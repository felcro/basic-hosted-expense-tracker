# jest-expo setup for apps/app

**This harness is already installed, configured and verified** (2026-09-17, against Expo
SDK 57.0.22, React 19.2.3, RN 0.86.3). The config lives in the `jest` key of
`apps/app/package.json`, with `test/setup.ts` and `test/mocks/styleMock.js` alongside it.
Do not re-derive it. Read the API notes below before writing tests, and re-check versions
with `npm view <pkg> peerDependencies` after an SDK bump.

## Three projects, two renderers

Projects are `ios`, `android` and `web`. "Native" means **both** `ios` and `android` —
they are separate presets with separate resolution, not one combined target.

`jest-expo/web` aliases `react-native` → `react-native-web`, so components compile to real
DOM. RNTL's renderer rejects DOM nodes; RTL-react requires them. Native has no `document`.
So the renderer is chosen by filename, via `testMatch` / `testPathIgnorePatterns`:

| Filename         | Projects          | Library                         | Sync/async          |
| ---------------- | ----------------- | ------------------------------- | ------------------- |
| `*.web.test.tsx` | `web`             | `@testing-library/react`        | sync `render(...)`  |
| `*.test.tsx`     | `ios` + `android` | `@testing-library/react-native` | `await render(...)` |

Mixing them fails loudly: RTL-react on native gives `document is not defined`; RNTL on web
gives "Text strings must be rendered within a `<Text>` component".

### What each native project resolves

| Source file       | `ios`    | `android`   |
| ----------------- | -------- | ----------- |
| `foo.ios.tsx`     | resolved | ignored     |
| `foo.android.tsx` | ignored  | resolved    |
| `foo.native.ts`   | resolved | resolved    |
| `foo.ts`          | fallback | fallback    |
| `Platform.OS`     | `'ios'`  | `'android'` |

Verified from the presets: `jest-expo/ios` has
`haste.platforms: ['ios', 'native']` and `jest-expo/android` has `['android', 'native']`.

Consequences for writing tests:

- A `*.test.tsx` file runs **twice**, once per native platform. It must pass under both,
  so do not hard-code `Platform.OS === 'ios'` expectations.
- A `.native.*` file is shared, so one test covers both native platforms.
- An `.ios.*` or `.android.*` file is resolved by only one project, so it needs its
  assertions to hold under the project that resolves it and to be inert under the other.
- `Platform.select` with distinct `ios` / `android` values is genuinely exercised on both.

Today the codebase has no `.ios.*` or `.android.*` files, and `api.ts`'s `Platform.select`
gives `ios` and `android` the same value, so the two native runs currently assert the same
things. That will change the moment an Android-specific path is added, which is why the
project is configured now.

`apps/app/test/README.md` documents this for humans.

## RNTL 14 is async — the thing most likely to waste your time

In `@testing-library/react-native` v14, `render`, `fireEvent`, `renderHook` and `act` are
**all async** and must be awaited. Breaking change from v13.

```ts
const view = await render(<Component />)      // not: const view = render(...)
await fireEvent.press(view.getByText('Save'))
```

An un-awaited `render` returns a Promise with no query methods, and the failure reads
`view.getByText is not a function` or `render function has not been called`, neither of
which points at the cause.

`@testing-library/react` (the web side) is **not** async — plain `render(...)`, and it
registers its own auto-cleanup, verified to prevent DOM leaking between tests.

`test-renderer` (not the deprecated `react-test-renderer`) is RNTL 14's renderer peer.
`1.3.0` is installed and verified; the docs suggest matching the React minor, which would
be `1.2` for React 19.2. Not currently a problem.

## react-native-web query behaviour

`accessibilityRole` is what produces a semantic element. A `Pressable` with
`accessibilityRole="button"` renders as:

```html
<button aria-label="Delete expense" role="button" type="button">…</button>
```

so `getByRole('button')` and `getByLabelText(...)` both work. **Without** the role it is a
plain `div`, and only `getByLabelText` finds it. Treat a missing `accessibilityRole` as an
accessibility finding rather than reaching for `getByTestId`.

## Installed packages, and why these

`jest-expo@~57.0.5`, `jest`, `@testing-library/react-native`, `test-renderer`,
`@testing-library/react`, `@types/react-dom@~19.2.7`. Facts that matter on a version bump:

- **`jest-expo` tracks the Expo SDK major.** SDK 57 → `jest-expo@57`, which peers on
  `@react-native/jest-preset@^0.86.3` (matching RN 0.86.3).
- **`test-renderer`, not `react-test-renderer`** — the latter is deprecated; RNTL 14 peers
  on `test-renderer@^1`.
- **Never `@testing-library/jest-native`** — deprecated, matchers are built into RNTL 12+.
- `@testing-library/dom` arrives transitively, and `jest-environment-jsdom` is already a
  jest-expo dependency and already the web project's environment.
- **Pin `@types/react-dom` to the `@types/react` minor.** `19.3.x` demands
  `@types/react@^19.3.0` and warns otherwise.
- `jest` is 30.x while jest-expo's bundled `jest-environment-jsdom` is 29.7.0. That is
  jest-expo's own pinning and it works — do not "fix" it.

## Config

Read the `jest` key in `apps/app/package.json` for the live version. Each project carries:

- `preset` — `jest-expo/ios`, `jest-expo/android` or `jest-expo/web`, and `displayName` so
  failures name their platform. (`jest-expo/universal` runs all three in one preset;
  explicit projects are preferred so `displayName` and `--selectProjects` work.)
- `setupFilesAfterEnv` — `test/setup.ts`.
- `moduleNameMapper` — `\\.(css)$` to a style mock, because `_layout.tsx` imports
  `@/global.css` and Jest cannot parse CSS; plus `^@/app/(.*)$` → `src/$1` and
  `^@/(.*)$` → `$1` to mirror the `module-resolver` aliases in `babel.config.js`.
- `testMatch` / `testPathIgnorePatterns` — the filename split described above.
- `transformIgnorePatterns` — jest-expo's default extended with the packages this app adds.

The root `bun run --filter '*' test` picks up `"test": "jest"` automatically.

### transformIgnorePatterns

Extend jest-expo's default, never replace it — replacing it breaks Expo's own modules. The
current pattern additionally allows: `nativewind`, `react-native-css`,
`react-native-unistyles`, `@gluestack-ui/*`, `react-native-paper`,
`@react-native-vector-icons/*`, `react-native-reanimated`, `react-native-worklets`,
`standard-navigation`, `expo-router`.

`standard-navigation` is the non-obvious one: `expo-router` pulls it in and it ships
untranspiled ESM.

The symptom of a missing entry is `Must use import to load ES Module` or a syntax error on
`import`/`export` inside `node_modules`, and the error names the package. Add it and re-run.

## Setup file, as it stands

`apps/app/test/setup.ts` covers two global concerns:

1. **A `window.matchMedia` polyfill**, because jsdom does not implement it and unistyles
   reads it at import time. Uses plain no-op functions rather than `jest.fn()`: this
   package's tsconfig sets `"types": []`, so jest's ambient globals are undeclared and
   `jest.fn()` fails typecheck with "Cannot use namespace 'jest' as a value". A test
   needing a real spy should import `jest` from `@jest/globals` locally.
2. **`import 'react-native-unistyles/mocks'`** — the library's own supported mock entry
   point, which mocks both itself and `react-native-nitro-modules`. Unistyles v3 is a Nitro
   native module with no native runtime under Jest, so without this both projects fail
   (`Failed to get NitroModules` on native). Do not hand-roll a replacement.

Not yet mocked, and needed once real component tests start: `expo-router`,
`expo-secure-store`, `expo-web-browser`, `@kinde/expo`. Add them to `setup.ts` if global,
or to the provider wrapper if a test needs to vary them.

## Verify the setup before writing tests

Do this in order. Each step catches a different failure, and a later step passing does not
imply an earlier one did.

All five passed on 2026-09-17. Re-run them after any SDK, React or RTL bump; do not
re-derive them for ordinary test work.

1. **Both projects run.** Output shows `ios` and `web`, two suites not one, and
   `--selectProjects ios` / `--selectProjects web` each work. If only one appears, every
   platform claim afterwards is false.
2. **Platform resolution differs** between the projects.
3. **`.web`/`.native` resolution works.** `test/resolution.test.ts` covers this: it imports
   `src/lib/useExpenseStream` and asserts the web project got the `EventSource`
   implementation while native got the stream reader. This is the check that proves the
   single-preset silent-failure mode is gone.
4. **A real render works** on each project with its own renderer
   (`test/render.test.tsx`, `test/webrender.web.test.tsx`).
5. **Runs from the repo root**, not just inside `apps/app`.

Plus: the suite was run twice with identical results, and `bunx tsc --noEmit` is clean for
`test/`.

Current state: 3 suites, 4 tests, all passing. Those files are harness smoke tests — keep
them, they are what will catch a config regression.

## If it fights you

Stop after a couple of focused attempts and report the exact error. Per the repo's
`CLAUDE.md`, search online early for tooling and config problems — these are known,
documented issues with existing fixes, not puzzles to reason out from logs.

Do not accumulate speculative config changes. Do not reach for `--forceExit`,
`--detectOpenHandles` as a fix rather than a diagnostic, or a blanket
`transformIgnorePatterns: []`. Those hide the problem and produce a suite that fails
differently later.
