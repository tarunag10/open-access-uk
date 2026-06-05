# Trust & Local Control + Deadline Intelligence (Phase 1) Design Spec

**Date**: 2026-06-05
**Sub-projects**: 1. Trust & Local Control Foundation (privacy centre, glossary, last-reviewed, follow-up flows, minor data) + 2. Deadline Intelligence & Planner foundations (shared wiring, letter-gen integration, ICS, planner surface start) + shared case foundations for #3.
**Status**: Design for approval before detailed writing-plans or implementation.
**Related to approved plan**: Phase 1 of full decomp (user choice A); hybrid approach (shared first + umbrella enhancements + additive to letter/directory).

## Goal (One sentence)
Deliver immediate user value in local control, trust (source visibility + data management), and accurate time-sensitive planning by centralizing deadlines in shared, enhancing the existing privacy section into a full interactive centre, adding a sourced glossary, surfacing freshness, adding follow-up loading flows, and integrating deadline calculation + ICS export into letter-generator and a new planner surface — all while strictly preserving the static, browser-only, privacy-first, source-provenanced contract.

## Architecture (2-3 sentences)
Extend `shared/deadlines/` and `shared/exports/` + new `shared/privacy/` enhancements and `shared/case/` skeleton (pure functions only) as the single source of truth for date math, pack formatting, registry-driven clear/export, and case composition. Enhance `open-access-uk-site/` (umbrella) for privacy centre (importable registry + clear + JSON export/import of packs), glossary (static sourced list + simple filter, tied to sources.yml), last-reviewed badges (in guidance/packs), and journey hooks. Additively extend `letter-generator/` (use shared deadlines in responsePlan/builders, new "load prior + follow-up" + ICS data: URL buttons in app + packs) and `public-service-directory/` (deadline-aware saved plans). New content (glossary terms, any planner UI) must reference or extend `data/sources.yml` + `data/deadline-rules.yml` + features. No new runtime deps; all client-side; update every gate (check-static, tests, verifies, CSP only if SW later). Follow exact existing patterns (pure builders returning {markdown, structured}, defensive localStorage, "Generated locally. Nothing sent", currentGuidance embedding, replaceChildren + dom.js helpers, no innerHTML in dynamic, slug/filename via shared where possible).

