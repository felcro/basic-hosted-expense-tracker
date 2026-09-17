# Test writing base rules

Applies to every test-writing agent. Type-specific guidance lives in each agent.

## Runner and layout

- `bun:test` everywhere except `apps/app`, which uses `jest-expo`.
- Import `describe`, `test`, `expect` from `bun:test`. Use `test`, not `it`.
- Tests live in `test/` at the package root, mirroring `src/`:
  `packages/shared/src/types/expense.ts` → `packages/shared/test/types/expense.test.ts`.
  Never inside `src/`.
- One test file per source file. That constrains layout, not sessions: a scoped request
  against a file that already has tests adds a `describe` block to it.
- Filenames need `.test`/`.spec`; directories starting with `.` are skipped. A path
  matching nothing exits 0, so check the test count, not the exit code.

## Verification before completion

Before claiming tests pass or work is done: run the command, read the output, check the
numbers support the claim, state it with those numbers.

```
cd <package> && bun test
bun run lint                 # from repo root, always
```

- Lint passing is not tests passing.
- One file licenses no claim about the package.
- Re-run after any edit.
- Check the test count. A glob matching nothing exits 0.
- Count skips separately; a skip proved nothing.
- Run the suite twice. Passing once and failing once is not finished.

Cannot run something (no Docker, no device, no secret)? Say so, name which assertions are
unverified, and do not call the file covered.

## Assert current behaviour, not intended behaviour

Source looks wrong? Do not write a failing test.

1. Assert what the code does **today**, so the suite passes.
2. Comment why it is documented rather than fixed.
3. Record the suspected bug in the package's `TODO.md`.

A suite that fails on checkout is one people learn to ignore.

## Reporting suspected bugs

Append to `TODO.md` at the root of the package holding the **source file**. Gitignored
repo-wide. **Append, never overwrite** — several hold the user's own notes. Check it is not
already listed. New file gets a `# <package> — TODO` heading.

Use this structure exactly, every heading present and in this order:

```markdown
## [test-<type>] <one-line summary>

### Background

One or two sentences on the bug. Name the source file and line.

### Expected Behaviour

What the code should do, with a concrete example in the context of this bug — the actual
input and the result it should produce.

### Actual Behaviour

What it does instead, and the outcomes that follow. Name the real values you observed.

### Impact

**Severity: COSMETIC | LOW | MEDIUM | HIGH | CRITICAL**

A few sentences on who is affected and how badly.

### Investigation

What the fix could be and where in the source it applies. What else in the codebase is
affected. Which tests would need updating when it is fixed.

### Workaround

Any workaround, or `N/A`.
```

Severity guide: **CRITICAL** data loss, a security hole, or an unusable core flow;
**HIGH** a broken feature, wrong data returned, or a 500 where a 4xx belongs; **MEDIUM** a
plausible input mishandled, or a confusing error; **LOW** an edge case with a clear
workaround; **COSMETIC** wording, formatting, no functional effect.

Only report what a passing assertion demonstrated. Keep each section to what you actually
established — a thin Investigation section is better than a speculative one.

This full structure is for **source bugs**. A harness or tooling note (a mock's limitation,
a version pin to revisit) is not a bug in the product: give it a `## [test-setup] <summary>`
heading and a few bullets, and do not pad it into six sections.

## Edge cases: the sweep

Cover what applies. A category that cannot occur needs no test, and a test whose input and
expectation are both trivially valid is noise. A scoped request narrows breadth, never
rigour: sweep the named scope fully, leave the rest alone.

- **Boundaries** — lowest valid, highest valid, one step outside each. `min(3)` → 2, 3, 4.
- **Empty and absent** — `''`, `[]`, `null`, `undefined`, key missing. `null` and missing
  are different inputs.
- **Type confusion** — number for string and vice versa, object for scalar, `NaN`,
  `Infinity`.
- **Whitespace** — leading, trailing, whitespace-only, embedded newlines.
- **Unicode** — accented characters, emoji. Essential against any `A-Za-z` regex.
- **Numeric strings** — leading zeros, leading `+`, thousands separators, exponent
  notation, precision beyond scale, values exceeding column width.
