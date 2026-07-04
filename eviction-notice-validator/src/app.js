// eviction-notice-validator/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs eviction-notice-validator

// ===== ../../shared/eviction/index.mjs =====
/**
 * Eviction notice validation — England.
 * Section 21 abolished 1 May 2026 (Renters' Rights Act 2025).
 * Section 8 grounds revised with effect from 1 May 2026.
 */


// ---------------------------------------------------------------------------
// RRA commencement date — the law changed on this date
// ---------------------------------------------------------------------------
const RRA_COMMENCEMENT = '2026-05-01';
const SECTION_21_COURT_DEADLINE = '2026-07-31';

// ---------------------------------------------------------------------------
// Notice Types — Section 21 is flagged as abolished post-1 May 2026
// ---------------------------------------------------------------------------
const NOTICE_TYPES = [
  {
    id: 'section21',
    name: 'Section 21 (No-Fault)',
    noticeDays: 62,
    description: 'Abolished in England on 1 May 2026 by the Renters\' Rights Act 2025. Cannot be served on any tenancy after that date.',
    source: 'housing-act-1988-s21',
    abolished: true,
    abolishedDate: '2026-05-01'
  },
  { id: 'section8-ground8', name: 'Section 8 - Ground 8 (Mandatory)', noticeDays: 14, description: 'At least 2 months rent arrears at time of notice and at hearing (pre-RRA). RRA raised threshold to at least 3 months arrears.', source: 'housing-act-1988-s8' },
  { id: 'section8-ground10', name: 'Section 8 - Ground 10', noticeDays: 14, description: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'section8-ground11', name: 'Section 8 - Ground 11', noticeDays: 14, description: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'section8-ground12', name: 'Section 8 - Ground 12', noticeDays: 14, description: 'Breach of tenancy obligation', source: 'housing-act-1988-s8' },
  { id: 'section8-ground14', name: 'Section 8 - Ground 14', noticeDays: 14, description: 'Nuisance or anti-social behaviour — under pre-RRA law proceedings could commence immediately after notice; RRA retains immediacy.', source: 'housing-act-1988-s8' },
  // RRA-introduced grounds (post-1 May 2026)
  { id: 'rra-ground-landlord-sale', name: 'RRA Ground — Landlord Intends to Sell', noticeDays: 60, description: 'Landlord intends to sell the property (new RRA mandatory ground). Notice period: 2 months.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-landlord-move-in', name: 'RRA Ground — Landlord or Family Move In', noticeDays: 60, description: 'Landlord or close family member needs to move into the property (new RRA mandatory ground). Notice period: 2 months.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-serious-arrears', name: 'RRA Ground — Serious Rent Arrears (3+ months)', noticeDays: 14, description: 'At least 3 months rent arrears at time of notice and at hearing (RRA replaces pre-RRA Ground 8 threshold of 2 months).', source: 'renters-rights-act-2025' }
];

