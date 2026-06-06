# Open Access UK — Claude Redesign + Feature Build

**Date:** 2026-06-06
**Status:** Approved design, ready for implementation planning

## Summary

Redesign all six pages of the Open Access UK suite into a single, coherent **Claude
design language** (warm cream paper, clay/coral accent, serif display headings, calm
editorial layout) "pushed with more energy" (bolder accent use, richer purposeful
motion, more depth/contrast). Add a comprehensive, **static / local-first** feature set
(15 features) that reuses existing shared infrastructure.

## Hard constraints (non-negotiable)

- **Static only.** Plain HTML/CSS/JS. Every demo must work by opening `index.html`.
- **Local-first.** No backend, no accounts, no server storage, no network calls for
  user data. User content stays in the browser (`localStorage`).
- **No tracking.** No analytics, no hidden data collection.
- **Accessibility is a hard constraint.** WCAG AA minimum: contrast, visible focus,
  keyboard operability, screen-reader names, focus order, `prefers-reduced-motion`,
  `prefers-color-scheme`. The redesign may not regress any current a11y behaviour;
  existing Playwright a11y/e2e suites must keep passing.
- **No new runtime dependencies.** No CSS frameworks, no JS libraries, no build step
  added. Pure static assets (matches current architecture and `docs/adr/0001`).

## Current state (baseline)

Six pages, each shipped as static HTML/CSS/JS:

| Page | Path | Function |
| --- | --- | --- |
| Umbrella site | `open-access-uk-site/` | Landing: toolkit grid, workflows selector, open-design token copy, privacy centre, roadmap. Already dark/polished SaaS look. |
| Letter generator | `letter-generator/` | Builds public-service letters from a form; org-specific guidance, evidence/safety notes, deadline calc, copy/download/print/email, action + handoff packs; draft saved to `localStorage`. |
| Accessible forms | `accessible-forms/` | Gallery of GOV.UK-style accessible form patterns; filters; reviewer notes (`localStorage`); JSON export. |
| Public service directory | `public-service-directory/` | Escalation routes by sector; evidence checklists; readiness scoring; contact log; saved action plans (`localStorage`). |
| Legal templates | `legal-templates/` | Plain-English template library (rail delay, SAR, housing, airline…); evidence/safety/escalation notes; favourites (`localStorage`). |
| Design system | `design-system/` | Colour tokens, contrast table, component inventory, recipes, token export, shortlist (`localStorage`). |

**Problem being solved:** The umbrella site is polished (dark navy SaaS) but the five
mini-apps use a plainer, **diverging** `topbar`/`hero`/`cards` style. There is no shared
visual layer, so the suite does not read as one product, and styling drifts per app.

**Existing shared infrastructure to reuse (do not rebuild):**

- `shared/deadlines/index.mjs` — `calculateDeadline`, `addWorkingDays`, `parseLocalDate`,
  `toLocalDateString` (working-day deadline math).
- `shared/exports/index.mjs` — `createTextExport`, `createMarkdownDocument`,
  `createPrintDocument`, `safeFilename` (txt/md/print export).
- `shared/privacy/local-storage.mjs` — `storageRegistry`, `clearKnownStorage`,
  `describeStorageRegistry` (registry of every `localStorage` key each tool uses).
- `design-system` contrast logic — `getContrastSummary` (WCAG ratio calculation).

## Part 1 — Visual redesign (Claude design language)

### 1.1 Shared design layer (single source of truth)

Create `shared/claude/`:

- **`tokens.css`** — CSS custom properties:
  - Surfaces: warm paper `--paper` (`#FAF9F5`), secondary surface `--paper-2`
    (`#F5F4EE`), card `--surface`, sunken `--surface-sunk`.
  - Ink: `--ink` (`#1F1E1C`), `--ink-muted`, `--ink-subtle`.
  - Accent: clay/coral `--accent` (`#D97757`) + hover/active variants; a second
    "energy" accent (deep teal, e.g. `#1A6A6A`) for highlights, links, and active states.
  - Status: success / warning / danger, each contrast-checked on paper.
  - Borders: low-contrast `--line`, focus `--focus-ring`.
  - Type: serif display family stack (`--font-display`), clean sans body
    (`--font-body`), mono for code/tokens; a modular type scale.
  - Spacing: 8pt scale (`--space-1`..`--space-12`).
  - Radius: `--radius-sm/md/lg`; shadow scale (soft, warm-tinted).
  - **Dark theme:** the same tokens redefined under `[data-theme="dark"]` (warm
    charcoal paper, clay accent retained), plus a `prefers-color-scheme` default.
  - **Contrast contract:** every foreground/background token pair documented and
    verified ≥ WCAG AA using the existing `getContrastSummary` logic (add a token-pair
    audit so CI can prove it).
