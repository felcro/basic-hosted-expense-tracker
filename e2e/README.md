# E2E tests

Argent flows that drive the real app on a simulator, emulator, or Chromium browser.

```
bun run test:e2e                              # every flow in e2e/flows
bunx argent flow run e2e/flows/smoke.yaml     # one flow
```

## Why here and not `.argent/flows`

Argent's default location is `.argent/flows`, but `argent flow run` accepts any `.yaml`
path or directory, so flows live here where they are visible alongside the other test
directories.

The one tradeoff: `argent flow list` only scans `.argent/flows`, so it will not list these.
Use paths (or `bun run test:e2e`) rather than bare flow names.

## No package, no dependencies

This is not a workspace package. There is no `package.json` here and nothing to install —
flows are declarative YAML executed by the Argent CLI, which is already a root
devDependency (`@swmansion/argent`). Do not add this directory to `workspaces`.

Playwright would be a separate, optional addition for web-specific depth (HTTP header
assertions, multiple browsers, request interception). Argent drives web via Chromium/CDP,
which covers the same journeys in one format.

## Flow file shape

Top-level keys are `steps` and optionally `executionPrerequisite`. Nothing else — a `name`
key is rejected; the filename names the flow.

```yaml
steps:
  - echo: 'what this flow proves'
  - launch: { ios: com.example.app }
```

A flow is **e2e** when its first non-`echo`/`script` step is `launch:`; it controls process
start. Without a leading `launch:` it is a **fragment**, runs against whatever state the
device is in, and must declare an `executionPrerequisite`.

Filenames may contain only letters, numbers, `_` and `-`, because the filename names the
run's report and artifacts.

## Credentials

**Never put credentials in a flow file.** Use `{{secret:NAME}}` placeholders, which the
tool-server resolves at run time and never prints.

Put the values in `.argent/secrets.env` (gitignored), which applies to this project:

```
KINDE_TEST_EMAIL=...
KINDE_TEST_PASSWORD=...
```

Then reference them in a flow:

```yaml
- type: { text: '{{secret:KINDE_TEST_EMAIL}}', into: email-field }
```

Resolution order, first source wins (`bunx argent secrets` lists names, never values):

1. `ARGENT_SECRET_<NAME>` in the environment
2. `<project>/.argent/secrets.env` — every key
3. `<project>/.env.local` then `<project>/.env` — only `ARGENT_SECRET_`-prefixed keys
4. `~/.argent/secrets.env` — every key, any project

A secrets file applies to the next tool call with no restart. An environment variable only
reaches a tool-server started after it was exported.

**Never name a test credential `EXPO_PUBLIC_*`.** Anything with that prefix is inlined into
the built JavaScript bundle and readable by anyone who downloads the web app.

## Auth strategy

Kinde issues user tokens only via Authorization Code with PKCE, which needs a browser —
there is no password grant. So the standard "call the token endpoint in setup" shortcut is
not available.

The plan: drive the real Kinde sign-in **once**, persist the session, and have every other
journey start signed in. One flow covers the interactive login and is allowed to be the
least stable one. Use the dedicated Kinde **test environment**, never production.

## Conventions

- Assert product behaviour, not UI state. If a flow would pass while the database never
  changed, it is testing an animation.
- Take coordinates from the element tree that every interaction returns. Never from
  screenshot pixels.
- Wait on real conditions with `await-ui-element`. No fixed sleeps.
- A saved regression flow needs **two consecutive unchanged passes** before it counts.
- Both platforms need covering: web and native differ in auth, networking and live updates.
  Name the platform each flow exercises.
