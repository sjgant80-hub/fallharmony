# FallHarmony — Design Note

`operational cockpit · single-file · prime 601`

This is the durable record of what FallHarmony is meant to do and how it is built,
so that a later change can be judged against intent rather than guesswork. Where this
note and [`index.html`](index.html) disagree, that is a bug in one of them.

## 1 · Purpose

FallHarmony is a single-page diagnostic cockpit for keeping a local agent-development
workstation clean: it turns the output of a manual process scan into a status grid,
classifies the task in front of you, runs an env-first debugging check, and gates a
pre-exit checklist. It is a decision aid, not an automation tool — it never touches the
machine. It reads text you paste in and renders a verdict.

## 2 · Constraints

- **Single file.** The whole application is `index.html` — markup, CSS, and inline
  JavaScript. No build step, no bundler, no runtime dependencies. It opens from disk.
- **Offline.** No network call is required to use it. A PWA manifest is inlined as a
  `data:` URL so it can be installed and run without a server.
- **Deterministic core.** The functions that produce a verdict are pure with respect to
  their inputs: given the same pasted text they return the same classification. That is
  what makes them testable outside a browser, and the test suite depends on it.

## 3 · The surfaces

Five panels, each backed by a small piece of logic in the inline script:

1. **NOW** — `parseDiag()` parses a JSON process snapshot and emits one status card per
   check (agent servers, MCP process sets, Playwright chromium, real Chrome, port, zombie
   temp dirs). Each card is graded `ok` / `amber` / `red`, and an overall
   `{ red, amber, ok }` tally is broadcast.
2. **CLASSIFY** — `onClassify()` tags the current task BUILD / ENV / CLEANUP / AUDIT.
   Choosing ENV starts a 30-minute time-box.
3. **ENV-FIRST DIAGNOSTIC** — `answerQ()` collects three yes/no answers and decides
   between two verdicts: *environment is the same, patch the code* versus *environment
   changed, restore it first*.
4. **PRE-EXIT CHECKLIST** — five items gate a clean `/exit`.
5. **OPERATIONAL PROTOCOL** — OP1–OP5, always visible.

State (the session log) persists in IndexedDB; cross-panel notifications ride a
`BroadcastChannel` named `fall-signal`.

## 4 · Classification rules (the assertable core)

The grading thresholds are fixed and are the part of the system a regression would most
likely break, so they are pinned by tests:

| check | ok | amber | red |
|---|---|---|---|
| agent servers | none running | exactly one | two or more (orphans) |
| MCP process sets (count ÷ 4, rounded) | ≤ 1 set | ≥ 2 sets | — |
| Playwright chromium | none | one or more | — |
| port `:1618` | free | in use | — |
| zombie temp dirs | none | one or more | — |

A malformed paste is rejected before any verdict is produced — the parser aborts rather
than emit a partial result.

## 5 · Verification

[`test.mjs`](test.mjs) loads the real inline script out of `index.html` and executes it
inside a minimal shim (a stub `document`, a recording `BroadcastChannel`, an in-memory
`IndexedDB`), then asserts the observed verdicts: the six-check clean tally, the red/amber
grading of orphaned processes, the malformed-input abort, the two env-first verdicts, and
the HTML-escaping helper. Every expected value was taken from running the code, not from
the prose above. The suite runs under `npm test` and in CI on every change.

## 6 · Non-goals

- It does not kill processes, delete directories, or run shell commands.
- It does not phone home or require an API key.
- It is not a security tool and makes no security claim.
