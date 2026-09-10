This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
bunx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
bunx expo start              # start the dev server
bunx expo lint               # lint
bunx tsc --noEmit            # typecheck
bunx expo-doctor             # diagnose dependency and config issues
bunx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck at the very end of a multi-edit task, not after each fix. No test suite exists in this package yet — don't assume `bun test` finds anything here.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `bunx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `bunx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Styling: two systems, not one — read this before styling anything

This app runs **two component libraries and two styling systems side by side**, deliberately, not as a migration-in-progress:

|                  | Existing UI                                                   | New UI (gluestack-ui v5)                              |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| Component source | `react-native-paper`                                          | `components/ui/*` (gluestack, CLI-generated)          |
| Styling          | `react-native-unistyles` (`StyleSheet.create`, theme objects) | NativeWind v5 `className` (Tailwind v4, CSS-first)    |
| Theme source     | `src/theme/themeTokens.ts`                                    | `global.css` (`@theme inline`, CSS custom properties) |

**`.agents/skills/gluestack-ui-v5/*` assumes a pure-gluestack project** ("always use Gluestack over RN primitives," "className only, never StyleSheet") — that guidance applies **only inside `components/ui/*` and any new screen/component you build primarily from gluestack components**. It does not apply to existing Paper/unistyles code. Don't "fix" `rnp-unistyles/*` or `common/*` components to use gluestack patterns; don't rewrite gluestack components to use unistyles. Match whichever system the file you're editing already uses.

### Why two systems

`react-native-paper` + unistyles is the established, working UI layer (most of `src/components/` and every current screen). gluestack-ui v5 was added specifically for components Paper doesn't have (Calendar, Menu, etc.) and to evaluate it going forward. Getting the two to coexist required real, non-obvious fixes — both NativeWind v5 and UniWind hit upstream bugs during install (circular imports in `react-native-web`; a babel plugin import-rewrite conflict where NativeWind's plugin and unistyles' plugin both rewrite the same `View`/`Pressable`/`Text` imports from `'react-native'`, and whichever runs first wins, silently breaking the other). Both are worked around in `babel.config.js` (see its inline comments) and `metro.config.js`. The root-level `metro` version override and `hoisted` Bun linker (see root `CLAUDE.md`) were also required to get here. Don't "clean up" any of these four places without understanding why each piece is there first.

### Theme tokens are duplicated on purpose, keep them in sync manually

`src/theme/themeTokens.ts` (hex colors, fonts, breakpoints) is the source of truth for the unistyles/Paper side. `global.css`'s CSS custom properties (`--primary`, `--background`, etc., as space-separated `R G B` triplets) are gluestack's copy of the same palette, mapped by _meaning_ not name (e.g. `tint` → `--primary`, `typography` → `--foreground`, `foreground` — a surface color in `themeTokens.ts` — → `--card`, not `--foreground`). There is no build step linking them and no single mapping table — each `global.css` variable has an inline comment naming its `themeTokens.ts` source. Changing a color means editing both files.

### `components/ui/*` is CLI-generated, but editing it is normal and expected

Already present: `calendar`, `menu`, `icon`, `gluestack-ui-provider`. Add more via `bunx gluestack-ui add <component>` — check this list first so you don't re-add one that already exists.

Editing these files directly is fine and expected — this is how project-specific styling gets applied to gluestack's base components, not something to avoid. Tailwind `className` strings live in each component's `index.tsx` (inline on the JSX) or a sibling `styles.ts`/`styles.tsx` (`tva()` variant definitions), depending on the component — check both before assuming a style isn't there. Editing base component styles here (not just usage-site overrides) is the normal way to change a component's default look project-wide.

This directory is excluded from `tsconfig.json` and remapped to `plaintext` in `.vscode/settings.json` (editor-hang workaround, gluestack-ui#3438) — don't remove either.

### Component library conventions

- `src/components/rnp-unistyles/*` — thin `withUnistyles(RNPComponent)` wrappers giving a `react-native-paper` component unistyles theming (see `Switch.tsx`, `Appbar.tsx`, `Card.tsx`, `DataTable.tsx`). When you need a themed Paper component not yet wrapped here, add the wrapper here rather than calling `withUnistyles` inline at the use site.
- `src/components/common/*` — cross-platform components not tied to either UI library specifically (`Table.tsx`, `Text.tsx`, `TextInput.tsx`, `BaseView.tsx`, `SkeletonBone.tsx`).
- `src/components/native/*` vs `src/components/web/*` — platform-specific component implementations for the same UI concern (e.g. `NativeHeader.tsx` vs `Navbar.tsx`). Separate from Expo Router's `.web.tsx` filename convention used for whole route files (see `src/app/(app)/_layout.web.tsx`).

## Structure

- `src/app/` — Expo Router routes (see AGENTS.md above); `(app)/` is the authenticated route group.
- `src/lib/routes.ts` — single source of truth for route metadata (`name`/`href`/`label`); imported directly by `Navbar.tsx`, `_layout.tsx`/`_layout.web.tsx`, and individual `(app)/*.tsx` screens for labels and navigation targets. Add a new screen's route here, not just as a file under `src/app/`.
- `src/lib/api.ts` — Hono RPC client (`hc<ApiRoutes>`) typed against `@basic-hosted-expense-tracker/server`'s route types. `apiUrl` is empty-string when `EXPO_PUBLIC_API_URL` is unset (same-origin deploy), never `'/'` — see the comment for why.
- `src/lib/auth.tsx` — `SessionProvider`/`useSession`, backed by a `react-query` query against `/api/me` (`userQueryOptions` in `api.ts`).
- `src/theme/unistyles.ts` — unistyles `StyleSheet.configure()` call; imports raw values from `themeTokens.ts`.
- `src/theme/paperTheme.ts` — derives `react-native-paper`'s MD3 theme from the same unistyles theme object, so Paper and unistyles-styled components always match.

## Environment variables

- `EXPO_PUBLIC_API_URL` — backend API base URL. `EXPO_PUBLIC_*` prefix is required for Expo to inline it into the client bundle; see `src/lib/api.ts`.

Per the repo root `CLAUDE.md`: never read `.env` files directly. Ask the user for values if needed for debugging.
