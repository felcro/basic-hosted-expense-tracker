# basic-hosted-expense-tracker

A small expense tracker built as a learning project for a full-stack, cloud-hosted app. Includes a Supabase Postgres database, auth (Kinde), cross-platform (mobile + web) client, served via a bun monorepo.

## Tech stack

This project exists to develop my skills with things I haven't used before, trying to implement best practices along the way:

- **[Bun](https://bun.com)** — package manager for the whole monorepo. Chosen due to it's speed and simplicity. I've worked with npm and yarn a lot, so wanted to try something new. I'm a fan!
- **[Hono](https://hono.dev)** — the API server framework. Runs directly on `Bun.serve()` and it's a pleasure to work with. Generally it boasts speed and performance, but also is designed to run anywhere without modification, which is very appealing when starting work on a new project and you aren't fully sure where the tech stack will take you yet.
- **[Drizzle ORM](https://orm.drizzle.team)** + **Postgres** — schema, migrations (`drizzle-kit`), and queries against a hosted Supabase Postgres instance. Row/insert types are derived from the schema with `drizzle-zod`. I chose Drizzle over Prisma because it's another new and fast-rising technology, and integrates really nicely with typescript. Similar to QueryDSL in Java then way the query code is written, which is familiar. The real time type inference is great. It has made deploying to a PostgreSQL db in Supabase super straightforward and easy.
- **[Clever Cloud](https://www.clever-cloud.com)** — hosts the Bun server (API + built web app). Chose clever cloud since it is EU based, and a PaaS, and they are sustainable. I haven't worked with hosting application code by myself before, and there were so many to choose from... But I wanted to use an EU based option that was sustainable. I've found them super simple and easy to use. Originally I was going to use Clever Cloud also to host my db, but opted to go for Supabase in the end to broaden my horizons.
- **[Supabase](https://supabase.com)** — hosts the Postgres database. Using it as a managed Postgres box for now rather than any of its other features (auth, storage, realtime, edge functions), but it made spinning up a proper hosted db for a side project painless, connection string and all.
- **[Kinde](https://kinde.com)** — hosted authentication. The server handles the OAuth flow and stores the session in an HTTP-only cookie; it never touches passwords directly. I couldn't make my mind up between Kinde, Clerk, or Supabase Auth, so I went for Kinde because I found a nice tutorial for it 🙂 I will try out Supabase Auth in the next project.
- **[Hono RPC](https://hono.dev/docs/guides/rpc)** — the server exports its route types (`ApiRoutes`), and the client builds a fully-typed fetch client from them with `hono/client`. No manually-written API types or OpenAPI codegen. This makes fantastic type safety in code, saving lots of debugging time, and was chosen because it works very well in a monorepo. Originally I was planning on writing this server in Python, but seeing the possibilities with RPC and shared type safety was too tempting.
- **[Expo](https://expo.dev) / [Expo Router](https://docs.expo.dev/router/introduction/)** + **React Native** — one codebase targets iOS, Android, and web (via `react-native-web`). File-based routing. This was chosen since I plan on developing something for cross-platform soon, and wanted to try working with a framework that covers all 3. So far, so good!
- **[React Native Paper](https://reactnativepaper.com)** + **[react-native-unistyles](https://www.unistyles.dev)** — Material Design components and theming/styling across native and web. Haven't been a huge fan of react native paper with unistyles. I love the way unistyles works since I've used it before and I wanted to use a similar tech again, but it's tricky to get it working with react-native-paper in a consistent way, resulting in more boilerplate and messy styling code than I wanted. I think next time I will try a different component library or try the shadcn ui approach.
- **[TanStack Query](https://tanstack.com/query)** — server state, caching, and the session/auth query on the client. Seemed like the best choice for the application given I'm not using redux or Vercel, and it's the industry standard with lots of good tutorials. It's been nice and simple to utilise alongside react-hook-form.
- **[React Hook Form](https://react-hook-form.com)** + **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** — form state and validation on the expense form, wired up to the same Zod schemas the server validates against. Barely any re-renders, and reusing the Zod schema instead of writing separate form validation means I can centralise lots of definitions easily. I wanted to use tanstack form since I'm already using tanstack query, but some compatibility issues were reported with react native or Expo, so I opted for the old trusty react-hook-form instead.
- **[EAS](https://docs.expo.dev/eas/)** — cloud builds and OTA updates for the native apps, configured per-environment (development/preview/production) in `eas.json`.
- **[Zod](https://zod.dev)** — request validation on the server and shared types between client and server. I've found this to be a perfect tool to use in a typescript monorepo for easy type sharing across the board.
- **oxlint / oxfmt** — linting and formatting. Much much much faster than ESLint!

### How the code fits together

The Bun server does double duty: it serves the Hono API under `/api/*` and also serves the built Expo web app as static files, so the whole thing deploys as a single service. Native builds (iOS/Android) talk to that same API over HTTPS, configured via `EXPO_PUBLIC_API_URL` per EAS build profile.

## What this code does

A minimal expense tracker: sign in, log expenses with a title and amount, and see your running total and expense history. Each user only sees their own expenses, scoped by the Kinde user ID. This app isn't really about what it does, more about getting all the individual parts of a full stack web app service working efficiently, securely, and at a high-quality.

Throughout developing this I've been focussing on implementing good practice.

## Structure

This is a Bun workspace monorepo:

- [apps/app](apps/app) — the Expo/React Native client (iOS, Android, web)
- [apps/server](apps/server) — the Hono API server (also serves the built web client)
- [packages/db](packages/db) — Drizzle schema, migrations, and the Postgres client
- [packages/shared](packages/shared) — types and Zod schemas shared between server and client

## Running

This app will be available at the following URL once complete:
_**STILL W.I.P: NOT COMPLETE YET!**_

## AI

I have tried to avoid using AI as much as possible whilst developing this app, since the whole point was to learn, not to just get Claude to generate code for me while I watch.

That being said, there are 3 edge cases where I relaxed this rule:

1. Generating boilerplate code I knew would take me a while to write but I know how to (e.g. creating React context).
2. Refactoring code I'd already written into different areas (e.g. splitting out React components I'd written into more generic functions - similar to the boilerplate thing really...)
3. When I was genuinely stuck. This project has been a steep learning curve for me, and things like auth and hosting are tricky to get working the first time when you don't know what needs doing!

I've found this approach to be the most beneficial, treating AI throughout this project as more like a coach. If I get AI to write all the code for me, how can I ever know what is right or wrong in the future?

Don't get me wrong, I think AI coding tools are very powerful and I don't shy away from their use case. I just didn't want to use them much here in a learning project.

Also, coding is fun. Reviewing AI code is a lot less fun. So, I have had a lot more fun doing it this way 🙂
