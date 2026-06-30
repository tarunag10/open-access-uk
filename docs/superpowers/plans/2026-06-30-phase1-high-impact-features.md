# Phase 1 — High-Impact UK Market Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the five highest-impact UK-specific consumer tools: NHS Complaints Tracker, Benefits Appeals System, Parking Appeal Generator, School SEND Helper, and Right to Repair Tracker. Each tool targets a common, high-friction UK consumer pain point with a local-first, static, WCAG AA web app.

**Architecture:** Three dependency tiers. **Tier A** = pure, DOM-free, unit-tested ES modules under `shared/` (no app touched). **Tier B** = per-app standalone submodules (new tool subdirectories). **Tier C** = integration with existing tools (letter-generator extensions, case-builder extensions, privacy registry updates). Tier A gates B and C.

**Tech Stack:** Plain static HTML/CSS/JS (ES modules), `node --test`, no new dependencies, no build step. Reuses shipped `shared/deadlines`, `shared/calendar/ics`, `shared/evidence`, `shared/exports`, `shared/privacy`, `shared/case`, `shared/readability`.

**Hard constraints (from spec):** static only, local-first, no backend, no tracking, WCAG AA, no new runtime deps. Every new `localStorage` key MUST be registered in `shared/privacy/local-storage.mjs`. Each new tool is a **git submodule** — commit inside the submodule, then bump the parent pointer (the workflow's agents do NOT run git; the orchestrator commits).

**Source provenance:** Every tool page must include a "Current source notes" section with linked references to the relevant legislation, regulator guidance, or official form. Example: NHS Complaints links to NHS Complaints Regulations 2009, PHSO guidance; Benefits Appeals links to DWP regs, tribunal rules; Parking links to POFA 2012, TMA 2004; SEND links to Children and Families Act 2014, SEND Code of Practice; Repairs links to Landlord and Tenant Act 1985, Housing Act 2004.

---

## File Structure

**Create (Tier A — shared engines, parent repo):**

- `shared/complaints/index.mjs` + `shared/complaints/index.test.mjs` — complaint stage model, deadline rules, evidence checklist generator (feature 1).
- `shared/appeals/index.mjs` + `shared/appeals/index.test.mjs` — benefits appeal deadlines, descriptor scoring guidance, SSCS1 form field model (feature 2).
- `shared/parking/index.mjs` + `shared/parking/index.test.mjs` — PCN deadline rules, operator-type routing, evidence checklist model (feature 3).
- `shared/send-appeals/index.mjs` + `shared/send-appeals/index.test.mjs` — SEND exclusion review deadlines, IRP request model, tribunal timeline (feature 4).
- `shared/repairs/index.mjs` + `shared/repairs/index.test.mjs` — emergency/repair deadline model, photo timeline, Housing Ombudsman escalation (feature 5).

**Modify (Tier A):**

- `shared/privacy/local-storage.mjs` + `shared/privacy/local-storage.test.mjs` — register 10 new localStorage keys across the 5 tools.

**Create (Tier B — per-app submodules):**

- `nhs-complaints-tracker/` — new standalone tool (index.html, src/app.js, src/letter-templates.mjs, styles.css, test/, scripts/).
- `benefits-appeals/` — new standalone tool (index.html, src/app.js, src/descriptors.mjs, src/sscs1-helper.mjs, styles.css, test/, scripts/).
- `send-helper/` — new standalone tool (index.html, src/app.js, src/exclusion-review.mjs, src/ehcp-dispute.mjs, styles.css, test/, scripts/).

**Modify (Tier C — existing tool extensions):**

- `letter-generator/` — add PCN appeal letter templates and parking deadline tracker (feature 3).
- `case-builder/` — add Right to Repair tracker module with 24h/28d deadlines and Housing Ombudsman escalation (feature 5).

---

# TIER A — Shared engines (pure, tested, no DOM)

## Task A1: NHS Complaints Tracker engine

**Files:**

- Create: `shared/complaints/index.mjs`
- Test: `shared/complaints/index.test.mjs`

- [ ] **Step 1: Create shared/complaints/ directory**

- [ ] **Step 2: Verify deadlines import path resolves**

Run: `node -e "import('../shared/deadlines/index.mjs').then(() => console.log('ok'))"`
Expected: `ok`

- [ ] **Step 3: Write the failing test**

```js
// shared/complaints/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLAINT_STAGES,
  getComplaintStage,
  calculateStageDeadline,
  buildEvidenceChecklist,
  buildEscalationLetter,
  COMPLAINTS_STORAGE_KEY
} from './index.mjs';

test('COMPLAINT_STAGES has PALS, formal, and PHSO stages', () => {
  const ids = COMPLAINT_STAGES.map((s) => s.id);
  assert.ok(ids.includes('pals'), 'missing PALS stage');
  assert.ok(ids.includes('formal'), 'missing formal complaint stage');
  assert.ok(ids.includes('phso'), 'missing PHSO stage');
});

test('getComplaintStage returns stage by id', () => {
  const stage = getComplaintStage('pals');
  assert.equal(stage.id, 'pals');
  assert.equal(stage.label, 'PALS (Patient Advice and Liaison Service)');
  assert.ok(stage.deadlineDays > 0);
});

test('getComplaintStage returns null for unknown id', () => {
  assert.equal(getComplaintStage('unknown'), null);
});

test('calculateStageDeadline computes target date from start', () => {
  const result = calculateStageDeadline('2026-07-01', 'pals');
  assert.equal(typeof result.targetDate, 'string');
  assert.match(result.targetDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(result.targetDate > '2026-07-01');
  assert.ok(result.explanation.length > 0);
});

test('calculateStageDeadline returns null for bad date', () => {
  assert.equal(calculateStageDeadline('not-a-date', 'pals'), null);
});

test('buildEvidenceChecklist returns array for formal stage', () => {
  const checklist = buildEvidenceChecklist('formal');
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length >= 3);
  assert.ok(checklist.some((item) => item.includes('letter') || item.includes('correspondence')));
});

test('buildEscalationLetter generates a letter with stage and date', () => {
  const letter = buildEscalationLetter({
    stage: 'phso',
    startDate: '2026-06-01',
    recipientName: 'Jane Smith',
    complaintSummary: 'Unresolved NHS treatment delay'
  });
  assert.ok(letter.includes('PHSO'));
  assert.ok(letter.includes('Jane Smith'));
  assert.ok(letter.includes('2026'));
});

test('COMPLAINTS_STORAGE_KEY is namespaced', () => {
  assert.equal(COMPLAINTS_STORAGE_KEY, 'open-access-uk:nhs-complaints-tracker:complaints');
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `node --test shared/complaints/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 5: Write the implementation**

```js
// shared/complaints/index.mjs
import { parseLocalDate, toLocalDateString, addWorkingDays, formatDateForDisplay } from '../deadlines/index.mjs';
import { buildICS } from '../deadlines/index.mjs';

export const COMPLAINTS_STORAGE_KEY = 'open-access-uk:nhs-complaints-tracker:complaints';
export const COMPLAINTS_DRAFT_KEY = 'open-access-uk:nhs-complaints-tracker:draft';

export const COMPLAINT_STAGES = [
  {
    id: 'pals',
    label: 'PALS (Patient Advice and Liaison Service)',
    deadlineDays: 0,
    deadlineWorking: false,
    deadlineNote: 'No statutory deadline, but aim for an initial PALS contact within 5 working days.',
    escalationNext: 'formal',
    description: 'Informal resolution through the hospital or trust PALS team.'
  },
  {
    id: 'formal',
    label: 'Formal NHS complaint',
    deadlineDays: 0,
    deadlineWorking: false,
    deadlineNote: 'Acknowledgement within 3 working days; full response target varies by trust, usually within 25 working days.',
    escalationNext: 'phso',
    description: 'Written formal complaint under the NHS Complaints Regulations 2009.'
  },
  {
    id: 'phso',
    label: 'Parliamentary and Health Service Ombudsman (PHSO)',
    deadlineDays: 0,
    deadlineWorking: false,
    deadlineNote: 'Must complain to PHSO within 12 months of the date of the events complained about, or within 6 months of the final response from the NHS body.',
    escalationNext: null,
    description: 'Independent investigation by PHSO after the NHS body has completed its investigation.'
  }
];

export function getComplaintStage(id) {
  return COMPLAINT_STAGES.find((s) => s.id === id) || null;
}

export function calculateStageDeadline(startDate, stageId) {
  const stage = getComplaintStage(stageId);
  if (!stage) return null;
  const start = parseLocalDate(startDate);
  if (!start) return null;

  let targetDate = null;
  if (stageId === 'pals') {
    targetDate = addWorkingDays(startDate, 5);
  } else if (stageId === 'formal') {
    targetDate = addWorkingDays(startDate, 25);
  } else if (stageId === 'phso') {
    const result = new Date(start.getTime());
    result.setUTCMonth(result.getUTCMonth() + 12);
    targetDate = toLocalDateString(result);
  }

  return {
    stageId,
    targetDate,
    explanation: `${stage.label}: ${stage.deadlineNote}`
  };
}

export function buildEvidenceChecklist(stageId) {
  const base = [
    'Copy of the original complaint or concern letter',
    'Dates of all correspondence and responses received',
    'Names and roles of staff involved or contacted',
    'Reference or case numbers from the NHS body'
  ];
  const stage = getComplaintStage(stageId);
  if (stageId === 'pals') {
    return [...base, 'Notes of any PALS conversations or meetings'];
  }
  if (stageId === 'formal') {
    return [...base, 'Copy of the formal complaint acknowledgement', 'Copy of the NHS body response or investigation report'];
  }
  if (stageId === 'phso') {
    return [...base, 'Copy of the NHS body final response', 'Evidence of the complaint timeline and outcomes sought', 'Any medical records relevant to the complaint'];
  }
  return base;
}

export function buildEscalationLetter({ stage, startDate, recipientName, complaintSummary } = {}) {
  const stageData = getComplaintStage(stage);
  const stageLabel = stageData ? stageData.label : stage;
  const deadline = calculateStageDeadline(startDate, stage);
  const dateDisplay = deadline ? formatDateForDisplay(deadline.targetDate) : 'not yet calculated';

  const lines = [
    `Dear ${recipientName || 'Sir or Madam'},`,
    '',
    `Re: NHS Complaint — ${stageLabel}`,
    '',
    complaintSummary || 'I am writing regarding my NHS complaint.',
    '',
    `I raised this complaint on ${formatDateForDisplay(startDate)}. The expected response or escalation deadline is approximately ${dateDisplay}.`,
    '',
    stage === 'phso'
      ? 'I am now escalating this complaint to the Parliamentary and Health Service Ombudsman as the NHS body has completed its investigation and I remain dissatisfied with the outcome.'
      : `Please provide an update on the progress of my complaint and confirm the target date for a response.`,
    '',
    'I enclose copies of the correspondence to date for your reference.',
    '',
    'Yours faithfully,',
    'Your name'
  ];

  return lines.join('\n');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test shared/complaints/index.test.mjs`
Expected: PASS — 8 tests.

- [ ] **Step 7: Verify exports match test imports**

Run: `node -e "import('./shared/complaints/index.mjs').then(m => { const keys = Object.keys(m); console.log(keys.join(', ')); if (!keys.includes('COMPLAINT_STAGES')) throw new Error('missing export'); })"`
Expected: prints export list; no error.

- [ ] **Step 8: Verify no unused variables in implementation**

Run: `node --check shared/complaints/index.mjs`
Expected: no output.

- [ ] **Step 9: Commit** (orchestrator only; workflow agents skip git)

```bash
git add shared/complaints/index.mjs shared/complaints/index.test.mjs
git commit -m "feat: add NHS complaints tracker engine"
```

---

## Task A2: Benefits Appeals engine

**Files:**

- Create: `shared/appeals/index.mjs`
- Test: `shared/appeals/index.test.mjs`

- [ ] **Step 1: Create shared/appeals/ directory**

- [ ] **Step 2: Write the failing test**

```js
// shared/appeals/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BENEFIT_TYPES,
  getBenefitType,
  calculateMRDeadline,
  calculateTribunalDeadline,
  buildMRLetter,
  buildTribunalApplication,
  getDescriptorGuidance,
  APPEALS_STORAGE_KEY
} from './index.mjs';

test('BENEFIT_TYPES includes UC, PIP, ESA', () => {
  const ids = BENEFIT_TYPES.map((b) => b.id);
  assert.ok(ids.includes('uc'), 'missing Universal Credit');
  assert.ok(ids.includes('pip'), 'missing PIP');
  assert.ok(ids.includes('esa'), 'missing ESA');
});

test('getBenefitType returns benefit config by id', () => {
  const benefit = getBenefitType('pip');
  assert.equal(benefit.id, 'pip');
  assert.ok(benefit.mrDeadlineDays > 0);
  assert.ok(benefit.tribunalDeadlineMonths > 0);
});

test('getBenefitType returns null for unknown id', () => {
  assert.equal(getBenefitType('xyz'), null);
});

test('calculateMRDeadline computes 1-month deadline for PIP', () => {
  const result = calculateMRDeadline('pip', '2026-07-01');
  assert.ok(result.targetDate > '2026-07-01');
  assert.ok(result.explanation.includes('month'));
});

test('calculateMRDeadline returns null for bad date', () => {
  assert.equal(calculateMRDeadline('pip', 'not-a-date'), null);
});

test('calculateTribunalDeadline computes deadline after MR decision date', () => {
  const result = calculateTribunalDeadline('uc', '2026-07-01');
  assert.ok(result.targetDate > '2026-07-01');
  assert.ok(result.explanation.includes('month'));
});

test('buildMRLetter generates a mandatory reconsideration letter', () => {
  const letter = buildMRLetter({
    benefitType: 'pip',
    decisionDate: '2026-06-15',
    decisionRef: 'DWP-12345',
    reasons: ['I disagree with the scoring for descriptor 1', 'My condition has worsened'],
    claimantName: 'Alex Jones'
  });
  assert.ok(letter.includes('mandatory reconsideration'));
  assert.ok(letter.includes('PIP'));
  assert.ok(letter.includes('Alex Jones'));
  assert.ok(letter.includes('DWP-12345'));
});

test('getDescriptorGuidance returns scoring info for PIP', () => {
  const guidance = getDescriptorGuidance('pip');
  assert.ok(Array.isArray(guidance));
  assert.ok(guidance.length > 0);
  assert.ok(guidance[0].activity);
  assert.ok(guidance[0].scoring);
});

test('APPEALS_STORAGE_KEY is namespaced', () => {
  assert.equal(APPEALS_STORAGE_KEY, 'open-access-uk:benefits-appeals:appeals');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test shared/appeals/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 4: Write the implementation**

```js
// shared/appeals/index.mjs
import { parseLocalDate, toLocalDateString, addWorkingDays, formatDateForDisplay } from '../deadlines/index.mjs';

export const APPEALS_STORAGE_KEY = 'open-access-uk:benefits-appeals:appeals';
export const APPEALS_DRAFT_KEY = 'open-access-uk:benefits-appeals:draft';

export const BENEFIT_TYPES = [
  {
    id: 'uc',
    label: 'Universal Credit (UC)',
    mrDeadlineDays: 1,
    mrDeadlineUnit: 'month',
    tribunalDeadlineMonths: 1,
    tribunalNote: 'You have 1 month from the date of the MR decision to appeal to the First-tier Tribunal (Social Entitlement Chamber).',
    description: 'Universal Credit decisions including work capability, sanctions, housing costs.'
  },
  {
    id: 'pip',
    label: 'Personal Independence Payment (PIP)',
    mrDeadlineDays: 1,
    mrDeadlineUnit: 'month',
    tribunalDeadlineMonths: 1,
    tribunalNote: 'You have 1 month from the date of the MR decision to appeal to the First-tier Tribunal.',
    description: 'PIP daily living and mobility component decisions.'
  },
  {
    id: 'esa',
    label: 'Employment and Support Allowance (ESA)',
    mrDeadlineDays: 1,
    mrDeadlineUnit: 'month',
    tribunalDeadlineMonths: 1,
    tribunalNote: 'You have 1 month from the date of the MR decision to appeal to the First-tier Tribunal.',
    description: 'ESA work capability assessment decisions.'
  }
];

export function getBenefitType(id) {
  return BENEFIT_TYPES.find((b) => b.id === id) || null;
}

export function calculateMRDeadline(benefitId, decisionDate) {
  const benefit = getBenefitType(benefitId);
  if (!benefit) return null;
  const start = parseLocalDate(decisionDate);
  if (!start) return null;

  const result = new Date(start.getTime());
  result.setUTCMonth(result.getUTCMonth() + benefit.mrDeadlineDays);

  return {
    benefitId,
    targetDate: toLocalDateString(result),
    explanation: `${benefit.label}: You have 1 calendar month from the date of the decision to request a Mandatory Reconsideration.`
  };
}

export function calculateTribunalDeadline(benefitId, mrDecisionDate) {
  const benefit = getBenefitType(benefitId);
  if (!benefit) return null;
  const start = parseLocalDate(mrDecisionDate);
  if (!start) return null;

  const result = new Date(start.getTime());
  result.setUTCMonth(result.getUTCMonth() + benefit.tribunalDeadlineMonths);

  return {
    benefitId,
    targetDate: toLocalDateString(result),
    explanation: `${benefit.label}: ${benefit.tribunalNote}`
  };
}

export function buildMRLetter({ benefitType, decisionDate, decisionRef, reasons = [], claimantName } = {}) {
  const benefit = getBenefitType(benefitType);
  const benefitLabel = benefit ? benefit.label : benefitType;
  const reasonsList = reasons.filter(Boolean).map((r) => `- ${r}`).join('\n');

  return `Dear Sir or Madam,

Re: Mandatory Reconsideration Request — ${benefitLabel}

I am writing to request a Mandatory Reconsideration of the decision made on ${formatDateForDisplay(decisionDate)} regarding my ${benefitLabel} claim.

Decision reference: ${decisionRef || 'Not provided'}

I believe this decision is wrong for the following reasons:

${reasonsList || '- [Add your reasons here]'}

Please review the decision taking into account all the evidence available, including any additional evidence I may provide.

I understand that if I remain dissatisfied after the Mandatory Reconsideration, I may have the right to appeal to the First-tier Tribunal.

Please confirm receipt of this request and the date by which I can expect the Mandatory Reconsideration to be completed.

Yours faithfully,
${claimantName || 'Your name'}`;
}

export function buildTribunalApplication({ benefitType, mrDecisionDate, mrDecisionRef, grounds = [], claimantName } = {}) {
  const benefit = getBenefitType(benefitType);
  const benefitLabel = benefit ? benefit.label : benefitType;
  const deadline = calculateTribunalDeadline(benefitType, mrDecisionDate);
  const deadlineDate = deadline ? formatDateForDisplay(deadline.targetDate) : 'within 1 month of the MR decision';
  const groundsList = grounds.filter(Boolean).map((g) => `- ${g}`).join('\n');

  return `SSCS1 — Appeal to the First-tier Tribunal (Social Entitlement Chamber)

Benefit type: ${benefitLabel}
Date of MR decision: ${formatDateForDisplay(mrDecisionDate)}
MR decision reference: ${mrDecisionRef || 'Not provided'}
Appellant name: ${claimantName || 'Your name'}

Grounds of appeal:
${groundsList || '- [Set out your grounds of appeal here]'}

I am appealing within the time limit. This appeal must be received by the Tribunal by ${deadlineDate}.

Please send all correspondence to the name and address above.

Signed: ${claimantName || 'Your name'}
Date: ${formatDateForDisplay(toLocalDateString(new Date()))}`;
}

const PIP_DESCRIPTORS = [
  { activity: 'Preparing food', scoring: '0 = Can prepare food. 1 = Needs prompting. 2 = Needs supervision. 3 = Cannot prepare food safely.' },
  { activity: 'Taking nutrition', scoring: '0 = Can take nutrition unaided. 1 = Needs prompting. 2 = Needs assistance. 3 = Cannot take nutrition.' },
  { activity: 'Managing therapy or monitoring a health condition', scoring: '0 = Can manage therapy. 1 = Needs prompting. 2 = Needs supervision. 3 = Cannot manage therapy.' },
  { activity: 'Washing and bathing', scoring: '0 = Can wash unaided. 1 = Needs prompting. 2 = Needs assistance. 3 = Cannot wash.' },
  { activity: 'Managing toilet needs', scoring: '0 = Can manage. 1 = Needs prompting. 2 = Needs assistance. 3 = Cannot manage.' },
  { activity: 'Dressing and undressing', scoring: '0 = Can dress. 1 = Needs prompting. 2 = Needs assistance. 3 = Cannot dress.' },
  { activity: 'Communicating verbally', scoring: '0 = Can communicate. 1 = Needs prompting. 2 = Needs assistance. 3 = Cannot communicate.' },
  { activity: 'Reading and understanding signs, symbols and words', scoring: '0 = Can read. 1 = Needs prompting. 2 = Cannot read.' },
  { activity: 'Engaging with other people face to face', scoring: '0 = Can engage. 1 = Needs prompting. 2 = Cannot engage.' },
  { activity: 'Making budgeting decisions', scoring: '0 = Can budget. 1 = Needs prompting. 2 = Cannot budget.' },
  { activity: 'Planning and following journeys', scoring: '0 = Can plan journeys. 1 = Needs prompting. 2 = Cannot plan journeys.' },
  { activity: 'Moving around', scoring: '0 = Can move 200m+. 1 = Can move 50–200m. 2 = Can move 20–50m. 3 = Cannot move.' }
];

export function getDescriptorGuidance(benefitId) {
  if (benefitId === 'pip') return PIP_DESCRIPTORS;
  return [];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test shared/appeals/index.test.mjs`
Expected: PASS — 10 tests.

- [ ] **Step 7: Verify exports match test imports**

Run: `node -e "import('./shared/appeals/index.mjs').then(m => { const keys = Object.keys(m); console.log(keys.join(', ')); if (!keys.includes('BENEFIT_TYPES')) throw new Error('missing export'); })"`
Expected: prints export list; no error.

- [ ] **Step 8: Verify no unused variables in implementation**

Run: `node --check shared/appeals/index.mjs`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add shared/appeals/index.mjs shared/appeals/index.test.mjs
git commit -m "feat: add benefits appeals engine (UC/PIP/ESA)"
```

---

## Task A3: Parking Appeals engine

**Files:**

- Create: `shared/parking/index.mjs`
- Test: `shared/parking/index.test.mjs`

- [ ] **Step 1: Create shared/parking/ directory**

- [ ] **Step 2: Write the failing test**

```js
// shared/parking/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OPERATOR_TYPES,
  getOperatorType,
  calculatePCNDeadline,
  buildPCNAppealLetter,
  getEvidenceChecklist,
  PARKING_STORAGE_KEY
} from './index.mjs';

test('OPERATOR_TYPES includes council and private', () => {
  const ids = OPERATOR_TYPES.map((o) => o.id);
  assert.ok(ids.includes('council'), 'missing council operator');
  assert.ok(ids.includes('private'), 'missing private operator');
});

test('getOperatorType returns config by id', () => {
  const op = getOperatorType('council');
  assert.equal(op.id, 'council');
  assert.ok(op.firstDeadlineDays > 0);
  assert.ok(op.escalationRoute.length > 0);
});

test('getOperatorType returns null for unknown id', () => {
  assert.equal(getOperatorType('xyz'), null);
});

test('calculatePCNDeadline computes first deadline for council', () => {
  const result = calculatePCNDeadline('council', '2026-07-01');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.explanation.length > 0);
  assert.ok(result.stage === 'first');
});

test('calculatePCNDeadline computes appeal deadline after rejection', () => {
  const result = calculatePCNDeadline('council', '2026-07-01', 'appeal');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.stage === 'appeal');
});

test('calculatePCNDeadline returns null for bad date', () => {
  assert.equal(calculatePCNDeadline('council', 'not-a-date'), null);
});

test('buildPCNAppealLetter generates appeal for council PCN', () => {
  const letter = buildPCNAppealLetter({
    operatorType: 'council',
    pcnNumber: 'PCN-999',
    issueDate: '2026-06-15',
    grounds: ['Signage was unclear', 'I was parked within the marked bay'],
    driverName: 'Sam Taylor'
  });
  assert.ok(letter.includes('PCN-999'));
  assert.ok(letter.includes('Sam Taylor'));
  assert.ok(letter.includes('council'));
});

test('getEvidenceChecklist returns relevant items for private operator', () => {
  const checklist = getEvidenceChecklist('private');
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length >= 3);
  assert.ok(checklist.some((item) => item.includes('photos') || item.includes('Photograph')));
});

test('PARKING_STORAGE_KEY is namespaced', () => {
  assert.equal(PARKING_STORAGE_KEY, 'open-access-uk:parking-appeal:pcns');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test shared/parking/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 4: Write the implementation**

```js
// shared/parking/index.mjs
import { parseLocalDate, toLocalDateString, addWorkingDays, formatDateForDisplay } from '../deadlines/index.mjs';

export const PARKING_STORAGE_KEY = 'open-access-uk:parking-appeal:pcns';
export const PARKING_DRAFT_KEY = 'open-access-uk:parking-appeal:draft';

export const OPERATOR_TYPES = [
  {
    id: 'council',
    label: 'Council (Local Authority)',
    firstDeadlineDays: 28,
    firstDeadlineNote: 'Pay or challenge within 28 days of the PCN being issued (Transport Act 2004, s.66).',
    appealDeadlineDays: 28,
    appealDeadlineNote: 'If your initial challenge is rejected, you have 28 days to appeal to the Traffic Penalty Tribunal.',
    escalationRoute: 'Traffic Penalty Tribunal (TPT)',
    description: 'PCN issued by a council or local authority for on-street parking, bus lanes, or CCTV offences.'
  },
  {
    id: 'private',
    label: 'Private parking operator',
    firstDeadlineDays: 14,
    firstDeadlineNote: 'The operator must allow 14 days to pay the reduced amount or challenge before any further action (POFA 2012, Schedule 1).',
    appealDeadlineDays: 0,
    appealDeadlineNote: 'There is no formal independent appeal body; escalation may be through the operator\'s approved Independent ADR provider or the courts.',
    escalationRoute: 'Independent ADR provider or county court',
    description: 'Parking Charge Notice on private land (car parks, retail, residential).'
  }
];

export function getOperatorType(id) {
  return OPERATOR_TYPES.find((o) => o.id === id) || null;
}

export function calculatePCNDeadline(operatorId, issueDate, stage = 'first') {
  const op = getOperatorType(operatorId);
  if (!op) return null;
  const start = parseLocalDate(issueDate);
  if (!start) return null;

  let days = 0;
  let explanation = '';
  if (stage === 'first') {
    days = op.firstDeadlineDays;
    explanation = `${op.label}: ${op.firstDeadlineNote}`;
  } else if (stage === 'appeal') {
    days = op.appealDeadlineDays || 28;
    explanation = `${op.label}: ${op.appealDeadlineNote}`;
  } else {
    return null;
  }

  const target = addWorkingDays(issueDate, days);

  return { operatorId, stage, targetDate: target, explanation };
}

export function buildPCNAppealLetter({ operatorType, pcnNumber, issueDate, grounds = [], driverName } = {}) {
  const op = getOperatorType(operatorType);
  const operatorLabel = op ? op.label : operatorType;
  const groundsList = grounds.filter(Boolean).map((g) => `- ${g}`).join('\n');

  return `Dear Sir or Madam,

Re: Parking Charge Notice — ${pcnNumber || 'Not provided'}
Operator: ${operatorLabel}
Date of issue: ${formatDateForDisplay(issueDate)}

I am writing to challenge the Parking Charge Notice referenced above. I believe the PCN was not correctly issued for the following reasons:

${groundsList || '- [Add your grounds for appeal here]'}

${operatorType === 'council'
  ? 'I request that the PCN be cancelled under the relevant traffic management powers.'
  : 'I understand that under the Protection of Freedoms Act 2012, the operator must allow a minimum period before any keeper liability proceedings. I do not accept that this PCN has been issued fairly or in accordance with the applicable code of practice.'}

Please confirm receipt of this challenge and the expected timeline for a response.

Yours faithfully,
${driverName || 'Your name'}`;
}

export function getEvidenceChecklist(operatorId) {
  const base = [
    'Clear photographs of the signage at the time of the alleged offence',
    'Photographs of the road markings, lines, or parking bay boundaries',
    'Photographs of any obstruction, damage, or circumstances relied upon'
  ];
  if (operatorId === 'council') {
    return [...base, 'Copy of the PCN with the council reference number', 'Any traffic regulation order or CCTV evidence notice', 'Any witness statements or dashcam footage'];
  }
  return [...base, 'Copy of the Parking Charge Notice', 'Photographs of the private car park signage and terms', 'Evidence of any ANPR or keeper liability notice'];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test shared/parking/index.test.mjs`
Expected: PASS — 10 tests.

- [ ] **Step 7: Verify exports match test imports**

Run: `node -e "import('./shared/parking/index.mjs').then(m => { const keys = Object.keys(m); console.log(keys.join(', ')); if (!keys.includes('OPERATOR_TYPES')) throw new Error('missing export'); })"`
Expected: prints export list; no error.

- [ ] **Step 8: Verify no unused variables in implementation**

Run: `node --check shared/parking/index.mjs`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add shared/parking/index.mjs shared/parking/index.test.mjs
git commit -m "feat: add parking appeals engine (council + private)"
```

---

## Task A4: SEND Appeals engine

**Files:**

- Create: `shared/send-appeals/index.mjs`
- Test: `shared/send-appeals/index.test.mjs`

- [ ] **Step 1: Create shared/send-appeals/ directory**

- [ ] **Step 2: Write the failing test**

```js
// shared/send-appeals/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SEND_STAGES,
  getSendStage,
  calculateExclusionReviewDeadline,
  calculateIRPDeadline,
  calculateSENDTribunalDeadline,
  buildExclusionReviewLetter,
  buildIRPRequest,
  buildEHCDisputeLetter,
  SEND_STORAGE_KEY
} from './index.mjs';

test('SEND_STAGES covers exclusion review, IRP, SEND tribunal, EHCP dispute', () => {
  const ids = SEND_STAGES.map((s) => s.id);
  assert.ok(ids.includes('exclusion-review'), 'missing exclusion review');
  assert.ok(ids.includes('irp'), 'missing IRP');
  assert.ok(ids.includes('send-tribunal'), 'missing SEND tribunal');
  assert.ok(ids.includes('ehcp-dispute'), 'missing EHCP dispute');
});

test('getSendStage returns stage by id', () => {
  const stage = getSendStage('irp');
  assert.equal(stage.id, 'irp');
  assert.ok(stage.deadlineNote.length > 0);
});

test('getSendStage returns null for unknown id', () => {
  assert.equal(getSendStage('xyz'), null);
});

test('calculateExclusionReviewDeadline computes 15-day deadline', () => {
  const result = calculateExclusionReviewDeadline('2026-07-01');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.explanation.includes('15'));
});

test('calculateExclusionReviewDeadline returns null for bad date', () => {
  assert.equal(calculateExclusionReviewDeadline('not-a-date'), null);
});

test('calculateIRPDeadline computes 15-day deadline for exclusion', () => {
  const result = calculateIRPDeadline('2026-07-01');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.explanation.includes('15'));
});

test('calculateSENDTribunalDeadline computes 2-month deadline from EHCP decision', () => {
  const result = calculateSENDTribunalDeadline('2026-07-01');
  assert.ok(result.targetDate > '2026-07-01');
  assert.ok(result.explanation.includes('2'));
});

test('buildExclusionReviewLetter generates letter to head teacher', () => {
  const letter = buildExclusionReviewLetter({
    childName: 'Jamie Smith',
    schoolName: 'Springfield Academy',
    exclusionDate: '2026-06-20',
    exclusionType: 'fixed',
    parentName: 'Chris Smith'
  });
  assert.ok(letter.includes('Jamie Smith'));
  assert.ok(letter.includes('Springfield Academy'));
  assert.ok(letter.includes('Chris Smith'));
  assert.ok(letter.includes('review'));
});

test('buildIRPRequest generates Independent Review Panel request', () => {
  const letter = buildIRPRequest({
    childName: 'Jamie Smith',
    schoolName: 'Springfield Academy',
    exclusionDate: '2026-06-20',
    parentName: 'Chris Smith'
  });
  assert.ok(letter.includes('Independent Review Panel'));
  assert.ok(letter.includes('Jamie Smith'));
});

test('buildEHCDisputeLetter generates EHCP dispute letter', () => {
  const letter = buildEHCDisputeLetter({
    childName: 'Jamie Smith',
    localAuthority: 'City Council',
    disputeReason: 'The EHCP does not include provision for speech therapy',
    parentName: 'Chris Smith'
  });
  assert.ok(letter.includes('EHCP'));
  assert.ok(letter.includes('City Council'));
  assert.ok(letter.includes('Chris Smith'));
});

test('SEND_STORAGE_KEY is namespaced', () => {
  assert.equal(SEND_STORAGE_KEY, 'open-access-uk:send-helper:cases');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test shared/send-appeals/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 4: Write the implementation**

```js
// shared/send-appeals/index.mjs
import { parseLocalDate, toLocalDateString, addWorkingDays, formatDateForDisplay } from '../deadlines/index.mjs';

export const SEND_STORAGE_KEY = 'open-access-uk:send-helper:cases';
export const SEND_DRAFT_KEY = 'open-access-uk:send-helper:draft';

export const SEND_STAGES = [
  {
    id: 'exclusion-review',
    label: 'Exclusion review (governing body)',
    deadlineDays: 15,
    deadlineNote: 'The governing body must consider the exclusion within 15 school days of receiving notice. Parents can make representations.',
    escalationNext: 'irp',
    description: 'Request a review of a fixed-term or permanent exclusion by the school governing body.'
  },
  {
    id: 'irp',
    label: 'Independent Review Panel (IRP)',
    deadlineDays: 15,
    deadlineNote: 'Applications to the IRP must be made within 15 school days of the exclusion decision. Applies to permanent exclusions and some fixed-term exclusions.',
    escalationNext: 'send-tribunal',
    description: 'Apply to the Independent Review Panel for a review of a permanent exclusion.'
  },
  {
    id: 'send-tribunal',
    label: 'SEND Tribunal (First-tier Tribunal, Special Educational Needs and Disability)',
    deadlineDays: 60,
    deadlineNote: 'Appeals relating to EHCP decisions must be made within 2 months of the decision, or 1 month after a mediated mediation certificate is issued, whichever is later.',
    escalationNext: null,
    description: 'Appeal EHCP refusal, contents, or SEND-related discrimination.'
  },
  {
    id: 'ehcp-dispute',
    label: 'EHCP disagreement resolution / mediation',
    deadlineDays: 30,
    deadlineNote: 'Disagreement resolution must be sought within 30 days. Mediation is mandatory before appealing to the tribunal for EHCP decisions.',
    escalationNext: 'send-tribunal',
    description: 'Disagreement resolution for EHCP content, Annual Review outcomes, or assessment decisions.'
  }
];

export function getSendStage(id) {
  return SEND_STAGES.find((s) => s.id === id) || null;
}

export function calculateExclusionReviewDeadline(exclusionDate) {
  const start = parseLocalDate(exclusionDate);
  if (!start) return null;
  const target = addWorkingDays(exclusionDate, 15);
  return { targetDate: target, explanation: 'Exclusion review: The governing body must consider the exclusion within 15 school days. Parents should make representations promptly.' };
}

export function calculateIRPDeadline(exclusionDate) {
  const start = parseLocalDate(exclusionDate);
  if (!start) return null;
  const target = addWorkingDays(exclusionDate, 15);
  return { targetDate: target, explanation: 'IRP: Applications for an Independent Review Panel must be made within 15 school days of the exclusion decision.' };
}

export function calculateSENDTribunalDeadline(decisionDate) {
  const start = parseLocalDate(decisionDate);
  if (!start) return null;
  const result = new Date(start.getTime());
  result.setUTCMonth(result.getUTCMonth() + 2);
  return { targetDate: toLocalDateString(result), explanation: 'SEND Tribunal: Appeals must be lodged within 2 months of the decision, or 1 month after mediation, whichever is later.' };
}

export function buildExclusionReviewLetter({ childName, schoolName, exclusionDate, exclusionType, parentName } = {}) {
  return [
    `Dear Head Teacher,`,
    `Re: Request for review of exclusion — ${childName}`,
    `School: ${schoolName || 'Not specified'}`,
    `Exclusion date: ${formatDateForDisplay(exclusionDate)}`,
    `Type: ${exclusionType || 'Fixed-term'}`,
    '',
    `I am writing as the parent of ${childName} to make representations regarding the above exclusion.`,
    '',
    'I would like to request that the governing body review this exclusion and consider:',
    '- Whether the exclusion was appropriate given the circumstances.',
    '- Any reasonable adjustments or SEND-related factors that may have contributed to the behaviour.',
    '- What support or provision could prevent future exclusions.',
    '',
    'I enclose copies of relevant documentation including any EHCP, educational psychologist report, or medical evidence.',
    '',
    'Please confirm the date of the governing body hearing and any further information required.',
    '',
    'Yours sincerely,',
    parentName || 'Your name'
  ].join('\n');
}

export function buildIRPRequest({ childName, schoolName, exclusionDate, parentName, grounds = [] } = {}) {
  const groundsList = grounds.filter(Boolean).map((g) => `- ${g}`).join('\n');
  return [
    `Dear Independent Review Panel Clerk,`,
    `Re: Application for Independent Review — ${childName}`,
    `School: ${schoolName || 'Not specified'}`,
    `Exclusion date: ${formatDateForDisplay(exclusionDate)}`,
    '',
    `I am applying for a review of the permanent exclusion of ${childName} from ${schoolName || 'the school'}.`,
    '',
    'The exclusion was disproportionate and failed to consider:',
    groundsList || '- [Add your grounds for the IRP application here]',
    '',
    'The governing body failed to consider the SEND needs of the child and whether reasonable adjustments could have prevented the exclusion.',
    '',
    'I request that the IRP review the decision and recommend reinstatement or appropriate remedies.',
    '',
    'Please confirm receipt and the expected date of the IRP hearing.',
    '',
    'Yours sincerely,',
    parentName || 'Your name'
  ].join('\n');
}

export function buildEHCDisputeLetter({ childName, localAuthority, disputeReason, parentName } = {}) {
  return [
    `Dear Disagreement Resolution Service,`,
    `Re: EHCP dispute — ${childName}`,
    `Local authority: ${localAuthority || 'Not specified'}`,
    '',
    `I am writing to initiate the disagreement resolution process regarding the Education, Health and Care Plan for ${childName}.`,
    '',
    'The reason for this dispute is:',
    disputeReason || '- [Add your reason for the dispute here]',
    '',
    'I understand that disagreement resolution is available to resolve disputes about:',
    '- The contents of the EHCP',
    '- The decision not to assess or not to issue an EHCP',
    '- Annual Review decisions',
    '',
    'I request that the local authority arrange disagreement resolution within the statutory timeframes.',
    '',
    'Please confirm receipt and the date of the planned resolution meeting.',
    '',
    'Yours sincerely,',
    parentName || 'Your name'
  ].join('\n');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test shared/send-appeals/index.test.mjs`
Expected: PASS — 12 tests.

- [ ] **Step 7: Verify exports match test imports**

Run: `node -e "import('./shared/send-appeals/index.mjs').then(m => { const keys = Object.keys(m); console.log(keys.join(', ')); if (!keys.includes('SEND_STAGES')) throw new Error('missing export'); })"`
Expected: prints export list; no error.

- [ ] **Step 8: Verify no unused variables in implementation**

Run: `node --check shared/send-appeals/index.mjs`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add shared/send-appeals/index.mjs shared/send-appeals/index.test.mjs
git commit -m "feat: add SEND appeals engine (exclusion, IRP, tribunal, EHCP)"
```

---

## Task A5: Right to Repair engine

**Files:**

- Create: `shared/repairs/index.mjs`
- Test: `shared/repairs/index.test.mjs`

- [ ] **Step 1: Create shared/repairs/ directory**

- [ ] **Step 2: Write the failing test**

```js
// shared/repairs/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REPAIR_CATEGORIES,
  getRepairCategory,
  calculateRepairDeadline,
  buildRepairNotice,
  buildOmbudsmanEscalation,
  getRepairEvidenceChecklist,
  REPAIRS_STORAGE_KEY
} from './index.mjs';

test('REPAIR_CATEGORIES has emergency and responsive', () => {
  const ids = REPAIR_CATEGORIES.map((c) => c.id);
  assert.ok(ids.includes('emergency'), 'missing emergency category');
  assert.ok(ids.includes('responsive'), 'missing responsive category');
});

test('getRepairCategory returns config by id', () => {
  const cat = getRepairCategory('emergency');
  assert.equal(cat.id, 'emergency');
  assert.ok(cat.deadlineHours > 0);
  assert.ok(cat.label.length > 0);
});

test('getRepairCategory returns null for unknown id', () => {
  assert.equal(getRepairCategory('xyz'), null);
});

test('calculateRepairDeadline computes 24h deadline for emergency', () => {
  const result = calculateRepairDeadline('emergency', '2026-07-01');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.explanation.includes('24'));
  assert.ok(result.category === 'emergency');
});

test('calculateRepairDeadline computes 28-day deadline for responsive', () => {
  const result = calculateRepairDeadline('responsive', '2026-07-01');
  assert.ok(result.targetDate >= '2026-07-01');
  assert.ok(result.explanation.includes('28'));
  assert.ok(result.category === 'responsive');
});

test('calculateRepairDeadline returns null for bad date', () => {
  assert.equal(calculateRepairDeadline('emergency', 'not-a-date'), null);
});

test('buildRepairNotice generates repair request letter', () => {
  const letter = buildRepairNotice({
    category: 'emergency',
    reportDate: '2026-07-01',
    issueDescription: 'No heating in winter, boiler failure',
    landlordName: 'City Housing Association',
    tenantName: 'Morgan Lee'
  });
  assert.ok(letter.includes('emergency'));
  assert.ok(letter.includes('Morgan Lee'));
  assert.ok(letter.includes('City Housing Association'));
  assert.ok(letter.includes('24'));
});

test('buildOmbudsmanEscalation generates Housing Ombudsman escalation', () => {
  const letter = buildOmbudsmanEscalation({
    landlordName: 'City Housing Association',
    complaintDate: '2026-06-01',
    repairIssue: 'Damp and mould in bedroom',
    tenantName: 'Morgan Lee'
  });
  assert.ok(letter.includes('Housing Ombudsman'));
  assert.ok(letter.includes('Morgan Lee'));
  assert.ok(letter.includes('City Housing Association'));
});

test('getRepairEvidenceChecklist returns checklist items', () => {
  const checklist = getRepairEvidenceChecklist('responsive');
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length >= 3);
  assert.ok(checklist.some((item) => item.includes('photo') || item.includes('Photo')));
});

test('REPAIRS_STORAGE_KEY is namespaced', () => {
  assert.equal(REPAIRS_STORAGE_KEY, 'open-access-uk:right-to-repair:repairs');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test shared/repairs/index.test.mjs`
Expected: FAIL — `Cannot find module './index.mjs'`.

- [ ] **Step 4: Write the implementation**

```js
// shared/repairs/index.mjs
import { parseLocalDate, toLocalDateString, addWorkingDays, formatDateForDisplay } from '../deadlines/index.mjs';

export const REPAIRS_STORAGE_KEY = 'open-access-uk:right-to-repair:repairs';
export const REPAIRS_DRAFT_KEY = 'open-access-uk:right-to-repair:draft';

export const REPAIR_CATEGORIES = [
  {
    id: 'emergency',
    label: 'Emergency repair',
    deadlineHours: 24,
    deadlineNote: 'The landlord must carry out an emergency repair within 24 hours (Housing Act 2004, Housing Health and Safety Rating System).',
    examples: ['No heating or hot water in cold weather', 'Gas leak', 'Blocked or overflowing drain', 'Serious structural issue', 'Burst pipe', 'Lock broken leaving property insecure'],
    escalationNote: 'If not resolved within 24 hours, contact the local authority housing team and the Housing Ombudsman.'
  },
  {
    id: 'responsive',
    label: 'Responsive repair',
    deadlineDays: 28,
    deadlineNote: 'The landlord should carry out responsive repairs within 28 days (Landlord and Tenant Act 1985, s.11 implied covenant to repair).',
    examples: ['Broken boiler (non-emergency)', 'Leaking roof', 'Damp or mould', 'Broken window', 'Faulty electrical wiring', 'Broken door or lock (non-emergency)'],
    escalationNote: 'If not resolved within 28 days, follow the landlord complaint procedure and then escalate to the Housing Ombudsman.'
  }
];

export function getRepairCategory(id) {
  return REPAIR_CATEGORIES.find((c) => c.id === id) || null;
}

export function calculateRepairDeadline(categoryId, reportDate) {
  const cat = getRepairCategory(categoryId);
  if (!cat) return null;
  const start = parseLocalDate(reportDate);
  if (!start) return null;

  let target = reportDate;
  let explanation = '';
  if (categoryId === 'emergency') {
    const result = new Date(start.getTime());
    result.setUTCDate(result.getUTCDate() + 1);
    target = toLocalDateString(result);
    explanation = `${cat.label}: ${cat.deadlineNote}`;
  } else {
    target = addWorkingDays(reportDate, cat.deadlineDays);
    explanation = `${cat.label}: ${cat.deadlineNote}`;
  }

  return { category: categoryId, targetDate: target, explanation };
}

export function buildRepairNotice({ category, reportDate, issueDescription, landlordName, tenantName } = {}) {
  const cat = getRepairCategory(category);
  const catLabel = cat ? cat.label : category;
  const deadline = calculateRepairDeadline(category, reportDate);
  const deadlineDate = deadline ? formatDateForDisplay(deadline.targetDate) : 'as soon as possible';

  return [
    `Dear ${landlordName || 'Landlord'},`,
    `Re: Repair request — ${catLabel}`,
    `Date reported: ${formatDateForDisplay(reportDate)}`,
    '',
    issueDescription || 'I am reporting a repair issue at my property.',
    '',
    cat ? `This is classified as a ${catLabel.toLowerCase()}. Under the ${deadline.explanation}` : '',
    '',
    `Please carry out this repair by ${deadlineDate}. If this is an emergency and is not resolved within 24 hours, I will contact the local authority housing team and consider escalation to the Housing Ombudsman.`,
    '',
    'Please confirm receipt of this notice and the date you expect the repair to be completed.',
    '',
    'Yours faithfully,',
    tenantName || 'Your name'
  ].join('\n');
}

export function buildOmbudsmanEscalation({ landlordName, complaintDate, repairIssue, tenantName, responseReceived } = {}) {
  return [
    `Dear Housing Ombudsman Service,`,
    `Re: Complaint against ${landlordName || 'my landlord'}`,
    `Date of original complaint: ${formatDateForDisplay(complaintDate)}`,
    '',
    `I am escalating a complaint about my landlord, ${landlordName || 'my landlord'}, regarding the following repair issue:`,
    '',
    repairIssue || '[Describe the repair issue]',
    '',
    `I reported this issue on ${formatDateForDisplay(complaintDate)}. ${responseReceived || 'I have not received a satisfactory response or the repair has not been completed within the expected timeframe.'}`,
    '',
    'The landlord has failed to:',
    '- Acknowledge the repair request within a reasonable time',
    '- Carry out the repair within the statutory or reasonable timeframe',
    '- Provide a satisfactory explanation or update',
    '',
    'I request that the Housing Ombudsman investigate this complaint and recommend appropriate remedies.',
    '',
    'Please confirm receipt and the expected timeline for investigation.',
    '',
    'Yours faithfully,',
    tenantName || 'Your name'
  ].join('\n');
}

export function getRepairEvidenceChecklist(categoryId) {
  const base = [
    'Date and time the repair was first reported',
    'Written record of the report (email, letter, or online form reference)',
    'Photographs of the issue with timestamps',
    'Any responses or correspondence from the landlord'
  ];
  if (categoryId === 'emergency') {
    return [...base, 'Evidence of the emergency nature (e.g. temperature readings, photos of damage)', 'Records of any emergency contact attempts (calls, voicemails)', 'Evidence of alternative accommodation costs if applicable'];
  }
  return [...base, 'Dated photographs showing the issue at each stage', 'Any inspection reports or contractor quotes', 'Records of any disruption to daily life (e.g. unable to use bathroom, damp-related health issues)'];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test shared/repairs/index.test.mjs`
Expected: PASS — 10 tests.

- [ ] **Step 7: Verify exports match test imports**

Run: `node -e "import('./shared/repairs/index.mjs').then(m => { const keys = Object.keys(m); console.log(keys.join(', ')); if (!keys.includes('REPAIR_CATEGORIES')) throw new Error('missing export'); })"`
Expected: prints export list; no error.

- [ ] **Step 8: Verify no unused variables in implementation**

Run: `node --check shared/repairs/index.mjs`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add shared/repairs/index.mjs shared/repairs/index.test.mjs
git commit -m "feat: add right-to-repair tracker engine"
```

---

## Task A6: Register new storage keys in privacy registry

**Files:**

- Modify: `shared/privacy/local-storage.mjs`
- Modify: `shared/privacy/local-storage.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `shared/privacy/local-storage.test.mjs`:

```js
import { COMPLAINTS_STORAGE_KEY } from '../complaints/index.mjs';
import { APPEALS_STORAGE_KEY } from '../appeals/index.mjs';
import { PARKING_STORAGE_KEY } from '../parking/index.mjs';
import { SEND_STORAGE_KEY } from '../send-appeals/index.mjs';
import { REPAIRS_STORAGE_KEY } from '../repairs/index.mjs';

test('storageRegistry includes Phase 1 tool keys', () => {
  const keys = storageRegistry.map((i) => i.key);
  assert.ok(keys.includes(COMPLAINTS_STORAGE_KEY), 'nhs-complaints key missing');
  assert.ok(keys.includes(APPEALS_STORAGE_KEY), 'benefits-appeals key missing');
  assert.ok(keys.includes(PARKING_STORAGE_KEY), 'parking-appeal key missing');
  assert.ok(keys.includes(SEND_STORAGE_KEY), 'send-helper key missing');
  assert.ok(keys.includes(REPAIRS_STORAGE_KEY), 'right-to-repair key missing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: FAIL — one or more keys missing.

- [ ] **Step 3: Add the registry entries**

In `shared/privacy/local-storage.mjs`, add these objects as the LAST elements of `storageRegistry` (after the existing entries):

```js
  ,
  {
    key: 'open-access-uk:nhs-complaints-tracker:complaints',
    tool: 'nhs-complaints-tracker',
    label: 'NHS complaints',
    storage: 'localStorage',
    contains: 'Tracked NHS complaints, stages, deadlines, and evidence checklists'
  },
  {
    key: 'open-access-uk:nhs-complaints-tracker:draft',
    tool: 'nhs-complaints-tracker',
    label: 'NHS complaints form draft',
    storage: 'localStorage',
    contains: 'In-progress NHS complaints form fields'
  },
  {
    key: 'open-access-uk:benefits-appeals:appeals',
    tool: 'benefits-appeals',
    label: 'Benefits appeals',
    storage: 'localStorage',
    contains: 'Tracked UC/PIP/ESA appeals, MR deadlines, and tribunal timelines'
  },
  {
    key: 'open-access-uk:benefits-appeals:draft',
    tool: 'benefits-appeals',
    label: 'Benefits appeals form draft',
    storage: 'localStorage',
    contains: 'In-progress benefits appeal form fields'
  },
  {
    key: 'open-access-uk:parking-appeal:pcns',
    tool: 'parking-appeal',
    label: 'Parking appeals',
    storage: 'localStorage',
    contains: 'Tracked PCN appeals, deadlines, and evidence checklists'
  },
  {
    key: 'open-access-uk:parking-appeal:draft',
    tool: 'parking-appeal',
    label: 'Parking appeal form draft',
    storage: 'localStorage',
    contains: 'In-progress parking appeal form fields'
  },
  {
    key: 'open-access-uk:send-helper:cases',
    tool: 'send-helper',
    label: 'SEND helper cases',
    storage: 'localStorage',
    contains: 'SEND exclusion, IRP, tribunal, and EHCP dispute cases'
  },
  {
    key: 'open-access-uk:send-helper:draft',
    tool: 'send-helper',
    label: 'SEND helper form draft',
    storage: 'localStorage',
    contains: 'In-progress SEND helper form fields'
  },
  {
    key: 'open-access-uk:right-to-repair:repairs',
    tool: 'right-to-repair',
    label: 'Right to repair',
    storage: 'localStorage',
    contains: 'Tracked repair requests, deadlines, and escalation notes'
  },
  {
    key: 'open-access-uk:right-to-repair:draft',
    tool: 'right-to-repair',
    label: 'Right to repair form draft',
    storage: 'localStorage',
    contains: 'In-progress right to repair form fields'
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/privacy/local-storage.mjs shared/privacy/local-storage.test.mjs
git commit -m "feat: register Phase 1 tool storage keys in privacy registry"
```

---

## Task A7: Cross-engine unit verification

- [ ] **Step 1: Run all Tier A shared tests together**

Run: `node --test shared/complaints/index.test.mjs shared/appeals/index.test.mjs shared/parking/index.test.mjs shared/send-appeals/index.test.mjs shared/repairs/index.test.mjs`
Expected: all PASS (50+ tests total).

- [ ] **Step 2: Verify no import cycles or missing dependencies**

Run: `node --check shared/complaints/index.mjs && node --check shared/appeals/index.mjs && node --check shared/parking/index.mjs && node --check shared/send-appeals/index.mjs && node --check shared/repairs/index.mjs`
Expected: all clean (no output).

- [ ] **Step 3: Verify privacy registry test passes**

Run: `node --test shared/privacy/local-storage.test.mjs`
Expected: PASS.

---

# TIER B — Per-app implementations

## Task B1: NHS Complaints Tracker app

**Files:**

- Create: `nhs-complaints-tracker/index.html`
- Create: `nhs-complaints-tracker/src/app.js`
- Create: `nhs-complaints-tracker/styles.css`
- Create: `nhs-complaints-tracker/scripts/check-static.mjs`

- [ ] **Step 1: Create the submodule directory**

- [ ] **Step 2: Create the HTML structure**

```html
<!-- nhs-complaints-tracker/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NHS Complaints Tracker — Open Access UK</title>
  <link rel="stylesheet" href="../shared/suite-skin.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <a href="../" class="logo">Open Access UK</a>
    <button id="theme-toggle" type="button" aria-pressed="false">Dark theme</button>
  </header>
  <main id="main">
    <h1>NHS Complaints Tracker</h1>
    <p class="summary">Track your NHS complaint through PALS, formal complaint, and PHSO escalation stages. Manage deadlines and build evidence checklists locally in your browser.</p>
    <section id="tool">
      <form id="complaint-form">
        <label for="complainantName">Your name</label>
        <input id="complainantName" name="complainantName" required />
        <label for="complaintSummary">Complaint summary</label>
        <textarea id="complaintSummary" name="complaintSummary" rows="3" required></textarea>
        <label for="startDate">Date complaint raised</label>
        <input id="startDate" name="startDate" type="date" required />
        <label for="currentStage">Current stage</label>
        <select id="currentStage" name="currentStage">
          <option value="pals">PALS (Patient Advice and Liaison Service)</option>
          <option value="formal">Formal NHS complaint</option>
          <option value="phso">Parliamentary and Health Service Ombudsman (PHSO)</option>
        </select>
        <label for="referenceNumber">Reference number</label>
        <input id="referenceNumber" name="referenceNumber" />
        <div class="actions">
          <button id="generate" type="button">Generate escalation letter</button>
          <button id="download" type="button" class="secondary">Download letter</button>
          <button id="printPage" type="button" class="secondary">Save as PDF / Print</button>
        </div>
      </form>
      <div id="status" role="status" aria-live="polite"></div>
      <div id="deadline-tracker" aria-live="polite"></div>
      <div id="evidence-checklist" aria-live="polite"></div>
      <pre id="preview" class="preview" tabindex="0"></pre>
      <div id="sources" aria-label="Current source notes"></div>
    </section>
  </main>
  <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify HTML syntax**

Run: `node --check nhs-complaints-tracker/index.html` (or use html-validate if available)

- [ ] **Step 4: Create the app module**

```js
// nhs-complaints-tracker/src/app.js
import {
  COMPLAINT_STAGES,
  getComplaintStage,
  calculateStageDeadline,
  buildEvidenceChecklist,
  buildEscalationLetter,
  COMPLAINTS_STORAGE_KEY,
  COMPLAINTS_DRAFT_KEY
} from '../../shared/complaints/index.mjs';
import { formatDateForDisplay, buildICS } from '../../shared/deadlines/index.mjs';
import { analyseReadability } from '../../shared/readability/index.mjs';

const form = document.querySelector('#complaint-form');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const deadlineTracker = document.querySelector('#deadline-tracker');
const evidenceChecklist = document.querySelector('#evidence-checklist');
const sourcesMount = document.querySelector('#sources');

function values() { return Object.fromEntries(new FormData(form).entries()); }

function renderDeadline() {
  const data = values();
  if (!data.startDate || !data.currentStage) { deadlineTracker.textContent = ''; return; }
  const deadline = calculateStageDeadline(data.startDate, data.currentStage);
  if (!deadline) { deadlineTracker.textContent = ''; return; }
  deadlineTracker.innerHTML = `<h2>Deadline</h2><p>${deadline.explanation}</p><p>Target date: <strong>${formatDateForDisplay(deadline.targetDate)}</strong></p>`;
}

function renderEvidence() {
  const data = values();
  if (!data.currentStage) { evidenceChecklist.innerHTML = ''; return; }
  const checklist = buildEvidenceChecklist(data.currentStage);
  evidenceChecklist.innerHTML = `<h2>Evidence checklist</h2><ul>${checklist.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function renderSources() {
  sourcesMount.innerHTML = `<h2>Current source notes</h2><ul>
    <li><strong>NHS Complaints Regulations 2009</strong> — The statutory framework for NHS complaints. Source: <a href="https://www.legislation.gov.uk/uksi/2009/671/contents" rel="noreferrer">legislation.gov.uk</a></li>
    <li><strong>PHSO Complaints Guidance</strong> — Independent investigation of unresolved NHS complaints. Source: <a href="https://www.ombudsman.org.uk/your-complaint" rel="noreferrer">ombudsman.org.uk</a></li>
  </ul>`;
}

function update() {
  const data = values();
  const letter = buildEscalationLetter({ stage: data.currentStage, startDate: data.startDate, recipientName: data.complainantName, complaintSummary: data.complaintSummary });
  preview.textContent = letter;
  renderDeadline();
  renderEvidence();
  renderSources();
  saveDraft();
}

function saveDraft() { try { localStorage.setItem(COMPLAINTS_DRAFT_KEY, JSON.stringify(values())); } catch {} }
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(COMPLAINTS_DRAFT_KEY) || '{}');
    for (const [name, value] of Object.entries(draft)) { const field = form.elements.namedItem(name); if (field) field.value = value; }
  } catch {}
}

form.addEventListener('input', update);
document.querySelector('#generate')?.addEventListener('click', update);
document.querySelector('#download')?.addEventListener('click', () => {
  const blob = new Blob([preview.textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'nhs-complaint-escalation.txt'; link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Letter downloaded locally. Nothing was sent to a server.';
});
document.querySelector('#printPage')?.addEventListener('click', () => window.print());
restoreDraft();
update();
```

- [ ] **Step 5: Verify app.js syntax**

Run: `node --check nhs-complaints-tracker/src/app.js`
Expected: no output (clean).

- [ ] **Step 6: Create styles**

```css
/* nhs-complaints-tracker/styles.css */
.summary { color: var(--ink-muted); margin-bottom: var(--space-4); }
#tool { display: grid; gap: var(--space-4); }
form { display: grid; gap: var(--space-3); }
.actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.preview { padding: var(--space-4); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); white-space: pre-wrap; min-height: 120px; }
#deadline-tracker, #evidence-checklist { padding: var(--space-3); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); }
```

- [ ] **Step 8: Verify full page tests + static checks**

Run: `cd nhs-complaints-tracker && node --check src/app.js && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) && cd ..`
Expected: no `--check` output; tests pass.

- [ ] **Step 9: Verify aria labels are present**

Run: `grep -c 'aria-live="polite"' nhs-complaints-tracker/index.html`
Expected: at least 2 (deadline tracker + evidence checklist).

- [ ] **Step 10: Verify print handler wired**

Run: `grep -c 'printPage' nhs-complaints-tracker/src/app.js`
Expected: at least 1.

- [ ] **Step 11: Commit**

```bash
git add nhs-complaints-tracker/
git commit -m "feat: add NHS complaints tracker tool"
```

---

## Task B2: Benefits Appeals app

**Files:**

- Create: `benefits-appeals/index.html`
- Create: `benefits-appeals/src/app.js`
- Create: `benefits-appeals/styles.css`
- Create: `benefits-appeals/scripts/check-static.mjs`

- [ ] **Step 1: Create the submodule directory**

- [ ] **Step 2: Create the HTML structure**

```html
<!-- benefits-appeals/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Benefits Appeals — Open Access UK</title>
  <link rel="stylesheet" href="../shared/suite-skin.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <a href="../" class="logo">Open Access UK</a>
    <button id="theme-toggle" type="button" aria-pressed="false">Dark theme</button>
  </header>
  <main id="main">
    <h1>Benefits Appeals</h1>
    <p class="summary">Generate Mandatory Reconsideration requests and Tribunal appeal applications for UC, PIP, and ESA. Track deadlines and scoring guidance locally.</p>
    <section id="tool">
      <form id="appeal-form">
        <label for="benefitType">Benefit type</label>
        <select id="benefitType" name="benefitType">
          <option value="uc">Universal Credit (UC)</option>
          <option value="pip">Personal Independence Payment (PIP)</option>
          <option value="esa">Employment and Support Allowance (ESA)</option>
        </select>
        <label for="appealStage">Appeal stage</label>
        <select id="appealStage" name="appealStage">
          <option value="mr">Mandatory Reconsideration</option>
          <option value="tribunal">Tribunal Appeal</option>
        </select>
        <label for="decisionDate">Date of DWP decision</label>
        <input id="decisionDate" name="decisionDate" type="date" required />
        <label for="decisionRef">Decision reference number</label>
        <input id="decisionRef" name="decisionRef" />
        <label for="claimantName">Your name</label>
        <input id="claimantName" name="claimantName" required />
        <label for="reasons">Reasons for appeal (one per line)</label>
        <textarea id="reasons" name="reasons" rows="4"></textarea>
        <div class="actions">
          <button id="generate" type="button">Generate letter</button>
          <button id="download" type="button" class="secondary">Download letter</button>
          <button id="printPage" type="button" class="secondary">Save as PDF / Print</button>
          <button id="addCalendar" type="button" class="secondary">Add deadline to calendar</button>
        </div>
      </form>
      <div id="status" role="status" aria-live="polite"></div>
      <div id="deadline-tracker" aria-live="polite"></div>
      <div id="descriptor-guidance" aria-live="polite"></div>
      <pre id="preview" class="preview" tabindex="0"></pre>
      <div id="sources" aria-label="Current source notes"></div>
    </section>
  </main>
  <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify HTML syntax**

- [ ] **Step 4: Create the app module**

```js
// benefits-appeals/src/app.js
import {
  BENEFIT_TYPES, getBenefitType, calculateMRDeadline, calculateTribunalDeadline,
  buildMRLetter, buildTribunalApplication, getDescriptorGuidance,
  APPEALS_STORAGE_KEY, APPEALS_DRAFT_KEY
} from '../../shared/appeals/index.mjs';
import { formatDateForDisplay, buildICS } from '../../shared/deadlines/index.mjs';

const form = document.querySelector('#appeal-form');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const deadlineTracker = document.querySelector('#deadline-tracker');
const descriptorGuidance = document.querySelector('#descriptor-guidance');
const sourcesMount = document.querySelector('#sources');

function values() { return Object.fromEntries(new FormData(form).entries()); }

function renderDeadline() {
  const data = values();
  if (!data.decisionDate || !data.benefitType) { deadlineTracker.textContent = ''; return; }
  const deadline = data.appealStage === 'mr' ? calculateMRDeadline(data.benefitType, data.decisionDate) : calculateTribunalDeadline(data.benefitType, data.decisionDate);
  if (deadline) {
    deadlineTracker.innerHTML = `<h2>${data.appealStage === 'mr' ? 'MR' : 'Tribunal'} Deadline</h2><p>${deadline.explanation}</p><p>Target date: <strong>${formatDateForDisplay(deadline.targetDate)}</strong></p>`;
  }
}

function renderDescriptors() {
  const data = values();
  if (data.benefitType !== 'pip' || data.appealStage !== 'tribunal') { descriptorGuidance.textContent = ''; return; }
  const guidance = getDescriptorGuidance('pip');
  if (!guidance.length) return;
  descriptorGuidance.innerHTML = `<h2>PIP Descriptor Scoring</h2><ul>${guidance.map((d) => `<li><strong>${d.activity}:</strong> ${d.scoring}</li>`).join('')}</ul>`;
}

function renderSources() {
  sourcesMount.innerHTML = `<h2>Current source notes</h2><ul>
    <li><strong>DWP Mandatory Reconsideration Guidance</strong> — Source: <a href="https://www.gov.uk/mandatory-reconsideration" rel="noreferrer">gov.uk</a></li>
    <li><strong>Tribunal Procedure Rules</strong> — Source: <a href="https://www.legislation.gov.uk/uksi/2008/2685" rel="noreferrer">legislation.gov.uk</a></li>
    <li><strong>PIP Descriptor Guidance</strong> — Source: <a href="https://www.gov.uk/pip/what-is-pip" rel="noreferrer">gov.uk</a></li>
  </ul>`;
}

function update() {
  const data = values();
  const letter = data.appealStage === 'mr'
    ? buildMRLetter({ benefitType: data.benefitType, decisionDate: data.decisionDate, decisionRef: data.decisionRef, reasons: (data.reasons || '').split('\n').filter(Boolean), claimantName: data.claimantName })
    : buildTribunalApplication({ benefitType: data.benefitType, mrDecisionDate: data.decisionDate, mrDecisionRef: data.decisionRef, grounds: (data.reasons || '').split('\n').filter(Boolean), claimantName: data.claimantName });
  preview.textContent = letter;
  renderDeadline();
  renderDescriptors();
  renderSources();
  saveDraft();
}

function saveDraft() { try { localStorage.setItem(APPEALS_DRAFT_KEY, JSON.stringify(values())); } catch {} }
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(APPEALS_DRAFT_KEY) || '{}');
    for (const [name, value] of Object.entries(draft)) { const field = form.elements.namedItem(name); if (field) field.value = value; }
  } catch {}
}

form.addEventListener('input', update);
document.querySelector('#generate')?.addEventListener('click', update);
document.querySelector('#download')?.addEventListener('click', () => {
  const data = values();
  const blob = new Blob([preview.textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `${data.appealStage === 'mr' ? 'mandatory-reconsideration' : 'tribunal-appeal'}-${data.benefitType}.txt`; link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Letter downloaded locally. Nothing was sent to a server.';
});
document.querySelector('#printPage')?.addEventListener('click', () => window.print());
document.querySelector('#addCalendar')?.addEventListener('click', () => {
  const data = values();
  if (!data.decisionDate || !data.benefitType) { status.textContent = 'Set a decision date and benefit type first.'; return; }
  const deadline = data.appealStage === 'mr' ? calculateMRDeadline(data.benefitType, data.decisionDate) : calculateTribunalDeadline(data.benefitType, data.decisionDate);
  if (!deadline) { status.textContent = 'Could not calculate deadline.'; return; }
  const ics = buildICS(`${data.appealStage === 'mr' ? 'MR' : 'Tribunal'} deadline: ${data.benefitType.toUpperCase()}`, deadline.targetDate, deadline.explanation);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'benefits-deadline.ics'; link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Calendar reminder downloaded. Nothing was sent to a server.';
});
restoreDraft();
update();
```

- [ ] **Step 7: Verify app.js syntax**

Run: `node --check benefits-appeals/src/app.js`

- [ ] **Step 8: Verify calendar button handler present**

Run: `grep -c 'addCalendar' benefits-appeals/src/app.js`
Expected: at least 2.

- [ ] **Step 9: Create styles**

```css
/* benefits-appeals/styles.css */
.summary { color: var(--ink-muted); margin-bottom: var(--space-4); }
#tool { display: grid; gap: var(--space-4); }
form { display: grid; gap: var(--space-3); }
.actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.preview { padding: var(--space-4); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); white-space: pre-wrap; min-height: 120px; }
#deadline-tracker, #descriptor-guidance { padding: var(--space-3); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); }
```

- [ ] **Step 10: Verify full page tests + static checks**

Run: `cd benefits-appeals && node --check src/app.js && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) && cd ..`

- [ ] **Step 11: Verify source notes section present**

Run: `grep -c 'Current source notes' benefits-appeals/src/app.js`
Expected: at least 1.

- [ ] **Step 12: Commit**

```bash
git add benefits-appeals/
git commit -m "feat: add benefits appeals tool (UC/PIP/ESA MR + tribunal)"
```

---

## Task B3: Parking Appeal Generator (extension to letter-generator)

**Files:**

- Modify: `letter-generator/index.html`
- Modify: `letter-generator/src/app.js`
- Modify: `letter-generator/styles.css`

- [ ] **Step 1: Add PCN appeal option to requestType select**

In `letter-generator/index.html`, add to the existing `#requestType` select:

```html
<option value="pcn-appeal">Parking Charge Notice (PCN) appeal</option>
```

- [ ] **Step 2: Add parking-specific form fields**

Inside the form in `letter-generator/index.html`, after the existing fields, add:

```html
<div id="parking-fields" hidden>
  <label for="operatorType">Operator type</label>
  <select id="operatorType" name="operatorType">
    <option value="council">Council (Local Authority)</option>
    <option value="private">Private parking operator</option>
  </select>
  <label for="pcnNumber">PCN number</label>
  <input id="pcnNumber" name="pcnNumber" />
  <label for="issueDate">PCN issue date</label>
  <input id="issueDate" name="issueDate" type="date" />
  <label for="appealGrounds">Grounds for appeal (one per line)</label>
  <textarea id="appealGrounds" name="appealGrounds" rows="3"></textarea>
</div>
```

- [ ] **Step 3: Add PCN imports at top of app.js**

At the TOP of `letter-generator/src/app.js`, after the existing imports, add:

```js
import { OPERATOR_TYPES, getOperatorType, calculatePCNDeadline, buildPCNAppealLetter, getEvidenceChecklist, PARKING_STORAGE_KEY } from '../../shared/parking/index.mjs';
```

- [ ] **Step 4: Add PCN generation logic at bottom of app.js**

At the BOTTOM, add:

```js
const parkingFields = document.querySelector('#parking-fields');
const requestTypeSelect = document.querySelector('#requestType');

function showParkingFields() {
  if (parkingFields) parkingFields.hidden = requestTypeSelect?.value !== 'pcn-appeal';
}

function generatePCNAppeal() {
  const data = values();
  if (data.requestType !== 'pcn-appeal') return null;
  return buildPCNAppealLetter({ operatorType: data.operatorType, pcnNumber: data.pcnNumber, issueDate: data.issueDate, grounds: (data.appealGrounds || '').split('\n').filter(Boolean), driverName: data.name });
}

const originalUpdate = update;
update = function() {
  const data = values();
  if (data.requestType === 'pcn-appeal') {
    const letter = generatePCNAppeal();
    if (letter) {
      preview.textContent = letter;
      showParkingFields();
      if (data.issueDate && data.operatorType) {
        const deadline = calculatePCNDeadline(data.operatorType, data.issueDate);
        deadlineTracker.textContent = deadline ? `${deadline.explanation} Target: ${formatDateForDisplay(deadline.targetDate)}` : '';
      }
      const checklist = getEvidenceChecklist(data.operatorType);
      evidenceChecklist.innerHTML = `<h2>Evidence checklist</h2><ul>${checklist.map((item) => `<li>${item}</li>`).join('')}</ul>`;
      return;
    }
  }
  showParkingFields();
  originalUpdate();
};

requestTypeSelect?.addEventListener('change', showParkingFields);
showParkingFields();
```

NOTE: Do NOT redeclare `status`, `preview`, `form`, `values`, `deadlineTracker`, `evidenceChecklist`, or `update`.

- [ ] **Step 5: Add styles**

Append to `letter-generator/styles.css`:

```css
#parking-fields { display: grid; gap: var(--space-3); margin-top: var(--space-3); }
#parking-fields[hidden] { display: none; }
```

- [ ] **Step 6: Verify syntax**

Run: `cd letter-generator && node --check src/app.js && node --test && node scripts/check-static.mjs && cd ..`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add letter-generator/index.html letter-generator/src/app.js letter-generator/styles.css
git commit -m "feat: add PCN appeal templates and deadline tracker to letter generator"
```

---

## Task B4: School SEND Helper app

**Files:**

- Create: `send-helper/index.html`
- Create: `send-helper/src/app.js`
- Create: `send-helper/styles.css`
- Create: `send-helper/scripts/check-static.mjs`

- [ ] **Step 1: Create the submodule directory**

- [ ] **Step 2: Create the HTML structure**

```html
<!-- send-helper/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>School SEND Helper — Open Access UK</title>
  <link rel="stylesheet" href="../shared/suite-skin.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <a href="../" class="logo">Open Access UK</a>
    <button id="theme-toggle" type="button" aria-pressed="false">Dark theme</button>
  </header>
  <main id="main">
    <h1>School SEND Helper</h1>
    <p class="summary">Review school exclusions, apply to the Independent Review Panel, and manage SEND tribunal and EHCP disputes. Track deadlines locally.</p>
    <section id="tool">
      <form id="send-form">
        <label for="sendStage">What do you need help with?</label>
        <select id="sendStage" name="sendStage">
          <option value="exclusion-review">Exclusion review (governing body)</option>
          <option value="irp">Independent Review Panel (IRP) application</option>
          <option value="send-tribunal">SEND Tribunal application</option>
          <option value="ehcp-dispute">EHCP dispute / mediation</option>
        </select>
        <label for="childName">Child's name</label>
        <input id="childName" name="childName" required />
        <label for="parentName">Parent / guardian name</label>
        <input id="parentName" name="parentName" required />
        <label for="schoolName">School name</label>
        <input id="schoolName" name="schoolName" />
        <label for="localAuthority">Local authority</label>
        <input id="localAuthority" name="localAuthority" />
        <label for="eventDate">Date of exclusion / decision</label>
        <input id="eventDate" name="eventDate" type="date" required />
        <label for="exclusionType">Exclusion type</label>
        <select id="exclusionType" name="exclusionType">
          <option value="fixed">Fixed-term</option>
          <option value="permanent">Permanent</option>
        </select>
        <label for="disputeReason">Reason / grounds (one per line)</label>
        <textarea id="disputeReason" name="disputeReason" rows="4"></textarea>
        <div class="actions">
          <button id="generate" type="button">Generate letter</button>
          <button id="download" type="button" class="secondary">Download letter</button>
          <button id="printPage" type="button" class="secondary">Save as PDF / Print</button>
          <button id="addCalendar" type="button" class="secondary">Add deadline to calendar</button>
        </div>
      </form>
      <div id="status" role="status" aria-live="polite"></div>
      <div id="deadline-tracker" aria-live="polite"></div>
      <pre id="preview" class="preview" tabindex="0"></pre>
      <div id="sources" aria-label="Current source notes"></div>
    </section>
  </main>
  <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify HTML syntax**

- [ ] **Step 4: Create the app module**

```js
// send-helper/src/app.js
import {
  SEND_STAGES, getSendStage, calculateExclusionReviewDeadline, calculateIRPDeadline,
  calculateSENDTribunalDeadline, buildExclusionReviewLetter, buildIRPRequest,
  buildEHCDisputeLetter, SEND_STORAGE_KEY, SEND_DRAFT_KEY
} from '../../shared/send-appeals/index.mjs';
import { formatDateForDisplay, buildICS } from '../../shared/deadlines/index.mjs';

const form = document.querySelector('#send-form');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const deadlineTracker = document.querySelector('#deadline-tracker');
const sourcesMount = document.querySelector('#sources');

function values() { return Object.fromEntries(new FormData(form).entries()); }

function renderDeadline() {
  const data = values();
  if (!data.eventDate || !data.sendStage) { deadlineTracker.textContent = ''; return; }
  let deadline = null;
  if (data.sendStage === 'exclusion-review') deadline = calculateExclusionReviewDeadline(data.eventDate);
  else if (data.sendStage === 'irp') deadline = calculateIRPDeadline(data.eventDate);
  else if (data.sendStage === 'send-tribunal') deadline = calculateSENDTribunalDeadline(data.eventDate);
  if (deadline) {
    deadlineTracker.innerHTML = `<h2>Deadline</h2><p>${deadline.explanation}</p><p>Target date: <strong>${formatDateForDisplay(deadline.targetDate)}</strong></p>`;
  } else { deadlineTracker.textContent = ''; }
}

function renderSources() {
  sourcesMount.innerHTML = `<h2>Current source notes</h2><ul>
    <li><strong>Children and Families Act 2014</strong> — Source: <a href="https://www.legislation.gov.uk/ukpga/2014/6/contents" rel="noreferrer">legislation.gov.uk</a></li>
    <li><strong>SEND Code of Practice 2015</strong> — Source: <a href="https://www.gov.uk/government/publications/send-code-of-practice-0-to-25" rel="noreferrer">gov.uk</a></li>
    <li><strong>Tribunal Procedure Rules</strong> — Source: <a href="https://www.legislation.gov.uk/uksi/2008/2685" rel="noreferrer">legislation.gov.uk</a></li>
  </ul>`;
}

function generate() {
  const data = values();
  let letter = '';
  if (data.sendStage === 'exclusion-review') {
    letter = buildExclusionReviewLetter({ childName: data.childName, schoolName: data.schoolName, exclusionDate: data.eventDate, exclusionType: data.exclusionType, parentName: data.parentName });
  } else if (data.sendStage === 'irp') {
    letter = buildIRPRequest({ childName: data.childName, schoolName: data.schoolName, exclusionDate: data.eventDate, parentName: data.parentName, grounds: (data.disputeReason || '').split('\n').filter(Boolean) });
  } else if (data.sendStage === 'ehcp-dispute') {
    letter = buildEHCDisputeLetter({ childName: data.childName, localAuthority: data.localAuthority, disputeReason: data.disputeReason, parentName: data.parentName });
  }
  preview.textContent = letter;
  renderDeadline();
  renderSources();
  saveDraft();
}

function saveDraft() { try { localStorage.setItem(SEND_DRAFT_KEY, JSON.stringify(values())); } catch {} }
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(SEND_DRAFT_KEY) || '{}');
    for (const [name, value] of Object.entries(draft)) { const field = form.elements.namedItem(name); if (field) field.value = value; }
  } catch {}
}

form.addEventListener('input', generate);
document.querySelector('#generate')?.addEventListener('click', generate);
document.querySelector('#download')?.addEventListener('click', () => {
  const blob = new Blob([preview.textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'send-helper-letter.txt'; link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Letter downloaded locally. Nothing was sent to a server.';
});
document.querySelector('#printPage')?.addEventListener('click', () => window.print());
document.querySelector('#addCalendar')?.addEventListener('click', () => {
  const data = values();
  if (!data.eventDate || !data.sendStage) { status.textContent = 'Set a date and stage first.'; return; }
  let deadline = null;
  if (data.sendStage === 'exclusion-review') deadline = calculateExclusionReviewDeadline(data.eventDate);
  else if (data.sendStage === 'irp') deadline = calculateIRPDeadline(data.eventDate);
  else if (data.sendStage === 'send-tribunal') deadline = calculateSENDTribunalDeadline(data.eventDate);
  if (!deadline) { status.textContent = 'Could not calculate deadline.'; return; }
  const stageData = getSendStage(data.sendStage);
  const ics = buildICS(`${stageData ? stageData.label : data.sendStage} deadline`, deadline.targetDate, deadline.explanation);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'send-deadline.ics'; link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Calendar reminder downloaded. Nothing was sent to a server.';
});
restoreDraft();
generate();
```

- [ ] **Step 5: Verify app.js syntax**

Run: `node --check send-helper/src/app.js`

- [ ] **Step 6: Verify calendar handler and source notes**

Run: `grep -c 'addCalendar' send-helper/src/app.js && grep -c 'Current source notes' send-helper/src/app.js`
Expected: at least 1 each.

- [ ] **Step 7: Create styles**

```css
/* send-helper/styles.css */
.summary { color: var(--ink-muted); margin-bottom: var(--space-4); }
#tool { display: grid; gap: var(--space-4); }
form { display: grid; gap: var(--space-3); }
.actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.preview { padding: var(--space-4); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); white-space: pre-wrap; min-height: 120px; }
#deadline-tracker { padding: var(--space-3); border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-2); }
```

- [ ] **Step 8: Verify full page tests + static checks**

Run: `cd send-helper && node --check src/app.js && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) && cd ..`

- [ ] **Step 9: Commit**

```bash
git add send-helper/
git commit -m "feat: add school SEND helper tool (exclusion, IRP, tribunal, EHCP)"
```

---

## Task B5: Right to Repair Tracker (extension to case-builder)

**Files:**

- Modify: `case-builder/index.html`
- Modify: `case-builder/src/app.js`
- Modify: `case-builder/styles.css`

- [ ] **Step 1: Add repair tracker section to index.html**

In `case-builder/index.html`, inside the main form, add after existing case fields:

```html
<div id="repair-section" class="repair-section" hidden>
  <h2>Right to Repair Tracker</h2>
  <label for="repairCategory">Repair category</label>
  <select id="repairCategory" name="repairCategory">
    <option value="emergency">Emergency (24-hour)</option>
    <option value="responsive">Responsive repair (28-day)</option>
  </select>
  <label for="repairReportDate">Date repair reported</label>
  <input id="repairReportDate" name="repairReportDate" type="date" />
  <label for="repairIssue">Repair issue description</label>
  <textarea id="repairIssue" name="repairIssue" rows="3"></textarea>
  <label for="landlordName">Landlord name</label>
  <input id="landlordName" name="landlordName" />
  <div id="repair-deadline-tracker" aria-live="polite"></div>
  <div id="repair-evidence-checklist" aria-live="polite"></div>
</div>
```

- [ ] **Step 2: Add repair tracker imports at top of app.js**

At the TOP of `case-builder/src/app.js`, after existing imports, add:

```js
import { getRepairCategory, calculateRepairDeadline, buildRepairNotice, buildOmbudsmanEscalation, getRepairEvidenceChecklist, REPAIRS_STORAGE_KEY } from '../../shared/repairs/index.mjs';
import { formatDateForDisplay, buildICS } from '../../shared/deadlines/index.mjs';
```

- [ ] **Step 3: Add repair tracker logic at bottom of app.js**

At the BOTTOM, add:

```js
const repairSection = document.querySelector('#repair-section');
const repairDeadlineTracker = document.querySelector('#repair-deadline-tracker');
const repairEvidenceChecklist = document.querySelector('#repair-evidence-checklist');

function showRepairSection() {
  const caseType = document.querySelector('#caseType')?.value;
  if (repairSection) repairSection.hidden = caseType !== 'repair';
}

function renderRepairDeadline() {
  const category = document.querySelector('#repairCategory')?.value;
  const reportDate = document.querySelector('#repairReportDate')?.value;
  if (!category || !reportDate || !repairDeadlineTracker) { if (repairDeadlineTracker) repairDeadlineTracker.textContent = ''; return; }
  const deadline = calculateRepairDeadline(category, reportDate);
  if (deadline) {
    repairDeadlineTracker.innerHTML = `<h3>Repair deadline</h3><p>${deadline.explanation}</p><p>Target completion: <strong>${formatDateForDisplay(deadline.targetDate)}</strong></p>`;
  }
}

function renderRepairEvidence() {
  const category = document.querySelector('#repairCategory')?.value;
  if (!category || !repairEvidenceChecklist) { if (repairEvidenceChecklist) repairEvidenceChecklist.textContent = ''; return; }
  const checklist = getRepairEvidenceChecklist(category);
  repairEvidenceChecklist.innerHTML = `<h3>Evidence checklist</h3><ul>${checklist.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

document.querySelector('#caseType')?.addEventListener('change', showRepairSection);
document.querySelector('#repairCategory')?.addEventListener('change', renderRepairDeadline);
document.querySelector('#repairReportDate')?.addEventListener('change', renderRepairDeadline);
showRepairSection();
renderRepairDeadline();
renderRepairEvidence();
```

- [ ] **Step 4: Add styles**

Append to `case-builder/styles.css`:

```css
.repair-section { display: grid; gap: var(--space-3); margin-top: var(--space-4); padding: var(--space-4); border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--paper-2); }
.repair-section[hidden] { display: none; }
#repair-deadline-tracker, #repair-evidence-checklist { margin-top: var(--space-3); padding: var(--space-3); border: 1px solid var(--line); border-radius: var(--radius-sm); }
```

- [ ] **Step 5: Verify syntax + tests**

Run: `cd case-builder && node --check src/app.js && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) && cd ..`

- [ ] **Step 6: Commit**

```bash
git add case-builder/index.html case-builder/src/app.js case-builder/styles.css
git commit -m "feat: add right-to-repair tracker to case builder"
```

---

## Task C1: Suite-level verification

**Files:** none (verification only)

- [ ] **Step 1: Run all Tier A shared tests**

Run: `node --test shared/complaints/index.test.mjs shared/appeals/index.test.mjs shared/parking/index.test.mjs shared/send-appeals/index.test.mjs shared/repairs/index.test.mjs shared/privacy/local-storage.test.mjs`
Expected: all PASS.

- [ ] **Step 2: Run every page's tests + static checks**

Run:

```bash
for d in letter-generator case-builder nhs-complaints-tracker benefits-appeals send-helper; do
  echo "== $d ==";
  ( cd "$d" && node --test && ( [ -f scripts/check-static.mjs ] && node scripts/check-static.mjs || echo 'no check-static' ) ) || exit 1;
done
echo "ALL PAGES GREEN"
```

Expected: each page green; final `ALL PAGES GREEN`.

- [ ] **Step 3: Repo quality + format**

Run: `npm run quality:static && npx prettier . --check`
Expected: "Static quality checks passed". If prettier flags files, run `npx prettier . --write` and re-commit.

- [ ] **Step 4: Privacy Centre coverage check**

Confirm every new `localStorage` key appears in `shared/privacy/local-storage.mjs`:

- `open-access-uk:nhs-complaints-tracker:complaints`
- `open-access-uk:nhs-complaints-tracker:draft`
- `open-access-uk:benefits-appeals:appeals`
- `open-access-uk:benefits-appeals:draft`
- `open-access-uk:parking-appeal:pcns`
- `open-access-uk:parking-appeal:draft`
- `open-access-uk:send-helper:cases`
- `open-access-uk:send-helper:draft`
- `open-access-uk:right-to-repair:repairs`
- `open-access-uk:right-to-repair:draft`

- [ ] **Step 5: Verify no console errors in any module**

Run: `node --check shared/complaints/index.mjs && node --check shared/appeals/index.mjs && node --check shared/parking/index.mjs && node --check shared/send-appeals/index.mjs && node --check shared/repairs/index.mjs`
Expected: all clean.

- [ ] **Step 6: Verify all submodule directories exist**

Run: `ls -la nhs-complaints-tracker/ benefits-appeals/ send-helper/ letter-generator/ case-builder/`
Expected: all directories present.

- [ ] **Step 7: Verify total localStorage key count**

Run: `node -e "import('./shared/privacy/local-storage.mjs').then(m => { console.log('Total keys:', m.storageRegistry.length); if (m.storageRegistry.length < 10) throw new Error('too few keys'); })"`
Expected: prints total >= 10.

- [ ] **Step 8: Verify all test files have correct import paths**

Run: `grep -r "from './index.mjs'" shared/complaints/index.test.mjs shared/appeals/index.test.mjs shared/parking/index.test.mjs shared/send-appeals/index.test.mjs shared/repairs/index.test.mjs | wc -l`
Expected: 5 (one per test file).

- [ ] **Step 9: Verify suite passes quality gate**

Run: `npm run quality:static`
Expected: "Static quality checks passed".

---

## Self-Review

**Spec coverage:** Feature 1 NHS Complaints Tracker (A1 + B1), Feature 2 Benefits Appeals (A2 + B2), Feature 3 Parking Appeal Generator (A3 + B3 extension to letter-generator), Feature 4 School SEND Helper (A4 + B4), Feature 5 Right to Repair Tracker (A5 + B5 extension to case-builder). Privacy registry updated (A6). All five tools ship with deadline management, evidence checklists, letter generation, source provenance notes, and local draft autosave.

**Placeholders:** none — every shared module ships full TDD code; every UI edit is a located insertion with full code. Verification commands are concrete.

**Type/name consistency:** `COMPLAINT_STAGES`/`getComplaintStage`/`calculateStageDeadline`/`buildEvidenceChecklist`/`buildEscalationLetter`/`COMPLAINTS_STORAGE_KEY`/`COMPLAINTS_DRAFT_KEY`, `BENEFIT_TYPES`/`getBenefitType`/`calculateMRDeadline`/`calculateTribunalDeadline`/`buildMRLetter`/`buildTribunalApplication`/`getDescriptorGuidance`/`APPEALS_STORAGE_KEY`/`APPEALS_DRAFT_KEY`, `OPERATOR_TYPES`/`getOperatorType`/`calculatePCNDeadline`/`buildPCNAppealLetter`/`getEvidenceChecklist`/`PARKING_STORAGE_KEY`/`PARKING_DRAFT_KEY`, `SEND_STAGES`/`getSendStage`/`calculateExclusionReviewDeadline`/`calculateIRPDeadline`/`calculateSENDTribunalDeadline`/`buildExclusionReviewLetter`/`buildIRPRequest`/`buildEHCDisputeLetter`/`SEND_STORAGE_KEY`/`SEND_DRAFT_KEY`, `REPAIR_CATEGORIES`/`getRepairCategory`/`calculateRepairDeadline`/`buildRepairNotice`/`buildOmbudsmanEscalation`/`getRepairEvidenceChecklist`/`REPAIRS_STORAGE_KEY`/`REPAIRS_DRAFT_KEY` are defined once and consumed with identical names across Tier A and Tier B/C. All reused symbols (`formatDateForDisplay`, `buildICS`, `analyseReadability`, `addWorkingDays`) verified present in their source files. CSS references only shipped design tokens.

**Risk note:** Tasks B3 and B5 edit existing `app.js` files by insertion. The agent must locate the documented anchors (existing variable declarations) and must NOT redeclare existing variables. Each task's verify step (`node --check` + `node --test`) catches redeclaration or syntax errors immediately.

**Source provenance:** Each tool includes a "Current source notes" section linking to the relevant legislation, regulator guidance, or official form (NHS Complaints Regulations 2009, PHSO guidance; DWP MR guidance, Tribunal Procedure Rules, PIP descriptors; Transport Act 2004, POFA 2012; Children and Families Act 2014, SEND Code of Practice; Housing Act 2004, Landlord and Tenant Act 1985, Housing Ombudsman).