const GROUNDS_OF_SECTION8 = [
  { id: 'ground8', noticeDays: 14, type: 'mandatory', requirement: 'At least 2 months rent arrears at time of notice and at hearing (pre-RRA). Under RRA the threshold rises to at least 3 months.', source: 'housing-act-1988-s8' },
  { id: 'ground10', noticeDays: 14, type: 'discretionary', requirement: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'ground11', noticeDays: 14, type: 'discretionary', requirement: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'ground12', noticeDays: 14, type: 'discretionary', requirement: 'Breach of any obligation of the tenancy', source: 'housing-act-1988-s8' },
  { id: 'ground14', noticeDays: 0, type: 'discretionary', requirement: 'Nuisance or anti-social behaviour — proceedings may commence immediately after notice under pre-RRA and RRA law.', source: 'housing-act-1988-s8' },
  // RRA new grounds
  { id: 'rra-ground-landlord-sale', noticeDays: 60, type: 'mandatory', requirement: 'Landlord genuinely intends to sell the property. Cannot be used if landlord has owned property for less than 12 months (anti-avoidance).', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-landlord-move-in', noticeDays: 60, type: 'mandatory', requirement: 'Landlord or a close family member (parent, child, sibling, grandparent) genuinely needs to move into the property.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-serious-arrears', noticeDays: 14, type: 'mandatory', requirement: 'At least 3 months rent arrears at time of notice and at hearing.', source: 'renters-rights-act-2025' }
];

const DEPOSIT_PROTECTION_CHECKLIST = [
  { id: 'deposit-paid', description: 'Deposit was paid by the tenant', required: true },
  { id: 'protection-certificate', description: 'Deposit protected within 30 days in a government-approved scheme', required: true },
  { id: 'prescribed-information', description: 'Prescribed information served on tenant within 30 days of deposit being received', required: true },
  { id: 'scheme-name', description: 'Name and contact details of the tenancy deposit scheme used', required: true },
  { id: 'deposit-amount', description: 'Amount of deposit and how it is to be repaid', required: true },
  { id: 'landlord-contact', description: 'Landlord name and contact details', required: true }
];

// ---------------------------------------------------------------------------
// RRA Transition Period Check
// ---------------------------------------------------------------------------

/**
 * Checks whether a Section 21 notice is within the transition window.
 * Pre-1 May 2026: valid if served correctly.
 * 1 May – 31 July 2026: court proceedings may still be issued for
 *   a pre-abolition S21 notice (served before 1 May).
 * Post-31 July 2026: no S21 notice can be enforced.
 */
function checkSection21Transition(noticeServedDate) {
  const served = parseLocalDate(noticeServedDate);
  if (!served) return { status: 'unknown', message: 'Cannot check transition status without a notice served date.' };

  const commencement = parseLocalDate(RRA_COMMENCEMENT);
  const courtDeadline = parseLocalDate(SECTION_21_COURT_DEADLINE);

  if (served < commencement) {
    return {
      status: 'transition',
      message: `This Section 21 notice was served before the law changed on 1 May 2026. Court proceedings must be issued by 31 July 2026. After that date, no Section 21 notice can be enforced.`
    };
  }

  if (served >= commencement && served <= courtDeadline) {
    return {
      status: 'critical',
      message: `Section 21 was abolished on 1 May 2026. A notice served after abolition is invalid. If court proceedings were issued before 31 July 2026 on a pre-abolition notice, they may still proceed. Seek urgent advice from Shelter or a housing solicitor.`
    };
  }

  return {
    status: 'invalid',
    message: 'Section 21 no-fault evictions were abolished in England on 1 May 2026. Any Section 21 notice served on or after that date is invalid and unenforceable. Landlords using Section 21 after abolition may face a civil penalty of up to £7,000.'
  };
}

// ---------------------------------------------------------------------------
// daysBetween — replaced with UTC-safe parseLocalDate from shared/deadlines
// ---------------------------------------------------------------------------

function daysBetween(dateA, dateB) {
  const a = parseLocalDate(dateA);
  const b = parseLocalDate(dateB);
  if (!a || !b) return NaN;
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Notice type helpers
// ---------------------------------------------------------------------------

function getNoticeTypes() {
  return NOTICE_TYPES.map((t) => ({ ...t }));
}

function getGroundsOfSection8() {
  return GROUNDS_OF_SECTION8.map((g) => ({ ...g }));
}

function getDepositProtectionChecklist() {
  return DEPOSIT_PROTECTION_CHECKLIST.map((c) => ({ ...c }));
}

// ---------------------------------------------------------------------------
// Validation — Section 21 (hard-blocked for post-abolition dates)
// ---------------------------------------------------------------------------

function validateSection21(data) {
  const errors = [];

  // Check if Section 21 is valid at all
  if (!data || !data.noticeServedDate) {
    errors.push('Notice served date is required');
    return { valid: false, errors, transition: null };
  }

  const transition = checkSection21Transition(data.noticeServedDate);
  if (transition.status === 'invalid' || transition.status === 'critical') {
    errors.push(transition.message);
    return { valid: false, errors, transition };
  }

  if (data.possessionDate) {
    const days = daysBetween(data.noticeServedDate, data.possessionDate);
    if (!isNaN(days) && days < 59) {
      errors.push(`Notice period must be at least "2 months" (which is at least 59 days depending on the months). Only ${days} days given.`);
    } else if (!isNaN(days) && days < 62) {
      errors.push(`The notice period of ${days} days may be short of the required "at least 2 months" for the specific months involved. Check with Shelter or a solicitor.`);
    }
  }
  if (!data.prescribedForm) errors.push('Prescribed form (Form 6A) must be served with the notice');
  if (!data.depositProtected) errors.push('Deposit must be protected in a government-approved scheme');
  if (data.hmoLicense === false) errors.push('HMO licence required if property is a House in Multiple Occupation');
  if (!data.epcProvided) errors.push('Energy Performance Certificate (EPC) must be provided to the tenant');
  if (!data.gasSafetyCertificate) errors.push('Gas safety certificate must be provided to the tenant');

  return { valid: errors.length === 0, errors, transition };
}

// ---------------------------------------------------------------------------
// Validation — Section 8 / RRA Grounds
// ---------------------------------------------------------------------------

function validateSection8(data) {
  const errors = [];
  if (!data || !data.ground) {
    errors.push('Ground is required');
    return { valid: false, errors };
  }
  const ground = GROUNDS_OF_SECTION8.find((g) => g.id === data.ground);
  if (!ground) {
    errors.push(`Invalid ground "${data.ground}". Must be one of: ${GROUNDS_OF_SECTION8.map((g) => g.id).join(', ')}`);
    return { valid: false, errors };
  }
  if (!data.noticeServedDate) {
    errors.push('Notice served date is required');
  }
  if (!data.serviceMethod) {
    errors.push('Service method is required (personal or first/second class post)');
  }

  // RRA ground: serious arrears (3+ months)
  if (data.ground === 'rra-ground-serious-arrears') {
    if (!data.rentArrearsMonths || data.rentArrearsMonths < 3) {
      errors.push(`RRA Ground (Serious Rent Arrears) requires at least 3 months rent arrears at time of notice and at hearing. ${data.rentArrearsMonths || 0} month(s) provided.`);
    }
    return { valid: errors.length === 0, errors };
  }

  // RRA grounds: landlord sale or move-in
  if (data.ground === 'rra-ground-landlord-sale' || data.ground === 'rra-ground-landlord-move-in') {
    if (!data.landlordIntentionEvidence) {
      errors.push(`Evidence of the landlord's intention is required for this ground. Provide a description of the circumstances.`);
    }
    return { valid: errors.length === 0, errors };
  }

  // Pre-RRA grounds
  if (data.ground === 'ground8' || data.ground === 'ground10') {
    const threshold = data.ground === 'ground8' ? 2 : 0;
    if (!data.rentArrearsMonths || data.rentArrearsMonths < threshold) {
      errors.push(`${ground.id} requires at least ${threshold} month(s) of rent arrears at time of notice`);
    }
  }
  if (data.ground === 'ground12' && !data.breachDescription) {
    errors.push('Description of the breach of tenancy obligation is required');
  }
  if (data.ground === 'ground14' && !data.nuisanceDescription) {
    errors.push('Description of the nuisance or anti-social behaviour is required');
  }
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Maps and helpers
// ---------------------------------------------------------------------------

const NOTICE_TYPE_MAP = {
  section21: 'Section 21',
  'section8-ground8': 'Section 8 (Ground 8)',
  'section8-ground10': 'Section 8 (Ground 10)',
  'section8-ground11': 'Section 8 (Ground 11)',
  'section8-ground12': 'Section 8 (Ground 12)',
  'section8-ground14': 'Section 8 (Ground 14)',
  'rra-ground-landlord-sale': 'RRA Ground — Landlord Intends to Sell',
  'rra-ground-landlord-move-in': 'RRA Ground — Landlord or Family Move In',
  'rra-ground-serious-arrears': 'RRA Ground — Serious Rent Arrears (3+ months)'
};

function generateChallengeText(data) {
  const noticeName = NOTICE_TYPE_MAP[data.noticeType] || data.noticeType;
  const lines = [];
  lines.push(`RE: Challenge to ${noticeName} Notice`);
  lines.push('');
  lines.push(`Dear ${data.landlordName || '[Landlord Name]'},`);
  lines.push('');
  lines.push(`I am writing regarding the ${noticeName} notice served on ${data.tenantName || '[Tenant Name]'}.`);
  lines.push('');
  lines.push('I believe there are issues with this notice for the following reason(s):');
  lines.push('');
  for (const issue of (data.issues || [])) {
    lines.push(`- ${issue}`);
  }
  lines.push('');
  lines.push('I request that you address these issues and confirm in writing that no further action will be taken.');
  lines.push('');
  lines.push('This letter is for information purposes. I may seek independent legal advice about my options.');
  lines.push('');
  lines.push('Yours faithfully,');
  lines.push(data.tenantName || '[Tenant Name]');
  return lines.join('\n');
}

function getCourtTimeline(noticeType) {
  const notice = NOTICE_TYPES.find((t) => t.id === noticeType) || NOTICE_TYPES[0];
  const baseDays = notice && notice.noticeDays !== undefined ? notice.noticeDays : 14;
  return [
    { name: 'Notice Period', minDays: baseDays, description: `${notice ? notice.name : 'Unknown'} notice period` },
    { name: 'Possession Hearing', minDays: 28, description: 'Court possession hearing (typically 28+ days after notice expires)' },
    { name: 'Bailiff Warrant', minDays: 28, description: 'Bailiff enforcement if tenant does not leave (28+ days after court order)' }
  ];
}

function serializeEviction(value) {
  return JSON.stringify(value);
}

function parseEviction(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}


// ===== src/tracker.js (imports resolved) =====

const DEPOSIT_SCHEMES = [
  { value: 'dps', label: 'Deposit Protection Service (DPS)' },
  { value: 'mydeposits', label: 'mydeposits' },
  { value: 'tenancy-deposit-scheme', label: 'Tenancy Deposit Scheme (TDS)' }
];

function escapeHtml(str) {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export {
  DEPOSIT_SCHEMES,
  escapeHtml,
  getNoticeTypes,
  getGroundsOfSection8,
  getDepositProtectionChecklist,
  validateSection21,
  validateSection8,
  generateChallengeText,
  getCourtTimeline,
  serializeEviction,
  parseEviction
};


// ===== Theme init =====
function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let stored;
  try { stored = window.localStorage.getItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
  let theme = resolveInitialTheme({ stored, prefersDark });
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }

  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* ignore */ }
  });
}

