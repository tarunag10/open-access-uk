# Claude Design Rollout (5 Remaining Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Roll the shared Claude design layer onto the five remaining pages (letter-generator, accessible-forms, public-service-directory, legal-templates, open-access-uk-site) so the whole suite reads as one warm, themable, accessible product — without changing any page's behaviour, mount points, or quality markers.

**Architecture:** Each mini-app's full bespoke `styles.css` is replaced by a thin stylesheet that `@import`s the shared layer (`../shared/claude/{tokens,components,motion,print}.css`) plus only that page's specific overrides. Each page gets the shared header (skip-link, `site-header`, mobile `nav-toggle`, theme toggle), a per-page theme adapter (`src/theme.js`) reusing `shared/theme/index.mjs`, and footer. The umbrella site keeps its richer structure and ALL strict `check-static` markers; only its visual layer (CSS) and small additive markup (skip-link already present; add theme toggle) change.

**Tech Stack:** Plain static HTML/CSS/JS (ES modules), `node --test`, no new dependencies, no build step.

**Critical constraints:**

- Every existing **mount id, ARIA attribute, `data-*` attribute, form field id, and section anchor** must be preserved exactly — the apps' `src/app.js` query these and will break otherwise.
- Each mini-app's `scripts/check-static.mjs` must still pass. The umbrella's is strict (canonical, `site.webmanifest`, `aria-pressed="true"`, `id="copy-status"`, `id="source-safety"`, `id="privacy"`, exactly 5 `data-tool`, 4 `data-workflow`, CSP, exact GTM copy, `replaceChildren`, no `innerHTML`). Do not remove any of these.
- **Submodules:** every page directory is its own git submodule. Commit inside the submodule, then bump the parent pointer. (Agents in the workflow do NOT run git; the orchestrator commits.)
- The relative import depth from a mini-app is `../shared/...` in CSS (from `app/styles.css`) and `../../shared/...` in JS (from `app/src/theme.js`), matching the proven design-system precedent.

---

## File Structure

For EACH of the four mini-apps (`letter-generator`, `accessible-forms`, `public-service-directory`, `legal-templates`):