- **`components.css`** — reusable component classes used by all pages: `button`
  (primary/secondary/ghost), `card`, `input`/`select`/`textarea` + `label`/error,
  `panel`, `tag`, `table`, `site-header`/`nav`/`nav-toggle`, `footer`, `hero`,
  `code-window` (recipe/token preview), `toast`/status region, `skeleton`, `meter`/ring.
- **`motion.css`** — reveal-on-scroll, hover lift, focus transitions, all gated behind
  `@media (prefers-reduced-motion: reduce)` (no motion when reduced).

Each page's `styles.css` is reduced to: `@import` the three shared files, then only
app-specific layout/overrides. Target: per-app stylesheet < ~150 lines.

### 1.2 Per-page redesign

All six pages get a redesigned, consistent **header** (serif brand, calm nav, working
mobile `nav-toggle`, theme toggle) and **footer**.

1. **Umbrella site** — recompose dark-navy SaaS → warm Claude editorial. Serif hero with
   clay accent; calm toolkit grid; redesigned workflows selector; privacy centre; roadmap
   timeline restyled. Keep all existing section anchors and copy semantics.
2. **Letter generator** — two-pane editor: form (left) + live letter "paper" preview
   (right) styled like real letterhead. Evidence + deadline rails. Actions row restyled.
3. **Accessible forms** — editorial gallery cards with live form preview; filters as
   calm chips; before/after pattern presentation.
4. **Public service directory** — escalation "journey" timeline; readiness score as a
   warm progress ring/meter; contact log restyled.
5. **Legal templates** — library with serif template preview pane; favourites as a warm
   "shelf"; filter chips.
6. **Design system** — becomes the **living showcase** of the new Claude tokens
   (dogfooding): token swatches, contrast table, component inventory all rendered from
   the shared layer.

## Part 2 — Feature build (15 features, all static/local-first)

### Cross-suite

1. **Theme system** — warm light + warm dark, toggle in header, persisted to
   `localStorage` (`open-access-uk:theme`), honours `prefers-color-scheme` on first load.
   Register the key in `shared/privacy` registry.
2. **Unified Privacy Centre ("My local data")** — a live dashboard (on the umbrella site,
   and linkable from each app) built on `shared/privacy` `storageRegistry`: lists exactly
   what each tool has saved **in this browser**, with per-item delete and clear-all,
   reading live presence/size from `localStorage`.
3. **Command palette (⌘K / Ctrl+K)** — keyboard-first overlay to jump to any tool,
   workflow, template, or escalation route. Built from a static client-side index.
   Fully keyboard operable, focus-trapped, ESC to close.
4. **Suite-wide search** — text search across tools, templates, escalation routes, and
   form patterns from a static index; powers the command palette and an umbrella search box.
5. **"Continue where you left off"** — umbrella reads (never writes) existing
   `localStorage` keys via the registry and surfaces resumable drafts/plans/favourites
   with deep links back into each tool.

### Letter generator

6. **Deadline tracker + calendar export** — use `shared/deadlines` to compute the
   response-by date; show a countdown; generate an `.ics` file **locally** for download
   (no network). New shared helper `shared/calendar/ics.mjs`.
7. **Tone / clarity assistant (offline, rule-based)** — local readability + plain-English
   checks on the drafted letter: estimated reading age, passive-voice flags, jargon/long-
   sentence flags. **No AI/network calls.** New module `shared/readability/index.mjs`.
8. **Portable evidence checklist** — a shared evidence model so a letter's evidence list
   can hand off to the directory's readiness report (export/import via clipboard or
   `localStorage` handoff key, registered in privacy registry).

### Public service directory

9. **Escalation timeline view** — visual step-by-step journey (e.g. council → ombudsman)
   driven by existing route data, with the readiness ring from existing scoring.
