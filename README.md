# basic-hosted-expense-tracker

A small expense tracker built as a learning project for a full-stack, cloud-hosted app. Includes a Supabase Postgres database, auth (Kinde), cross-platform (mobile + web) client, served via a bun monorepo.

The web app is deployed on Clever Cloud and is live (sometimes) at:
https://app-0a0cf65d-c6fa-4bb5-86e8-0df9c595b8dc.cleverapps.io

## Tech stack

This project exists to develop my skills with things I haven't used before, trying to implement best practices along the way:

- **[Bun](https://bun.com)** — package manager for the whole monorepo. Chosen due to it's speed and simplicity. I've worked with npm and yarn a lot, so wanted to try something new. I'm a fan!
- **[Hono](https://hono.dev)** — the API server framework. Runs directly on `Bun.serve()` and it's a pleasure to work with. Generally it boasts speed and performance, but also is designed to run anywhere without modification, which is very appealing when starting work on a new project and you aren't fully sure where the tech stack will take you yet.
- **[Drizzle ORM](https://orm.drizzle.team)** + **Postgres** — schema, migrations (`drizzle-kit`), and queries against a hosted Supabase Postgres instance. Row/insert types are derived from the schema with `drizzle-zod`. I chose Drizzle over Prisma because it's another new and fast-rising technology, and integrates really nicely with typescript. Similar to QueryDSL in Java then way the query code is written, which is familiar. The real time type inference is great. It has made deploying to a PostgreSQL db in Supabase super straightforward and easy.
- **[Clever Cloud](https://www.clever-cloud.com)** — hosts the Bun server (API + built web app). Chose clever cloud since it is EU based, and a PaaS, and they are sustainable. I haven't worked with hosting application code by myself before, and there were so many to choose from... But I wanted to use an EU based option that was sustainable. I've found them super simple and easy to use. Originally I was going to use Clever Cloud also to host my db, but opted to go for Supabase in the end to broaden my horizons.
- **[Supabase](https://supabase.com)** — hosts the Postgres database. Using it as a managed Postgres box for now rather than any of its other features (auth, storage, realtime, edge functions), but it made spinning up a proper hosted db for a side project painless, connection string and all.
- **[Kinde](https://kinde.com)** — hosted authentication. On web the server handles the OAuth flow and stores the session in HTTP-only cookies; it never touches passwords directly. Native runs PKCE in-app and sends a bearer token instead (more on why below). I couldn't make my mind up between Kinde, Clerk, or Supabase Auth, so I went for Kinde because I found a nice tutorial for it 🙂 I will try out Supabase Auth in the next project.
- **[Hono RPC](https://hono.dev/docs/guides/rpc)** — the server exports its route types (`ApiRoutes`), and the client builds a fully-typed fetch client from them with `hono/client`. No manually-written API types or OpenAPI codegen. This makes fantastic type safety in code, saving lots of debugging time, and was chosen because it works very well in a monorepo. Originally I was planning on writing this server in Python, but seeing the possibilities with RPC and shared type safety was too tempting.
- **[Expo](https://expo.dev) / [Expo Router](https://docs.expo.dev/router/introduction/)** + **React Native** — one codebase targets iOS, Android, and web (via `react-native-web`). File-based routing. This was chosen since I plan on developing something for cross-platform soon, and wanted to try working with a framework that covers all 3. So far, so good!
- **[React Native Paper](https://reactnativepaper.com)** + **[react-native-unistyles](https://www.unistyles.dev)** — Material Design components and theming/styling across native and web. Haven't been a huge fan of react native paper with unistyles. I love the way unistyles works since I've used it before and I wanted to use a similar tech again, but it's tricky to get it working with react-native-paper in a consistent way, resulting in more boilerplate and messy styling code than I wanted.
- **[gluestack-ui v5](https://gluestack.io)** + **[NativeWind v5](https://www.nativewind.dev)** — added later, on purpose, alongside Paper rather than replacing it. Paper has no calendar or toast, and I wanted to try a Tailwind, shadcn model approach (copy and paste component code) to as an alternative to React-Native-Paper. Both styling systems now run side by side. Getting them to coexist was tricky — see "Two component libraries" below.
- **[TanStack Query](https://tanstack.com/query)** — server state, caching, and the session/auth query on the client. Seemed like the best choice for the application given I'm not using redux or Vercel, and it's the industry standard with lots of good tutorials. It's been nice and simple to utilise alongside react-hook-form.
- **[React Hook Form](https://react-hook-form.com)** + **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** — form state and validation on the expense form, wired up to the same Zod schemas the server validates against. Barely any re-renders, and reusing the Zod schema instead of writing separate form validation means I can centralise lots of definitions easily. I wanted to use tanstack form since I'm already using tanstack query, but some compatibility issues were reported with react native or Expo, so I opted for the old trusty react-hook-form instead.
- **[EAS](https://docs.expo.dev/eas/)** — cloud builds and OTA updates for the native apps, configured per-environment (development/preview/production) in `eas.json`.
- **[Zod](https://zod.dev)** — request validation on the server and shared types between client and server. I've found this to be a perfect tool to use in a typescript monorepo for easy type sharing across the board.
- **oxlint / oxfmt** — linting and formatting. Much much much faster than ESLint!

### How the code fits together

The Bun server does double work: it serves the Hono API under `/api/*` and also serves the built Expo web app as static files, so the whole thing deploys as a single service. Native builds (iOS/Android) talk to that same API over HTTPS, configured via `EXPO_PUBLIC_API_URL` per EAS build profile.

Types flow one way through the monorepo and never get hand-written twice. `packages/shared` holds the Zod schemas; the server validates request bodies against them with `zValidator`, the form validates against the same schemas via `zodResolver`, and the client's API types are inferred from the server's route definitions through Hono RPC. Change a field in one place and both ends fail to compile. Creating the monorepo from scratch and learning the associated intricacies was a bit of a learning curve.

## What this code does

A minimal expense tracker: sign in, log expenses with a title, amount and date, and see your running total and expense history. Each user only sees their own expenses, scoped by the Kinde user ID. This app isn't really about what it does, more about getting all the individual parts of a full-stack web & mobile app service working efficiently, securely, at a high-quality, all with the same codebase.

Throughout developing this I've been focussing on implementing good practice.

## Things I've implemented along the way

The interesting parts of this project were the parts I couldn't have expected when starting out. Roughly in the order I hit them:

**Two auth flows for one API.** Web was fairly simple: the server owns the Kinde client secret, runs the authorization-code flow, and sets HTTP-only session cookies. Native can't use that, and it took me a while to understand why. The auth browser sheet has its own cookie jar, so a cookie set during login never reaches the app's `fetch`, and there's nowhere safe to keep a client secret in a shipped app. So, native runs PKCE in-app via `@kinde/expo` and sends the access token as a bearer header. The server's `getUser` middleware tries the bearer token first and falls back to the cookie session, so every route works for both without knowing which client it's talking to.

**Verifying tokens properly.** Kinde's `validateToken` checks the RS256 signature against the domain's JWKS and nothing else, which I didn't realise at first. A valid signature only proves Kinde issued the token, not that it was issued for this API or that it's still current, so `kinde.ts` checks `iss`, `exp` and `aud` explicitly. Without the `exp` check a leaked token would be accepted forever.

**Token refresh with a single-flight guard.** Access tokens expire, and on a cold start several queries fire at once. Each would have kicked off its own refresh, but one would have been spending an already-rotated refresh token. There's now one shared in-flight refresh promise, a 60-second refresh-ahead threshold so a token can't lapse mid-request, and a failed refresh clears the stored session rather than retrying a token that can never work again.

**Unified 401 handling.** A session can lapse on any request, not just the one that loads it. Rather than every screen rendering its own "an error has occurred" dead end, a custom `UnauthorisedError` is thrown at the API layer and caught in the QueryClient's `QueryCache`/`MutationCache` `onError`, which clears the cached user and lets the route guards redirect to sign-in.

**CSRF that doesn't break native.** CSRF protection guards against a browser silently attaching _cookies_ to a cross-site request. A bearer token is never attached automatically, so the protection is inert for token-authenticated calls. Native also doesn't send `Origin` or `sec-fetch-site`, and Hono defaults a missing `Content-Type` to `text/plain`, which matches its form-submission check, so every bodyless non-safe request from native was getting a 403 before reaching its handler. A native `DELETE` sends no `Content-Type`, which is how I found this. The middleware now skips CSRF entirely for bearer-authenticated requests rather than exempting them by origin.

**Server-sent events for cross-device sync.** Add an expense on the phone and the browser tab updates without a manual refresh. The server keeps a registry of open SSE streams keyed by user ID and pushes an event after a successful insert or delete; the client invalidates the relevant TanStack Query keys on detection of this SSE. Web uses `EventSource`, and native has its own implementation reading the response stream by hand with reconnect backoff, since it needs to attach the bearer header. This also forced two fixes: `hono/compress` buffers a response to compress it, which held the stream's events back indefinitely, so the stream path is excluded from it, and Bun's per-request timeout (default ~10s) had to be disabled for that route.

Note - the subscriber registry lives in process memory, so it only works while the API runs as a single instance. Scale to >1 instance, and a client on instance A never hears about a write handled by instance B. Postgres `LISTEN`/`NOTIFY` would fix it by routing through the database both instances already share.

**Cache updates instead of refetches.** Creating an expense navigates immediately, writes a skeleton row into the cache as a loading placeholder, then splices the real row into the existing list on success. Deleting filters the row out of the cached list in `onSuccess`. Neither triggers a refetch, which is a very useful optimisation technique to know about for future projects. The create path reads the existing expenses _before_ posting, since otherwise the new row would be added to the cache automatically and manually, appearing twice.

**Web bundle compression.** The bundle was around 2 MB uncompressed and Clever Cloud wasn't compressing anything. Two layers now: `hono/compress` handles gzip per request, and a build-time script brotli-compresses every static asset at quality 11 and writes a `.br` alongside it. Brotli compresses the gzip by an additional ~20% here, but this is too slow to run per request, so the server serves the prebuilt `.br` when the browser accepts it and falls through to gzip otherwise.

**Lazy route loading.** Expo Router's `asyncRoutes` is enabled for web, so routes are split out of the initial bundle instead of all shipping up front. This does not apply to native, and further optimisations for the native (and incidentally, web) bundles include:

- Icon font subsetting. Currently it sits at 1.3mb (before compression) for all the ~7800 icons, and could reduce to only the 8 that have actually been used, utilising the python `fonttools` tool.
- Trying out zod/mini instead of the full zod, which would disallow zod method chaining and require manual imports of each method, but save up to 800kb before compression (50kb after compression).
- The `_common` bundle is larger than desired, but largely unavoidable due to this project being both web and native.

**Skeleton loading states.** A shimmer component built on `Animated` + `expo-linear-gradient`, used in the table while data is pending and for the optimistic create row. I haven't implemented `React.Suspense`, and this could be a nice future improvement to reduce the `if (isLoading)` calls.

**Two component libraries.** Paper + unistyles is the established layer; gluestack-ui v5 + NativeWind v5 was added for components Paper doesn't have, and also to try it out. Getting them to work together was tricky. NativeWind's babel plugin and unistyles' babel plugin both rewrite the same `View`/`Pressable`/`Text` imports from `react-native`, and whichever runs first silently breaks the other. NativeWind's import rewriting also transformed `react-native-web`'s own internal source, creating a circular import that threw at runtime on web only. And a `:root.dark` selector (which the gluestack docs suggest) is rejected by `react-native-css`'s native compiler and breaks Metro bundling on iOS and Android while bundling fine on web. The theme palette is intentionally duplicated between `themeTokens.ts` and `global.css` with no build step linking them, because there was no easy way to map them. Some VSCode plugins/config I found useful for the NativeWind styling:

- `Color Highlight` - enabled color highlighting in `global.css`, enabling easier colour selection. `"color-highlight.matchRgbWithNoFunction": true,` in VSCode `settings.json` was necessary config due to how NativeWind requires colours to be specified like `--primary: 216 97 5;`. Additionally, I've found that on the current version of NativeWind (`^5.0.0-rc.0`), the `className` divisors don't really work on native (mobile), e.g. `bg-primary/10` won't work, so the colour needs to be distinctly specified (see `createExpense.tsx:58-60`).
- `"editor.defaultColorDecorators": "always"` in VSCode `settings.json` was the fix to show color swatches in .ts files.
- `Change Color Format` - allowed me to easily convert HEX to the RGB format needed by NativeWind.

**Dependency resolution fixes.** `bunfig.toml` pins `install.linker = "hoisted"` and the root `package.json` overrides `metro` to a single version. The default linker leaves multiple physical copies of metro-adjacent packages installed at once, and several `apps/app` dependencies pull in different metro versions transitively, which breaks native and web bundling.

**Smaller things that took longer than expected.**

- Timestamps being stored and parsed inconsistently as UTC (I'm still not happy with the way this is done, as we can see lots of instances of `convertUTCToLocaleDate` throughout the codebase).
- Refreshing a page redirecting to home, which turned out to be `StrictMode`'s double-mount letting expo-router write its own surviving state back over the URL. Thankfully this is not an issue in production since `StrictMode` is disabled.
- The Gluestack-ui Toast & Calendar components crashing the VSCode ts server due to deeply nested component type inference.
- The Toast overlay preventing interactions on the native tab bar underneath it.
- Dark mode persistence, which needs `expo-secure-store` on native and different handling on web.

## Structure

This is a Bun workspace monorepo:

- [apps/app](apps/app) — the Expo/React Native client (iOS, Android, web)
- [apps/server](apps/server) — the Hono API server (also serves the built web client)
- [packages/db](packages/db) — Drizzle schema, migrations, and the Postgres client
- [packages/shared](packages/shared) — types and Zod schemas shared between server and client

Shared dependency versions (`hono`, `typescript`, `zod`, `drizzle-*`) are pinned once in the root `package.json`'s `workspaces.catalog` and referenced as `"catalog:"` everywhere else, so a bump happens in one place.

## Running

Locally:

```bash
bun install          # from the repo root
bun run dev          # API server with watch mode
bun run web          # Expo web dev server
bun run ios          # native iOS (needs a development build)
bun run android      # native Android
bun run build:web    # export the web bundle + brotli precompress
bun run lint         # oxfmt + oxlint
```

Native points at the deployed API even in development. Kinde only accepts a plain-HTTP redirect URI on `localhost`, and a phone or emulator can't reach the Mac's localhost, so a local native login has no valid callback URL. The trade-off is that anything created while testing on a device is real data. A workaround for this is to replace the dev api url to the machine's LAN IP address.

Env vars are documented per package in the respective `CLAUDE.md` files.

## Still to do

- **Tests.** There's no test suite yet, anywhere. This is the biggest gap in the project and the thing I'd want to fix first: the auth middleware's token verification and the SSE subscriber lifecycle in particular are exactly the kind of logic that should not be verified by hand.
- **Native bundle size.** The web bundle is now compressed and lazily loaded, but the native bundle hasn't had the same treatment. Needs profiling before guessing at fixes.
- **Test on a real iPhone.** Everything native so far has been a simulator, which papers over real-device issues like actual secure-store behaviour, background/foreground token refresh, and genuine network conditions.

## AI

I have tried to avoid using AI as much as possible whilst developing this app, since the whole point was to learn, not to just get Claude to generate code for me while I watch.

That being said, there are 3 edge cases where I relaxed this rule:

1. Generating boilerplate code I knew would take me a while to write but I know how to (e.g. creating React context).
2. Refactoring code I'd already written into different areas (e.g. splitting out React components I'd written into more generic functions - similar to the boilerplate thing really...)
3. When I was genuinely stuck with new concepts (e.g. auth, routing, design for mobile). This project has been a steep learning curve for me, and things like auth and hosting are tricky to get working the first time when you don't know what needs doing!

I've found this approach to be the most beneficial, treating AI throughout this project as more like a coach. If I get AI to write all the code for me, how can I ever know what is right or wrong in the future?

I've also used this project to skill up on good practice for agentic coding, MCP server utilisation, and defining robust claude context files. I plan on utilising Claude Code extensively for future projects, so implementing some of these workflows in areas I already understand was a new learning concept.

Don't get me wrong, I think AI coding tools are very powerful and I don't shy away from their use case. I just didn't want to use them much here in a learning project.

Also, coding is fun. Reviewing AI code is a lot less fun. So, I have had a lot more fun doing it this way 🙂
