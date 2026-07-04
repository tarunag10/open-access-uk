# Open Access UK — UK Market Expansion: 20 New Civic Tech Features

**Date:** 2026-06-30
**Status:** Approved design, ready for implementation planning

## Summary

Expand the Open Access UK suite with 20 new civic tech features targeting the UK's
highest-friction public-service pain points. Every feature is **static, local-first,
no backend, no tracking, WCAG AA**, matching the hard constraints of the existing
spec. The 20 features are organized in 4 tiers by impact and complexity, share existing
infrastructure (deadlines, exports, privacy registry, readability checks), and ship as
standalone HTML/CSS/JS pages under the umbrella site.

## Hard constraints (non-negotiable, inherited)

- **Static only.** Plain HTML/CSS/JS. Every page works by opening `index.html`.
- **Local-first.** No backend, no accounts, no server storage, no network calls for
  user data. All user content stays in `localStorage`.
- **No tracking.** No analytics, no hidden data collection.
- **Accessibility is a hard constraint.** WCAG AA minimum: contrast, visible focus,
  keyboard operability, screen-reader names, focus order, `prefers-reduced-motion`,
  `prefers-color-scheme`.
- **No new runtime dependencies.** No CSS frameworks, no JS libraries, no build step.
  Pure static assets.

## Architecture overview

Each feature lives under `features/<feature-slug>/` with:

```
features/<feature-slug>/
  index.html        — single-page app entry
  styles.css        — imports shared/claude/tokens + components, adds feature-specific layout
  src/
    app.js          — DOM wiring (thin controller)
    <domain>.js     — domain logic (pure, unit-testable, no DOM)
    data.js         — static reference data (UK-specific, sourced/attributed)
```

Shared modules reused:

| Module                             | Used by                            |
| ---------------------------------- | ---------------------------------- |
| `shared/deadlines/index.mjs`       | Features 1, 2, 3, 5, 6, 7, 10      |
| `shared/exports/index.mjs`         | All features (txt/md/print output) |
| `shared/privacy/local-storage.mjs` | All features (key registration)    |
| `shared/calendar/ics.mjs`          | Features 2, 3, 5, 7, 10            |
| `shared/readability/index.mjs`     | Features 1, 4, 5, 6, 8, 9, 10      |
| `shared/claude/tokens.css`         | All features                       |
| `shared/claude/components.css`     | All features                       |
| `shared/claude/motion.css`         | All features                       |
| `shared/claude/print.css`          | All features (print/PDF output)    |

## Shared infrastructure reuse

### Deadline engine (`shared/deadlines`)

- `calculateDeadline(startDate, workingDays)` — compute response deadlines per UK
  working days (bank holidays included).
- `addWorkingDays(date, n)` — chain deadlines (e.g., initial → ombudsman → tribunal).
- Used for: complaint response windows, appeal filing deadlines, tribunal time limits.

### Export engine (`shared/exports`)

- `createTextExport(content, filename)` — plain text download.
- `createMarkdownDocument(content, filename)` — markdown download.
- `createPrintDocument(html, filename)` — trigger browser print dialog.
- `safeFilename(name)` — sanitise user-provided names for file saves.

### Privacy registry (`shared/privacy`)

- `storageRegistry` — central map of every `localStorage` key, which feature owns it,
  and a human-readable description.
- `clearKnownStorage()` — clear all registered keys.
- Every new feature must register its keys before writing anything.

### Readability engine (`shared/readability`)

- `estimateReadingAge(text)` — UK reading-age estimate.
- `flagPassiveVoice(text)` — passive voice detection.
- `flagLongSentences(text)` — sentences > 25 words.
- `flagJargon(text, dictionary)` — common jargon detection.

### Calendar (`shared/calendar/ics`)

- `generateICS(events)` — produce a valid `.ics` file for deadline reminders.
- No network calls; download triggers a local file save.

### Design system (`shared/claude`)

- `tokens.css`, `components.css`, `motion.css`, `print.css`.
- All features import these; feature CSS is < 150 lines of layout overrides only.

## Geographic coverage strategy

All features work UK-wide by default. Where data varies by nation or local authority:

| Scope             | Approach                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UK-wide (default) | Static data covers England, Scotland, Wales, NI. User selects nation at start.                                                                                                                     |
| England-only      | Feature clearly labelled. Scotland/Wales/NI users see "Not available in your region" with links to equivalent routes.                                                                              |
| Local authority   | User selects LA from a static dropdown (England: 317 LAs, Scotland: 32 councils, Wales: 22 LAs, NI: 11 councils). LA-specific data (addresses, deadlines, phone numbers) is embedded in `data.js`. |
| Devolved          | Scotland/Wales/NI get adapted guidance text where legislation differs (e.g., Scottish housing law vs. English).                                                                                    |

Region selection is stored in `localStorage` under `open-access-uk:region` and
propagated across all features as a shared preference.

## Source provenance requirements

Every feature must document:

1. **Data sources** — which statutes, regulations, guidance, or official data underpin
   the feature. Cited inline in `data.js` comments and in a visible "Sources" section
   on the page.
2. **Last verified date** — when the reference data was last checked against official
   sources. Stored in `data.js` as `export const LAST_VERIFIED = 'YYYY-MM-DD'`.
3. **Disclaimer** — prominent notice that this tool provides guidance, not legal advice;
   users should seek professional advice for complex cases.
4. **Versioning** — when legislation changes, update `data.js` and bump a `DATA_VERSION`
   constant. The privacy registry stores the current version.

## Testing strategy

### Unit tests (`node --test`)

- Every new `domain.js` module gets unit tests in `features/<slug>/tests/`.
- Shared module extensions (new exports from deadlines, exports, readability, calendar)
  get unit tests in `shared/<module>/tests/`.

### A11y tests (Playwright + `@axe-core/playwright`)

- Every new feature page gets an a11y spec: zero critical/serious violations.
- Command palette, theme toggle, and privacy centre remain regression-tested.

### E2E tests (Playwright)

- Critical user journeys per feature (form fill → generate → download).
- Theme persistence, "continue where you left off", region selection propagation.

### Static quality

- `scripts/static-quality.mjs` continues to pass.
- `prettier --check`, stylelint, Lighthouse budget (no regression).

### Contrast audit

- Every token pair in `shared/claude/tokens.css` verified ≥ WCAG AA.

## Accessibility approach

### WCAG AA compliance (all features)

- **Colour:** All text/background pairs ≥ 4.5:1 (normal text) or ≥ 3:1 (large text).
- **Focus:** Visible focus ring on all interactive elements; focus order follows logical
  reading order.
- **Keyboard:** Every action reachable via keyboard; no keyboard traps; skip links.
- **Screen readers:** Semantic HTML (`<main>`, `<nav>`, `<section>`, `<h1>`–`<h6>`),
  ARIA labels where semantic HTML is insufficient, live regions for dynamic content.
- **Motion:** `prefers-reduced-motion: reduce` disables all animation.
- **Colour scheme:** `prefers-color-scheme` respected; theme toggle available.
- **Error identification:** Form errors identified in text, not colour alone; error
  messages linked to fields via `aria-describedby`.
- **Input purpose:** `autocomplete` attributes on personal data fields where applicable.
- **Target size:** Interactive targets ≥ 44×44 CSS pixels.

### Feature-specific a11y

- Form-heavy features (complaints, appeals): fieldsets with legends, error summaries
  with focus management.
- Document preview: `role="document"` on preview panes; print styles preserve
  semantic structure.
- Data tables: proper `<th>` with `scope`, sortable columns announced via live regions.
- Timers/deadlines: countdown announced via `aria-live="polite"` at reasonable
  intervals (not every second).

## Privacy impact

### Data collected

All data is user-entered and stored **only** in the browser's `localStorage`. No data
leaves the device.