- **Dates** — leap day, non-leap 29 Feb, month 13, day 32, and the timezone forms the
  schema accepts. Check reachability first: a `Z`-only schema makes offset and DST cases
  impossible.
- **Collections** — zero, one, many, ordering, limits honoured.
- **Error shape** — the right error, not merely that one occurred. Assert exact messages
  and field paths; where several fields are invalid, assert all report.
- **Authorisation** — user A cannot read, modify or delete user B's rows. Highest-value
  category in this repo.

## Platform divergence: web and native are two products

One codebase, two products differing in auth, networking and live updates. A test proving
one platform proves nothing about the other.

Signals: `.web.tsx`/`.native.ts` files, `Platform.OS`/`Platform.select` branches,
server-side branches on client type.

"Native" means **iOS and Android** — separate targets, separate resolution. `.native.*` is
shared; `.ios.*` and `.android.*` are not, and `Platform.OS` differs. In `apps/app` all
three run as separate jest projects (see `references/jest-expo-setup.md`).

Verify against source before relying on this:

| Concern          | Web                              | Native                                            |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| Auth             | Server-side, session **cookie**  | In-app PKCE, **bearer token**                     |
| Request auth     | Cookie; `authHeaders()` → `{}`   | `Authorization: Bearer` + pre-emptive refresh     |
| Token refresh    | None                             | `refreshOnce()` mutex, session cleared on failure |
| Live updates     | `EventSource`, `withCredentials` | `expo/fetch` stream, hand-parsed, 3s backoff      |
| Session loading  | Immediate                        | Gated on `kinde.isLoading`                        |
| Sign in / logout | `window.location.href`           | `kinde.login()` / `kinde.logout()`                |
| Profile identity | From `/api/me`                   | Local id token; `/api/me` knows only the id       |
| CSRF             | Enforced                         | Bypassed for `Bearer`                             |

- Name the platform each file exercises. Never report "covered" unqualified, and never
  "native" when only one of the two ran.
- Test both implementations of a `.web`/`.native` pair; both arms of a `Platform.OS` branch.
- Auth is the highest-risk divergence. Mocking away the bearer/cookie distinction tests
  neither path.

## Assertions

Find the input that breaks the code. One happy-path test per unit, then spend the effort on
hostile inputs: what would a malicious client send, what does the author not expect?

A behaviour-preserving refactor must not break your test:

- Assert return values, thrown errors, rendered output, HTTP responses, database rows — not
  call order, internal state or private helpers, unless the call _is_ the contract (a token
  revoked, a cache invalidated).
- Prefer a real outcome to a mock assertion: where a route writes a row, assert the row.
- **Never derive an expected value using the code under test.** Write the literal:
  `expect(total).toBe('42.50')`, not `expect(total).toBe(sum(rows))`.
- Assert specifics, not truthiness. `expect(result.error?.issues[0]?.message).toBe('…')`
  beats `expect(result.success).toBe(false)` when a message exists.
- `toEqual` full shapes where practical, so added fields are noticed.
- Never write an assertion that passes regardless of the code under test. No snapshots.
- Assert the negative where it carries risk: not just that B was refused, but that A's data
  survived.

## Structure and style

**A human has to review this. Optimise for that.** A suite is only useful if someone can
read it and see what is covered. 600 lines of near-identical blocks is unreviewable even
when every assertion is correct.

- **`test.each` is mandatory wherever cases differ only by input and expected outcome.**
  Never write `n` separate `test()` blocks that vary one value — that is a table, and a
  reader can check a table at a glance but cannot diff six prose blocks. Six boundary cases
  are one `test.each` with six rows.

  ```ts
  test.each([
    ['int32 lower boundary', INT32_MIN, true],
    ['int32 upper boundary', INT32_MAX, true],
    ['one below int32 min', INT32_MIN - 1, false],
    ['one above int32 max', INT32_MAX + 1, false],
  ])('id: %s', (_label, id, valid) => {
    expect(schema.safeParse({ ...valid, id }).success).toBe(valid)
  })
  ```

  Write a standalone `test()` only when the case needs different setup or a different
  assertion shape.