// ===== App logic =====
const STORAGE_KEY = 'open-access-uk:eviction-notice-validator:validations';
const FORM_KEY = 'open-access-uk:eviction-notice-validator:form-draft';

const form = document.querySelector('#validation-form');
const list = document.querySelector('#result-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
const section21Options = document.querySelector('#section21-options');
const section8Options = document.querySelector('#section8-options');
let activeId = null;

function loadAll() {
  return parseEviction(localStorage.getItem(STORAGE_KEY));
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, serializeEviction(records));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(records) {
  const total = records.length;
  const valid = records.filter((r) => r.result?.valid).length;
  const invalid = records.filter((r) => r.result && !r.result.valid).length;
  const issues = records.filter((r) => r.result?.errors?.length > 0).length;

  const cards = [
    { label: 'Total validated', value: total, tone: 'default' },
    { label: 'All checks passed', value: valid, tone: 'success' },
    { label: 'Issues found', value: invalid, tone: 'danger' },
    { label: 'Issues found', value: issues, tone: 'warning' }
  ];

  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = `summary-card ${c.tone === 'success' ? 'success' : c.tone === 'danger' ? 'danger' : c.tone === 'warning' ? 'warning' : ''}`;
      const label = document.createElement('p');
      label.className = 'summary-label';
      label.textContent = c.label;
      const value = document.createElement('p');
      value.className = 'summary-value';
      value.textContent = String(c.value);
      card.append(label, value);
      return card;
    })
  );

  const timelinePanel = document.querySelector('#court-timeline');
  if (timelinePanel) {
    const noticeType = form?.elements.namedItem('noticeType')?.value || 'section21';
    const timeline = getCourtTimeline(noticeType);
    timelinePanel.replaceChildren(
      ...timeline.map((stage) => {
        const row = document.createElement('div');
        row.className = 'stage';
        const name = document.createElement('span');
        name.className = 'stage-name';
        name.textContent = stage.name;
        const days = document.createElement('span');
        days.className = 'stage-days';
        days.textContent = `${stage.minDays}+ days`;
        row.append(name, days);
        return row;
      })
    );
  }
}