### localStorage keys (all registered in privacy registry)

| Key                                     | Feature(s) | Contents                                 |
| --------------------------------------- | ---------- | ---------------------------------------- |
| `open-access-uk:region`                 | All        | Selected nation/local authority          |
| `open-access-uk:nhs-complaint-drafts`   | 1          | NHS complaint drafts                     |
| `open-access-uk:benefits-appeal-drafts` | 2          | Benefits appeal drafts + evidence lists  |
| `open-access-uk:parking-appeal-drafts`  | 3          | Parking ticket appeal drafts             |
| `open-access-uk:exclusions-drafts`      | 4          | School exclusion/SEND appeal drafts      |
| `open-access-uk:tribunal-drafts`        | 5          | Employment tribunal case documents       |
| `open-access-uk:immigration-drafts`     | 6          | Immigration/visa complaint drafts        |
| `open-access-uk:sanctions-drafts`       | 7          | UC sanctions challenge drafts            |
| `open-access-uk:repair-logs`            | 8          | Right to repair evidence logs            |
| `open-access-uk:section-21-drafts`      | 9          | Section 21/8 notice validation results   |
| `open-access-uk:protocol-drafts`        | 10         | Pre-action protocol letters              |
| `open-access-uk:foi-batches`            | 11         | Multi-authority FOI batch configurations |
| `open-access-uk:deadline-cascade`       | 12         | Saved deadline cascade states            |
| `open-access-uk:evidence-checks`        | 13         | Evidence upload readiness results        |
| `open-access-uk:parsed-cases`           | 14         | Email-to-case parsed results             |
| `open-access-uk:welsh-prefs`            | 15         | Welsh language preferences               |
| `open-access-uk:ombudsman-outcomes`     | 16         | Bookmarked ombudsman outcomes            |
| `open-access-uk:la-scores`              | 17         | Saved LA performance comparisons         |
| `open-access-uk:complaint-routes`       | 18         | Regulated professional complaint configs |
| `open-access-uk:fee-calcs`              | 19         | Saved fee calculations                   |
| `open-access-uk:format-requests`        | 20         | Accessible format request drafts         |

### Mitigations

- `localStorage` has a ~5 MB limit per origin; features check available space before
  writing and show a warning if approaching the limit.
- All keys prefixed with `open-access-uk:` for easy identification and bulk deletion.
- Privacy Centre dashboard (feature from previous spec) lists all keys with per-item
  delete and clear-all.
- Private browsing mode: features degrade gracefully with a clear message that data
  will not persist.

---

## TIER 1 — HIGH IMPACT, HIGH VOLUME

### Feature 1: NHS Complaints Tracker

**Purpose:** Help patients draft, track, and escalate NHS complaints through the
formal NHS complaints procedure (including PALS, formal complaint, and Ombudsman
stages).

**User journey:**

1. Select NHS trust or GP practice from a static list (or enter custom).
2. Describe the incident in structured form (date, what happened, impact).
3. Choose complaint stage (PALS informal, formal complaint, Parliamentary/Health
   Service Ombudsman).
4. Generator produces a formal complaint letter with the correct legal references
   (NHS Act 2006, HSC Act 1998, NHS Complaints Regulations 2009).
5. Track deadline (must acknowledge within 3 working days, respond within 25 working
   days for formal complaints).
6. Export letter, save draft, set calendar reminder.

**Key features:**

- Multi-stage complaint workflow (PALS → formal → Ombudsman escalation).
- Automatic deadline calculation using `shared/deadlines` (NHS working days).
- Duty of Candour reminder (Health and Social Care Act 2008, Reg 20).
- Evidence checklist (medical records request, incident dates, staff names).
- Letter tone adjuster (formal, firm but polite, escalation language).
- Calendar export for acknowledgement and response deadlines.

**Data requirements:**

- NHS Trust directory (217 trusts in England, with addresses and PALS contacts).
- GP practice directory (approx. 6,500 practices with ICB associations).
- NHS Complaints Regulations 2009 response timescales.
- Health Service Ombudsman stages and time limits.
- Scottish NHS (Public Information Commissioner), Welsh (Public Services Ombudsman),
  NI (Patient & Client Council) equivalents.

**Source provenance:** NHS Complaints Regulations 2009 (SI 2009/309), NHS Act 2006
s114, Health and Social Care Act 2008 (Regulated Activities) Reg 20 (Duty of Candour),
Parliamentary and Health Service Ombudsman "Understanding complaints" guidance.

**Integration points:**

- `shared/deadlines` — NHS working-day deadline calculation.
- `shared/exports` — letter output (txt/md/print).
- `shared/calendar/ics` — deadline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:nhs-complaint-drafts`

**Technical notes:**

- NHS Trust data is ~120 KB as JSON; lazy-load on first interaction.
- PALS contact details change frequently; data verified quarterly (stale data warning
  shown if > 90 days old).
- Duty of Candour applies separately from complaints procedure; tool cross-references
  both timelines.

**WCAG considerations:**

- Complex form with conditional fields: use `aria-controls` and `aria-expanded` to
  announce conditional sections.
- Deadline countdown uses `aria-live="polite"` with 60-second interval (not every second).
- Error summary with focus management on validation failure.

**Risk level:** Medium — data freshness of NHS contacts; multi-stage workflow complexity.

---

### Feature 2: Benefits Appeals System (UC/PIP/ESA)

**Purpose:** Guide users through the mandatory reconsideration and appeal process
for Universal Credit, Personal Independence Payment, and Employment and Support
Allowance decisions.

**User journey:**

1. Select benefit type (UC, PIP, ESA) and decision type (new claim, change of
   circumstances, renewal, sanctions).
2. Enter decision details (date of decision, what was decided, why they disagree).
3. Tool explains mandatory reconsideration (must request within 1 month) and
   tribunal appeal (must appeal within 1 month of MR decision).
4. Generator produces mandatory reconsideration request letter.
5. If MR fails or is not revised, tool generates tribunal appeal form guidance
   (SSCS1 form walkthrough).
6. Evidence checklist generated based on benefit type and condition.

**Key features:**

- Benefit-specific workflows (UC/PIP/ESA have different procedures and forms).
- Mandatory reconsideration deadline tracker (30 calendar days from decision).
- Tribunal appeal deadline tracker (30 calendar days from MR notice).
- Evidence strength scoring (based on medical evidence, functional assessments,
  witness statements).
- Form walkthrough for SSCS1 (tribunal appeal form) with plain-English guidance.
- Calendar export for all critical deadlines (MR request, MR response, appeal filing).

**Data requirements:**

- DWP decision maker addresses (by benefit type and region).
- HMCTS tribunal address (Social Entitlement Chamber).
- SSCS1 form field definitions and guidance notes.
- Benefit-specific evidence types (PIP: daily living/mobility descriptors; ESA:
  work capability assessment; UC: housing/carer/child elements).
- Time limit rules per benefit type and decision stage.

**Source provenance:** Social Security Act 1998, Universal Credit Regulations 2013,
PIP Regulations 2014, ESA Regulations 2008, Tribunal Procedure (First-tier Tribunal)
(Final-Tier Tribunal and Immigration and Asylum Chamber) Rules 2008.

**Integration points:**

- `shared/deadlines` — mandatory reconsideration and appeal deadlines.
- `shared/exports` — letter and form guidance output.
- `shared/calendar/ics` — all deadline reminders.
- `shared/readability` — plain-English check on letters.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:benefits-appeal-drafts`

**Technical notes:**

- SSCS1 form is ~40 fields; guide users through sections, not all at once.
- PIP descriptors are the most complex; provide a descriptor-by-descriptor checklist.
- Tribunal success rates vary by benefit (PIP: ~70%, ESA: ~65%, UC: ~50%); include
  as contextual information, not as advice.

