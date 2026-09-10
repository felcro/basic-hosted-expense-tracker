# basic-hosted-expense-tracker

Bun workspace monorepo.

## IMPORTANT

YOU MUST NEVER access any .env files, as these are secrets. Environment variable names are defined in the respective package CLAUDE.md files. If the values in .env are required for debugging at any point, ALWAYS ask the user to manually provide them first.

## Structure

- `apps/app` — Expo/React Native mobile app (see `apps/app/CLAUDE.md`)
- `apps/server` — backend API (see `apps/server/CLAUDE.md`)
- `packages/db` — database layer (see `packages/db/CLAUDE.md`)
- `packages/shared` — code shared across `apps/*` (see `packages/shared/CLAUDE.md`)

Dependency versions shared across packages (e.g. `hono`, `typescript`, `zod`, etc...) are pinned once in this root `package.json`'s `workspaces.catalog` and referenced as `"catalog:"` in each package's own `package.json`. When bumping one of these, edit the catalog entry here, not the individual package.

## Package manager

Use Bun, not npm/yarn/pnpm, everywhere in this repo:

- `bun install` — install dependencies (run from repo root)
- `bun run <script>` — run a package.json script
- `bun run --filter '*' <script>` — run a script across every workspace package that defines it
- `bunx <package>` — one-off package execution instead of `npx`

`bunfig.toml` sets `install.linker = "hoisted"`. This is required, not optional — the default linker leaves multiple physical copies of some transitive dependencies (metro, react-native-web-adjacent packages) installed simultaneously, which breaks Metro bundling in `apps/app`. Do not remove it without re-verifying the app still bundles on web and native.

`package.json` has an `overrides.metro` pin (currently `0.84.5`). Several dependencies in `apps/app` pull in different versions of `metro` transitively; without the override, Bun installs multiple incompatible copies side by side and native/web bundling breaks with `Bundler` class-identity mismatches. Keep this pinned to whatever version `@expo/metro-runtime` and `metro-config` in `apps/app` actually declare — check both before changing it.

## Running scripts

Every time you start a server within a session, stop the server process once you have finished using it so the user can run the server on the expected port. Do not claim the server has stopped without verifying the process has been killed.

## Linting & formatting

- `bun run lint` — oxfmt + oxlint
- `bun run lint:fix` — same, with autofix
- `bun run fmt` — oxfmt only

Config: `oxlint.config.ts`, `oxfmt.config.ts` at repo root.