- **Budget: roughly 15–25 tests per source file.** Past that, ask whether cases are being
  enumerated rather than grouped into tables. A file needing more genuinely distinct
  behaviours is fine — say so in your report — but a file over ~300 lines is usually a
  collapsing problem, not a coverage one.
- One behaviour per test. Several assertions about one behaviour is fine; two behaviours is
  two tests.
- Name by subject, scenario, outcome: "rejects an expired token with 401", not "token test
  2". This is what you read in CI.
- Nest `describe` by unit, then field or behaviour.
- One valid fixture at the top; spread-override a single field per case.
- No logic in tests: no conditionals, no loops but `test.each`, no try/catch around the
  assertion.
- Order-independent, safe under concurrency.
- Never `test.only` or `test.skip` in committed code.

## No shortcuts to reach green

A test exists to fail when the code breaks. Anything that makes it pass without improving
what it proves reports coverage that does not exist. Never:

- **Weaken the assertion** — `toBeDefined`/`toBeTruthy`/`expect.any` because the exact
  value failed. Find out why it failed.
- **Loosen a matcher** — `toContain` for `toBe`, `toMatchObject` for `toEqual`, when the
  precise form is knowable.
- **Add a sleep.** Wait on the real condition.
- **Widen a mock** until the code stops complaining. A mock returning fields the real
  dependency would not has drifted from reality.
- **Skip, comment out or delete** a test you cannot pass. Report it.
- **Catch and swallow.** `try { assert } catch {}` cannot fail.
- **Retry.** That is a flaky test with the evidence hidden.
- **Relax a type.** `as any`/`@ts-expect-error` to silence a real mismatch. For a
  deliberately invalid input, cast that one argument and comment why.

Three honest outcomes when a test will not pass: the test was wrong and you fix it; the
code is wrong and you assert current behaviour plus a `TODO.md` entry; or you cannot tell
and you report it. Never a fourth.

Same for the harness: no `--forceExit`, no blanket `transformIgnorePatterns: []`, no global
timeout bump, no disabled lint rule to get past an undiagnosed failure.

## Flaky is broken

Rule these out up front:

- Real clocks — freeze time for `Date.now()` / `new Date()`.
- Ambient timezone or locale — pin both when asserting formatted output.
- Real network or real elapsed time.
- Shared mutable state — module-level cache, shared `QueryClient`, unreset mocks, a row
  left behind.
- Assumed iteration or query order. Compare sets, or order explicitly.
- Generated ids or timestamps inside an asserted shape.

## Extract a test tool at the third repetition

Below three occurrences, inline it. Extraction earns its place for: a fixture builder
taking partial overrides (`makeExpense({ amount: '99.99' })`); per-layer harness setup;
seeding two users with owned rows; reading state back to assert against.

They live in `<package>/test/helpers/`.

- **No assertions in a helper** — that moves the failure away from its cause. Helpers
  arrange and return; tests assert.
- **No conditionals.** A branching helper is two helpers.
- **Plain arguments, plain return.** No inheritance, no dozen-key config object, no builder
  chains.
- **Deterministic.** Fixed ids, timestamps, strings. Random data makes failures
  irreproducible; a test needing a unique value passes one in.
- **Overridable**, so a test varies one field and the rest stays valid and visible.
- **Never derive a value with the code under test.**

Do not extract in anticipation — by the third occurrence you know what actually varies.

## Repo conventions

- Match surrounding formatting; `oxfmt` reflows, so do not fight it.
- `noUnusedLocals`: prefix unused destructured bindings with `_`.
- `noUncheckedIndexedAccess`: index access yields `T | undefined`, so use `?.` not `!`.
- Never read, print or copy values from any `.env`. If a test needs a secret, stop and ask.
  Absolute rule.
- Do not modify `src/`. Source changes go to `TODO.md`.
- Test what exists. No tests for hypothetical behaviour, no refactoring source to be "more
  testable", no helper for a single call site.
