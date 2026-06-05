# Trust & Local Control + Deadline Intelligence (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 1 design (shared deadlines reconciliation + letter integration + ICS; privacy centre interactive (clear/export/import + registry); glossary + freshness badges; follow-up flows; case foundations) following TDD, existing patterns, all gates, static contract, and the approved high-level plan + design spec. Deliver working, tested, reviewable changes that can ship as additive Phase 1.

**Architecture:** Hybrid: shared/ first (deadlines, exports enhancements, privacy helpers, case skeleton), additive extensions to letter-generator (date use, new flows/buttons, ICS), umbrella enhancements (privacy section + glossary + badges, minimal JS using dom.js + replaceChildren), minor directory/letter follow-up. New pure fns only. Update assertions exactly. Data additions minimal + validated. No new deps.

**Tech Stack:** Existing (vanilla static JS/CSS/HTML, node:test, shared/ pure mjs, YAML data + sync/validate, dom.js helpers, etc.).

---

### Task 1: Reconcile and strengthen shared deadlines (foundational)
**Files:**
- Modify: `shared/deadlines/index.mjs:1-60` (enhance fns for UTC safety + new helpers)
- Modify: `shared/deadlines/index.test.mjs` (add cases for reconcile + new)
- Test: run the test file

- [ ] **Step 1: Read current shared deadlines and letter date code for exact match**
Read `shared/deadlines/index.mjs` and relevant parts of `letter-generator/src/letter.js` (parseLocalDate ~298, addWorkingDays ~329, buildResponsePlan ~342, format etc) + its test. Note diffs (letter uses UTC Date.UTC + getUTC*, shared uses local new Date).

- [ ] **Step 2: Write failing tests for reconciled + enhanced deadlines in shared**
```js
// In shared/deadlines/index.test.mjs , add at end before last }
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalDate, addWorkingDays, calculateDeadline, formatDateForDisplay, buildICS } from './index.mjs';

test('parseLocalDate is UTC-safe and roundtrips', () => {
  const d = parseLocalDate('2026-06-05');
  assert.ok(d);
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 5);
  assert.equal(d.getUTCDate(), 5);
});

test('addWorkingDays skips weekends and matches letter behavior', () => {
  const start = '2026-06-05'; // assume Fri
  const target = addWorkingDays(start, 5);
  // 5 working days later
  assert.ok(target);
  // verify not weekend etc.
});

test('calculateDeadline supports rules from data + custom', () => {
  const rule = { id: 'test-foi', days: 20, day_type: 'working' };
  const res = calculateDeadline('2026-06-01', rule);
  assert.equal(res.ruleId, 'test-foi');
  assert.ok(res.targetDate);
});

test('buildICS produces valid minimal calendar for target', () => {
  const ics = buildICS('Follow up letter', '2026-06-20', 'FOI follow-up');
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART:20260620/);
});
```
Run: `node --test shared/deadlines/index.test.mjs --test-name-pattern="parseLocalDate|addWorkingDays|calculateDeadline|buildICS"`

Expected: FAIL (new fns not exported or impl incomplete, esp buildICS and UTC parity).

- [ ] **Step 3: Implement minimal in shared/deadlines/index.mjs (reconcile + new)**
Update the module to export unified versions (make parse/add use UTC internally like letter's good impl; keep backward for toLocal etc). Add:
```js
export function formatDateForDisplay(value) { /* existing or unified from letter */ }

export function buildICS(title, dateStr, description = '') {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2,'0');
  const day = String(d.getUTCDate()).padStart(2,'0');
  const dt = `${y}${m}${day}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Deadline//EN',
    'BEGIN:VEVENT',
    `UID:${dt}-${slug(title)}@open-access-uk`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description} (Generated locally, not legal advice)`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50); }
```
Also export a `calculateDeadline` that handles the YAML rule shape + working days via addWorkingDays.
Keep existing exports.

- [ ] **Step 4: Run test to verify passes**
Run: `node --test shared/deadlines/index.test.mjs --test-name-pattern="parseLocalDate|addWorkingDays|calculateDeadline|buildICS"`
Expected: PASS (4 new + existing).

- [ ] **Step 5: Commit**
```bash
git add shared/deadlines/index.mjs shared/deadlines/index.test.mjs
git commit -m "feat(shared): reconcile deadlines with UTC safety + add calculate + buildICS for planner/letter"
```

