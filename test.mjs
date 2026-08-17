// FallHarmony · behavioural test suite
//
// The cockpit ships as a single index.html with its logic in an inline <script>.
// Rather than duplicate that logic, this suite loads the real script text out of
// index.html and executes it inside a minimal browser-shim (a stub document, a
// recording BroadcastChannel, an in-memory IndexedDB) so the exact functions the
// browser runs are the functions under assertion here. Every expected value below
// was derived by observing the real code run — none is asserted a priori.
//
// Run: node test.mjs   (also wired as `npm test` and the CI check).

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// VER-05: the suite imports a module from the project's own tree.
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// ---- load the real inline script out of index.html -----------------------
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const from = html.indexOf('const PRIME = 601;');
const to = html.indexOf('// init', from);
assert.ok(from >= 0 && to > from, 'located the cockpit script block in index.html');
const scriptSrc = html.slice(from, to);

function stubElement() {
  let markup = '';
  return {
    set innerHTML(v) { markup = v; },
    get innerHTML() { return markup; },
    textContent: '', value: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelectorAll() { return []; }
  };
}

function stubDb() {
  const store = { add() {}, clear() {}, getAll() { return {}; } };
  return { transaction: () => ({ objectStore: () => store }) };
}

// Build one fresh instance of the cockpit module with recording shims.
function loadCockpit() {
  const byId = {};
  const document = {
    getElementById(id) { return byId[id] || (byId[id] = stubElement()); },
    querySelectorAll() { return []; }
  };
  const signals = [];
  function BroadcastChannel() { this.postMessage = (m) => signals.push(m); this.onmessage = null; this.close = () => {}; }
  const indexedDB = {
    open() {
      const req = {};
      queueMicrotask(() => { if (req.onsuccess) req.onsuccess({ target: { result: stubDb() } }); });
      return req;
    }
  };
  const noop = () => {};
  const build = new Function(
    'document', 'indexedDB', 'BroadcastChannel', 'alert', 'confirm', 'prompt',
    'setInterval', 'clearInterval', 'setTimeout', 'navigator', 'window', 'location',
    scriptSrc + '\nreturn { PRIME, TIMER_DURATION, ENV_QS, EXIT_ITEMS, parseDiag, escapeHtml, answerQ };'
  );
  const mod = build(document, indexedDB, BroadcastChannel, noop, noop, noop, () => 0, noop, () => 0, {}, {}, {});
  return { mod, document, signals };
}

// Drive the diagnostic parser with a raw textarea value; return its verdict + markup.
function runDiag(rawValue) {
  const { mod, document, signals } = loadCockpit();
  document.getElementById('diagInput').value = rawValue;
  mod.parseDiag();
  const run = signals.find((m) => m.kind === 'fallharmony_diagnostic_run');
  return { payload: run ? run.payload : null, markup: document.getElementById('statusOut').innerHTML };
}

// Answer the three env questions in order; return the emitted verdict + markup.
function runEnv(procs, mcp, files) {
  const { mod, document, signals } = loadCockpit();
  const btn = { classList: { add() {}, remove() {} }, parentElement: { querySelectorAll: () => [] } };
  mod.answerQ('procs', btn, procs);
  mod.answerQ('mcp', btn, mcp);
  mod.answerQ('files', btn, files);
  const env = signals.find((m) => m.kind === 'fallharmony_env_diagnostic');
  return { payload: env ? env.payload : null, markup: document.getElementById('diagResult').innerHTML };
}

// ---- runner --------------------------------------------------------------
let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (err) { failures.push(name); console.error('  FAIL ' + name + '  ::  ' + (err && err.message)); }
}

// ---- manifest ------------------------------------------------------------
test('package manifest names this project and wires npm test', () => {
  assert.equal(pkg.name, 'fallharmony');
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.description && pkg.description.length > 10);
  assert.equal(pkg.scripts.test, 'node test.mjs');
});

// ---- constants -----------------------------------------------------------
test('cockpit constants carry the declared identity and time-box', () => {
  const { mod } = loadCockpit();
  assert.equal(mod.PRIME, 601);
  assert.equal(mod.TIMER_DURATION, 30 * 60 * 1000);
  assert.equal(mod.TIMER_DURATION, 1800000);
});

test('the env questionnaire and exit checklist have their published shape', () => {
  const { mod } = loadCockpit();
  assert.deepEqual(mod.ENV_QS.map((q) => q.id), ['procs', 'mcp', 'files']);
  assert.equal(mod.EXIT_ITEMS.length, 5);
  assert.equal(mod.EXIT_ITEMS[0].lab, 'Used /exit');
  assert.ok(mod.EXIT_ITEMS.every((it) => typeof it.desc === 'string' && it.desc.length > 0));
});

// ---- escapeHtml ----------------------------------------------------------
test('escapeHtml neutralises every HTML metacharacter', () => {
  const { mod } = loadCockpit();
  assert.equal(mod.escapeHtml('<b>"x"&\''), '&lt;b&gt;&quot;x&quot;&amp;&#39;');
  assert.equal(mod.escapeHtml('plain text'), 'plain text');
  assert.equal(mod.escapeHtml(42), '42');
});

// ---- parseDiag classification -------------------------------------------
test('a clean host reports zero orphans across all six checks', () => {
  const { payload } = runDiag('{}');
  assert.deepEqual(payload, { red: 0, amber: 0, ok: 6 });
});

test('two agent servers is a red orphan; extra mcp/pw/port/zombies are amber', () => {
  const input = JSON.stringify({ agentServers: [1, 2], mcpServers: [1, 2, 3, 4, 5, 6, 7, 8], playwright: [1], realChrome: 3, port1618: 1, zombieDirs: 2 });
  const { payload, markup } = runDiag(input);
  assert.deepEqual(payload, { red: 1, amber: 4, ok: 1 });
  assert.ok(markup.includes('status red'), 'markup flags a red status card');
});

test('a single agent server is amber, not red, and one mcp set stays clean', () => {
  const { payload } = runDiag(JSON.stringify({ agentServers: [1], mcpServers: [1, 2, 3, 4] }));
  assert.deepEqual(payload, { red: 0, amber: 1, ok: 5 });
});

test('malformed diagnostic JSON aborts before any verdict is emitted', () => {
  const { payload } = runDiag('not json {{{');
  assert.equal(payload, null);
});

// ---- env-first verdict ---------------------------------------------------
test('same procs + same mcp + unchanged files verdicts "patch the code"', () => {
  const { payload, markup } = runEnv('yes · same baseline', 'yes · all connected', 'no · same git HEAD');
  assert.deepEqual(payload, { sameProcs: true, sameMCP: true, sameFiles: true });
  assert.ok(markup.includes('Environment is the same'));
});

test('any drift from baseline verdicts "restore env before patching"', () => {
  const { payload, markup } = runEnv('no · something changed', 'yes · all connected', 'no · same git HEAD');
  assert.deepEqual(payload, { sameProcs: false, sameMCP: true, sameFiles: true });
  assert.ok(markup.includes('Environment changed'));
});

// ---- summary -------------------------------------------------------------
console.log('\n' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) process.exit(1);