- Modify: `<app>/styles.css` — replace entirely with thin imports + page overrides.
- Modify: `<app>/index.html` — swap `topbar` header for shared `site-header` (skip-link + nav-toggle + theme toggle), add `site-footer`; preserve every section/id/aria/data attribute and all body content below the header.
- Create: `<app>/src/theme.js` — theme DOM adapter (identical to design-system's).
- Modify: `<app>/src/app.js` — import + call `initTheme`, wire mobile nav-toggle.

For the umbrella (`open-access-uk-site`):

- Modify: `open-access-uk-site/styles.css` — replace with thin imports + the page-specific layout overrides it needs (hero, toolkit grid, workflows, timeline) on top of the shared layer.
- Modify: `open-access-uk-site/index.html` — add a theme toggle button to the existing `site-header`; keep ALL strict markers and `data-*`/section ids.
- Create: `open-access-uk-site/src/theme.js` — theme adapter (import depth `../../shared/...`).
- Modify: `open-access-uk-site/src/app.js` — import + call `initTheme` (nav-toggle wiring already exists).

---

## Shared snippets (used verbatim across tasks)

**SNIPPET A — theme adapter** (`<app>/src/theme.js`, identical for every page):

```js
// <app>/src/theme.js
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

**SNIPPET B — app.js wiring** (append to each mini-app's `src/app.js`; the import goes at the top):

Top of file:

```js
import { initTheme } from './theme.js';
```

Bottom of file:

```js
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
```

**SNIPPET C — shared header** (replaces each mini-app's `<header class="topbar">…</header>`; keep each page's existing nav links). Place the skip-link immediately before the header and point it at `#tool` (or `#main` for umbrella):

```html
<a class="skip-link" href="#tool">Skip to content</a>
<header class="site-header">
  <a class="brand" href="index.html">Open Access UK</a>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
    Menu
  </button>
  <nav id="primary-nav" aria-label="Primary">
    <!-- KEEP this page's existing nav links exactly -->
  </nav>
  <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
    Dark theme
  </button>
</header>
```

**SNIPPET D — shared footer** (add just before `</main>`'s closing, i.e. after the last `</section>` and before `</main>` is wrong — place AFTER `</main>`, before `<script>`). For mini-apps that currently have no footer:

```html
<footer class="site-footer">
  <nav aria-label="Footer">
    <a href="index.html">Open Access UK</a>
    <a href="#tool">Tool</a>
    <a href="LICENSE">MIT License</a>
  </nav>
  <p>Open-source, privacy-first, and local to your browser.</p>
</footer>
```

**SNIPPET E — thin stylesheet base** (top of each mini-app `styles.css`; note `../shared`):

```css
@import url('../shared/claude/tokens.css');
@import url('../shared/claude/components.css');
@import url('../shared/claude/motion.css');
@import url('../shared/claude/print.css');
```

---

## Task 1: Letter generator page

**Files:**

- Modify: `letter-generator/styles.css`
- Modify: `letter-generator/index.html`
- Create: `letter-generator/src/theme.js`
- Modify: `letter-generator/src/app.js`

- [ ] **Step 1: Create the theme adapter**

Create `letter-generator/src/theme.js` with the exact contents of SNIPPET A.

- [ ] **Step 2: Replace styles.css with thin imports + page overrides**

Replace the ENTIRE contents of `letter-generator/styles.css` with SNIPPET E followed by these letter-generator overrides:

```css
/* Letter generator: two-pane editor + letter "paper" preview. */
#tool.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
  padding: var(--space-7) 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.preview {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  font-family: var(--font-display);
  white-space: pre-wrap;
  line-height: 1.7;
}
.guidance-card {
  margin-top: var(--space-4);
}
.gtm-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  padding: var(--space-6) 0;
}
.gtm-strip article {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
}
.gtm-strip span {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.footer-band {
  padding: var(--space-7) 0;
  border-top: 1px solid var(--line);
}
.card.warning {
  border-color: var(--warning);
}
.product-panel,
.mini-window {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: var(--space-5);
}
@media (max-width: 860px) {
  #tool.grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Swap the header in index.html**

In `letter-generator/index.html`, replace the existing `<header class="topbar">…</header>` block with SNIPPET C, keeping the page's nav links (`#tool` "Tool", `#guidance` "Guidance", `#contribute` "Contribute") inside the `<nav id="primary-nav">`. Do not change any other markup, ids, or aria attributes.

- [ ] **Step 4: Add the footer in index.html**

In `letter-generator/index.html`, add SNIPPET D immediately after the closing `</main>` tag and before `<script type="module" src="src/app.js"></script>`.

- [ ] **Step 5: Wire app.js**

In `letter-generator/src/app.js`, add the import line from SNIPPET B at the very top, and append the `initTheme` + nav-toggle block from SNIPPET B at the very bottom.

- [ ] **Step 6: Verify**

Run: `cd letter-generator && node --check src/app.js && node --check src/theme.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: all `--check` produce no output; tests pass; "Static accessibility smoke check passed" prints.

- [ ] **Step 7: Confirm preserved markers**

Run: `cd letter-generator && node -e "const h=require('fs').readFileSync('index.html','utf8'); for (const m of ['id=\"tool\"','id=\"requestType\"','id=\"status\"','id=\"preview\"','id=\"selected-guidance\"','aria-live','site-header','theme-toggle','skip-link']) if(!h.includes(m)) throw new Error('missing '+m); console.log('letter-generator markers OK');" && cd ..`
Expected: `letter-generator markers OK`.

---

## Task 2: Accessible forms page

**Files:**

- Modify: `accessible-forms/styles.css`
- Modify: `accessible-forms/index.html`
- Create: `accessible-forms/src/theme.js`
- Modify: `accessible-forms/src/app.js`

- [ ] **Step 1: Create the theme adapter**

Create `accessible-forms/src/theme.js` with the exact contents of SNIPPET A.

- [ ] **Step 2: Replace styles.css with thin imports + page overrides**

Replace the ENTIRE contents of `accessible-forms/styles.css` with SNIPPET E followed by:

```css
/* Accessible forms: editorial gallery + filters. */
.gtm-strip,
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--space-4);
}
.gtm-strip {
  padding: var(--space-6) 0;
}
.gtm-strip article {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
}
.gtm-strip span {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.use-cases {
  padding: var(--space-7) 0;
}
.form-list {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-7) 0;
}
.footer-band {
  padding: var(--space-7) 0;
  border-top: 1px solid var(--line);
}
.product-panel,
.mini-window {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: var(--space-5);
}
```

- [ ] **Step 3: Swap the header in index.html**

In `accessible-forms/index.html`, replace the `<header class="topbar">…</header>` block with SNIPPET C, keeping this page's nav links (`#tool` "Tool", `#guidance` "Guidance", `#contribute` "Contribute"). Change nothing else.

