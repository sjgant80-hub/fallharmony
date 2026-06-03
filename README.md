# FallHarmony

> ◊·κ=1 · operational cockpit · prime 601

Single-file dashboard that keeps the AI Native Solutions estate calm. Codifies the seven lessons from the 2026-06-02 forensic into a live cockpit: env-first debug · 30-min time-box · pre-exit checklist · process diagnostic.

**Live:** https://sjgant80-hub.github.io/fallharmony/

## Five panels

1. **NOW** — paste the PowerShell diagnostic snippet output. See what's running. Orphans flag amber/red.
2. **CLASSIFY** — every task is BUILD / ENV / CLEANUP / AUDIT. Pick before you start. ENV starts a 30-min timer.
3. **ENV-FIRST DIAGNOSTIC** — three questions before you patch code. Verdict: env-changed (restore first) vs same-env (patch confidently).
4. **PRE-EXIT CHECKLIST** — tick before closing Claude Code. Stops MCP leaks.
5. **OPERATIONAL PROTOCOL** — OP1-OP5 · the codified rules. Always visible.

Plus: **THE SEVEN LESSONS** as living reference and **SESSION LOG** (IndexedDB · persistent across reloads).

## The five rules (OP1-OP5)

- **OP1 · ENV-FIRST DEBUG** — when something worked yesterday and breaks today, verify env BEFORE patching code
- **OP2 · NAME-BEFORE-KILL** — name what a process provides before stopping it
- **OP3 · IMPROVISATION = STOP-THE-LINE** — agent inventing file names = lost context · force the existing verb
- **OP4 · 30-MIN TIME-BOX ON ENV DEBUGGING** — after 30, switch to manual path
- **OP5 · SESSION HYGIENE** — always /exit Claude Code · daily orphan scan

## How to use it

### When starting any task
1. Open https://sjgant80-hub.github.io/fallharmony/ (or save as PWA · works offline)
2. Pick the task type (BUILD / ENV / CLEANUP / AUDIT) under CLASSIFY
3. If ENV → 30-min timer starts. When it hits 0, switch to manual.

### When debugging
1. Paste the PowerShell snippet from NOW panel into your terminal
2. Copy the JSON output back into the textarea
3. See the status grid: orphans flagged red/amber, what each process provides
4. Run the ENV-FIRST DIAGNOSTIC three questions — get the verdict (restore env or patch code)

### Before closing Claude Code
1. Run the PRE-EXIT CHECKLIST · tick five items
2. When all five green → ready to /exit

## Architecture

- Single HTML file (~1000 LOC including CSS + JS) · MIT licensed
- Vanilla JS · no frameworks · no build step
- IndexedDB for session log
- BroadcastChannel `fall-signal` for estate-mesh integration
- Konomi licence shim baked (sovereign tier · mint pending Ed25519 sourcing)
- PWA manifest baked via data: URL
- Mobile-first responsive
- Runs offline · no API key required

## Part of the estate

- [fallmind](https://sjgant80-hub.github.io/fallmind/) — sovereign self-trained LLM pipeline (prime 587)
- [fallfence](https://sjgant80-hub.github.io/fallfence/) — sovereign debating engine (prime 599)
- [fallfind](https://sjgant80-hub.github.io/fallfind/) — searchable estate browser
- [fall-substrate](https://sjgant80-hub.github.io/fall-substrate/) — research → cited tool → live URL (flagship)
- [si-didy-agent](https://github.com/sjgant80-hub/si-didy-agent) — the persona agent (prime 379)

## Licence

MIT · Simon Gant 2026

◊·κ=1 · env-first · name-before-kill · time-box · /exit always
