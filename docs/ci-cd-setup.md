# CI/CD setup

Phase 1: the core lane. Covers requirements 1, 2.a, 2.c, 2.d, 2.e, 2.f and 2.g.
E2E (2.b), issue automation, and security scanning are later phases.

## What runs, and when

| Workflow                  | Trigger                   | Purpose                                         |
| ------------------------- | ------------------------- | ----------------------------------------------- |
| `ci.yml`                  | PR to `main`, merge queue | The gate. Everything below must pass to merge.  |
| `deploy.yml`              | Manual only               | Deploys a chosen commit to Clever Cloud.        |
| `merge-queue-bump.yml`    | Manual only               | Moves a PR to the front of the merge queue.     |
| `nightly-flake-check.yml` | 02:00 UTC daily           | Unit + integration, 5x each, to surface flakes. |

### Jobs in `ci.yml`

Run order: `mergeability` first and alone, then everything else in parallel,
then `ci-passed` aggregates.

| Job               | Blocking | Notes                                              |
| ----------------- | -------- | -------------------------------------------------- |
| Mergeability      | yes      | Conflict check **before** any expensive job (2.e). |
| Lint & format     | yes      | `oxfmt --check` + `oxlint`.                        |
| Typecheck         | yes      | All four packages, via `bun run typecheck`.        |
| Migration drift   | yes      | Schema vs committed migrations.                    |
| Unit tests        | yes      | 2 runs (2.a).                                      |
| Integration tests | yes      | 2 runs, Testcontainers Postgres (2.a).             |
| Web build         | yes      | What actually gets deployed.                       |
| CI passed         | yes      | The single required status check.                  |

`CI passed` is the only check named in the ruleset. Add or rename jobs freely;
just add them to its `needs` list. A skipped or cancelled job is not a pass.

## One-time setup

### 1. Apply branch protection

```bash
DRY_RUN=1 ./scripts/setup-branch-protection.sh   # inspect first
./scripts/setup-branch-protection.sh             # apply
```

Blocks direct pushes to `main` (requirement 1), requires a PR, requires the
`CI passed` check, and enables the merge queue (2.f).

`bypass_actors` is empty, so this applies to you too. That is the point of
requirement 1. Adding yourself as a bypass actor silently disables it.

### 2. Stop Clever Cloud auto-deploying (2.g)

Clever's GitHub **integration** cannot be disconnected once established. That is
a Clever-side limitation with no console setting, and starting a new app is the
only way to undo it.

It does not need undoing. What actually triggers a deploy is an ordinary
repository webhook that Clever created here, and we own it:

```
POST https://api.clever-cloud.com/v2/github/redeploy   on: push
```

Disabling that webhook stops every automatic deploy and leaves the integration,
the app and its GitHub link untouched:

```bash
./scripts/clever-autodeploy.sh status
./scripts/clever-autodeploy.sh disable   # merging to main stops deploying
./scripts/clever-autodeploy.sh enable    # fully reversible
```

**Manual deploys keep working, verified against this app on 2026-09-18.** The
app's deployment source _is_ the GitHub repository, so Clever pulls the code at
deploy time rather than being pushed to. `clever restart --commit <sha>` logged
`Deploying commit ID <sha>` and deployed it in 39 seconds with no push
involved. A bogus SHA exits 1, so a failed deploy fails the workflow.

That is also why `deploy.yml` uses `clever restart --commit`, not
`clever deploy`: there is no separate Clever git remote to push to: the app's
deployment URL is the GitHub repo itself.

Then add three repository secrets:

| Secret          | Where to get it                                                         |
| --------------- | ----------------------------------------------------------------------- |
| `CLEVER_TOKEN`  | `clever login` locally, then `~/.config/clever-cloud/clever-tools.json` |
| `CLEVER_SECRET` | same file                                                               |
| `CLEVER_APP_ID` | `app_0a0cf65d-c6fa-4bb5-86e8-0df9c595b8dc`                              |

```bash
gh secret set CLEVER_TOKEN
gh secret set CLEVER_SECRET
gh secret set CLEVER_APP_ID
```

Deploying: Actions -> Deploy -> _Run workflow_, pick a ref, type `DEPLOY`.
It refuses any commit without a successful `CI passed` check. Rolling back is
the same workflow with an older ref.

### 3. Create the `flaky-test` label

```bash
gh label create flaky-test --color FBCA04 \
  --description "Nightly flake check found non-deterministic test results"
```

### 4. Optional: a `production` environment

`deploy.yml` targets an environment named `production`. Creating it in
_Settings → Environments_ lets you add required reviewers, so a deploy needs a
second approval. Without it the workflow still runs.

## Known gaps, deliberately left

### `apps/server` has no unit tests in CI

`bun run test` uses `--filter '*'`, which runs each package's `test` script.
`apps/server` defines only `test:integration`, so it is skipped. Any unit test
added under `apps/server/test/` outside `integration/` will not run until a
`test` script is added to its `package.json`.

### Dependabot PRs will fail CI until the lockfile is regenerated

Dependabot's npm updater cannot write `bun.lock`, so its PRs fail
`bun install --frozen-lockfile`. That is intended: run `bun install` on the
branch and commit the lockfile. Catalog-pinned deps are not bumped by
Dependabot at all: edit `workspaces.catalog` in the root `package.json`.

### Merge-queue bumping is a workaround

GitHub's merge queue orders strictly by entry time and exposes no priority API.
`merge-queue-bump.yml` dequeues everything ahead of the target and re-adds it
behind. Each dequeued PR abandons its in-flight merge-queue CI run. Use it when
something genuinely needs to jump the line.

## Where the logs are

- **Per-job logs**: the Actions run page.
- **Test output**: artifacts on each run: `unit-tests-run-{1,2}`,
  `integration-tests-run-{1,2}`, `build-web-log`. 30 days.
- **Built web bundle**: `web-dist` artifact, 7 days.
- **Nightly flake results**: `nightly-<suite>-run-<n>` artifacts, plus a
  comment on a single reused `flaky-test` issue.
- **Deploy logs**: `deploy-log` artifact, plus the Clever console.

## Still to come

- **2.b: E2E.** Deferred: `e2e/flows/` holds one placeholder echo step. When
  real flows exist, split into `e2e/flows/smoke/` (every PR) and
  `e2e/flows/full/` (nightly, 2x), and wire EAS workflows for native.
  Needs `eas init` first: `apps/app/app.json` has no EAS project ID.
- **Issue automation**: `/write-tests` filing GitHub issues instead of writing package-level `TODO.md` files. Look at the github Automation actions: https://github.com/felcro/basic-hosted-expense-tracker/actions/new?category=automation .
- **Security and quality**: CodeQL and dependency scanning, or another suitable tool e.g. Sonarqube, Dependency Review.