function renderList(records) {
  list.replaceChildren();
  if (records.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No validated notices yet. Use the form to validate an eviction notice.';
    list.append(empty);
    return;
  }
  const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  for (const record of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    if (activeId === record.id) item.classList.add('active');
    const noticeName = NOTICE_TYPE_MAP[record.noticeType] || record.noticeType;
    const isValid = record.result?.valid;
    const statusClass = isValid ? 'valid' : record.result?.errors?.length > 0 ? 'invalid' : '';

    item.innerHTML = `
      <header>
        <h3>${escapeHtml(record.tenantName || 'Untitled')}</h3>
        <span class="status-pill ${statusClass}">${isValid ? 'All checks passed' : record.result?.errors?.length > 0 ? 'Issues found' : 'Pending'}</span>
      </header>
      <p class="meta">${escapeHtml(noticeName)} — ${escapeHtml(record.landlordName || 'No landlord')} — ${record.noticeServedDate || 'No date'}</p>
      <div class="item-actions">
        <button type="button" data-action="view" data-id="${record.id}">View</button>
        <button type="button" data-action="delete" data-id="${record.id}" class="secondary">Delete</button>
      </div>`;
    list.append(item);
  }

  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectRecord(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
  });
}

function selectRecord(id) {
  activeId = id;
  const records = loadAll();
  const record = records.find((r) => r.id === id);
  if (!record) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(record);
  renderList(records);
}

