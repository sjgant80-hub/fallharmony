# CLAUDE.md — working notes for agents in this repo

FallHarmony is a single-file web app. The whole product is [`index.html`](index.html):
markup, CSS, and an inline `<script>` that holds all the logic. There is no build step and
there are no runtime dependencies.

## Ground rules

- **Edit `index.html` directly.** Do not introduce a bundler, a framework, or a `src/`
  tree. The single-file constraint is a feature (it opens from disk and installs as a PWA).
- **Keep the verdict functions pure.** `parseDiag()`, `answerQ()`, and `escapeHtml()`
  return a value that depends only on their input. The tests execute these exact functions
  outside the browser; coupling them harder to the DOM breaks that.
- **No new runtime dependencies.** If something needs a library, reconsider it. Zero deps
  is a property the assessor and the PWA both rely on.
- **The grading thresholds are load-bearing.** The `ok` / `amber` / `red` boundaries in
  `parseDiag()` are pinned by [`test.mjs`](test.mjs). Change a threshold and update the
  test in the same change, with a note in the design record.

## How to verify

```
npm test
```

`test.mjs` reads the inline script out of `index.html`, runs it in a minimal DOM shim, and
asserts the observed classifications. CI runs the same command on every push
(see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Where things are

- [`index.html`](index.html) — the entire application.
- [`SPEC.md`](SPEC.md) — what it does and why, plus the classification rules.
- [`test.mjs`](test.mjs) — the behavioural suite.
- [`README.md`](README.md) — the user-facing overview.

## Boundaries

This tool only reads text a human pastes in and renders a verdict. It never modifies the
machine — no process is killed, no file is deleted, no command is run. Keep it that way.