10. **Calendar export for escalation deadlines** — reuse `shared/calendar/ics.mjs` to
    export escalation deadline reminders locally.

### Legal templates

11. **Fill-in / live document mode** — fill template placeholders inline and see the live
    rendered document; export to txt/md/print via `shared/exports`.
12. **Collections** — group favourites into named local collections (e.g. "My housing
    case"). Stored in `localStorage`; key registered in privacy registry.

### Accessible forms

13. **Live accessibility linter** — preview a form pattern and run WCAG checks (label
    presence, contrast via `getContrastSummary`, focus order, fieldset/legend) with
    plain-English findings. Reuses design-system contrast logic.

### Design system

14. **Token playground + export** — edit token values live, watch components react,
    export CSS/JSON (extends existing token export). Edits are local/in-session only.

### Shared

15. **Unified print-to-PDF styling** — a shared print stylesheet so every "document"
    output (letters, readiness reports, contact logs, filled templates) prints/saves to
    PDF cleanly via the browser's native print-to-PDF. No PDF library, no backend.

## New / changed shared modules

- `shared/claude/tokens.css`, `components.css`, `motion.css` — design layer.
- `shared/claude/print.css` — print/PDF styling (feature 15).
- `shared/calendar/ics.mjs` (+ test) — local `.ics` generation (features 6, 10).
- `shared/readability/index.mjs` (+ test) — offline readability/plain-English checks
  (feature 7).
- `shared/privacy/local-storage.mjs` — add new keys: theme, evidence handoff,
  legal-templates collections.
- `shared/search/index.mjs` (+ test) — static suite index + search (features 3, 4).

## Architecture & boundaries

- **Design layer is presentation-only** — no JS behaviour in `shared/claude/`.
- **Each shared JS module is pure and unit-tested** (`node --test`), no DOM dependency in
  the core logic (DOM wiring lives in each app's `src/`), mirroring the current split
  between `letter.js` (logic) and `app.js` (DOM).
- **Privacy registry is the single source of truth** for what is stored; every feature
  that writes `localStorage` must register its key and appear in the Privacy Centre.
- **Each app's `src/app.js`** wires DOM to shared logic; keep files focused. If
  `letter.js`/directory logic files grow too large while adding features, split by concern.

## Error handling

- `localStorage` may be unavailable (private mode / disabled): every read/write wrapped;
  features degrade gracefully (no crash, clear message), matching existing patterns.
- Clipboard / download / print failures show a plain-English fallback (manual
  select-and-copy), as the letter generator already does.
- Offline by design — no network error paths to handle for user data.

## Testing

- **Unit:** `node --test` for every new shared module (`ics`, `readability`, `search`),
  plus extend `shared/privacy` and `shared/exports` tests for new keys/outputs.
- **A11y:** existing `@axe-core/playwright` a11y specs must pass on every redesigned page;
  add a11y specs for command palette, theme toggle, and privacy centre.
- **E2E:** existing Playwright e2e for the umbrella + extend to cover theme persistence,
  command palette navigation, and "continue where you left off".
- **Static quality:** existing `scripts/static-quality.mjs`, `prettier --check`,
  stylelint, and Lighthouse budget must continue to pass (no regression).
- **Contrast audit:** add a check that every token pair in `shared/claude/tokens.css`
  meets WCAG AA using `getContrastSummary`.

## Out of scope (YAGNI)

- Any backend, accounts, sync, or server storage.
- Any analytics/telemetry.
- AI/LLM-powered features or network calls for user content (tone assistant is
  rule-based and offline).
- Adding a build step, bundler, CSS framework, or JS runtime dependency.
- A real PDF-generation library (browser print-to-PDF only).

## Implementation order (suggested)

1. **Foundation:** `shared/claude/` design layer + theme system (1) + design-system page
   as living showcase. Establishes the look before touching every page.
2. **Roll out redesign** page by page (umbrella → letter → directory → templates → forms),
   each reduced to a thin `styles.css`.
3. **Shared feature modules:** `ics`, `readability`, `search`, privacy registry updates
   (with tests).
4. **Wire features** into each app (2–14).
5. **Print/PDF styling** (15) across all document outputs.
6. **Tests + quality gates** green; Privacy Centre reflects all new keys.