function renderDetail(record) {
  detailContent.replaceChildren();
  const noticeName = NOTICE_TYPE_MAP[record.noticeType] || record.noticeType;
  const timeline = getCourtTimeline(record.noticeType);
  const isValid = record.result?.valid;

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = record.tenantName || 'Untitled notice';
  const status = document.createElement('span');
  status.className = `status-pill ${isValid ? 'valid' : 'invalid'}`;
  status.textContent = isValid ? 'All checks passed' : 'Issues found';
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Notice type', noticeName],
    ['Tenant', record.tenantName || 'Not specified'],
    ['Landlord', record.landlordName || 'Not specified'],
    ['Property', record.propertyAddress || 'Not specified'],
    ['Notice served', record.noticeServedDate || 'Not recorded'],
    ['Tenancy started', record.tenancyStartDate || 'Not recorded'],
    ['Deposit amount', record.depositAmount ? `£${record.depositAmount}` : 'Not specified'],
    ['Deposit scheme', DEPOSIT_SCHEMES.find((s) => s.value === record.depositScheme)?.label || 'Not specified'],
    ['Created', new Date(record.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const issuesSection = document.createElement('section');
  const issuesHeading = document.createElement('h3');
  issuesHeading.textContent = isValid ? 'Checklist complete' : 'Issues found';
  issuesSection.append(issuesHeading);
  const issueList = document.createElement('ul');
  issueList.className = `issue-list${isValid ? ' valid' : ''}`;
  const issues = record.result?.errors || (isValid ? ['Notice meets all legal requirements'] : ['No validation data available']);
  for (const issue of issues) {
    const li = document.createElement('li');
    li.textContent = issue;
    issueList.append(li);
  }
  issuesSection.append(issueList);

  const timelineSection = document.createElement('section');
  const timelineHeading = document.createElement('h3');
  timelineHeading.textContent = 'Court timeline';
  timelineSection.append(timelineHeading);
  const timelineInfo = document.createElement('div');
  timelineInfo.className = 'timeline-info';
  for (const stage of timeline) {
    const row = document.createElement('div');
    row.className = 'stage';
    const name = document.createElement('span');
    name.className = 'stage-name';
    name.textContent = stage.name;
    const days = document.createElement('span');
    days.className = 'stage-days';
    days.textContent = `${stage.minDays}+ days`;
    row.append(name, days);
    timelineInfo.append(row);
  }
  timelineSection.append(timelineInfo);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyChallenge = document.createElement('button');
  copyChallenge.type = 'button';
  copyChallenge.textContent = 'Copy challenge letter';
  copyChallenge.addEventListener('click', () => {
    const text = generateChallengeText({
      noticeType: record.noticeType,
      tenantName: record.tenantName,
      landlordName: record.landlordName,
      issues: record.result?.errors || []
    });
    copyText(text, 'Challenge letter copied locally.');
  });

  const downloadChallenge = document.createElement('button');
  downloadChallenge.type = 'button';
  downloadChallenge.className = 'secondary';
  downloadChallenge.textContent = 'Download challenge letter';
  downloadChallenge.addEventListener('click', () => {
    const text = generateChallengeText({
      noticeType: record.noticeType,
      tenantName: record.tenantName,
      landlordName: record.landlordName,
      issues: record.result?.errors || []
    });
    downloadText(text, 'eviction-challenge-letter.txt', 'text/plain');
  });

  const printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.className = 'secondary';
  printBtn.textContent = 'Print';
  printBtn.addEventListener('click', () => window.print());

  actions.append(copyChallenge, downloadChallenge, printBtn);
  detailContent.append(header, grid, issuesSection, timelineSection, actions);
}

function updateNoticeType() {
  const noticeType = form?.elements.namedItem('noticeType')?.value;
  const isS21 = noticeType === 'section21';
  if (section21Options) section21Options.hidden = !isS21;
  if (section8Options) section8Options.hidden = isS21;
}

function deleteRecord(id) {
  const records = loadAll();
  const remaining = records.filter((r) => r.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Record deleted locally.';
  renderAll();
}

function renderAll() {
  const records = loadAll();
  renderSummary(records);
  renderList(records);
  if (activeId) {
    const record = records.find((r) => r.id === activeId);
    if (record) renderDetail(record);
  }
}

function saveFormDraft() {
  if (!form) return;
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch {
    /* ignore */
  }
}

function restoreFormDraft() {
  if (!form) return;
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const [name, value] of Object.entries(data)) {
      const field = form.elements.namedItem(name);
      if (field && value) field.value = value;
    }
    updateNoticeType();
  } catch {
    /* ignore */
  }
}

function clearFormDraft() {
  localStorage.removeItem(FORM_KEY);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    statusEl.textContent = message;
  } catch {
    statusEl.textContent = 'Copy failed. You can still select and copy the text manually.';
  }
}