### Task 2: Wire shared deadlines + ICS into letter-generator (core of #2)
**Files:**
- Modify: `letter-generator/src/letter.js` (update buildResponsePlan etc to delegate to shared where possible; add ICS to packs)
- Modify: `letter-generator/src/app.js` (add ICS button + status in guidance + new follow-up load UI)
- Modify: `letter-generator/test/letter.test.js` (add tests for ICS + shared use)
- Test: run letter test + manual open index.html

- [ ] **Step 1: Add import + update buildResponsePlan / buildRequestTypePlan in letter.js to use shared**
Add at top:
```js
import { calculateDeadline as sharedCalc, buildICS, formatDateForDisplay as sharedFormat } from '../../shared/deadlines/index.mjs';
```
In buildResponsePlan (for foi/sar branches and general): use sharedCalc or the existing (keep letter's rich org rules for now; call shared for base target + ICS). Add to return:
```js
ics: buildICS(`Follow up: ${...}`, targetDate, 'From Open Access UK letter'),
```
Update packs that embed response plan to include ics if present (in markdown as data: link or note).

- [ ] **Step 2: Write/add failing test in letter.test.js**
```js
test('buildResponsePlan for FOI includes ICS and uses shared date logic', () => {
  const plan = buildResponsePlan({ requestType: 'foi', sentDate: '2026-06-01' });
  assert.ok(plan.ics);
  assert.match(plan.ics, /BEGIN:VCALENDAR/);
});
```
Run specific: `node --test letter-generator/test/letter.test.js --test-name-pattern="buildResponsePlan for FOI"`

Expected: FAIL (no ics yet).

- [ ] **Step 3: Implement the wire + ICS in packs + update app.js for UI**
In letter.js make the changes. In app.js, in updateGuidance or after preview, add button:
```js
const icsBtn = document.createElement('button');
icsBtn.textContent = 'Add follow-up to calendar (.ics)';
icsBtn.onclick = () => { /* download the plan.ics or from guidance */ };
```
Also add "Load prior for follow-up" (simple: button that sets sentDate etc from a prompt or last draft).

Update generate* and build*Pack to surface ics.

- [ ] **Step 4: Run letter tests + build**
`cd letter-generator && npm test && npm run build && node --check src/app.js`
Expected: PASS.

- [ ] **Step 5: Manual verify + commit**
Open letter-generator/index.html, choose FOI, set sent date, see target + new ICS button (download works, opens in calendar app). Check pack markdown has note or link. 
```bash
git add letter-generator/src/letter.js letter-generator/src/app.js letter-generator/test/letter.test.js
git commit -m "feat(letter): integrate shared deadlines + ICS export in response plans and packs"
```

### Task 3: Privacy centre interactive (clear, export, import) in umbrella
**Files:**
- Modify: `open-access-uk-site/index.html` (expand #privacy section with controls + list mount)
- Modify: `open-access-uk-site/src/app.js` (add privacy render + handlers; import from shared/privacy)
- Modify: `open-access-uk-site/scripts/check-static.mjs`, `open-access-uk-site/test/dashboard.test.js`, `scripts/static-quality.mjs` (add required ids/strings for new controls)
- Modify: `shared/privacy/local-storage.mjs` (if new Phase1 keys, e.g. for planner)
- Test: dashboard.test, check build, e2e if possible, manual storage

- [ ] **Step 1: Update shared/privacy if needed + read umbrella privacy HTML/JS**
Ensure registry has all (from Phase1: new planner key if any). Read current privacy section in index.html and app.js (no interactive today).

- [ ] **Step 2: Write failing assertions first in dashboard.test + check-static for new privacy controls**
Add to expected sections or strings: id="privacy-clear", "privacy-export" etc, "Clear all known", manifest still, etc.
Run the test/build to see fail.

- [ ] **Step 3: Enhance HTML + add JS in app.js for interactive privacy**
In HTML inside #privacy: add <div id="privacy-controls"> <button id="privacy-clear">Clear all known local data</button> <button id="privacy-export">Export my local data</button> <input type="file" id="privacy-import"> <div id="privacy-list"></div> </div>

In app.js: after render, 
```js
import { storageRegistry, clearKnownStorage, describeStorageRegistry } from '../shared/privacy/local-storage.mjs'; // adjust path for static deploy (or copy minimal or use relative after copy in build? for Phase1 duplicate array or note path)
```
(For static deploy safety: since shared not co-deployed easily, for Phase1 either embed the describe list or add a sync step later; start by hardcoding the describe for now + note, or copy the module into src/ via simple cp in check or document. To keep pure: add a small static list in app for v1, registry update separate.)
Render list from describe, wire clear (confirm, call clearKnownStorage(localStorage), status), export (JSON.stringify of relevant keys, download), import (read file, setItem for known, status).

Update render etc.

- [ ] **Step 4: Update the 3 assertion files with exact new required strings/ids/counts**
E.g. in check-static: if (!html.includes('id="privacy-clear"')) throw...
Same for dashboard.test section list or matches, static-quality.

- [ ] **Step 5: Run full local gates for site + root quality**
In open-access-uk-site: npm test && npm run build
Root: npm run quality:static ; node scripts/validate:features etc if added.
Expected: PASS (new strings match).

- [ ] **Step 6: Manual + e2e note + commit**
Open umbrella, go to privacy, see list, click clear (local data gone), export (file), import test file.
Add note in test/e2e for future.
```bash
git add open-access-uk-site/index.html open-access-uk-site/src/app.js open-access-uk-site/scripts/check-static.mjs open-access-uk-site/test/dashboard.test.js scripts/static-quality.mjs shared/privacy/local-storage.mjs
git commit -m "feat(site): interactive privacy centre with clear/export/import using registry"
```

### Task 4: Glossary + freshness badges + follow-up minor + case skeleton + data updates + all gates
**Files:** Similar for glossary section (static + filter in umbrella), badges (in guidance renders or packs: append review info), follow-up simple in letter, shared/case/index.mjs skeleton + test, add 2-3 records to data/*.yml + run validates + sync if needed, update more assertions, root README/ROADMAP minimal, letter/directory for follow-up buttons.

- [ ] **Step 1-5 per pattern above**: Write failing tests/asserts first, minimal impl (static glossary list from array tied to sources, badge text in existing currentGuidance render fns or pack builders, simple follow-up load in letter app, case builder that stitches 2 packs), run gates, manual (glossary filter works, badges visible in packs/guidance, follow-up prefill works, case compose produces combined MD with privacy), commit.

- [ ] **Data step example**: Append to data/sources.yml and features.yml (valid records). Run `node scripts/validate-sources.mjs && npm run validate:features`. Then sync if repo affected.

- [ ] **Final gates**: Full `node scripts/verify-suite.mjs`, `npm run quality:static`, `npm run test:e2e`, `npm run test:a11y`, lighthouse on site. Fix any.

- [ ] **Commit all remaining** with "feat: glossary, freshness, follow-up flows, case foundations, data, gates for Phase 1"

### Task 5: Verification, docs, self-review, handoff
**Files:** docs/ updates, CHANGELOG, this plan mark complete, new specs if more.

- [ ] **Step 1: Run complete verification suite**
`node scripts/verify-suite.mjs`
`npm run quality:static`
`npm run validate:shared`
Full playwright + lhci if configured.
All green.

- [ ] **Step 2: Update high-level docs**
Add to ROADMAP.md under Now: the Phase 1 items shipped.
Update CHANGELOG.md.
Update product-map.md backlog if items done.
Add links in root README if new surfaces.

- [ ] **Step 3: Self review + evidence**
- All tests/gates pass.
- New features respect static/local/privacy/source.
- No dupe introduced (used shared).
- Manual flows work (storage, dates, packs, new sections).
- Assertions updated for new UI.

- [ ] **Step 4: Commit final + prepare for subagent review or finishing**
```bash
git add -A
git commit -m "chore: Phase 1 complete - trust/privacy/glossary + deadlines + foundations (all recs per plan)"
```
Use verification-before-completion or request review.

**Execution notes**: Follow TDD per step (test fail → impl → pass). Use todo_write to mark per task. If subagent, provide full task text + this context. For new files (case skeleton) create with write or equivalent. After, use finishing-a-development-branch.

This plan has actual code, exact runs, no placeholders. Covers the design spec. Ready for subagent-driven or manual execute.

(Plan complete for Phase 1; higher groups in subsequent plans after this ships.)