**WCAG considerations:**

- Multi-step wizard pattern: clear progress indicator, `aria-current="step"`.
- Conditional form sections: live region announcements when sections appear/disappear.
- Complex tables (descriptor scoring): proper `<th>` with `scope="row"` and
  `scope="col"`.

**Risk level:** High — benefit rules change frequently; tribunal procedures are
complex; high user vulnerability.

---

### Feature 3: Parking Ticket Appeal Generator

**Purpose:** Generate formal parking ticket (PCN) appeal letters for council and
private parking tickets, using the correct legal grounds and escalation routes.

**User journey:**

1. Select ticket type (council PCN, private parking charge, or bus lane/UTurn PCN).
2. Enter ticket details (date, location, council/private operator, grounds for appeal).
3. Choose appeal stage (first appeal to issuer, appeal to PATAS/IAPO, or tribunal).
4. Generator produces appeal letter citing relevant Traffic Management Act 2004,
   Protection of Freedoms Act 2012, or BPA/APA codes of practice.
5. Evidence upload checklist (photos, CCTV request, signage evidence).
6. Track appeal deadline (28 days for council PCN, varies for private tickets).

**Key features:**

- Council PCN vs. private parking charge distinction (different legal frameworks).
- Grounds selector with plain-English explanations (procedural defects, signage,
  proportionality, POFA 2012 keeper liability rules).
- Stage-appropriate language (first appeal: formal; PATAS: legal; tribunal: evidence-based).
- Template for requesting CCTV footage from council (Data Protection Act 2018).
- Proportionality argument generator (based on income guidelines and IPC/BPA codes).
- Calendar export for appeal deadlines and enforcement warning deadlines.

**Data requirements:**

- Council parking department addresses (by London borough and shire district).
- PATAS (Parking and Traffic Appeals Service) address and procedures.
- IAPO (Independent Appeals for Private Operators) address and procedures.
- BPA Approved Operator Scheme codes of practice.
- IPC (International Parking Community) code of practice.
- POFA 2012 keeper liability rules (s.9–s.12).

**Source provenance:** Traffic Management Act 2004, Protection of Freedoms Act 2012
(POFA), Civil Enforcement of Parking Contraventions (England) General Regulations 2007,
BPA Code of Practice, IPC Code of Practice.

**Integration points:**

- `shared/deadlines` — appeal deadline calculation.
- `shared/exports` — appeal letter output.
- `shared/calendar/ics` — deadline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:parking-appeal-drafts`

**Technical notes:**

- Private parking tickets have no single governing statute; guidance is code-of-practice
  based and must be carefully worded.
- POFA 2012 keeper liability rules are time-sensitive (must be served within statutory
  time limits); tool checks this automatically.
- London vs. rest of England has different enforcement processes (London: TfL/private
  enforcement; outside London: council enforcement).

**WCAG considerations:**

- Ticket type selector uses radio buttons with clear descriptions for each option.
- Evidence checklist uses a task-list pattern with checkboxes and progress reporting.
- All legal references are hyperlinked to plain-English explanations (not legal jargon).

**Risk level:** Medium — private parking law is complex and frequently litigated;
data freshness of council contacts.

---

### Feature 4: School Exclusions and SEND Appeal Helper

**Purpose:** Support parents/carers in appealing school exclusions (fixed-term and
permanent) and challenging SEND provision decisions.

**User journey:**

1. Select issue type (exclusion appeal, SEND tribunal, EHCP refusal, SEND
   provision complaint).
2. Enter school/local authority details (school name, LA, exclusion date, reasons
   given).
3. Tool explains legal framework (Education Act 1996, Education and Inspections
   Act 2006, SEND Code of Practice).
4. Generator produces exclusion appeal letter to the governing body (50% of permanent
   exclusion appeals succeed; include success context).
5. If exclusion upheld, generate Independent Review Panel (IRP) application.
6. For SEND: generate SEND tribunal application guidance with form walkthrough.

**Key features:**

- Exclusion appeal workflow (governor review → IRP → Secretary of State direction).
- SEND tribunal application guidance (form SEND343 walkthrough with plain-English).
- EHCP needs assessment request template (for initial applications and annual reviews).
- School-based evidence checklist (incident logs, behaviour records, SEN support plans).
- Legal references to: Education Act 1996 s51A (SEND duty), Equality Act 2010 (disability
  discrimination), SEND Code of Practice 2015.
- Calendar exclusion deadline tracker (governor panel must meet within 15 school days).

**Data requirements:**

- School directories (state schools in England by LA; independent schools separate).
- LA SEND tribunal addresses and procedures (HMCTS First-tier Tribunal, SEND Chamber).
- SEND tribunal application fees (currently free for parents; tool confirms).
- Exclusion time limits (governor panel: 15 school days; IRP: within 15 days of
  governor decision).
- EHCP annual review timescales.

**Source provenance:** Education Act 1996, Education and Inspections Act 2006,
SEND Code of Practice 2015, Education (Pupil Exclusions) (England) Regulations 2012,
Equality Act 2010.

**Integration points:**

- `shared/deadlines` — exclusion and tribunal deadlines (school-day calculation).
- `shared/exports` — letter and form output.
- `shared/calendar/ics` — all deadline reminders.
- `shared/readability` — plain-English check on letters.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:exclusions-drafts`

**Technical notes:**

- "School days" deadline calculation is non-trivial (excludes weekends, bank holidays,
  and school holidays); may need a school-term calendar or approximate working days.
- SEND tribunal has no fee for parents; tool should confirm this and not confuse with
  other tribunal fees.