function downloadText(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = `Downloaded ${filename}. Nothing was sent to a server.`;
}

function generateValidationId() {
  return 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function handleValidate(event) {
  event.preventDefault();
  const data = values();
  if (!data.tenantName?.trim()) {
    statusEl.textContent = 'Add a tenant name before validating.';
    return;
  }
  if (!data.landlordName?.trim()) {
    statusEl.textContent = 'Add a landlord name before validating.';
    return;
  }

  const noticeType = data.noticeType;
  let result;

  if (noticeType === 'section21') {
    result = validateSection21({
      noticeServedDate: data.noticeServedDate,
      prescribedForm: data.prescribedForm === 'true',
      depositProtected: data.depositProtected === 'true',
      hmoLicense: data.hmoLicense === 'true' ? true : undefined,
      epcProvided: data.epcProvided === 'true',
      gasSafetyCertificate: data.gasSafetyCertificate === 'true'
    });
  } else {
    const groundId = noticeType.replace('section8-', '');
    result = validateSection8({
      ground: groundId,
      noticeServedDate: data.noticeServedDate,
      serviceMethod: data.serviceMethod,
      rentArrearsMonths: data.rentArrearsMonths ? Number(data.rentArrearsMonths) : 0,
      breachDescription: data.breachDescription,
      nuisanceDescription: data.nuisanceDescription
    });
  }

  const record = {
    id: generateValidationId(),
    createdAt: new Date().toISOString(),
    noticeType,
    tenantName: data.tenantName,
    landlordName: data.landlordName,
    propertyAddress: data.propertyAddress,
    noticeDate: data.noticeDate,
    noticeServedDate: data.noticeServedDate,
    tenancyStartDate: data.tenancyStartDate,
    depositAmount: data.depositAmount,
    depositScheme: data.depositScheme,
    groundsDetails: data.groundsDetails,
    result
  };

  const records = loadAll();
  records.push(record);
  saveAll(records);
  form.reset();
  clearFormDraft();
  activeId = record.id;
  updateNoticeType();
  const issueCount = result.errors?.length || 0;
  statusEl.textContent = result.valid
    ? `All checks passed. ${issueCount === 0 ? 'No issues found.' : ''}`
    : `${issueCount} item(s) need attention. Review the details below.`;
  renderAll();
}

function handleClearAll() {
  const records = loadAll();
  if (records.length === 0) {
    statusEl.textContent = 'No records to clear.';
    return;
  }
  if (!confirm(`Delete all ${records.length} validated notice(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All records cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleValidate);
form.addEventListener('input', saveFormDraft);
form.addEventListener('change', () => {
  updateNoticeType();
  saveFormDraft();
});

const clearAllBtn = document.querySelector('#clearAll');
const loadSampleBtn = document.querySelector('#loadSample');

clearAllBtn?.addEventListener('click', handleClearAll);
loadSampleBtn?.addEventListener('click', () => {
  const sample = [
    {
      id: generateValidationId(),
      createdAt: new Date().toISOString(),
      noticeType: 'section21',
      tenantName: 'Jane Smith',
      landlordName: 'Acme Properties Ltd',
      propertyAddress: '42 Oak Street, Manchester, M1 1AA',
      noticeDate: '2026-05-01',
      noticeServedDate: '2026-05-01',
      tenancyStartDate: '2023-06-15',
      depositAmount: '1200.00',
      depositScheme: 'dps',
      groundsDetails: 'No-fault eviction notice under Section 21.',
      result: validateSection21({
        noticeServedDate: '2026-05-01',
        prescribedForm: true,
        depositProtected: true,
        hmoLicense: true,
        epcProvided: true,
        gasSafetyCertificate: true
      })
    },
    {
      id: generateValidationId(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      noticeType: 'section8-ground8',
      tenantName: 'John Doe',
      landlordName: 'Riverside Lettings',
      propertyAddress: '15 River Lane, Birmingham, B1 2BB',
      noticeDate: '2026-04-15',
      noticeServedDate: '2026-04-15',
      tenancyStartDate: '2024-01-01',
      depositAmount: '900.00',
      depositScheme: 'mydeposits',
      groundsDetails: 'Rent arrears of 3 months.',
      result: validateSection8({
        ground: 'ground8',
        noticeServedDate: '2026-04-15',
        rentArrearsMonths: 3,
        serviceMethod: 'first-class'
      })
    }
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.tenantName === s.tenantName && e.noticeType === s.noticeType)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample validations.';
  renderAll();
});

updateNoticeType();
renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