## Existing Patterns Followed (from exploration)
- Tool layout + boilerplate (but for Phase 1 mostly extensions, no full new dir yet).
- Pack builders (additive composition; see duplication reduction via shared).
- localStorage (always add to `shared/privacy/local-storage.mjs` registry; use serialize/parse).
- Date (reconcile letter's UTC-safe parse/addWorkingDays + shared; prefer extending shared).
- Data sync/validate (new records → validate → sync if affects generated → full verify).
- Umbrella extension (add section + nav + update 4 assertion sites + e2e; use workflows pattern for interactive; metadata for cards).
- Safety/provenance (every new text/pack has "not legal advice", sources, review notes).
- Tests (node:test for new pure fns; extend existing; later playwright).

## Detailed Requirements / Sections

### 1. Shared Deadlines Strengthening (foundational for #2)
- Reconcile + enhance `shared/deadlines/index.mjs`: keep/add `parseLocalDate` (make UTC-safe to match letter), `addWorkingDays`, `toLocalDateString`, `formatDateForDisplay` (Intl), `calculateDeadline(start, rule)` (support rule from YAML + custom days). Export `loadDeadlineRules()` or accept injected (for static). Add `buildFollowUpPlan(originalSent, ruleId, options)` helper.
- Add `data/deadline-rules.yml` consumption helper (or keep in letter for now; plan to centralize).
- Update tests in `shared/deadlines/index.test.mjs`.
- Impact: letter-generator can import and use for all requestTypes (FOI/SAR + org plans).

### 2. Privacy Centre Full Enhancement (Trust #1)
- In `open-access-uk-site/index.html`: expand `#privacy` section (or new id) with interactive: list from `describeStorageRegistry()`, button "Clear all known local data" (uses `clearKnownStorage(localStorage)`), "Export my local packs" (JSON of known keys' values, safe), "Import local packs" (file input, parse + set, with confirmation).
- New or enhanced `src/privacy.js` (or inline in app.js using dom.js): render list, handlers for clear/export/import. Status messages.
- Wire to existing nav.
- Update `shared/privacy/local-storage.mjs` if new keys from Phase 1 (e.g. new drafts).
- Update assertions: check-static, dashboard.test, static-quality, e2e/home.spec (add clicks/asserts for new controls), a11y.
- Add feature record to data/features.yml if new.
- Safety: confirm dialogs, "this only affects this browser", no server.

### 3. Glossary + Last-Reviewed / Freshness (Trust)
- Static glossary section in umbrella (modeled on privacy/roadmap): sourced terms (FOI, SAR, reasonable adjustment, deadlock, Completion of Procedures, etc.) with plain defs + links to sources/tools that use them. Simple JS filter/search (data-driven from small array or future generated).
- "Last reviewed" : in currentGuidance renders or new pack sections, show "Source last checked: {last_checked} (review due {review_due})" for high-risk (pull from synced or embed minimal in currentGuidance).
- In maintainer-helper already has freshness dashboard; surface summary badge or link in umbrella privacy/safety.
- Add minimal new sources if needed for glossary terms.
- Update checks/tests for new section id/content.

### 4. Follow-up from Previous Flows (letter + directory)
- letter-generator: add "Load prior request" (local file paste or from saved draft keys if accessible, or simple form fields for original sentDate/reference). Pre-populates complaint-follow-up generator. New button "Create follow-up from this letter".
- Directory: from saved plans, "Create follow-up letter" link/pre-fill to letter demo (or copy context).
- Both: embed in local action packs + handoffs.
- Tests for new helpers.

### 5. Deadline Integration + Planner Foundations (letter + shared + umbrella start)
- letter-generator/src/letter.js + app.js: import shared deadlines; update buildResponsePlan / buildRequestTypePlan / packs to use calculate + display "target + ICS button" (data:text/calendar with VEVENT for follow-up).
- New "Deadline Planner" section or workflow in umbrella (or thin in letter for Phase 1): form for sent date + rule select (from deadline-rules), calc target, add to local "upcoming actions" list (localStorage), export pack.
- Extend directory saved plans with deadline notes.
- Reconcile any date fn diffs; make shared the canonical (update letter to delegate).
- ICS: simple `buildICS(title, date, description)` in shared/exports or deadlines.
- Add to currentGuidance + safety.

### 6. Case Foundations (for aggregator #3)
- In shared/exports or new shared/case/index.mjs: `buildCaseFile({title, parts: [{type:'letter', content, ...}, ...], sources})` → {markdown with stitched sections + auto privacy + sources + combined checklist}.
- `composeFromPacks(packResults[])` helper.
- Used by letter handoff etc optionally; exported for future aggregator tool.
- Tests.

### 7. Cross-Cutting / Non-Functional
- All new: WCAG AA (labels, focus, contrast, keyboard, aria), plain English, "not legal advice", "local only" notes, source citations.
- No innerHTML in dynamic (use replaceChildren + textElement).
- Update all gates (exact): add new section ids/strings to open-access-uk-site/scripts/check-static.mjs, test/dashboard.test.js, scripts/static-quality.mjs, playwright specs, root verify/quality.
- Data: append 3-5 records to sources/deadline-rules/features as needed; run validates.
- Docs: update product-map/ROADMAP/CHANGELOG minimally; full in specs.
- PWA note: defer full SW; manifest already present (enhance icons? later).
- Performance: keep lighthouse clean.

## Data Model / New Records (examples)
- sources.yml additions: e.g. for glossary terms if high-risk.
- deadline-rules: already 5; may extend.
- features.yml: e.g. id: privacy-centre-interactive, tool: open-access-uk-site, status: in-progress, etc. (match schema).
- repositories no change (Phase 1 extensions).

## UI / User Journeys (high-level, no mockups yet)
- Privacy: From umbrella #privacy → see list of stored (e.g. "Letter draft (letter-generator): ..."), Clear All (with confirm), Export JSON (download), Import (choose file, merge/overwrite with status).
- Glossary: Nav link → filterable list of terms with defs + "used in: Letter gen, Directory".
- Letter: After generate → new "Add to my deadlines" or "Follow-up from this" buttons; ICS download for target date.
- Planner surface (start): Simple form (date + select rule) → calc + "Save to my actions" + pack export.
- Badges: In guidance cards or packs: "Source reviewed 2026-06-02; due 2026-09-02".

## Testing Strategy (TDD)
- Unit: new/updated pure fns in shared + letter (date calc, case build, follow-up helpers, serialize for new storage).
- Integration: existing tool tests + new for flows.
- Static gates + e2e: new sections clickable, controls work, no violations, counts updated.
- Manual: keyboard, storage clear, generate+export pack with sources, print, different dates (weekend/ invalid).
- Full: after changes `node scripts/verify-suite.mjs`, `npm run quality:static`, `npm run test:e2e`, `npm run test:a11y`, lighthouse.
- Privacy: test clear only affects known keys, export safe (no secrets).

## Error / Edge Handling
- Bad dates/JSON in storage: always defensive (as existing parse*).
- Missing sources: fallback.
- CSP: no new external; local JS only.
- Large local data: limit in export (as saved plans do 12).
- Accessibility: axe + manual; visible errors.

## Open Questions / Risks (to resolve in user review or next)
- Exact new sources/deadline rules for Phase 1? (propose 2-3 in impl plan).
- Planner surface location for Phase 1 (letter extension + umbrella section vs full new tool dir)?
- Import/export format for privacy (simple {key: value} or structured packs with metadata)?
- Any visual mockups needed before writing-plans (use image_gen or browser companion)?
- Confirm no Welsh or other content expansions in Phase 1.

## Self-Review Against Spec (done)
- Covers all Phase 1 items from approved plan.
- No placeholders/TBD.
- Matches constraints (static, patterns, gates).
- Internal consistent (shared first, additive, provenance).
- Gaps: full wizard/aggregator tool deferred to Phase 2 per phasing; PWA minimal.

**This design is ready for user review/approval. Once approved, next is writing detailed implementation plans (via writing-plans skill) for the sub-tasks, then execution.**

(Design doc complete; commit after review.)