- Exclusion data is highly sensitive (children's data); tool stores nothing about
  the child's identity — only incident details entered by the parent.

**WCAG considerations:**

- Sensitive content: clear, calm language; avoid alarmist framing in UI copy.
- Multi-step form with conditional paths: `aria-live` announcements for path changes.
- Progress indicator for multi-step wizard.

**Risk level:** Medium — school-day deadline calculation is approximate; SEND law
is complex and frequently updated.

---

### Feature 5: Employment Tribunal Case Builder

**Purpose:** Help employees build a case for employment tribunal, from ACAS early
conciliation through to tribunal application (ET1 form).

**User journey:**

1. Enter employment details (employer, role, dates, reason for claim).
2. Select claim type (unfair dismissal, discrimination, wages, redundancy, etc.).
3. Tool explains legal requirements (qualifying period, time limits, burden of proof).
4. Generator produces ACAS early conciliation notification (mandatory before tribunal).
5. Guide through ET1 form completion with plain-English field-by-field help.
6. Generate chronology/timeline of events as tribunal evidence.
7. Track time limits (3 months less 1 day from effective date of termination for
   unfair dismissal; varies for discrimination).

**Key features:**

- Claim-type selector with eligibility checker (qualifying period, time limits).
- ACAS early conciliation step-by-step guide (mandatory before tribunal claim).
- ET1 form walkthrough (33 pages simplified into guided sections).
- Event chronology builder (date-driven timeline exportable as evidence).
- Evidence categorisation (documents, witness statements, expert reports).
- Compensation calculator (basic award + compensatory award, statutory caps).

**Data requirements:**

- ACAS early conciliation address and phone number.
- HMCTS tribunal office addresses (regional: London Central, London South, etc.).
- Statutory caps (compensatory award: lower of 52 weeks' pay or £115,115 from
  April 2026; basic award: £ per week of service by age).
- Discrimination time limits (3 months less 1 day, different from dismissal).
- Qualifying periods (1 year continuous service for unfair dismissal; none for
  discrimination).

**Source provenance:** Employment Rights Act 1996, Equality Act 2010, Employment
Tribunal (Constitution and Rules of Procedure) Regulations 2013, ACAS Code of
Practice, Employment Rights (Dispute Resolution) Act 1998.

**Integration points:**

- `shared/deadlines` — tribunal time limits (critical; 3 months less 1 day).
- `shared/exports` — ET1 guidance, chronology, letters.
- `shared/calendar/ics` — deadline reminders (ACAS, ET1 filing).
- `shared/readability` — plain-English check on tribunal documents.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:tribunal-drafts`

**Technical notes:**

- Tribunal time limits are strict and short; tool must prominently warn about this.
- ACAS early conciliation extends the limitation period; tool calculates the extended
  deadline when ACAS certificate is issued.
- Compensation calculator must use current statutory rates (updated annually in April).
- Discrimination claims have no qualifying period but strict time limits (3 months
  less 1 day); tool must distinguish from dismissal claims.

**WCAG considerations:**

- Chronology timeline: accessible alternative to visual timeline (table or list view
  available alongside visual timeline).
- Compensation calculator: clear result announcement via `aria-live="assertive"`.
- Complex eligibility checker: use summary at top, detailed criteria below.

**Risk level:** High — strict time limits; tribunal rules change; high user vulnerability;
compensation figures update annually.

---

## TIER 2 — SPECIALIZED BUT CRITICAL

### Feature 6: Immigration and Visa Complaint Tool

**Purpose:** Assist immigration and visa applicants in drafting complaints about
Home Office delays, decision errors, and caseworker conduct.

**User journey:**

1. Select complaint category (visa processing delay, decision error, lost documents,
   caseworker conduct, breach of procedural fairness).
2. Enter application details (application type, date submitted, reference number
   if available).
3. Tool explains legal framework (Immigration Act 1971, Nationality Act 1981,
   procedural fairness principles).
4. Generator produces complaint letter to Home Office complaints address.
5. If Home Office fails to respond, generate complaint to Immigration Ombudsman.
6. Calendar export for Home Office response deadlines and escalation windows.

**Key features:**

- Category-specific complaint templates (delay, error, conduct, lost documents).
- Procedural fairness argument builder (based on case law principles).
- Home Office complaints address lookup (by application type).
- Immigration Ombudsman escalation guide.
- Document retention evidence log (for tracking what was submitted and when).
- Plain-English legal references (Immigration Rules, procedural fairness case law).

**Data requirements:**

- Home Office complaints addresses (by application type and location).
- Immigration Ombudsman address and procedures.
- Processing time standards (by visa type).
- Relevant statutory provisions (Immigration Act 1971, Human Rights Act 1998,
  ECHR Article 8).
- Common procedural fairness grounds (failure to consider evidence, bias, delay).

**Source provenance:** Immigration Act 1971, Nationality Immigration and Asylum
Act 2002, Human Rights Act 1998, Immigration Rules, Immigration Ombudsman guidance.

**Integration points:**

- `shared/deadlines` — escalation time windows.
- `shared/exports` — complaint letters.
- `shared/calendar/ics` — deadline reminders.
- `shared/readability` — plain-English check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:immigration-drafts`

**Technical notes:**

- Immigration law changes frequently; data versioning is critical.
- Home Office processing times are published but change; update quarterly.
- Sensitive content: immigration status is highly personal; tool must handle with
  care in UI copy and not store immigration status beyond what's necessary for the
  complaint letter.

**WCAG considerations:**

- Sensitive topic: calm, non-judgmental language throughout.
- Complex legal concepts: layered information (summary first, detail on request).
- Multi-language support potential (future enhancement; Welsh first in Tier 3).

**Risk level:** High — immigration law complexity; frequent changes; vulnerable users;
sensitivity of data.

---

### Feature 7: Universal Credit Sanctions Challenge

**Purpose:** Help UC claimants challenge unfair sanctions by drafting mandatory
reconsideration requests and tribunal appeals.

**User journey:**

1. Enter sanction details (date, amount, reason given by DWP, claimant's circumstances).
2. Tool explains sanction types (high, medium, low, failure to attend work coach).
3. Identify potential grounds for challenge (reasonable excuse, procedural error,
   disproportionality, failure to consider vulnerability).
4. Generator produces mandatory reconsideration request letter.
5. If MR unsuccessful, generate tribunal appeal guidance (SSCS1 form).
6. Track deadlines (MR within 1 month; appeal within 1 month of MR decision).

**Key features:**

- Sanction type identification and legal framework (UC Regulations 2013 reg 354–364).
- Grounds selector (reasonable excuse, vulnerability, procedural error, proportionality).
- Vulnerability flagging (mental health, disability, caring responsibilities, homelessness).
- MR request letter generator with legal references.
- Tribunal appeal guidance (SSCS1 walkthrough).
- Financial impact calculator (sanction amount vs. household hardship).

**Data requirements:**

- DWP benefit centre addresses (by region).
- Sanction types and corresponding statutory provisions.
- Reasonable excuse grounds (case law database of accepted excuses).
- Vulnerability factors (from DWP's own guidance and case law).
- Tribunal success rates for sanctions appeals.

**Source provenance:** Universal Credit Regulations 2013 (reg 354–364), Welfare Reform
Act 2012, Social Security Act 1998, DWP sanctions guidance.

**Integration points:**

- `shared/deadlines` — MR and appeal deadlines.
- `shared/exports` — MR request letters, tribunal documents.
- `shared/calendar/ics` — deadline reminders.
- `shared/readability` — plain-English check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:sanctions-drafts`

**Technical notes:**

- Sanctions disproportionately affect vulnerable users; UI must be accessible and calm.
- Financial impact calculator should show real-world effect (e.g., "14-day sanction
  = £X lost, which is Y% of your monthly UC").
- Tribunal success rate for sanctions challenges is ~50%; provide context without
  raising false hope.

**WCAG considerations:**

- Financial stress context: calm, supportive tone; avoid alarming calculations.
- Clear error identification: if user enters invalid amounts, clear guidance.
- Simple language for complex legal concepts.

**Risk level:** High — vulnerable users; financial stress; frequent DWP policy changes.

---

### Feature 8: Right to Repair Tracker (Social Housing)

**Purpose:** Help social housing tenants track and escalate repair requests, document
disrepair, and pursue legal remedies under landlord obligations.

**User journey:**

1. Enter repair details (type, date reported, landlord response, ongoing issues).
2. Log evidence (photos, correspondence, dates of contact).
3. Tool explains landlord obligations (Landlord and Tenant Act 1985 s11, Housing
   Act 2004, Homes (Fitness for Human Habitation) Act 2018).
4. Generator produces formal repair request letter with legal references.
5. If landlord fails to act, generate complaint to housing ombudsman or local
   authority environmental health.
6. Track repair timelines and escalation deadlines.

**Key features:**

- Repair logging with timestamped entries (date reported, date acknowledged, date
  completed).
- Evidence log with photo descriptions and correspondence tracking.
- Legal obligation references (s11 Landlord and Tenant Act 1985, HHSRS under
  Housing Act 2004).
- Escalation route generator (landlord → housing ombudsman → local authority
  environmental health → pre-action protocol).
- Formal repair request letter generator.
- Disrepair claim readiness scoring (evidence strength, duration of issue, impact
  on health).

**Data requirements:**

- Social landlord directories (by region; ~1,500 housing associations, ~160
  council landlord departments).
- Housing Ombudsman contact details and complaint procedure.
- HHSRS hazard categories (31 categories with assessment criteria).
- Relevant statutory timescales (emergency repairs: 24 hours; urgent: 7 days;
  routine: 28 days).
- Pre-action protocol for social housing claims.

**Source provenance:** Landlord and Tenant Act 1985 s11, Housing Act 2004 (HHSRS),
Homes (Fitness for Human Habitation) Act 2018, Housing Ombudsman Complaint Handling
Code.

**Integration points:**

- `shared/deadlines` — repair response deadlines.
- `shared/exports` — repair letters, evidence logs.
- `shared/calendar/ics` — escalation reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:repair-logs`

**Technical notes:**

- Photo evidence is stored as descriptions in `localStorage` (not actual photos, due
  to storage limits). Users instructed to keep original photos on their device.
- HHSRS hazard categories are detailed; provide summary view with detail on request.
- Social housing tenants may have limited digital access; tool should be lightweight
  and work on low-end devices.

**WCAG considerations:**

- Photo evidence entry: text description alternatives (not image-only input).
- Timeline view: accessible as both visual timeline and table.
- Simple, clear language (target reading age: 11).

**Risk level:** Medium — disrepair can be a health risk; tenant vulnerability; data
freshness of landlord contacts.

---

### Feature 9: Section 21/8 Notice Validator

**Purpose:** Help tenants verify whether a Section 21 (no-fault eviction) or
Section 8 (fault-based eviction) notice from their landlord is legally valid.

**User journey:**

1. Enter notice details (type, date served, grounds cited, landlord/agent details).
2. Tool runs a validation checklist against the legal requirements for valid notice.
3. For Section 21: checks prescribed form, deposit protection, EPC, gas safety
   certificate, How to Rent guide service, licensing (where required).
4. For Section 8: checks grounds cited are proven, notice period matches grounds,
   notice form is correct.
5. Generator produces a response letter to the landlord/agent identifying defects.
6. Links to relevant advice services (Shelter, Citizens Advice, local council).

**Key features:**

- Section 21 validity checklist (prescribed form, deposit, EPC, gas cert, How to
  Rent, licensing — each is a potential defect that invalidates the notice).
- Section 8 grounds checker (grounds 2–14 with plain-English explanations and
  evidence requirements for each).
- Notice period validator (correct notice period for each ground).
- Response letter generator identifying defects in the notice.
- Links to Shelter, Citizens Advice, local housing aid centres.
- Timeline view of eviction process from notice to court hearing.

**Data requirements:**

- Section 21 prescribed form requirements (Deregulation Act 2015 s33).
- Section 8 grounds (Grounds 1–14, Housing Act 1988 Sch 2).
- Notice periods per ground (Housing Act 1988, as amended).
- Deposit protection requirements (Housing Act 2004).
- EPC and gas safety certificate requirements (Deregulation Act 2015).
- How to Rent guide (updated by MHCLG periodically).

**Source provenance:** Housing Act 1988, Deregulation Act 2015, Housing Act 2004,
Renting Homes (Wales) Act 2016 (for Welsh tenants), Private Rented Sector code
of practice.

**Integration points:**

- `shared/deadlines` — notice period calculation.
- `shared/exports` — response letters.
- `shared/calendar/ics` — eviction timeline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:section-21-drafts`

**Technical notes:**

- Section 21 abolition is being implemented via the Renters' Reform Bill; tool must
  adapt when the bill receives Royal Assent and is commenced.
- Wales has different rules under Renting Homes (Wales) Act 2016; tool must distinguish.
- High-stakes feature: tenants facing eviction are extremely vulnerable; UI must be
  calm, supportive, and not raise false hope.

**WCAG considerations:**

- Critical information (invalidity of notice) prominently announced.
- Multi-step checklist with clear completion status.
- Links to emergency advice services clearly distinguishable.

**Risk level:** High — eviction is high-stakes; legal changes pending (Renters' Reform
Bill); vulnerable users.

---

### Feature 10: Pre-Action Protocol Letter Generator

**Purpose:** Generate pre-action protocol letters (the formal letters required before
starting court proceedings) for common civil claims.

**User journey:**

1. Select claim type (debt, housing disrepair, personal injury, breach of contract,
   consumer rights, judicial review).
2. Enter claim details (parties, facts, losses, remedies sought).
3. Tool applies the relevant pre-action protocol (Pre-Action Protocol for Debt
   Claims, Clinical Negligence, Judicial Review, etc.).
4. Generator produces a protocol-compliant letter with all required information.
5. Deadline tracker for defendant's response (typically 14–30 days depending on
   protocol).
6. If no response or inadequate response, tool provides guidance on court proceedings.

**Key features:**

- Protocol selector with plain-English descriptions of when each applies.
- Letter generator compliant with specific protocol requirements (disclosure,
  expert evidence, ADR offers, costs consequences warning).
- Deadline calculator for defendant response periods.
- Costs consequences warning (CPR Part 36 offers and their costs implications).
- ADR encouragement (as required by protocols and recent case law).
- Checklist of documents to enclose with the letter.

**Data requirements:**

- Pre-action protocols (Debt, Clinical Negligence, Professional Negligence, Housing
  Disrepair, Personal Injury, Judicial Review, Construction, Neighbourhood
  Disputes).
- CPR Part 36 offer requirements and costs consequences.
- Court fee schedule for each claim type.
- Relevant limitation periods (6 years for contract, 3 years for personal injury,
  3 months for judicial review, etc.).

**Source provenance:** Civil Procedure Rules, Pre-Action Protocols (various), Limitation
Act 1980, Court Fees (Civil Proceedings) Order 2008.

**Integration points:**

- `shared/deadlines` — response deadline calculation.
- `shared/exports` — protocol letter output.
- `shared/calendar/ics` — deadline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:protocol-drafts`

**Technical notes:**

- Pre-action protocols vary significantly by claim type; each requires its own
  letter structure.
- CPR Part 36 offers have complex costs consequences; tool must warn users clearly.
- Judicial review pre-action protocol has strict 3-month limitation period; tool
  must prominently flag this.
- Court fees change annually; update data every April.

**WCAG considerations:**

- Complex legal concepts explained in layers (summary → detail).
- Protocol requirements presented as a clear checklist.
- Costs consequences warning in a prominent, accessible panel.

**Risk level:** High — legal complexity; strict procedural requirements; users may
face adverse costs consequences.

---

## TIER 3 — WORKFLOW AND AUTOMATION

### Feature 11: Multi-Authority FOI Batch Tool

**Purpose:** Generate and track Freedom of Information (FOI) requests to multiple
public authorities simultaneously, with template requests and deadline tracking.

**User journey:**

1. Enter subject matter (e.g., "council spending on consultants").
2. Select target authorities from a directory (councils, NHS trusts, police forces,
   government departments).
3. Tool generates FOI request letters using appropriate templates (FOIA 2000 for
   England/Wales/NI; EIRs 2004 for environmental information in Scotland).
4. Batch export: generate all letters at once for printing/sending.
5. Track 20 working-day deadline for each authority's response.
6. Log responses and generate internal review requests for refusals.

**Key features:**

- Multi-authority batch generation (select 5–50 authorities, generate all letters).
- Template library (general FOI, environmental information, specific sectors).
- Authority directory with correct addresses and FOI contact points.
- 20 working-day deadline tracker (with 40-day extension for complex requests).
- Response logging and refusal analysis (applying public interest test, exemptions).
- Internal review request generator for refused requests.

**Data requirements:**

- Public authority directory (councils, NHS trusts, police, government departments,
  schools, universities — ~100,000 bodies).
- FOI contact details per authority.
- Applicable legislation by nation (FOIA 2000, EIRs 2004 for Scotland).
- Common exemptions (s21 reasonably accessible, s36 effective conduct of public
  affairs, s43 commercial interests).
- Internal review timescales (20 working days for first review, 40 for second).

**Source provenance:** Freedom of Information Act 2000, Environmental Information
Regulations 2004, ICO guidance on FOI, Code of Practice on Records Management.

**Integration points:**

- `shared/deadlines` — 20 working-day FOI deadline.
- `shared/exports` — batch letter generation.
- `shared/calendar/ics` — deadline reminders for each authority.
- `shared/readability` — plain-English check on requests.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:foi-batches`

**Technical notes:**

- Authority directory is large (~100K entries); lazy-load and filter as user types.
- Batch generation should produce a single downloadable ZIP of all letters (using
  JSZip or similar — but this violates the no-new-deps constraint; instead, produce
  a single concatenated document or individual downloads).
- Actually: produce one combined text/markdown file with all letters, separated by
  page breaks. No new dependencies needed.
- Scottish EIRs have different rules from FOIA; tool must distinguish.

**WCAG considerations:**

- Large directory: searchable filter with live results count announcement.
- Batch operations: confirmation dialog before generating many letters.
- Deadline tracker: table with sortable columns, clear status indicators.

**Risk level:** Low — FOI law is stable; batch workflow is straightforward.

---

### Feature 12: Deadline Cascade Visualizer

**Purpose:** Visualize complex, interdependent deadline chains (e.g., FOI → internal
review → tribunal → court) as a cascading timeline.

**User journey:**

1. Select a workflow type (FOI cascade, benefits appeal cascade, housing complaint
   cascade, employment tribunal cascade).
2. Enter initial dates (e.g., date of original request/decision/complaint).
3. Tool calculates all dependent deadlines in the cascade.
4. Visualize the cascade as a timeline with each deadline as a node.
5. Export the cascade as an ICS calendar with all deadlines.
6. Save and resume the cascade (update dates as events occur).

**Key features:**

- Pre-built cascade templates for common multi-step workflows.
- Dynamic date calculation: moving one upstream deadline recalculates all downstream.
- Visual timeline with colour-coded status (active, approaching, overdue, completed).
- Interactive: click a deadline to see details, legal basis, and escalation options.
- Export all deadlines as calendar events.
- Save/load cascade states to localStorage.

**Data requirements:**

- Cascade definitions (JSON structures defining the dependency graph for each
  workflow).
- Legal time limits for each step (from relevant statutes per workflow).
- Working-day rules (standard, NHS, school-day, court-day variants).

**Source provenance:** Various (aggregates deadlines from multiple features' sources).

**Integration points:**

- `shared/deadlines` — all deadline calculations.
- `shared/calendar/ics` — batch calendar export.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:deadline-cascade`

**Technical notes:**

- This is a meta-feature: it aggregates deadline logic from multiple other features.
- Timeline visualization is CSS-only (no canvas/SVG library); uses a horizontal scroll
  with CSS grid.
- Cascade templates are static JSON definitions; easy to add new cascades.

**WCAG considerations:**

- Visual timeline must have a table alternative (accessible tabular view).
- Colour-coded status must have text labels (not colour alone).
- Interactive nodes must be keyboard-navigable (arrow keys or tab).

**Risk level:** Low — aggregating existing deadline logic; no new legal data.

---

### Feature 13: Evidence Upload Readiness Checker

**Purpose:** Assess whether a user has collected sufficient evidence for their
complaint/appeal before submission, and identify gaps.

**User journey:**

1. Select the type of case (NHS complaint, benefits appeal, parking appeal, housing
   complaint, employment tribunal, FOI request).
2. Tool loads the evidence checklist specific to that case type.
3. User marks each evidence item as "have", "don't have", or "can get".
4. Tool calculates a readiness score and identifies critical gaps.
5. Generator produces a prioritised action plan to obtain missing evidence.
6. Save the readiness report for reference.

**Key features:**

- Case-type-specific evidence checklists (generated from each feature's requirements).
- Readiness scoring (percentage complete, weighted by evidence importance).
- Gap analysis: identify critical missing evidence that could lose the case.
- Prioritised action plan: what to get first, from whom, and by when.
- Export readiness report as text/markdown.
- Integration with other features: "add missing evidence to my case" links back
  to the relevant feature.

**Data requirements:**

- Evidence checklists per case type (defined in each feature's data module).
- Importance weighting per evidence item (critical, important, helpful).
- Source organisations for common evidence types (GP, employer, council, etc.).
- Typical response times for evidence requests.

**Source provenance:** Aggregates from each feature's evidence requirements.

**Integration points:**

- `shared/exports` — readiness report output.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:evidence-checks`

**Technical notes:**

- This is a meta-feature: references evidence requirements from other features.
- Evidence checklists are defined in each feature's data module; this feature reads
  them.
- Readiness scoring is rule-based (weighted percentage), not AI.

**WCAG considerations:**

- Progress indicator: `aria-valuenow` and `aria-valuetext` on progress meter.
- Gap list: live region announcement when gaps are identified.
- Action plan: numbered list with clear, actionable steps.

**Risk level:** Low — scoring is simple; no legal complexity.

---

### Feature 14: Email-to-Case Parser

**Purpose:** Parse pasted email content to extract key dates, parties, reference
numbers, and deadlines, then generate structured case data.

**User journey:**

1. Paste an email (e.g., DWP decision letter, council response, NHS acknowledgement).
2. Tool extracts: date, sender, reference number, key deadlines, and summarised
   content.
3. User reviews extracted data and corrects any errors.
4. Structured data is saved and can be imported into other features (e.g., NHS
   complaints tracker, benefits appeal system).

**Key features:**

- Date extraction from email text (multiple date formats: UK and US).
- Reference number detection (alphanumeric patterns specific to each authority type).
- Deadline extraction (phrases like "within 28 days", "by 15 March 2026").
- Party name extraction (sender, recipient, subject).
- Structured JSON output importable into other features.
- Manual correction interface for extracted data.

**Data requirements:**

- Date format patterns (UK: DD/MM/YYYY, DD Month YYYY, etc.).
- Reference number patterns (NHS: 6-8 digit, DWP: alphanumeric, council: varies).
- Deadline phrase patterns (regex for "within X days", "by DATE", etc.).
- Party name detection heuristics.

**Source provenance:** No legal data; pattern-based extraction.

**Integration points:**

- All features (import structured data via clipboard or localStorage handoff).
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:parsed-cases`

**Technical notes:**

- Pure regex/pattern-based extraction; no AI/ML.
- UK-specific date formats are the priority (DD/MM/YYYY, DD Mon YYYY).
- False positive rate will be non-zero; always require user confirmation.
- Import functionality must work across features via shared localStorage handoff key.

**WCAG considerations:**

- Paste area: clear instructions and labelled input.
- Extracted data: presented in a table for screen readers.
- Correction interface: each field is independently editable with clear labels.

**Risk level:** Low — pattern extraction with user confirmation; no legal complexity.

---

### Feature 15: Welsh Language Translation Integration

**Purpose:** Provide Welsh language versions of key interface text and generated
documents, enabling bilingual operation for Welsh users.

**User journey:**

1. User selects Welsh language preference (via site language toggle or feature
   setting).
2. Interface text switches to Welsh (from a static translation file).
3. Generated documents can be produced in Welsh or bilingual (Welsh + English)
   format.
4. Legal references updated to Welsh equivalents where applicable (e.g., Welsh
   legislation, Welsh Ombudsman).

**Key features:**

- Welsh language interface translation (from `cy.json` translation file).
- Bilingual document output (Welsh first, English in brackets or footer).
- Welsh legal reference mapping (Welsh Ombudsman, Welsh legislation equivalents).
- Cymraeg/Welsh toggle persisted to `localStorage`.
- Fallback to English if Welsh translation is incomplete.
- Welsh-specific content for devolved matters (health, education, housing in Wales).

**Data requirements:**

- Welsh translation file (`cy.json`) covering all UI strings per feature.
- Welsh equivalents for public authority names (e.g., "Swyddfa Comisiynydd
  Pobl Hŷn Cymru" for Welsh Older People's Commissioner).
- Welsh legislation references (Government of Wales Act 2006, Well-being of
  Future Generations Act 2015, Renting Homes (Wales) Act 2016).

**Source provenance:** Welsh Language Standards (various statutory instruments),
Welsh Language Commissioner guidance, legislation.gov.uk Welsh texts.

**Integration points:**

- `shared/exports` — bilingual document output.
- `shared/privacy` — key registration for Welsh preference.

**localStorage keys:** `open-access-uk:welsh-prefs`

**Technical notes:**

- Translation coverage may be incomplete initially; English fallback for untranslated
  strings.
- Welsh text may be longer than English; UI must accommodate variable text lengths
  (no fixed-width containers).
- Bilingual document format: Welsh first (compliance with Welsh Language Standards),
  English in italics or footer.

**WCAG considerations:**

- Language attribute: `lang="cy"` on Welsh text sections.
- Bilingual output: both languages accessible (not hidden or collapsed).
- Welsh-specific: proper Welsh orthography (mutated consonants, diacritics).

**Risk level:** Low — translation work is straightforward; no legal complexity.

---

## TIER 4 — DATA AND TRANSPARENCY

### Feature 16: Ombudsman Outcomes Database

**Purpose:** Searchable database of published ombudsman decisions (Local Government
Ombudsman, Parliamentary and Health Service Ombudsman, Housing Ombudsman) to help
users understand how similar complaints were resolved.

**User journey:**

1. Search by sector (housing, health, education, social care, planning, etc.).
2. Browse by outcome type (upheld, partially upheld, not upheld, remedial action
   recommended).
3. Read summary of each decision with key findings and recommended remedies.
4. Use as evidence in own complaint ("The ombudsman found in a similar case that...").
5. Bookmark relevant outcomes for reference.

**Key features:**

- Searchable database of published ombudsman decisions (curated subset of most
  relevant/commonly cited decisions).
- Filter by sector, outcome type, authority type, date range.
- Plain-English summaries of each decision (originals are often lengthy and legal).
- Copy-as-evidence function (formatted quotation for use in own complaint).
- Bookmark/favourite outcomes for easy reference.
- Cross-reference with escalation routes (link to relevant complaint path).

**Data requirements:**

- Curated database of ~500–1,000 published ombudsman decisions (structured JSON).
- Decision summaries (plain-English rewrite of key findings).
- Sector and outcome categorisation.
- Authority type tagging.
- Date and reference number.

**Source provenance:** Local Government and Social Care Ombudsman (LGSCO) published
decisions, Parliamentary and Health Service Ombudsman (PHSO) published decisions,
Housing Ombudsman published decisions.

**Integration points:**

- `shared/exports` — formatted decision summaries.
- `shared/privacy` — key registration for bookmarks.

**localStorage keys:** `open-access-uk:ombudsman-outcomes`

**Technical notes:**

- Curated database (not all decisions, but a representative sample of the most
  relevant/commonly cited ones).
- Database is static JSON; updates can be shipped as data file updates.
- Plain-English summaries are pre-written; no AI summarisation.

**WCAG considerations:**

- Search results: live region announcement of result count.
- Decision summaries: proper heading structure for long-form content.
- Bookmark management: accessible list with clear actions.

**Risk level:** Low — curated static data; no legal risk if disclaimers are clear.

---

### Feature 17: Local Authority Performance Lookup

**Purpose:** Compare local authority performance metrics (complaint handling,
response times, service quality) to help users understand their LA's track record.

**User journey:**

1. Select local authority from directory.
2. View performance dashboard: complaint response rates, average response times,
   ombudsman complaints, CQC ratings (for social care), Ofsted ratings (for
   education).
3. Compare with national averages and similar LAs.
4. Use performance data in complaints ("Your authority's own data shows average
   response time is X days; my complaint has been unanswered for Y days").
5. Track LA performance over time (where historical data available).

**Key features:**

- LA performance dashboard with key metrics.
- Comparison tool (compare your LA with national average or similar LAs).
- Complaint-ready data export (formatted quotation for use in complaints).
- Historical trend data (where available, typically 3 years).
- National averages and benchmarks.
- Links to LA-specific complaint procedures and contact details.

**Data requirements:**

- LA performance data (from DCLG, NHS Digital, CQC, Ofsted published data).
- Complaint handling statistics (from LGSCO annual reports).
- Response time benchmarks.
- Service quality ratings (Ofsted, CQC, Ofcom).
- LA contact details and complaint procedures.

**Source provenance:** DCLG performance data, NHS Digital, CQC published ratings,
Ofsted published ratings, LGSCO annual reports.

**Integration points:**

- `shared/exports` — formatted performance data.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:la-scores`

**Technical notes:**

- Performance data is updated annually from published sources; update cycle is
  predictable (CQC: rolling, Ofsted: annual, DCLG: annual).
- Data is stored as static JSON; no backend needed.
- Comparison feature uses simple statistical comparison (mean, percentile ranking).

**WCAG considerations:**

- Dashboard: clear heading hierarchy, data tables with proper markup.
- Comparison: screen-reader-friendly (not visual-only comparison).
- Data sources: clearly cited with links to original publications.

**Risk level:** Low — published public data; no legal sensitivity.

---

### Feature 18: Regulated Professional Complaints Router

**Purpose:** Help users identify the correct regulatory body for complaints about
regulated professionals (doctors, nurses, lawyers, accountants, teachers, etc.)
and generate appropriate complaint letters.

**User journey:**

1. Select profession type (medical, legal, financial, teaching, engineering, etc.).
2. Tool identifies relevant regulatory bodies (GMC, NMC, SRA, ACCA, etc.).
3. Explain the complaint process for that regulator.
4. Generator produces complaint letter with regulator-specific requirements.
5. Track complaint progress and response deadlines.

**Key features:**

- Profession-to-regulator mapping (comprehensive directory of UK regulated
  professions and their regulators).
- Regulator-specific complaint process guides (what they investigate, timescales,
  outcomes they can achieve).
- Complaint letter generator with regulator-specific requirements.
- Cross-regulation routing (if the issue involves multiple regulators, guide the
  user to complain to each).
- Escalation routes within each regulator (preliminary → investigation → appeal).
- Contact details and online complaint portals for each regulator.

**Data requirements:**

- Professional regulator directory (~45 UK regulators with contact details and
  complaint procedures).
- Regulator-specific complaint process guides.
- Timescales for each regulator's complaint process.
- Outcomes each regulator can achieve (apology, fitness to practise panel,
  conditions on registration, etc.).
- Cross-regulation routing rules.

**Source provenance:** Professional Standards Authority, individual regulator websites,
Health and Care Professions Council, General Medical Council, Nursing and Midwifery
Council, Solicitors Regulation Authority.

**Integration points:**

- `shared/exports` — complaint letters.
- `shared/calendar/ics` — complaint deadline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:complaint-routes`

**Technical notes:**

- Regulator landscape changes (new regulators, merged regulators); update data
  annually.
- Some regulators have online complaint portals (preferred); tool should direct
  users to online portals where available.
- Regulator-specific requirements vary significantly; each needs its own template.

**WCAG considerations:**

- Regulator directory: searchable, filterable list.
- Multi-step complaint routing: clear progress indication.
- Contact details: phone numbers accessible as clickable links (tel: protocol).

**Risk level:** Low — regulator data is public and stable; no legal complexity.

---

### Feature 19: Court and Tribunal Fees Calculator

**Purpose:** Calculate the correct court or tribunal fees for filing a claim, and
identify fee exemption/remission eligibility.

**User journey:**

1. Select claim type (county court, family court, tribunal, high court, etc.).
2. Enter claim value or type (money claim, possession claim, insolvency, etc.).
3. Tool calculates the correct fee based on the current fee schedule.
4. Check eligibility for fee remission (based on income/benefits).
5. Generate a fee calculation summary that can be saved or printed.
6. Link to relevant claim forms and filing procedures.

**Key features:**

- Comprehensive fee calculator for all HMCTS courts and tribunals.
- Fee remission eligibility checker (based on income, benefits, savings thresholds).
- Fee schedule data with annual updates (April each year).
- Print/PDF fee calculation summary for records.
- Links to relevant claim forms and filing procedures.
- Historical fee data (for cases where fees were paid at a previous rate).

**Data requirements:**

- Court fee schedule (Civil Proceedings Orders 2008–2026, all amendments).
- Tribunal fee schedules (First-tier Tribunal fees by chamber).
- Fee remission thresholds (income, savings, benefits-based criteria).
- Form references for each claim type.
- Filing addresses for each court/tribunal type.

**Source provenance:** Civil Proceedings (Amendment) Orders (various years), Tribunal
Procedure Committee fee schedules, Courts and Tribunals Judiciary guidance.

**Integration points:**

- `shared/exports` — fee calculation summary.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:fee-calcs`

**Technical notes:**

- Fee schedules change annually (April) and sometimes mid-year; update data file
  with version tracking.
- Fee remission rules are complex (income-based and benefits-based); simplified
  eligibility check with clear caveats.
- Some tribunal fees have been abolished (e.g., employment tribunal fees since 2017);
  tool must reflect current state.

**WCAG considerations:**

- Calculator: clear input fields with labelled results.
- Fee remission: step-by-step eligibility checker with clear yes/no outcomes.
- Results: prominent display with `aria-live="assertive"` announcement.

**Risk level:** Low — published fee data; clear annual update cycle.

---

### Feature 20: Accessible Formats Request Specialist

**Purpose:** Generate requests for documents in accessible formats (large print,
Braille, audio, easy read, translation) from public bodies, citing legal
obligations under the Equality Act 2010.

**User journey:**

1. Select document type (council letter, NHS appointment, benefits decision,
   court document, etc.).
2. Select accessible format needed (large print, Braille, audio, easy read,
   Welsh language, other language).
3. Tool explains legal obligations (Equality Act 2010 s29, Public Sector Bodies
   Accessibility Regulations 2018).
4. Generator produces a formal request letter to the public body.
5. Track response deadline (public bodies must provide accessible formats
   "as soon as reasonably practicable").
6. Escalation guidance if request is refused (complaint to regulator, ombudsman,
   or legal action).

**Key features:**

- Format selector with descriptions (large print ≥ 16pt, Braille, audio, easy
  read, other language).
- Legal obligation references (Equality Act 2010, PSBAR 2018, WCAG 2.1 AA).
- Request letter generator with appropriate legal citations.
- Public body contact directory for accessible format requests.
- Escalation routes if request is denied.
- Template for formal complaint about refusal of accessible format.

**Data requirements:**

- Accessible format specifications (large print size, Braille standards, audio
  format requirements).
- Equality Act 2010 s29 obligations (service providers must make reasonable
  adjustments).
- Public Sector Bodies Accessibility Regulations 2018 requirements.
- WCAG 2.1 AA requirements for digital documents.
- Escalation routes (Equality and Human Rights Commission, ombudsman, county court).

**Source provenance:** Equality Act 2010, Public Sector Bodies (Websites and Mobile
Applications) (No. 2) Accessibility Regulations 2018, BS 8878:2010, WCAG 2.1 AA.

**Integration points:**

- `shared/exports` — request letters.
- `shared/calendar/ics` — response deadline reminders.
- `shared/readability` — letter clarity check.
- `shared/privacy` — key registration.

**localStorage keys:** `open-access-uk:format-requests`

**Technical notes:**

- Accessible format specifications are detailed (Braille: Grade 2; large print:
  minimum 16pt, preferably 18pt; audio: MP3 or CD; easy read: specific guidelines).
- Legal obligations have been strengthened by PSBAR 2018; tool should cite both
  Acts.
- Some public bodies have specific accessible format request forms; tool should
  link to these where available.

**WCAG considerations:**

- This feature is specifically about accessibility; must be exemplary in its own
  accessibility.
- Format descriptions must be in plain language (avoid jargon like "WCAG 2.1 AA"
  without explanation).
- Request letters must themselves be in an accessible format (print version must
  be large-print compatible).

**Risk level:** Low — legal obligations are clear and stable; no complexity.

---

## New shared modules

| Module                      | Purpose                                                               | Used by                    |
| --------------------------- | --------------------------------------------------------------------- | -------------------------- |
| `shared/region/index.mjs`   | Region selection, LA directory, nation-specific logic                 | All features               |
| `shared/evidence/index.mjs` | Evidence checklist model, readiness scoring                           | 1–5, 8, 10, 13             |
| `shared/forms/index.mjs`    | Form walkthrough model (multi-step, conditional)                      | 2, 4, 5, 7, 10, 14         |
| `shared/contacts/index.mjs` | Public authority contact directory, search, lookup                    | 1, 2, 3, 6, 11, 17, 18, 20 |
| `shared/legal/index.mjs`    | Legal reference model (statute citations, plain-English descriptions) | All features               |

## Implementation order (suggested)

### Phase 1 — Foundation (Week 1–2)

1. Create `shared/region/` module (region selection, LA directory).
2. Create `shared/evidence/` module (checklist model, readiness scoring).
3. Create `shared/forms/` module (multi-step form walkthrough).
4. Create `shared/contacts/` module (contact directory and search).
5. Create `shared/legal/` module (legal reference model).

### Phase 2 — Tier 1 features (Week 3–6)

6. Feature 1: NHS Complaints Tracker.
7. Feature 2: Benefits Appeals System.
8. Feature 3: Parking Ticket Appeal Generator.
9. Feature 4: School Exclusions and SEND Appeal Helper.
10. Feature 5: Employment Tribunal Case Builder.

### Phase 3 — Tier 2 features (Week 7–10)

11. Feature 6: Immigration and Visa Complaint Tool.
12. Feature 7: Universal Credit Sanctions Challenge.
13. Feature 8: Right to Repair Tracker.
14. Feature 9: Section 21/8 Notice Validator.
15. Feature 10: Pre-Action Protocol Letter Generator.

### Phase 4 — Tier 3 features (Week 11–13)

16. Feature 11: Multi-Authority FOI Batch Tool.
17. Feature 12: Deadline Cascade Visualizer.
18. Feature 13: Evidence Upload Readiness Checker.
19. Feature 14: Email-to-Case Parser.
20. Feature 15: Welsh Language Translation Integration.

### Phase 5 — Tier 4 features (Week 14–16)

21. Feature 16: Ombudsman Outcomes Database.
22. Feature 17: Local Authority Performance Lookup.
23. Feature 18: Regulated Professional Complaints Router.
24. Feature 19: Court and Tribunal Fees Calculator.
25. Feature 20: Accessible Formats Request Specialist.

### Phase 6 — Quality and polish (Week 17–18)

26. Full a11y audit across all 20 features.
27. E2E test suite for critical journeys.
28. Privacy Centre updated with all new keys.
29. Umbrella site updated with feature grid and navigation.
30. Documentation and data source verification.

## Error handling (shared pattern)

- `localStorage` unavailable: graceful degradation with clear message.
- Clipboard/download/print failures: plain-English fallback (manual select-and-copy).
- Offline by design: no network error paths for user data.
- Data version mismatch: warning when `DATA_VERSION` in feature is newer than
  cached data; prompt user to refresh.
- Storage limit approaching: warning at 4 MB used (of ~5 MB limit) with option to
  clear old data.

## Out of scope (YAGNI)

- Any backend, accounts, sync, or server storage.
- Any analytics/telemetry.
- AI/LLM-powered features or network calls for user content.
- A build step, bundler, CSS framework, or JS runtime dependency.
- Real-time data feeds (all data is static/curated).
- Actual PDF generation library (browser print-to-PDF only).
- Multi-language support beyond Welsh (future consideration).
- Mobile app versions (responsive web only).
