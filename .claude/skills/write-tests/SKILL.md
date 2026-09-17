---
name: write-tests
description: >
  Write tests for a package, file, or feature in this repo using the specialist
  test-writing agents with a built-in write → review → revise feedback loop. Routes to the
  right writer (unit, auth, integration, component, e2e), invokes test-quality-reviewer
  between cycles, and caps the loop at two cycles. Use when asked to write, add, or
  improve tests for any part of this monorepo.
---

# Write tests

You own the loop; the agents do the work.

## 1. Establish the target

Anything after `/write-tests` is the target, and may be free text rather than a path:

- `packages/db` — a package
- `apps/app/src/app/(app)/create-expense.tsx` — a file
- `create-expense.tsx covering only amount validation` — scoped
- `the userId isolation on the expenses routes` — a scenario, no path
- `packages/shared, integration only` — an explicit layer

If vague, inspect and decide, then state your plan in one line. Do not ask permission on an
unambiguous request — ask only when the target is genuinely unclear or a prerequisite is
missing.

### Scoped requests

When the user narrows the target, **honour it exactly** and pass the scope verbatim to the
writer. Two defaults change, and you must say so in the prompt:

- The edge-case sweep applies **only to the named scope**.
- A scoped run may **add a `describe` block to an existing file** — "one test file per
  source file" constrains layout, not sessions.

Tell the reviewer the scope too, or it reports out-of-scope gaps as findings and burns
cycle 2 on declined work.

If the scope looks mistaken — it excludes something with real bug risk — write what was
asked, then name the omission in your report. Never silently widen it.

### Prerequisites

- **`packages/*`, `apps/server` unit** — nothing.
- **`apps/app`** — harness built and verified (`ios`/`android`/`web` jest projects). See
  `.claude/agents/references/jest-expo-setup.md`.
- **`apps/server` integration** — harness built and verified.
  `cd apps/server && bun run test:integration`. Needs `colima start`. See
  `apps/server/test/README.md`: the route under test must be imported inside `beforeAll`,
  or a module-scope import connects to the **real Supabase database**.
- **E2E** — `e2e/flows/` set up, `bun run test:e2e` works. Needs a booted simulator,
  emulator, or Chrome with `--remote-debugging-port`, plus `KINDE_TEST_*` in
  `.argent/secrets.env`. No packages to install. See `e2e/README.md`.

## 2. Route to the writer

| Target                                                                  | Agent                     |
| ----------------------------------------------------------------------- | ------------------------- |
| Zod schemas, pure functions, type guards, formatters                    | `test-unit-writer`        |
| `packages/shared`, `packages/db` schema and drift tests                 | `test-unit-writer`        |
| `apps/server/kinde.ts`, JWT/claim validation, `getUser`                 | `test-auth-writer`        |
| `apps/server` routes, Drizzle queries, anything needing a real database | `test-integration-writer` |
| `apps/app` components and hooks                                         | `test-component-writer`   |
| Whole journeys on a device or browser, visual regression                | `test-e2e-writer`         |

A target spanning layers splits into one invocation per layer, each with its own loop.
`apps/server` typically means both `test-auth-writer` and `test-integration-writer`.

Independent layers can run in parallel — launch those writers in a single message. Never
parallelise cycle 2 of one loop against cycle 1 of another.

### Always set the platform scope

Web and native differ in auth, networking and live updates. Determine which platforms the
target runs on and pass that explicitly:

- `packages/shared`, `packages/db` — platform-agnostic.
- `apps/server` — serves both; the CSRF bypass and `/api/me` differ per client.
- `apps/app` — always both, unless the target is a `.web`- or `.native`-only file. Instruct
  the writer to run all platform projects.
- E2E — both, or an explicit decision with the user to defer one.

A writer reporting a file "covered" without naming a platform is incomplete — send it back.
Divergence table: `.claude/rules/test-writing.md`.

## 3. Run the loop

Hard cap: **two write cycles, two reviews.** Never a third.

```
Cycle 1:  writer → reviewer
          PASS → done
          REVISE ↓
Cycle 2:  writer (with feedback) → reviewer → done either way
```

**Cycle 1.** Invoke the writer with the target, telling it to read
`.claude/rules/test-writing.md` first. Background it unless the user is waiting on nothing
else.

**Review 1.** Invoke `test-quality-reviewer` with the test type, the paths written, the
source under test, and the writer's own report — including any limitation it declared, so
the reviewer can judge whether the gap was acknowledged.

On **PASS**, stop. Do not run cycle 2 for completeness.

**Cycle 2.** On **REVISE**, re-invoke the _same_ writer with the findings verbatim. It must
address every HIGH and MEDIUM, and push back explicitly rather than silently skipping
anything it judges wrong — disagreement is useful signal.

**Review 2.** Whatever the verdict, the loop ends. If HIGH findings remain, report them as
open items for the user to decide. Never a third cycle.

## 4. Verify independently

**An agent's report is a claim, not evidence.** Run it yourself before reporting:

All from the repo root:

```
bun run test              # shared + db + app (app via jest-expo)
bun run test:integration  # apps/server; Colima env + preload in the script
bun run test:all          # both of the above
bun run lint              # always
```

Use `bun run test`, never bare `bun test` — the latter walks the tree itself and skips
`apps/app` entirely (see `bunfig.toml`). To narrow to one package, `cd` into it and run its
own script.

- Pass and fail **counts**, not the exit code.
- **Non-zero** test count — a glob matching nothing exits 0 and looks like success.
- Skips counted separately.
- For `apps/app`, confirm **every** platform project ran; a single-preset run reads
  identically to a full one.
- **Run the suite twice.** Passing once and failing once is not finished, and a disagreement
  between runs is the finding to report ahead of any coverage gap.

If a suite fails after the writer reported it passing, say so plainly — that tells you the
writer's other claims need checking. Never write "tests pass" without having just run them.

## 5. Report

- Files written, test counts, pass/fail, **and lines per file** — the user reviews this by
  hand, so a 600-line file is a cost they need to know about before opening it. If a file
  is over ~300 lines or ~25 tests, say whether that is genuine coverage or uncollapsed
  tables.
- **What is actually covered**, as a few lines per file grouped by behaviour — not a list of
  test names. "Every field against its own rules; int32 boundaries; the drift between the
  shared regex and the column width" beats 62 names.
- Cycles used and each review's verdict
- **`TODO.md` entries added**, with package and one-line summary. Surface these
  prominently — they are the source bugs the user asked to be told about.
- Anything unresolved after cycle 2
- Anything unverifiable (no Docker, no device, missing credential) and what that leaves
  unproven

No trailing recap of what the diff already shows.

## Rules the loop must not break

- Agents never edit `src/`. Source bugs go to the owning package's `TODO.md`, **appended**
  never overwritten — several already hold the user's notes, and they are gitignored.
- Never read or surface values from any `.env`. If a test needs a secret, stop and ask.
- Integration tests stay out of the default `bun test` run.
- If a writer starts a server or device, confirm it was stopped.
- A failing committed suite is worse than none: tests must be green, asserting current
  behaviour, with suspected bugs recorded rather than encoded as failures.