- [ ] **Step 4: Add the footer in index.html**

Add SNIPPET D immediately after `</main>` and before the `<script type="module" src="src/app.js"></script>` line.

- [ ] **Step 5: Wire app.js**

In `accessible-forms/src/app.js`, add the SNIPPET B import at the top and the SNIPPET B `initTheme` + nav-toggle block at the bottom.

- [ ] **Step 6: Verify**

Run: `cd accessible-forms && node --check src/app.js && node --check src/theme.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 7: Confirm preserved markers**

Run: `cd accessible-forms && node -e "const h=require('fs').readFileSync('index.html','utf8'); for (const m of ['id=\"tool\"','id=\"form-filters\"','id=\"forms\"','id=\"current-guidance\"','aria-live','site-header','theme-toggle','skip-link']) if(!h.includes(m)) throw new Error('missing '+m); console.log('accessible-forms markers OK');" && cd ..`
Expected: `accessible-forms markers OK`.

---

## Task 3: Public service directory page

**Files:**

- Modify: `public-service-directory/styles.css`
- Modify: `public-service-directory/index.html`
- Create: `public-service-directory/src/theme.js`
- Modify: `public-service-directory/src/app.js`

- [ ] **Step 1: Create the theme adapter**

Create `public-service-directory/src/theme.js` with the exact contents of SNIPPET A.

- [ ] **Step 2: Replace styles.css with thin imports + page overrides**

Replace the ENTIRE contents of `public-service-directory/styles.css` with SNIPPET E followed by:

```css
/* Directory: search panel + results + readiness meter. */
#tool.grid {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-6);
  align-items: start;
  padding: var(--space-7) 0;
}
.saved-list {
  margin-top: var(--space-4);
  display: grid;
  gap: var(--space-2);
}
.gtm-strip,
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--space-4);
}
.gtm-strip {
  padding: var(--space-6) 0;
}
.gtm-strip article {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
}
.gtm-strip span {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.use-cases {
  padding: var(--space-7) 0;
}
.footer-band {
  padding: var(--space-7) 0;
  border-top: 1px solid var(--line);
}
.product-panel,
.mini-window {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: var(--space-5);
}
@media (max-width: 860px) {
  #tool.grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Swap the header in index.html**

In `public-service-directory/index.html`, replace the `<header class="topbar">…</header>` block with SNIPPET C, keeping this page's nav links (`#tool` "Tool", `#guidance` "Guidance", `#contribute` "Contribute"). Change nothing else; preserve the `#tool` section's inner markup (`#query`, `#sector`, `#reset`, `#saved-plans`, `#results`) exactly.

- [ ] **Step 4: Add the footer in index.html**

Add SNIPPET D immediately after `</main>` and before the `<script type="module" src="src/app.js"></script>` line.

- [ ] **Step 5: Wire app.js**

In `public-service-directory/src/app.js`, add the SNIPPET B import at the top and the SNIPPET B `initTheme` + nav-toggle block at the bottom.

- [ ] **Step 6: Verify**

Run: `cd public-service-directory && node --check src/app.js && node --check src/theme.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 7: Confirm preserved markers**

Run: `cd public-service-directory && node -e "const h=require('fs').readFileSync('index.html','utf8'); for (const m of ['id=\"tool\"','id=\"query\"','id=\"sector\"','id=\"reset\"','id=\"saved-plans\"','id=\"results\"','aria-live','site-header','theme-toggle','skip-link']) if(!h.includes(m)) throw new Error('missing '+m); console.log('directory markers OK');" && cd ..`
Expected: `directory markers OK`.

---

## Task 4: Legal templates page

**Files:**

- Modify: `legal-templates/styles.css`
- Modify: `legal-templates/index.html`
- Create: `legal-templates/src/theme.js`
- Modify: `legal-templates/src/app.js`

- [ ] **Step 1: Create the theme adapter**

Create `legal-templates/src/theme.js` with the exact contents of SNIPPET A.

- [ ] **Step 2: Replace styles.css with thin imports + page overrides**

Replace the ENTIRE contents of `legal-templates/styles.css` with SNIPPET E followed by:

```css
/* Legal templates: form + serif document preview. */
#tool.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
  padding: var(--space-7) 0;
}
.preview {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  font-family: var(--font-display);
  white-space: pre-wrap;
  line-height: 1.7;
}
.summary {
  color: var(--ink-muted);
}
.checkbox-row,
.checkbox-list {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.bundle-panel {
  margin-top: var(--space-5);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.gtm-strip,
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--space-4);
}
.gtm-strip {
  padding: var(--space-6) 0;
}
.gtm-strip article {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
}
.gtm-strip span {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.use-cases {
  padding: var(--space-7) 0;
}
.footer-band {
  padding: var(--space-7) 0;
  border-top: 1px solid var(--line);
}
.card.warning {
  border-color: var(--warning);
}
.product-panel,
.mini-window {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-2);
  padding: var(--space-5);
}
@media (max-width: 860px) {
  #tool.grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Swap the header in index.html**

In `legal-templates/index.html`, replace the `<header class="topbar">…</header>` block with SNIPPET C, keeping this page's nav links (`#tool` "Tool", `#catalogue` "Catalogue", `#contribute` "Contribute"). Change nothing else; preserve the form's ids (`#category`, `#search`, `#template`, `#template-summary`, `#showFavourites`, all the action button ids, `#bundle-options`, `#output`, `#catalogue-cards`, `#current-guidance`, `#status`).

- [ ] **Step 4: Add the footer in index.html**

Add SNIPPET D immediately after `</main>` and before the `<script type="module" src="src/app.js"></script>` line. Use `#catalogue` as the skip-link/footer secondary anchor is not required — keep SNIPPET D's `#tool` link.

- [ ] **Step 5: Wire app.js**

In `legal-templates/src/app.js`, add the SNIPPET B import at the top and the SNIPPET B `initTheme` + nav-toggle block at the bottom.

- [ ] **Step 6: Verify**

Run: `cd legal-templates && node --check src/app.js && node --check src/theme.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed".

- [ ] **Step 7: Confirm preserved markers**

Run: `cd legal-templates && node -e "const h=require('fs').readFileSync('index.html','utf8'); for (const m of ['id=\"tool\"','id=\"category\"','id=\"template\"','id=\"output\"','id=\"bundle-options\"','id=\"catalogue-cards\"','id=\"status\"','aria-live','site-header','theme-toggle','skip-link']) if(!h.includes(m)) throw new Error('missing '+m); console.log('legal-templates markers OK');" && cd ..`
Expected: `legal-templates markers OK`.

---

## Task 5: Umbrella site (visual-only, preserve strict markers)

The umbrella already has the right structure. We re-skin it to Claude and add ONLY a theme toggle. We must NOT remove any strict `check-static` marker.

**Files:**

- Modify: `open-access-uk-site/styles.css`
- Modify: `open-access-uk-site/index.html`
- Create: `open-access-uk-site/src/theme.js`
- Modify: `open-access-uk-site/src/app.js`

- [ ] **Step 1: Create the theme adapter**

Create `open-access-uk-site/src/theme.js` with the exact contents of SNIPPET A.

- [ ] **Step 2: Add a theme toggle to the existing header**

In `open-access-uk-site/index.html`, inside the existing `<header class="site-header">`, immediately AFTER the existing `<a class="header-cta" href="#toolkit">Explore the toolkit</a>` line, add:

```html
<button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
  Dark theme
</button>
```

Do NOT change the `theme-color` meta, canonical link, manifest link, any `data-tool`/`data-workflow` attribute, `aria-pressed="true"` usage, `id="copy-status"`, `id="source-safety"`, `id="privacy"`, or any GTM copy string.

- [ ] **Step 3: Replace styles.css with thin imports + umbrella overrides**

Replace the ENTIRE contents of `open-access-uk-site/styles.css` with SNIPPET E followed by the umbrella-specific layout below. (This drops the dark-navy palette; the shared tokens now drive colour. We keep the layout shapes — hero grid, toolkit grid, workflows, timeline — re-themed.)

```css
/* Umbrella site: Claude re-skin of existing layout shapes. */
.section-shell {
  width: min(var(--max), calc(100% - var(--space-6)));
  margin: 0 auto;
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
  padding: var(--space-8) 0;
}
.hero-copy h1 {
  font-size: var(--step-4);
  margin: 0 0 var(--space-4);
}
.hero-lede {
  font-size: var(--step-2);
  color: var(--ink);
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
}
.hero-detail {
  color: var(--ink-muted);
  max-width: 56ch;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
.hero-principles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
  color: var(--ink-muted);
  font-size: var(--step--1);
}
.header-cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--space-5);
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  text-decoration: none;
  font-weight: 600;
}
.section-kicker {
  color: var(--accent);
  font-size: var(--step--1);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-3);
}
.split-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.7fr);
  gap: var(--space-6);
  align-items: end;
  margin-bottom: var(--space-5);
}
.split-heading h2 {
  margin: 0;
}
.split-heading p {
  margin: 0;
  color: var(--ink-muted);
}
.toolkit,
.workflows,
.open-design,
.vision,
.github,
.roadmap {
  padding: var(--space-8) 0;
  border-top: 1px solid var(--line);
}
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}
.tool-card,
.workflow-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--ink);
  padding: var(--space-5);
  text-align: left;
  box-shadow: var(--shadow-sm);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}
