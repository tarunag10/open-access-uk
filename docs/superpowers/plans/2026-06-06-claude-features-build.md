# Claude Features Build (Features 2–15) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the 14 static, local-first features from the spec across the suite — shared engines (calendar/ics, readability, suite search, evidence handoff, collections) plus the UI that consumes them (Privacy Centre, command palette, suite search, "continue", deadline tracker, tone assistant, escalation timeline, template fill-in, a11y linter, token playground, print-to-PDF).

**Architecture:** Three dependency tiers. **Tier A** = pure, DOM-free, unit-tested ES modules under `shared/` (no app touched). **Tier B** = cross-suite UI on the umbrella site (Privacy Centre, ⌘K palette, suite search, "continue where you left off"). **Tier C** = per-app wiring of the Tier A engines (letter-gen, directory, legal, forms, design-system) + print-to-PDF. Tier A gates B and C.

**Tech Stack:** Plain static HTML/CSS/JS (ES modules), `node --test`, no new dependencies, no build step. Reuses shipped `shared/claude/*`, `shared/theme`, `shared/deadlines`, `shared/exports`, `shared/privacy`.

**Hard constraints (from spec):** static only, local-first, no backend, no tracking, WCAG AA, no new runtime deps. Every new `localStorage` key MUST be registered in `shared/privacy/local-storage.mjs`. Each page is a **git submodule** — commit inside the submodule, then bump the parent pointer (the workflow's agents do NOT run git; the orchestrator commits).

**Scope note:** This is Plan 3, the mega-plan covering all remaining features. It depends on Plans 1–2 (design layer + rollout) being shipped.

---

## File Structure

**Create (Tier A — shared engines, parent repo):**

- `shared/calendar/ics.mjs` + `shared/calendar/ics.test.mjs` — local `.ics` generation (features 6, 10).
- `shared/readability/index.mjs` + `.test.mjs` — offline plain-English checks (feature 7).
- `shared/search/index.mjs` + `.test.mjs` — static suite index + search (features 3, 4).
- `shared/evidence/index.mjs` + `.test.mjs` — portable evidence checklist model (feature 8).
- `shared/collections/index.mjs` + `.test.mjs` — named local collections store logic (feature 12).

**Modify (Tier A):**

- `shared/privacy/local-storage.mjs` (+ test) — register new keys: evidence handoff, legal collections.

**Create (Tier B — umbrella site submodule):**

- `open-access-uk-site/src/privacy-centre.js` — Privacy Centre UI (feature 2).
- `open-access-uk-site/src/command-palette.js` — ⌘K palette + suite search UI (features 3, 4).
- `open-access-uk-site/src/continue.js` — "continue where you left off" (feature 5).

**Modify (Tier B):**

- `open-access-uk-site/index.html` — add Privacy Centre mount, palette markup, "continue" mount (preserve ALL strict markers).
- `open-access-uk-site/src/app.js` — import + init the three modules.
- `open-access-uk-site/test/dashboard.test.js` — assert new markers.

**Modify (Tier C — per-app submodules):**

- `letter-generator/{index.html,src/app.js}` — deadline tracker + ics + tone assistant + evidence export.
- `public-service-directory/{index.html,src/app.js}` — escalation timeline + ics.
- `legal-templates/{index.html,src/app.js}` — fill-in mode + collections.
- `accessible-forms/{index.html,src/app.js}` — live a11y linter.
- `design-system/{index.html,src/app.js}` — token playground.
- Each app `styles.css` — small additive styles for the new UI.
- Print-to-PDF reuses shipped `shared/claude/print.css` (already imported by every page) — Tier C only adds `no-print`/`.preview` hooks where missing.

---

# TIER A — Shared engines (pure, tested, no DOM)

## Task A1: Calendar `.ics` generator

**Files:**

- Create: `shared/calendar/ics.mjs`
- Test: `shared/calendar/ics.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/calendar/ics.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIcsEvent, foldIcsLine } from './ics.mjs';

test('createIcsEvent produces a valid all-day VEVENT', () => {
  const ics = createIcsEvent({
    title: 'FOI response due',
    date: '2026-07-01',
    description: 'Response expected from access@example.org',
    uid: 'fixed-uid-1'
  });
  assert.match(ics, /^BEGIN:VCALENDAR/);
  assert.match(ics, /VERSION:2\.0/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:FOI response due/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260701/);
  assert.match(ics, /DTEND;VALUE=DATE:20260702/); // all-day end is +1 day
  assert.match(ics, /UID:fixed-uid-1/);
  assert.match(ics, /END:VEVENT/);
  assert.match(ics, /END:VCALENDAR/);
  assert.ok(ics.endsWith('\r\n'), 'ICS lines must be CRLF-terminated');
});

test('createIcsEvent escapes commas, semicolons, and newlines', () => {
  const ics = createIcsEvent({
    title: 'Deadline; urgent, act',
    date: '2026-07-01',
    description: 'Line one\nLine two',
    uid: 'u2'
  });
  assert.match(ics, /SUMMARY:Deadline\\; urgent\\, act/);
  assert.match(ics, /DESCRIPTION:Line one\\nLine two/);
});

test('createIcsEvent returns empty string for an invalid date', () => {
  assert.equal(createIcsEvent({ title: 'x', date: 'not-a-date', uid: 'u3' }), '');
});

test('foldIcsLine wraps lines longer than 75 octets with CRLF + space', () => {
  const long = 'SUMMARY:' + 'a'.repeat(120);
  const folded = foldIcsLine(long);
  assert.ok(folded.split('\r\n').every((seg) => seg.length <= 75));
  assert.match(folded, /\r\n /);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/calendar/ics.test.mjs`
Expected: FAIL — `Cannot find module './ics.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// shared/calendar/ics.mjs
import { parseLocalDate, toLocalDateString } from '../deadlines/index.mjs';

function pad(n) {
  return String(n).padStart(2, '0');
}

function compactDate(dateString) {
  return dateString.replace(/-/g, '');
}

function nextDay(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return toLocalDateString(date);
}

function escapeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// RFC 5545 line folding at 75 octets.
export function foldIcsLine(line) {
  if (line.length <= 75) return line;
  const segments = [];
  let remaining = line;
  segments.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    segments.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return segments.join('\r\n');
}

export function createIcsEvent({ title, date, description = '', uid } = {}) {
  const start = parseLocalDate(date);
  if (!start) return '';
  const end = nextDay(date);
  const stamp = `${compactDate(date)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Local//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid || `${compactDate(date)}-${escapeText(title)}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${compactDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/calendar/ics.test.mjs`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit** (orchestrator only; workflow agents skip git)

```bash
git add shared/calendar/ics.mjs shared/calendar/ics.test.mjs
git commit -m "feat: add local ICS calendar event generator"
```

---

## Task A2: Readability / plain-English checker (offline)

**Files:**

- Create: `shared/readability/index.mjs`
- Test: `shared/readability/index.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/readability/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyseReadability, countSyllables } from './index.mjs';

test('countSyllables is reasonable for common words', () => {
  assert.equal(countSyllables('cat'), 1);
  assert.equal(countSyllables('reasonable'), 4);
  assert.ok(countSyllables('accessibility') >= 5);
});

test('analyseReadability returns metrics and flags', () => {
  const text =
    'I am writing to request a reasonable adjustment. The exam was inaccessible. Please respond.';
  const result = analyseReadability(text);
  assert.equal(typeof result.readingAge, 'number');
  assert.equal(typeof result.sentenceCount, 'number');
  assert.equal(typeof result.wordCount, 'number');
  assert.ok(Array.isArray(result.flags));
});

test('flags long sentences', () => {
  const long = 'This ' + 'very '.repeat(40) + 'long sentence keeps going and going.';
  const result = analyseReadability(long);
  assert.ok(result.flags.some((f) => f.type === 'long-sentence'));
});

test('flags passive voice', () => {
  const result = analyseReadability('The decision was made by the panel.');
  assert.ok(result.flags.some((f) => f.type === 'passive'));
});

test('flags jargon terms', () => {
  const result = analyseReadability('Please find enclosed the aforementioned documentation herewith.');
  assert.ok(result.flags.some((f) => f.type === 'jargon'));
});

test('empty text returns zeroed metrics, no crash', () => {
  const result = analyseReadability('');
  assert.equal(result.wordCount, 0);
  assert.equal(result.flags.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/readability/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// shared/readability/index.mjs
// Offline, rule-based plain-English checks. No network, no AI.

const JARGON = [
  'aforementioned',
  'herewith',
  'hereinafter',
  'notwithstanding',
  'aforesaid',
  'whereof',
  'pursuant',
  'henceforth',
  'thereto',
  'enclosed please find',
  'please find enclosed'
];

const PASSIVE = /\b(was|were|is|are|been|being|be)\b\s+\w+(ed|en)\b(\s+by\b)?/i;

export function countSyllables(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

function splitSentences(text) {
  return String(text)
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text) {
  return String(text).trim().match(/[A-Za-z']+/g) || [];
}

export function analyseReadability(text = '') {
  const sentences = splitSentences(text);
  const allWords = words(text);
  const wordCount = allWords.length;
  const sentenceCount = sentences.length;
  const syllableCount = allWords.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch–Kincaid grade level → approximate UK reading age (+5).
  let readingAge = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    const grade =
      0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    readingAge = Math.max(5, Math.round(grade + 5));
  }

  const flags = [];
  sentences.forEach((sentence, index) => {
    const wc = words(sentence).length;
    if (wc > 25) {
      flags.push({ type: 'long-sentence', index, detail: `Sentence ${index + 1} has ${wc} words.` });
    }
    if (PASSIVE.test(sentence)) {
      flags.push({ type: 'passive', index, detail: `Sentence ${index + 1} may be passive.` });
    }
  });
  const lower = String(text).toLowerCase();
  for (const term of JARGON) {
    if (lower.includes(term)) {
      flags.push({ type: 'jargon', term, detail: `Consider plainer wording than "${term}".` });
    }
  }

  return { readingAge, wordCount, sentenceCount, syllableCount, flags };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/readability/index.test.mjs`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add shared/readability/index.mjs shared/readability/index.test.mjs
git commit -m "feat: add offline readability/plain-English checker"
```

---

## Task A3: Suite search index

**Files:**

- Create: `shared/search/index.mjs`
- Test: `shared/search/index.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/search/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suiteIndex, searchSuite } from './index.mjs';

test('suiteIndex contains entries for all five tools', () => {
  const tools = new Set(suiteIndex.filter((e) => e.kind === 'tool').map((e) => e.id));
  for (const id of ['letter-generator', 'accessible-forms', 'public-service-directory', 'legal-templates', 'design-system']) {
    assert.ok(tools.has(id), `missing tool ${id}`);
  }
});

test('searchSuite matches by title and keywords, ranked', () => {
  const results = searchSuite('letter');
  assert.ok(results.length > 0);
  assert.equal(results[0].kind, 'tool');
  assert.equal(results[0].id, 'letter-generator');
});

test('searchSuite is case-insensitive and trims', () => {
  assert.ok(searchSuite('  ESCALATION ').some((r) => r.id === 'public-service-directory'));
});

test('empty query returns no results', () => {
  assert.deepEqual(searchSuite(''), []);
});

test('every entry has id, kind, title, url, keywords', () => {
  for (const e of suiteIndex) {
    assert.ok(e.id && e.kind && e.title && e.url);
    assert.ok(Array.isArray(e.keywords));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/search/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// shared/search/index.mjs
// Static client-side suite index + ranked substring search. No network.

export const suiteIndex = [
  {
    id: 'letter-generator',
    kind: 'tool',
    title: 'Public-Service Letter Generator',
    url: 'https://letter-generator-psi.vercel.app',
    keywords: ['letter', 'foi', 'freedom of information', 'subject access', 'sar', 'adjustment', 'complaint', 'deadline']
  },
  {
    id: 'accessible-forms',
    kind: 'tool',
    title: 'Accessible Public Forms',
    url: 'https://accessible-forms-two.vercel.app',
    keywords: ['forms', 'accessibility', 'wcag', 'labels', 'readiness', 'remediation']
  },
  {
    id: 'public-service-directory',
    kind: 'tool',
    title: 'Public Service Directory',
    url: 'https://public-service-directory.vercel.app',
    keywords: ['escalation', 'ombudsman', 'complaint', 'council', 'regulator', 'readiness', 'route']
  },
  {
    id: 'legal-templates',
    kind: 'tool',
    title: 'Legal Templates UK',
    url: 'https://legal-templates-seven.vercel.app',
    keywords: ['template', 'refund', 'chargeback', 'housing', 'rail', 'data', 'sar', 'letter']
  },
  {
    id: 'design-system',
    kind: 'tool',
    title: 'Open Access Design System',
    url: 'https://design-system-two-delta.vercel.app',
    keywords: ['tokens', 'components', 'contrast', 'design', 'accessibility', 'recipes']
  },
  {
    id: 'workflow-information',
    kind: 'workflow',
    title: 'Workflow: Request information',
    url: 'https://openaccessuk.vercel.app/#workflows',
    keywords: ['foi', 'information', 'request', 'workflow']
  },
  {
    id: 'workflow-escalate',
    kind: 'workflow',
    title: 'Workflow: Escalate a complaint',
    url: 'https://openaccessuk.vercel.app/#workflows',
    keywords: ['escalate', 'complaint', 'ombudsman', 'workflow']
  }
];

export function searchSuite(query, index = suiteIndex) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const keywords = entry.keywords.join(' ').toLowerCase();
    let score = 0;
    if (title === q) score += 100;
    if (title.startsWith(q)) score += 40;
    if (title.includes(q)) score += 20;
    if (entry.keywords.some((k) => k.toLowerCase() === q)) score += 30;
    if (keywords.includes(q)) score += 10;
    if (score > 0) scored.push({ ...entry, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/search/index.test.mjs`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add shared/search/index.mjs shared/search/index.test.mjs
git commit -m "feat: add static suite search index"
```

---

## Task A4: Portable evidence model

**Files:**

- Create: `shared/evidence/index.mjs`
- Test: `shared/evidence/index.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/evidence/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EVIDENCE_HANDOFF_KEY,
  createEvidencePack,
  serializeEvidence,
  parseEvidence
} from './index.mjs';

test('handoff key is namespaced', () => {
  assert.equal(EVIDENCE_HANDOFF_KEY, 'open-access-uk:evidence-handoff');
});

test('createEvidencePack normalises items and source', () => {
  const pack = createEvidencePack({ source: 'letter-generator', items: ['Receipt', '', '  Photos '] });
  assert.equal(pack.source, 'letter-generator');
  assert.deepEqual(pack.items, ['Receipt', 'Photos']);
});

test('serialize then parse round-trips', () => {
  const pack = createEvidencePack({ source: 'x', items: ['a', 'b'] });
  const parsed = parseEvidence(serializeEvidence(pack));
  assert.deepEqual(parsed.items, ['a', 'b']);
  assert.equal(parsed.source, 'x');
});

test('parseEvidence tolerates garbage', () => {
  assert.deepEqual(parseEvidence('not json'), { source: '', items: [] });
  assert.deepEqual(parseEvidence('{"items":"nope"}').items, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/evidence/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// shared/evidence/index.mjs
export const EVIDENCE_HANDOFF_KEY = 'open-access-uk:evidence-handoff';

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((i) => String(i).trim()).filter(Boolean))];
}

export function createEvidencePack({ source = '', items = [] } = {}) {
  return { source: String(source).trim(), items: cleanItems(items) };
}

export function serializeEvidence(pack) {
  return JSON.stringify(createEvidencePack(pack));
}

export function parseEvidence(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return createEvidencePack({ source: parsed.source, items: parsed.items });
  } catch {
    return { source: '', items: [] };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/evidence/index.test.mjs`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add shared/evidence/index.mjs shared/evidence/index.test.mjs
git commit -m "feat: add portable evidence pack model"
```

---

## Task A5: Collections store logic

**Files:**

- Create: `shared/collections/index.mjs`
- Test: `shared/collections/index.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/collections/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_KEY,
  addToCollection,
  removeFromCollection,
  parseCollections,
  serializeCollections
} from './index.mjs';

test('collections key is namespaced', () => {
  assert.equal(COLLECTIONS_KEY, 'open-access-uk:legal-templates:collections');
});

test('addToCollection creates and dedupes', () => {
  let state = {};
  state = addToCollection(state, 'My housing case', 'refund-request');
  state = addToCollection(state, 'My housing case', 'refund-request');
  state = addToCollection(state, 'My housing case', 'sar');
  assert.deepEqual(state['My housing case'], ['refund-request', 'sar']);
});

test('removeFromCollection prunes and drops empty collections', () => {
  let state = { case: ['a', 'b'] };
  state = removeFromCollection(state, 'case', 'a');
  assert.deepEqual(state.case, ['b']);
  state = removeFromCollection(state, 'case', 'b');
  assert.equal(state.case, undefined);
});

test('serialize/parse round-trips and rejects garbage', () => {
  const state = { a: ['x'] };
  assert.deepEqual(parseCollections(serializeCollections(state)), state);
  assert.deepEqual(parseCollections('garbage'), {});
  assert.deepEqual(parseCollections('{"a":"notarray"}'), {});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/collections/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// shared/collections/index.mjs
export const COLLECTIONS_KEY = 'open-access-uk:legal-templates:collections';

export function addToCollection(state, name, id) {
  const key = String(name).trim();
  const value = String(id).trim();
  if (!key || !value) return state;
  const existing = Array.isArray(state[key]) ? state[key] : [];
  if (existing.includes(value)) return state;
  return { ...state, [key]: [...existing, value] };
}

export function removeFromCollection(state, name, id) {
  if (!Array.isArray(state[name])) return state;
  const next = state[name].filter((x) => x !== id);
  const copy = { ...state };
  if (next.length) copy[name] = next;
  else delete copy[name];
  return copy;
}

export function serializeCollections(state) {
  return JSON.stringify(state || {});
}

export function parseCollections(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [name, ids] of Object.entries(parsed)) {
      if (Array.isArray(ids)) clean[name] = ids.filter((x) => typeof x === 'string');
    }
    return clean;
  } catch {
    return {};
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/collections/index.test.mjs`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add shared/collections/index.mjs shared/collections/index.test.mjs
git commit -m "feat: add named collections store logic"
```

---

## Task A6: Register new storage keys in privacy registry

**Files:**

- Modify: `shared/privacy/local-storage.mjs`
- Modify: `shared/privacy/local-storage.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `shared/privacy/local-storage.test.mjs`:

```js
import { EVIDENCE_HANDOFF_KEY } from '../evidence/index.mjs';
import { COLLECTIONS_KEY } from '../collections/index.mjs';

test('storageRegistry includes evidence handoff and collections keys', () => {
  const keys = storageRegistry.map((i) => i.key);
  assert.ok(keys.includes(EVIDENCE_HANDOFF_KEY), 'evidence handoff key missing');
  assert.ok(keys.includes(COLLECTIONS_KEY), 'collections key missing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: FAIL — one of the keys missing.

- [ ] **Step 3: Add the registry entries**

In `shared/privacy/local-storage.mjs`, add these two objects as the LAST elements of `storageRegistry` (after the theme entry added in Plan 1):

```js
  ,
  {
    key: 'open-access-uk:evidence-handoff',
    tool: 'suite',
    label: 'Evidence handoff',
    storage: 'localStorage',
    contains: 'Evidence checklist passed between the letter generator and directory'
  },
  {
    key: 'open-access-uk:legal-templates:collections',
    tool: 'legal-templates',
    label: 'Template collections',
    storage: 'localStorage',
    contains: 'Named local groupings of favourite templates'
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/privacy/local-storage.mjs shared/privacy/local-storage.test.mjs
git commit -m "feat: register evidence and collections storage keys"
```

---

# TIER B — Cross-suite UI (umbrella site submodule)

> All Tier B modules import shared logic with depth `../../shared/...`. They must NOT remove any strict `check-static` marker. New `aria-pressed` controls require updating the count assertion in `test/dashboard.test.js` (as established in Plan 2).

## Task B1: Privacy Centre (feature 2)

**Files:**

- Create: `open-access-uk-site/src/privacy-centre.js`
- Modify: `open-access-uk-site/index.html`
- Modify: `open-access-uk-site/src/app.js`

- [ ] **Step 1: Create the Privacy Centre module**

```js
// open-access-uk-site/src/privacy-centre.js
import { storageRegistry, clearKnownStorage } from '../../shared/privacy/local-storage.mjs';

function readPresence(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : value.length;
  } catch {
    return null;
  }
}

export function initPrivacyCentre(mountSelector = '#privacy-centre') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  function render() {
    const list = document.createElement('ul');
    list.className = 'privacy-list';
    list.setAttribute('aria-label', 'Local data stored in this browser');
    for (const item of storageRegistry) {
      const size = readPresence(item.key);
      const li = document.createElement('li');
      li.className = 'privacy-item';
      const title = document.createElement('strong');
      title.textContent = `${item.label} (${item.tool})`;
      const detail = document.createElement('p');
      detail.textContent = size === null ? `${item.contains} — nothing stored.` : `${item.contains} — ${size} characters stored.`;
      li.append(title, detail);
      list.append(li);
    }
    const clearAll = document.createElement('button');
    clearAll.type = 'button';
    clearAll.className = 'secondary';
    clearAll.textContent = 'Clear all local data';
    clearAll.addEventListener('click', () => {
      clearKnownStorage(window.localStorage);
      render();
      status.textContent = 'Cleared all known local data from this browser.';
    });
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    mount.replaceChildren(list, clearAll, status);
  }

  render();
}
```

- [ ] **Step 2: Add the Privacy Centre mount to index.html**

In `open-access-uk-site/index.html`, inside the existing `<section id="privacy" …>`, immediately after its closing `</div>` of `.timeline` (i.e. before the section closes), add:

```html
<div id="privacy-centre" class="privacy-centre" aria-label="My local data"></div>
```

Do not remove `id="privacy"`, the section heading, or any timeline content.

- [ ] **Step 3: Wire it in app.js**

At the top of `open-access-uk-site/src/app.js` add:

```js
import { initPrivacyCentre } from './privacy-centre.js';
```

At the bottom add:

```js
initPrivacyCentre('#privacy-centre');
```

- [ ] **Step 4: Verify**

Run: `cd open-access-uk-site && node --check src/privacy-centre.js && node --check src/app.js && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add open-access-uk-site/src/privacy-centre.js open-access-uk-site/index.html open-access-uk-site/src/app.js
git commit -m "feat: add Privacy Centre to umbrella site"
```

---

## Task B2: Command palette + suite search (features 3, 4)

**Files:**

- Create: `open-access-uk-site/src/command-palette.js`
- Modify: `open-access-uk-site/index.html`
- Modify: `open-access-uk-site/src/app.js`
- Modify: `open-access-uk-site/test/dashboard.test.js`

- [ ] **Step 1: Create the palette module**

```js
// open-access-uk-site/src/command-palette.js
import { searchSuite, suiteIndex } from '../../shared/search/index.mjs';

export function initCommandPalette({ root = document } = {}) {
  const dialog = root.querySelector('#command-palette');
  const input = root.querySelector('#command-input');
  const list = root.querySelector('#command-results');
  const openButton = root.querySelector('#command-open');
  if (!dialog || !input || !list) return;

  let active = -1;
  let current = [];

  function render(query) {
    current = query ? searchSuite(query) : suiteIndex.map((e) => ({ ...e }));
    active = current.length ? 0 : -1;
    list.replaceChildren(
      ...current.map((entry, index) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = entry.url;
        link.textContent = entry.title;
        link.setAttribute('role', 'option');
        link.id = `command-option-${index}`;
        link.setAttribute('aria-selected', String(index === active));
        li.append(link);
        return li;
      })
    );
    input.setAttribute('aria-activedescendant', active >= 0 ? `command-option-${active}` : '');
  }

  function open() {
    dialog.hidden = false;
    input.value = '';
    render('');
    input.focus();
  }
  function close() {
    dialog.hidden = true;
    openButton?.focus();
  }

  openButton?.addEventListener('click', open);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog.hidden ? open() : close();
    } else if (!dialog.hidden && event.key === 'Escape') {
      close();
    }
  });
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = Math.min(active + 1, current.length - 1);
      render(input.value);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = Math.max(active - 1, 0);
      render(input.value);
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      window.location.href = current[active].url;
    }
  });
}
```

- [ ] **Step 2: Add palette markup + trigger to index.html**

In `open-access-uk-site/index.html`, inside `<header class="site-header">`, immediately before the `#theme-toggle` button, add:

```html
<button id="command-open" class="theme-toggle" type="button" aria-haspopup="dialog" aria-controls="command-palette">Search (⌘K)</button>
```

And immediately after the opening `<main id="main">` tag, add:

```html
<div id="command-palette" class="command-palette" role="dialog" aria-modal="true" aria-label="Search the suite" hidden>
  <label for="command-input">Search tools and workflows</label>
  <input id="command-input" type="text" role="combobox" aria-expanded="true" aria-controls="command-results" aria-autocomplete="list" autocomplete="off" />
  <ul id="command-results" role="listbox" aria-label="Search results"></ul>
</div>
```

- [ ] **Step 3: Wire it in app.js**

Top of `open-access-uk-site/src/app.js`:

```js
import { initCommandPalette } from './command-palette.js';
```

Bottom:

```js
initCommandPalette({ root: document });
```

- [ ] **Step 4: Update the aria-pressed count test**

In `open-access-uk-site/test/dashboard.test.js`, the assertion currently expects 5 `aria-pressed` (4 workflow cards + theme toggle from Plan 2). The command-open button uses `aria-haspopup`, NOT `aria-pressed`, so the count stays 5 — no change needed. Instead, ADD a new assertion to the existing `'homepage accessibility controls are wired'` test:

```js
  assert.match(html, /id="command-palette"/);
  assert.match(html, /id="command-input"/);
  assert.match(html, /role="listbox"/);
```

- [ ] **Step 5: Verify**

Run: `cd open-access-uk-site && node --check src/command-palette.js && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 6: Commit**

```bash
git add open-access-uk-site/src/command-palette.js open-access-uk-site/index.html open-access-uk-site/src/app.js open-access-uk-site/test/dashboard.test.js
git commit -m "feat: add command palette and suite search to umbrella"
```

---

## Task B3: Continue where you left off (feature 5)

**Files:**

- Create: `open-access-uk-site/src/continue.js`
- Modify: `open-access-uk-site/index.html`
- Modify: `open-access-uk-site/src/app.js`

- [ ] **Step 1: Create the module**

```js
// open-access-uk-site/src/continue.js
import { storageRegistry } from '../../shared/privacy/local-storage.mjs';

const TOOL_URLS = {
  'letter-generator': 'https://letter-generator-psi.vercel.app',
  'accessible-forms': 'https://accessible-forms-two.vercel.app',
  'public-service-directory': 'https://public-service-directory.vercel.app',
  'legal-templates': 'https://legal-templates-seven.vercel.app',
  'design-system': 'https://design-system-two-delta.vercel.app'
};

export function initContinue(mountSelector = '#continue') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const resumable = storageRegistry.filter((item) => {
    if (!TOOL_URLS[item.tool]) return false;
    try {
      return window.localStorage.getItem(item.key) !== null;
    } catch {
      return false;
    }
  });

  if (!resumable.length) {
    mount.hidden = true;
    return;
  }
  mount.hidden = false;
  const cards = resumable.map((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    const h3 = document.createElement('h3');
    h3.textContent = item.label;
    const p = document.createElement('p');
    p.textContent = item.contains;
    const a = document.createElement('a');
    a.href = TOOL_URLS[item.tool];
    a.textContent = 'Continue →';
    card.append(h3, p, a);
    return card;
  });
  const wrap = document.createElement('div');
  wrap.className = 'cards';
  wrap.append(...cards);
  mount.replaceChildren(wrap);
}
```

- [ ] **Step 2: Add the mount to index.html**

In `open-access-uk-site/index.html`, immediately after the opening `<main id="main">` and after the command-palette div from Task B2, add:

```html
<section id="continue" class="continue section-shell" aria-label="Continue where you left off" hidden></section>
```

- [ ] **Step 3: Wire it in app.js**

Top:

```js
import { initContinue } from './continue.js';
```

Bottom:

```js
initContinue('#continue');
```

- [ ] **Step 4: Verify**

Run: `cd open-access-uk-site && node --check src/continue.js && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add open-access-uk-site/src/continue.js open-access-uk-site/index.html open-access-uk-site/src/app.js
git commit -m "feat: add continue-where-you-left-off to umbrella"
```

---

# TIER C — Per-app feature wiring

## Task C1: Letter generator — deadline tracker, ICS, tone assistant (features 6, 7, 8)

**Files:**

- Modify: `letter-generator/index.html`
- Modify: `letter-generator/src/app.js`
- Modify: `letter-generator/styles.css`

- [ ] **Step 1: Add UI mounts to index.html**

In `letter-generator/index.html`, inside the `.actions` div (after the existing buttons), add:

```html
<button id="addToCalendar" type="button" class="secondary">Add deadline to calendar</button>
<button id="checkTone" type="button" class="secondary">Check plain English</button>
<button id="sendEvidence" type="button" class="secondary">Send evidence to directory</button>
```

And immediately after the `<p id="status" …></p>` line, add:

```html
<div id="deadline-tracker" class="deadline-tracker" aria-live="polite"></div>
<div id="tone-report" class="tone-report" aria-live="polite"></div>
```

- [ ] **Step 2: Wire features in app.js**

At the TOP of `letter-generator/src/app.js`, after the existing imports, add:

```js
import { createIcsEvent } from '../../shared/calendar/ics.mjs';
import { analyseReadability } from '../../shared/readability/index.mjs';
import { createEvidencePack, serializeEvidence, EVIDENCE_HANDOFF_KEY } from '../../shared/evidence/index.mjs';
import { addWorkingDays } from '../../shared/deadlines/index.mjs';
```

At the BOTTOM of `letter-generator/src/app.js`, add:

```js
const addToCalendarBtn = document.querySelector('#addToCalendar');
const checkToneBtn = document.querySelector('#checkTone');
const sendEvidenceBtn = document.querySelector('#sendEvidence');
const deadlineTracker = document.querySelector('#deadline-tracker');
const toneReport = document.querySelector('#tone-report');

function resolveDeadlineDate() {
  const sent = document.querySelector('#sentDate')?.value;
  if (!sent) return null;
  // Default: 20 working days for FOI/SAR-style responses.
  return addWorkingDays(sent, 20);
}

function renderDeadline() {
  if (!deadlineTracker) return;
  const due = resolveDeadlineDate();
  deadlineTracker.textContent = due
    ? `Estimated response-by date: ${due} (about 20 working days from the sent date).`
    : 'Add a sent date to estimate the response-by deadline.';
}

addToCalendarBtn?.addEventListener('click', () => {
  const due = resolveDeadlineDate();
  if (!due) {
    status.textContent = 'Add a sent date first to create a calendar reminder.';
    return;
  }
  const ics = createIcsEvent({
    title: 'Public-service response due',
    date: due,
    description: 'Follow up if no response has arrived by this date.',
    uid: `oauk-letter-${due}`
  });
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'response-deadline.ics';
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Calendar reminder downloaded. Nothing was sent to a server.';
});

checkToneBtn?.addEventListener('click', () => {
  const result = analyseReadability(preview.textContent || '');
  if (!toneReport) return;
  if (!result.wordCount) {
    toneReport.textContent = 'Write a letter first, then check plain English.';
    return;
  }
  const flagText = result.flags.length
    ? result.flags.map((f) => f.detail).join(' ')
    : 'No plain-English issues found.';
  toneReport.textContent = `Estimated reading age ${result.readingAge}. ${result.flags.length} flag(s). ${flagText}`;
});

sendEvidenceBtn?.addEventListener('click', () => {
  const raw = document.querySelector('#evidence')?.value || '';
  const items = raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const pack = createEvidencePack({ source: 'letter-generator', items });
  try {
    window.localStorage.setItem(EVIDENCE_HANDOFF_KEY, serializeEvidence(pack));
    status.textContent = `Saved ${pack.items.length} evidence item(s) locally for the directory.`;
  } catch {
    status.textContent = 'Could not save evidence locally in this browser.';
  }
});

renderDeadline();
form.addEventListener('input', renderDeadline);
```

NOTE: `status`, `preview`, and `form` are already declared in this file (confirmed). Do not redeclare them.

- [ ] **Step 3: Add styles**

Append to `letter-generator/styles.css`:

```css

.deadline-tracker,
.tone-report {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--paper-2);
  color: var(--ink-muted);
}
```

- [ ] **Step 4: Verify**

Run: `cd letter-generator && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add letter-generator/index.html letter-generator/src/app.js letter-generator/styles.css
git commit -m "feat: add deadline/ics, tone check, evidence handoff to letter generator"
```

---

## Task C2: Directory — escalation timeline + ICS (features 9, 10)

**Files:**

- Modify: `public-service-directory/src/app.js`
- Modify: `public-service-directory/styles.css`

- [ ] **Step 1: Add timeline rendering + ICS in app.js**

At the TOP of `public-service-directory/src/app.js`, after the existing imports, add:

```js
import { createIcsEvent } from '../../shared/calendar/ics.mjs';
import { addWorkingDays } from '../../shared/deadlines/index.mjs';
```

In `public-service-directory/src/app.js`, the `renderActionPlan(plan)` function returns a card template. Inside that template string, immediately BEFORE the final `</article>`, insert this timeline + calendar markup (keeping all existing content):

```js
    `<ol class="escalation-timeline" aria-label="Escalation journey">
      <li><span class="step-dot"></span>${plan.firstStep || 'Start the organisation complaint process'}</li>
      <li><span class="step-dot"></span>${plan.escalationPath || 'Escalate to the relevant ombudsman or regulator'}</li>
      <li><span class="step-dot"></span>Keep evidence and await the final decision</li>
    </ol>
    <button id="add-escalation-deadline" type="button" class="secondary">Add 8-week reminder to calendar</button>`
```

Concretely: change the return so the timeline string is concatenated before `</article>`. Find the line ending the readiness `checklist-tools` div and the closing `</article>`, and insert the block above between them.

- [ ] **Step 2: Wire the calendar button inside update()**

In the `update()` function of `public-service-directory/src/app.js`, after the existing `copyContactLog` handler block, add:

```js
  const addDeadline = document.querySelector('#add-escalation-deadline');
  if (addDeadline) {
    addDeadline.addEventListener('click', () => {
      const today = new Date();
      const start = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      const due = addWorkingDays(start, 40); // ~8 weeks
      const ics = createIcsEvent({
        title: `Escalation follow-up: ${currentPlan?.routeName || 'complaint'}`,
        date: due,
        description: 'Most ombudsman routes allow escalation around 8 weeks after the first complaint.',
        uid: `oauk-escalation-${due}`
      });
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'escalation-reminder.ics';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
```

NOTE: `new Date()` is allowed here — this runs in the browser, not in a workflow script. `currentPlan` is already declared in this file.

- [ ] **Step 3: Add styles**

Append to `public-service-directory/styles.css`:

```css

.escalation-timeline {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0;
  display: grid;
  gap: var(--space-3);
}
.escalation-timeline li {
  display: flex;
  gap: var(--space-3);
  align-items: start;
}
.step-dot {
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 999px;
  background: var(--accent);
}
```

- [ ] **Step 4: Verify**

Run: `cd public-service-directory && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add public-service-directory/src/app.js public-service-directory/styles.css
git commit -m "feat: add escalation timeline and calendar reminder to directory"
```

---

## Task C3: Legal templates — collections (feature 12) + fill-in confirmation (feature 11)

**Files:**

- Modify: `legal-templates/index.html`
- Modify: `legal-templates/src/app.js`
- Modify: `legal-templates/styles.css`

Note: feature 11 (live fill-in document) already substantially exists — `update()` renders `output.textContent` live from form values, and txt/md export exists. This task ADDS collections (feature 12) and a "save to collection" affordance, completing the fill-in workflow.

- [ ] **Step 1: Add collections UI to index.html**

In `legal-templates/index.html`, inside the `<fieldset class="bundle-panel">`, after the existing actions div, add:

```html
<div class="collection-row">
  <label for="collectionName">Collection name</label>
  <input id="collectionName" name="collectionName" placeholder="My housing case" />
  <button id="addToCollection" type="button" class="secondary">Add current to collection</button>
</div>
<div id="collections" class="collections" aria-live="polite" aria-label="Saved collections"></div>
```

- [ ] **Step 2: Wire collections in app.js**

At the TOP of `legal-templates/src/app.js`, after the existing imports, add:

```js
import { addToCollection, parseCollections, serializeCollections, COLLECTIONS_KEY } from '../../shared/collections/index.mjs';
```

At the BOTTOM of `legal-templates/src/app.js`, add:

```js
const collectionNameInput = document.querySelector('#collectionName');
const addToCollectionBtn = document.querySelector('#addToCollection');
const collectionsMount = document.querySelector('#collections');

function loadCollections() {
  try {
    return parseCollections(localStorage.getItem(COLLECTIONS_KEY));
  } catch {
    return {};
  }
}

function saveCollections(state) {
  try {
    localStorage.setItem(COLLECTIONS_KEY, serializeCollections(state));
  } catch {
    /* private mode */
  }
}

function renderCollections() {
  if (!collectionsMount) return;
  const state = loadCollections();
  const names = Object.keys(state);
  if (!names.length) {
    collectionsMount.replaceChildren();
    return;
  }
  collectionsMount.replaceChildren(
    ...names.map((name) => {
      const card = document.createElement('article');
      card.className = 'card';
      const h3 = document.createElement('h3');
      h3.textContent = name;
      const p = document.createElement('p');
      p.textContent = `${state[name].length} template(s): ${state[name].join(', ')}`;
      card.append(h3, p);
      return card;
    })
  );
}

addToCollectionBtn?.addEventListener('click', () => {
  const name = collectionNameInput?.value?.trim();
  const id = values().template;
  if (!name || !id) {
    status.textContent = 'Enter a collection name and choose a template first.';
    return;
  }
  saveCollections(addToCollection(loadCollections(), name, id));
  renderCollections();
  status.textContent = `Added "${id}" to collection "${name}" locally.`;
});

renderCollections();
```

NOTE: `status` and `values` are already declared in this file.

- [ ] **Step 3: Add styles**

Append to `legal-templates/styles.css`:

```css

.collection-row {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.collections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}
```

- [ ] **Step 4: Verify**

Run: `cd legal-templates && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add legal-templates/index.html legal-templates/src/app.js legal-templates/styles.css
git commit -m "feat: add named template collections to legal templates"
```

---

## Task C4: Accessible forms — live a11y linter (feature 13)

**Files:**

- Modify: `accessible-forms/index.html`
- Modify: `accessible-forms/src/app.js`
- Modify: `accessible-forms/styles.css`

Note: `assessFormReadiness` already computes a checklist/score. This task surfaces it as an explicit on-demand "linter" panel with plain-English WCAG findings, driven by the same data so it stays honest.

- [ ] **Step 1: Add linter mount to index.html**

In `accessible-forms/index.html`, inside `<section id="tool" class="form-list" …>`, immediately after the `<div id="forms"></div>`, add:

```html
<div id="linter" class="linter" aria-live="polite" aria-label="Accessibility linter summary"></div>
```

- [ ] **Step 2: Wire the linter in app.js**

At the BOTTOM of `accessible-forms/src/app.js`, add:

```js
const linterMount = document.querySelector('#linter');

function renderLinter() {
  if (!linterMount) return;
  const topic = document.querySelector('#topic-filter')?.value || 'all';
  const complexity = document.querySelector('#complexity-filter')?.value || 'all';
  const filtered = filterForms(exampleForms, { topic, complexity });
  const rows = filtered.map((form) => {
    const readiness = assessFormReadiness(form);
    const issues = readiness.issues.length ? readiness.issues.join('; ') : 'No blocking accessibility issues found.';
    return `<li><strong>${escapeHtml(form.title)} — ${readiness.score}%:</strong> ${escapeHtml(issues)}</li>`;
  });
  linterMount.innerHTML = `<h2>Accessibility linter</h2><ul>${rows.join('')}</ul>`;
}

renderLinter();
filtersMount.addEventListener('change', renderLinter);
```

NOTE: `filterForms`, `exampleForms`, `assessFormReadiness`, `escapeHtml`, and `filtersMount` are already imported/declared in this file.

- [ ] **Step 3: Add styles**

Append to `accessible-forms/styles.css`:

```css

.linter {
  margin-top: var(--space-5);
  padding: var(--space-5);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
}
.linter ul {
  display: grid;
  gap: var(--space-2);
}
```

- [ ] **Step 4: Verify**

Run: `cd accessible-forms && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 5: Commit**

```bash
git add accessible-forms/index.html accessible-forms/src/app.js accessible-forms/styles.css
git commit -m "feat: add accessibility linter panel to accessible forms"
```

---

## Task C5: Design system — token playground (feature 14)

**Files:**

- Modify: `design-system/index.html`
- Modify: `design-system/src/app.js`
- Modify: `design-system/styles.css`

- [ ] **Step 1: Add playground mount to index.html**

In `design-system/index.html`, inside `<section id="tool">`, immediately after the `<div id="tokens" …></div>`, add:

```html
<div id="token-playground" class="token-playground" aria-label="Token playground">
  <h3>Token playground</h3>
  <label for="pg-accent">Accent colour</label>
  <input id="pg-accent" type="color" value="#c2410c" />
  <label for="pg-radius">Card radius (px)</label>
  <input id="pg-radius" type="range" min="0" max="28" value="14" />
  <div id="pg-preview" class="card">
    <button type="button">Preview button</button>
    <p>Live preview of the current accent and radius.</p>
  </div>
</div>
```

- [ ] **Step 2: Wire the playground in app.js**

At the BOTTOM of `design-system/src/app.js`, add:

```js
const pgAccent = document.querySelector('#pg-accent');
const pgRadius = document.querySelector('#pg-radius');
const pgPreview = document.querySelector('#pg-preview');

function applyPlayground() {
  if (!pgPreview) return;
  if (pgAccent) pgPreview.style.setProperty('--accent', pgAccent.value);
  if (pgRadius) pgPreview.style.setProperty('--radius-md', `${pgRadius.value}px`);
}

pgAccent?.addEventListener('input', applyPlayground);
pgRadius?.addEventListener('input', applyPlayground);
applyPlayground();
```

- [ ] **Step 3: Add styles**

Append to `design-system/styles.css`:

```css

.token-playground {
  margin-top: var(--space-5);
  padding: var(--space-5);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  display: grid;
  gap: var(--space-3);
}
#pg-preview button {
  background: var(--accent);
  border-radius: var(--radius-md);
}
```

- [ ] **Step 4: Verify**

Run: `cd design-system && node --check src/app.js && node --test && cd ..`
Expected: no `--check` output; existing token tests pass.

- [ ] **Step 5: Commit**

```bash
git add design-system/index.html design-system/src/app.js design-system/styles.css
git commit -m "feat: add live token playground to design system"
```

---

## Task C6: Print-to-PDF hooks (feature 15)

Print styling already ships in `shared/claude/print.css` (imported by every page) — it hides chrome and forces clean B/W document output. This task only adds explicit "Save as PDF" affordances where a printable document exists, reusing `window.print()`.

**Files:**

- Modify: `letter-generator/index.html`, `legal-templates/index.html`

- [ ] **Step 1: Add a print button to letter generator**

In `letter-generator/index.html`, inside the `.actions` div, the existing `#printLetter` button already triggers print — verify it is present. If present, no change. If absent, add:

```html
<button id="printLetter" type="button" class="secondary">Save as PDF / Print</button>
```

and ensure `src/app.js` has (only if not already wired): a handler `document.querySelector('#printLetter')?.addEventListener('click', () => window.print());`

- [ ] **Step 2: Add a print button to legal templates**

In `legal-templates/index.html`, inside the template `.actions` div, add:

```html
<button id="printTemplate" type="button" class="secondary">Save as PDF / Print</button>
```

At the BOTTOM of `legal-templates/src/app.js`, add:

```js
document.querySelector('#printTemplate')?.addEventListener('click', () => window.print());
```

- [ ] **Step 3: Verify both pages**

Run: `cd letter-generator && node --check src/app.js && node --test && cd .. && cd legal-templates && node --check src/app.js && node --test && cd ..`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add letter-generator/index.html letter-generator/src/app.js legal-templates/index.html legal-templates/src/app.js
git commit -m "feat: add explicit save-as-PDF affordances"
```

---

## Task D1: Suite-level verification

**Files:** none (verification only)

- [ ] **Step 1: Run all shared tests**

Run: `node --test shared/calendar/ics.test.mjs shared/readability/index.test.mjs shared/search/index.test.mjs shared/evidence/index.test.mjs shared/collections/index.test.mjs shared/privacy/local-storage.test.mjs`
Expected: all PASS.

- [ ] **Step 2: Run every page's tests + static checks**

Run:

```bash
for d in letter-generator accessible-forms public-service-directory legal-templates open-access-uk-site design-system; do
  echo "== $d ==";
  ( cd "$d" && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) ) || exit 1;
done
echo "ALL PAGES GREEN"
```

Expected: each page green; final `ALL PAGES GREEN`.

- [ ] **Step 3: Repo quality + format**

Run: `npm run quality:static && npx prettier . --check`
Expected: "Static quality checks passed". If prettier flags files, run `npx prettier . --write` and re-commit.

- [ ] **Step 4: Privacy Centre coverage**

Confirm every new `localStorage` key (`open-access-uk:evidence-handoff`, `open-access-uk:legal-templates:collections`) appears in `shared/privacy/local-storage.mjs` and therefore in the Privacy Centre.

---

## Self-Review

**Spec coverage:** feature 2 Privacy Centre (B1), 3 command palette (B2), 4 suite search (B2/A3), 5 continue (B3), 6 deadline+ics (A1/C1), 7 tone assistant (A2/C1), 8 evidence handoff (A4/C1), 9 escalation timeline (C2), 10 escalation ics (A1/C2), 11 fill-in (pre-existing + C3 confirm), 12 collections (A5/C3), 13 a11y linter (C4), 14 token playground (C5), 15 print-to-PDF (C6 + shipped print.css). Feature 1 (theme) shipped in Plans 1–2.

**Placeholders:** none — every shared module ships full TDD code; every UI edit is a located insertion with full code. Verification commands are concrete.

**Type/name consistency:** `createIcsEvent`/`foldIcsLine`, `analyseReadability`/`countSyllables`, `searchSuite`/`suiteIndex`, `createEvidencePack`/`serializeEvidence`/`parseEvidence`/`EVIDENCE_HANDOFF_KEY`, `addToCollection`/`removeFromCollection`/`parseCollections`/`serializeCollections`/`COLLECTIONS_KEY`, `initPrivacyCentre`/`initCommandPalette`/`initContinue` are defined once and consumed with identical names. All reused symbols (`status`, `preview`, `form`, `values`, `currentPlan`, `filterForms`, `exampleForms`, `assessFormReadiness`, `escapeHtml`, `filtersMount`, `addWorkingDays`) verified present in their target files. CSS overrides reference only shipped tokens.

**Risk note:** Tasks B/C edit existing `app.js` files by insertion. The agent must locate the documented anchors (existing declarations) and must NOT redeclare `status`/`preview`/`form`/`values`/`currentPlan`. Each task's verify step (`node --check` + `node --test`) catches redeclaration or syntax errors immediately.
