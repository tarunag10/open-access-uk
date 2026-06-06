# Claude Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared Claude design layer (warm tokens + components + motion + print), a token-pair contrast audit, and a reusable theme toggle — then prove it by rebuilding the `design-system` page on top of it.

**Architecture:** A single source-of-truth CSS layer under `shared/claude/` (presentation only, no JS behaviour). A pure, unit-tested JS module `shared/theme/index.mjs` handles theme resolution/persistence logic; thin per-page `src/theme.js` wires it to the DOM. The existing WCAG `contrastPair` logic is reused to add a Node test that fails if any documented token pair drops below AA. The `design-system` page becomes the living showcase, dogfooding the new tokens.

**Tech Stack:** Plain static HTML/CSS/JS (ES modules), `node --test`, no new dependencies, no build step.

**Scope note:** This is Plan 1 of a multi-plan effort (see `docs/superpowers/specs/2026-06-06-claude-redesign-and-features-design.md`). Later plans roll the design layer out to the other five pages and add the remaining features. This plan stands alone: it produces a working, themable design layer and one fully-redesigned page.

---

## File Structure

**Create:**
- `shared/claude/tokens.css` — CSS custom properties (light + dark themes), warm palette.
- `shared/claude/components.css` — reusable component classes (button, card, input, panel, tag, table, header/nav, footer, hero, code-window, toast, meter).
- `shared/claude/motion.css` — purposeful motion, gated by `prefers-reduced-motion`.
- `shared/claude/print.css` — print/PDF document styling.
- `shared/claude/token-pairs.mjs` — the list of foreground/background token pairs + hex values, with `auditTokenPairs()` returning AA pass/fail per pair (reuses `contrastPair`).
- `shared/claude/token-pairs.test.mjs` — Node test asserting every pair meets WCAG AA.
- `shared/theme/index.mjs` — pure theme logic: `resolveInitialTheme`, `nextTheme`, `THEME_STORAGE_KEY`.
- `shared/theme/index.test.mjs` — Node tests for the theme logic.

**Modify:**
- `shared/privacy/local-storage.mjs` — register the theme storage key.
- `shared/privacy/local-storage.test.mjs` — assert the theme key is registered.
- `design-system/index.html` — import shared layer, add header theme toggle, restructure to showcase.
- `design-system/styles.css` — reduce to thin imports + page-specific overrides.
- `design-system/src/app.js` — wire the theme toggle via `shared/theme`.

---

## Task 1: Theme logic module (pure, tested)

**Files:**
- Create: `shared/theme/index.mjs`
- Test: `shared/theme/index.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// shared/theme/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme } from './index.mjs';

test('storage key is namespaced', () => {
  assert.equal(THEME_STORAGE_KEY, 'open-access-uk:theme');
});

test('stored theme wins over system preference', () => {
  assert.equal(resolveInitialTheme({ stored: 'dark', prefersDark: false }), 'dark');
  assert.equal(resolveInitialTheme({ stored: 'light', prefersDark: true }), 'light');
});

test('falls back to system preference when nothing stored', () => {
  assert.equal(resolveInitialTheme({ stored: null, prefersDark: true }), 'dark');
  assert.equal(resolveInitialTheme({ stored: null, prefersDark: false }), 'light');
});

test('ignores invalid stored values', () => {
  assert.equal(resolveInitialTheme({ stored: 'banana', prefersDark: true }), 'dark');
});

test('nextTheme toggles', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/theme/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 3: Write minimal implementation**

```js
// shared/theme/index.mjs
export const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

export function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/theme/index.test.mjs`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add shared/theme/index.mjs shared/theme/index.test.mjs
git commit -m "feat: add pure theme resolution logic"
```

---

## Task 2: Register theme key in privacy registry

**Files:**
- Modify: `shared/privacy/local-storage.mjs`
- Modify: `shared/privacy/local-storage.test.mjs`

- [ ] **Step 1: Write the failing test**

Add this test to `shared/privacy/local-storage.test.mjs`:

```js
import { THEME_STORAGE_KEY } from '../theme/index.mjs';

test('storageRegistry includes the theme preference key', () => {
  const entry = storageRegistry.find((item) => item.key === THEME_STORAGE_KEY);
  assert.ok(entry, 'theme key must be registered');
  assert.equal(entry.tool, 'suite');
  assert.equal(entry.storage, 'localStorage');
});
```

(If `storageRegistry`/`assert`/`test` are not already imported at the top of the file, ensure the existing imports cover them — the file already imports `storageRegistry` and uses `node:test`/`node:assert`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: FAIL — `theme key must be registered`.

- [ ] **Step 3: Add the registry entry**

In `shared/privacy/local-storage.mjs`, add this object as the **last** element of the `storageRegistry` array (after the existing `maintainer-helper` entry):

```js
  {
    key: 'open-access-uk:theme',
    tool: 'suite',
    label: 'Theme preference',
    storage: 'localStorage',
    contains: 'Chosen light or dark theme for the suite'
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: PASS — all tests including the new one.

- [ ] **Step 5: Commit**

```bash
git add shared/privacy/local-storage.mjs shared/privacy/local-storage.test.mjs
git commit -m "feat: register theme preference in privacy registry"
```

---

## Task 3: Token-pair contrast audit (proves AA)

**Files:**
- Create: `shared/claude/token-pairs.mjs`
- Test: `shared/claude/token-pairs.test.mjs`

This reuses the proven WCAG ratio math. We copy the small `luminance`/`contrastPair`
functions into this shared module so `shared/` has no dependency on an app folder
(`design-system/src/tokens.js` stays the app-level copy; this is the canonical shared one).

- [ ] **Step 1: Write the failing test**

```js
// shared/claude/token-pairs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenPairs, contrastPair, auditTokenPairs } from './token-pairs.mjs';

test('contrastPair matches a known value (black on white ~21)', () => {
  assert.ok(Math.abs(contrastPair('#000000', '#ffffff') - 21) < 0.1);
});

test('every documented token pair meets its required ratio', () => {
  const results = auditTokenPairs();
  const failures = results.filter((r) => !r.passes);
  assert.deepEqual(
    failures,
    [],
    `Token pairs below required contrast: ${failures.map((f) => `${f.name} ${f.ratio}:1`).join(', ')}`
  );
});

test('each pair declares both hex values and a minimum ratio', () => {
  for (const pair of tokenPairs) {
    assert.match(pair.foreground, /^#[0-9a-f]{6}$/i, `${pair.name} foreground hex`);
    assert.match(pair.background, /^#[0-9a-f]{6}$/i, `${pair.name} background hex`);
    assert.ok(pair.min === 4.5 || pair.min === 3, `${pair.name} min must be 4.5 or 3`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/claude/token-pairs.test.mjs`
Expected: FAIL — `Cannot find module './token-pairs.mjs'`.

- [ ] **Step 3: Write the implementation**

These hex values are the **canonical source of truth** for `tokens.css` in Task 4 — keep
them identical. All pairs are chosen to pass AA (4.5:1 for normal text, 3:1 for large
text / UI). `min: 3` is only used for large display text and non-text UI borders.

```js
// shared/claude/token-pairs.mjs

// WCAG relative luminance + contrast ratio (sRGB).
function luminance(hex) {
  const rgb = hex
    .match(/[a-f0-9]{2}/gi)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastPair(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Canonical Claude palette. Light theme on warm paper; dark theme on warm charcoal.
export const palette = {
  light: {
    paper: '#faf9f5',
    paper2: '#f5f4ee',
    ink: '#1f1e1c',
    inkMuted: '#56524a',
    accent: '#c2410c', // clay, darkened from #d97757 to pass AA as text on paper
    accentInk: '#ffffff', // text on accent fill
    teal: '#0f5b5b', // energy accent / links
    success: '#1a6a3c',
    warning: '#8a5a00',
    danger: '#b42318',
    line: '#d9d6cc'
  },
  dark: {
    paper: '#1c1a17',
    paper2: '#262320',
    ink: '#f6f4ee',
    inkMuted: '#bdb7ab',
    accent: '#e8997a', // lighter clay for text on charcoal
    accentInk: '#1c1a17',
    teal: '#5fc9c9',
    success: '#5fd08a',
    warning: '#e0b150',
    danger: '#f0857c',
    line: '#3a352f'
  }
};

// Foreground/background pairs that MUST meet contrast. min 4.5 = text, min 3 = large/UI.
export const tokenPairs = [
  // Light
  { name: 'light body text', foreground: palette.light.ink, background: palette.light.paper, min: 4.5 },
  { name: 'light muted text', foreground: palette.light.inkMuted, background: palette.light.paper, min: 4.5 },
  { name: 'light accent text', foreground: palette.light.accent, background: palette.light.paper, min: 4.5 },
  { name: 'light text on accent', foreground: palette.light.accentInk, background: palette.light.accent, min: 4.5 },
  { name: 'light link', foreground: palette.light.teal, background: palette.light.paper, min: 4.5 },
  { name: 'light success', foreground: palette.light.success, background: palette.light.paper, min: 4.5 },
  { name: 'light warning', foreground: palette.light.warning, background: palette.light.paper, min: 4.5 },
  { name: 'light danger', foreground: palette.light.danger, background: palette.light.paper, min: 4.5 },
  { name: 'light border', foreground: palette.light.line, background: palette.light.paper, min: 3 },
  // Dark
  { name: 'dark body text', foreground: palette.dark.ink, background: palette.dark.paper, min: 4.5 },
  { name: 'dark muted text', foreground: palette.dark.inkMuted, background: palette.dark.paper, min: 4.5 },
  { name: 'dark accent text', foreground: palette.dark.accent, background: palette.dark.paper, min: 4.5 },
  { name: 'dark text on accent', foreground: palette.dark.accentInk, background: palette.dark.accent, min: 4.5 },
  { name: 'dark link', foreground: palette.dark.teal, background: palette.dark.paper, min: 4.5 },
  { name: 'dark success', foreground: palette.dark.success, background: palette.dark.paper, min: 4.5 },
  { name: 'dark warning', foreground: palette.dark.warning, background: palette.dark.paper, min: 4.5 },
  { name: 'dark danger', foreground: palette.dark.danger, background: palette.dark.paper, min: 4.5 },
  { name: 'dark border', foreground: palette.dark.line, background: palette.dark.paper, min: 3 }
];

export function auditTokenPairs(pairs = tokenPairs) {
  return pairs.map((pair) => {
    const ratio = Number(contrastPair(pair.foreground, pair.background).toFixed(2));
    return { ...pair, ratio, passes: ratio >= pair.min };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/claude/token-pairs.test.mjs`
Expected: PASS — 3 tests. If any pair fails, adjust that hex toward more contrast in
BOTH this file and (later) `tokens.css`, then re-run. Do not lower `min`.

- [ ] **Step 5: Commit**

```bash
git add shared/claude/token-pairs.mjs shared/claude/token-pairs.test.mjs
git commit -m "feat: add WCAG token-pair contrast audit for Claude palette"
```

---

## Task 4: Design tokens stylesheet

**Files:**
- Create: `shared/claude/tokens.css`

The hex values MUST match `palette` in `shared/claude/token-pairs.mjs` exactly.

- [ ] **Step 1: Write the tokens file**

```css
/* shared/claude/tokens.css — Claude design language, single source of truth. */
:root,
[data-theme='light'] {
  color-scheme: light;
  --paper: #faf9f5;
  --paper-2: #f5f4ee;
  --surface: #ffffff;
  --ink: #1f1e1c;
  --ink-muted: #56524a;
  --accent: #c2410c;
  --accent-ink: #ffffff;
  --accent-soft: #f6e7df;
  --teal: #0f5b5b;
  --success: #1a6a3c;
  --warning: #8a5a00;
  --danger: #b42318;
  --line: #d9d6cc;
  --focus-ring: #c2410c;

  --font-display: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
  --font-body: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, monospace;

  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0: clamp(1rem, 0.96rem + 0.2vw, 1.08rem);
  --step-1: clamp(1.2rem, 1.1rem + 0.5vw, 1.4rem);
  --step-2: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --step-3: clamp(2rem, 1.6rem + 2vw, 3rem);
  --step-4: clamp(2.6rem, 1.9rem + 3.5vw, 4.6rem);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;

  --shadow-sm: 0 1px 2px rgba(31, 30, 28, 0.06);
  --shadow-md: 0 12px 32px rgba(31, 30, 28, 0.1);
  --shadow-lg: 0 28px 64px rgba(31, 30, 28, 0.14);

  --max: 1180px;
}

[data-theme='dark'] {
  color-scheme: dark;
  --paper: #1c1a17;
  --paper-2: #262320;
  --surface: #2b2824;
  --ink: #f6f4ee;
  --ink-muted: #bdb7ab;
  --accent: #e8997a;
  --accent-ink: #1c1a17;
  --accent-soft: #3a2c25;
  --teal: #5fc9c9;
  --success: #5fd08a;
  --warning: #e0b150;
  --danger: #f0857c;
  --line: #3a352f;
  --focus-ring: #e8997a;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 28px 64px rgba(0, 0, 0, 0.6);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    --paper: #1c1a17;
    --paper-2: #262320;
    --surface: #2b2824;
    --ink: #f6f4ee;
    --ink-muted: #bdb7ab;
    --accent: #e8997a;
    --accent-ink: #1c1a17;
    --accent-soft: #3a2c25;
    --teal: #5fc9c9;
    --success: #5fd08a;
    --warning: #e0b150;
    --danger: #f0857c;
    --line: #3a352f;
    --focus-ring: #e8997a;
  }
}
```

- [ ] **Step 2: Verify hex parity with the audit module**

Run: `node --test shared/claude/token-pairs.test.mjs`
Expected: PASS (unchanged). Then visually confirm each `--paper/--ink/--accent/--teal/
--success/--warning/--danger/--line` value in BOTH light and dark blocks equals the
matching `palette.light.*` / `palette.dark.*` hex in `token-pairs.mjs`.

- [ ] **Step 3: Commit**

```bash
git add shared/claude/tokens.css
git commit -m "feat: add Claude design tokens (light + dark)"
```

---

## Task 5: Components stylesheet

**Files:**
- Create: `shared/claude/components.css`

- [ ] **Step 1: Write the components file**

```css
/* shared/claude/components.css — reusable Claude components. Uses tokens.css vars. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
}

main {
  width: min(var(--max), calc(100% - var(--space-6)));
  margin: 0 auto;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  line-height: 1.08;
  font-weight: 600;
  color: var(--ink);
}

h1 {
  font-size: var(--step-4);
}
h2 {
  font-size: var(--step-3);
}
h3 {
  font-size: var(--step-1);
}

a {
  color: var(--teal);
  text-underline-offset: 3px;
}

:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 4px;
}

.skip-link {
  position: fixed;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 30;
  transform: translateY(-150%);
  background: var(--ink);
  color: var(--paper);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  text-decoration: none;
}
.skip-link:focus {
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Header + nav */
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--space-5);
  width: min(var(--max), calc(100% - var(--space-6)));
  margin: 0 auto;
  padding: var(--space-4) 0;
  background: color-mix(in srgb, var(--paper) 86%, transparent);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--step-1);
  color: var(--ink);
  text-decoration: none;
  margin-right: auto;
}
.site-header nav {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.site-header nav a {
  color: var(--ink-muted);
  text-decoration: none;
  font-size: var(--step--1);
}
.site-header nav a:hover {
  color: var(--ink);
}
.nav-toggle {
  display: none;
}
.theme-toggle {
  min-height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

/* Buttons */
.button,
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-5);
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
  box-shadow: var(--shadow-sm);
}
.button:hover,
button:hover {
  box-shadow: var(--shadow-md);
}
.button.secondary,
button.secondary {
  background: var(--surface);
  color: var(--ink);
  border-color: var(--line);
}
.button.ghost,
button.ghost {
  background: transparent;
  color: var(--accent);
  border-color: transparent;
  box-shadow: none;
}

/* Cards + panels */
.card,
.panel {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}
.card h3 {
  margin-top: 0;
}
.card p {
  color: var(--ink-muted);
}

/* Form controls */
label {
  display: block;
  font-weight: 600;
  margin: var(--space-4) 0 var(--space-2);
}
input,
select,
textarea {
  width: 100%;
  font: inherit;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}
textarea {
  min-height: 140px;
}

/* Hero */
.hero {
  display: grid;
  gap: var(--space-7);
  padding: var(--space-8) 0;
}
.hero h1 {
  margin: 0 0 var(--space-4);
}
.hero p {
  font-size: var(--step-1);
  color: var(--ink-muted);
  max-width: 60ch;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

/* Tags + table */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-3);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--step--1);
  font-weight: 600;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: var(--space-3);
  border-bottom: 1px solid var(--line);
}

/* Code / token window */
.code-window {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--step--1);
  overflow: auto;
}

/* Status toast / live region */
.toast {
  color: var(--success);
  font-weight: 600;
}

/* Meter / readiness ring base */
.meter {
  height: 10px;
  border-radius: 999px;
  background: var(--paper-2);
  overflow: hidden;
}
.meter > span {
  display: block;
  height: 100%;
  background: var(--accent);
}

/* Footer */
.site-footer {
  margin-top: var(--space-9);
  padding: var(--space-7) 0;
  border-top: 1px solid var(--line);
  color: var(--ink-muted);
}
.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
}
.site-footer a {
  color: var(--ink-muted);
}

@media (max-width: 720px) {
  .nav-toggle {
    display: inline-flex;
    min-height: 44px;
    padding: 0 var(--space-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }
  .site-header nav {
    display: none;
    flex-direction: column;
    width: 100%;
  }
  .site-header nav.is-open {
    display: flex;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/claude/components.css
git commit -m "feat: add Claude shared component styles"
```

---

## Task 6: Motion + print stylesheets

**Files:**
- Create: `shared/claude/motion.css`
- Create: `shared/claude/print.css`

- [ ] **Step 1: Write motion.css**

```css
/* shared/claude/motion.css — purposeful motion, disabled when reduced. */
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 480ms ease,
    transform 480ms ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
.card,
.button,
button {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Write print.css**

```css
/* shared/claude/print.css — clean print/PDF output for document views. */
@media print {
  .site-header,
  .site-footer,
  .nav-toggle,
  .theme-toggle,
  .hero-actions,
  .actions,
  .no-print {
    display: none !important;
  }
  :root {
    --paper: #ffffff;
    --surface: #ffffff;
    --ink: #000000;
    --ink-muted: #333333;
    --line: #999999;
  }
  body {
    background: #ffffff;
    color: #000000;
    font-size: 12pt;
  }
  .card,
  .panel,
  .preview {
    border: 1px solid #999999;
    box-shadow: none;
    break-inside: avoid;
  }
  a::after {
    content: ' (' attr(href) ')';
    font-size: 9pt;
    color: #555555;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add shared/claude/motion.css shared/claude/print.css
git commit -m "feat: add Claude motion and print stylesheets"
```

---

## Task 7: Theme DOM wiring helper (design-system page)

**Files:**
- Create: `design-system/src/theme.js`

This is the thin DOM adapter. Core logic lives in `shared/theme/index.mjs` (Task 1).
Other pages will reuse the same shared module with their own copy of this tiny adapter.

- [ ] **Step 1: Write the adapter**

```js
// design-system/src/theme.js
import { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme } from '../../shared/theme/index.mjs';

function readStored() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* private mode: theme still applies for this session */
  }
}

function apply(theme, toggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }
}

export function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let theme = resolveInitialTheme({ stored: readStored(), prefersDark });
  apply(theme, toggle);

  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    apply(theme, toggle);
    writeStored(theme);
  });
}
```

- [ ] **Step 2: Sanity check (lint parse)**

Run: `node --check design-system/src/theme.js`
Expected: no output (valid module).

- [ ] **Step 3: Commit**

```bash
git add design-system/src/theme.js
git commit -m "feat: add theme DOM adapter for design-system page"
```

---

## Task 8: Rebuild design-system page on the shared layer

**Files:**
- Modify: `design-system/styles.css`
- Modify: `design-system/index.html`
- Modify: `design-system/src/app.js`

- [ ] **Step 1: Reduce design-system/styles.css to thin imports**

Replace the ENTIRE contents of `design-system/styles.css` with:

```css
/* design-system page — Claude layer + page-specific overrides. */
@import url('../shared/claude/tokens.css');
@import url('../shared/claude/components.css');
@import url('../shared/claude/motion.css');
@import url('../shared/claude/print.css');

/* Page-specific: token swatches */
.token-card .swatch {
  display: block;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  margin-bottom: var(--space-3);
}
.token-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
```

- [ ] **Step 2: Update the header in design-system/index.html**

Replace the existing `<header class="topbar">…</header>` block with:

```html
  <a class="skip-link" href="#tool">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="index.html">Open Access UK</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    <nav id="primary-nav" aria-label="Primary">
      <a href="#tool">Tokens</a>
      <a href="#guidance">Guidance</a>
      <a href="#contribute">Contribute</a>
    </nav>
    <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">Dark theme</button>
  </header>
```

- [ ] **Step 3: Wire the theme toggle in design-system/src/app.js**

At the TOP of `design-system/src/app.js`, add:

```js
import { initTheme } from './theme.js';
```

At the BOTTOM of `design-system/src/app.js`, add:

```js
initTheme('#theme-toggle');

// Mobile nav toggle (matches shared component behaviour)
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
```

- [ ] **Step 4: Run the existing design-system tests**

Run: `cd design-system && node --test && node --check src/app.js && node --check src/theme.js && cd ..`
Expected: existing token tests PASS; both `--check` calls produce no output.

- [ ] **Step 5: Manual smoke check**

Open `design-system/index.html` in a browser. Verify: warm paper background, serif
headings, clay buttons; the theme toggle switches to warm dark and the choice survives a
page reload; the mobile Menu button shows/hides nav under 720px; keyboard Tab shows a
visible clay focus ring on links, buttons, and the toggle.

- [ ] **Step 6: Commit**

```bash
git add design-system/styles.css design-system/index.html design-system/src/app.js
git commit -m "feat: rebuild design-system page on Claude design layer"
```

---

## Task 9: Suite-level verification

**Files:** none (verification only)

- [ ] **Step 1: Run all shared + design-system tests**

Run: `node --test shared/theme/index.test.mjs shared/claude/token-pairs.test.mjs shared/privacy/local-storage.test.mjs`
Expected: PASS — all suites green.

- [ ] **Step 2: Run repo static quality + format checks**

Run: `npm run quality:static && npx prettier . --check`
Expected: "Static quality checks passed" and prettier reports all files formatted (run
`npx prettier . --write` and re-commit if it flags the new files).

- [ ] **Step 3: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: format Claude design foundation files" || echo "nothing to format"
```

- [ ] **Step 4: Final confirmation**

Confirm the branch `redesign/claude-design-and-features` contains: shared Claude layer
(tokens/components/motion/print), passing token-pair AA audit, theme logic + registry
entry, and a fully redesigned, themable `design-system` page — with all tests and quality
gates green.

---

## Self-Review

**Spec coverage (this plan's slice):** shared design layer ✓ (Tasks 4–6), theme system ✓
(Tasks 1, 2, 7, 8), dark theme ✓ (Task 4), contrast contract ✓ (Task 3), design-system as
living showcase ✓ (Task 8), privacy registry single-source-of-truth ✓ (Task 2), test +
quality gates ✓ (Task 9). Remaining spec items (other 5 pages + features 2–15) are
explicitly deferred to follow-on plans per the Scope note.

**Placeholders:** none — every code step shows full content; no "TBD"/"add error handling"
placeholders (localStorage try/catch shown explicitly).

**Type/name consistency:** `THEME_STORAGE_KEY`, `resolveInitialTheme`, `nextTheme`,
`initTheme`, `tokenPairs`, `auditTokenPairs`, `palette`, `contrastPair` are defined once
and referenced with identical names across tasks. `tokens.css` hex values are pinned to
`palette` in `token-pairs.mjs` and cross-checked in Task 4 Step 2.