.tool-card.is-active,
.tool-card:hover,
.workflow-card.is-selected,
.workflow-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
}
.tool-icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.tool-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-3);
}
.tool-card a {
  color: var(--teal);
  text-decoration: none;
  font-weight: 600;
}
.workflow-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}
.workflow-card {
  cursor: pointer;
}
.design-layout,
.github-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: center;
}
.check-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}
.check-list li::before {
  content: '✓ ';
  color: var(--accent);
  font-weight: 700;
}
.code-window .window-bar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.code-window .window-bar span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--line);
}
.timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}
.timeline article {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-5);
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-bottom: var(--space-2);
  background: var(--accent);
}
.dot.next {
  background: var(--teal);
}
.dot.later {
  background: var(--ink-muted);
}
.product-orbit {
  position: relative;
  min-height: 420px;
  border-radius: var(--radius-lg);
  background: var(--paper-2);
  border: 1px solid var(--line);
  padding: var(--space-5);
}
.product-card,
.terminal-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  box-shadow: var(--shadow-sm);
}
.product-card i {
  display: block;
  height: 6px;
  margin-top: var(--space-2);
  border-radius: 999px;
  background: var(--line);
}
.product-card a {
  display: inline-flex;
  margin-top: var(--space-3);
  color: var(--teal);
  text-decoration: none;
  font-weight: 600;
}
@media (max-width: 860px) {
  .hero,
  .split-heading,
  .design-layout,
  .github-layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Wire the theme toggle in app.js**

In `open-access-uk-site/src/app.js`, add at the top:

```js
import { initTheme } from './theme.js';
```

and add at the bottom (the nav-toggle handler already exists in this file — do NOT duplicate it):

```js
initTheme('#theme-toggle');
```

- [ ] **Step 5: Verify (strict)**

Run: `cd open-access-uk-site && node --check src/app.js && node --check src/theme.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: no `--check` output; tests pass; "Static accessibility smoke check passed" (this runs the STRICT umbrella check).

- [ ] **Step 6: Confirm strict markers preserved**

Run: `cd open-access-uk-site && node -e "const h=require('fs').readFileSync('index.html','utf8'); for (const m of ['rel=\"canonical\"','site.webmanifest','aria-pressed=\"true\"','id=\"copy-status\"','id=\"source-safety\"','id=\"privacy\"','theme-toggle','skip-link']) if(!h.includes(m)) throw new Error('missing '+m); const t=(h.match(/data-tool=/g)||[]).length, w=(h.match(/data-workflow=/g)||[]).length; if(t!==5) throw new Error('tools '+t); if(w!==4) throw new Error('workflows '+w); console.log('umbrella strict markers OK');" && cd ..`
Expected: `umbrella strict markers OK`.

---

## Task 6: Suite-level verification

**Files:** none (verification only)

- [ ] **Step 1: Run every page's tests + static checks**

Run:

```bash
for d in letter-generator accessible-forms public-service-directory legal-templates open-access-uk-site; do
  echo "== $d ==";
  ( cd "$d" && node --test && node scripts/check-static.mjs ) || exit 1;
done
echo "ALL PAGES GREEN"
```

Expected: each page prints its passing tests + "Static ... check passed"; final line `ALL PAGES GREEN`.

- [ ] **Step 2: Run repo-level quality + format**

Run: `npm run quality:static && npx prettier . --check`
Expected: "Static quality checks passed". If prettier flags files, run `npx prettier . --write` and note it for the commit step.

- [ ] **Step 3: Final confirmation**

Confirm all five pages now import the shared Claude layer, expose a working theme toggle, retain every mount id / ARIA / data attribute / quality marker, and pass all checks.

---

## Self-Review

**Spec coverage:** Per-page redesign of letter-generator (Task 1), accessible-forms (Task 2), public-service-directory (Task 3), legal-templates (Task 4), umbrella site (Task 5) — all mapped to spec §1.2. Shared header/footer/theme toggle on every page ✓. Thin per-app stylesheet importing the shared layer ✓ (spec §1.1 "each page's styles.css reduced to @import + overrides"). Theme system reused from foundation ✓. Umbrella strict markers preserved ✓.

**Placeholders:** none — every CSS/JS/HTML change is given as full literal content or an exact, located edit (SNIPPETs A–E + per-task overrides). Verification commands are concrete with expected output.

**Type/name consistency:** `initTheme`, `THEME_STORAGE_KEY`, `resolveInitialTheme`, `nextTheme`, `#theme-toggle`, `.nav-toggle`, `#primary-nav`, `site-header`, `skip-link` are used identically across all five tasks and match the shipped foundation (design-system precedent). CSS overrides reference only tokens that exist in `shared/claude/tokens.css` (`--paper`, `--paper-2`, `--surface`, `--ink`, `--ink-muted`, `--accent`, `--accent-ink`, `--accent-soft`, `--teal`, `--warning`, `--line`, `--space-*`, `--radius-*`, `--shadow-*`, `--step-*`, `--font-display`, `--max`).
