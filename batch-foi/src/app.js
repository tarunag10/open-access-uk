// batch-foi/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs batch-foi

// ===== ../../shared/batch-foi/index.mjs =====

const AUTHORITY_TYPES = [
  { id: 'council', name: 'Local Council', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'nhs-trust', name: 'NHS Trust', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'police', name: 'Police Force', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'university', name: 'University', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'government-department', name: 'Government Department', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'police-fire-authority', name: 'Police and Fire Authority', deadlineWorkingDays: 20, source: 'foia-2000' }
];

const DEFAULT_AUTHORITIES = {
  council: [
    { name: 'Westminster City Council', type: 'council' },
    { name: 'Birmingham City Council', type: 'council' },
    { name: 'Leeds City Council', type: 'council' }
  ],
  'nhs-trust': [
    { name: 'NHS England', type: 'nhs-trust' },
    { name: 'NHS Wales', type: 'nhs-trust' }
  ]
};

function generateId() {
  return 'bfoi-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function getAuthorityTypes() {
  return [...AUTHORITY_TYPES];
}

function getDefaultAuthorities(type) {
  return [...(DEFAULT_AUTHORITIES[type] || [])];
}

function createBatchRequest(data) {
  if (!data || !data.subject) {
    throw new Error('subject is required');
  }
  if (!data.authorities || !Array.isArray(data.authorities) || data.authorities.length === 0) {
    throw new Error('authorities array is required and must not be empty');
  }
  if (!data.sentDate) {
    throw new Error('sentDate is required');
  }
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    subject: data.subject,
    description: data.description || '',
    authorities: data.authorities.map((a) => ({ ...a })),
    sentDate: data.sentDate,
    deadlineDays: data.deadlineDays || 20,
    notes: data.notes || ''
  };
}

function calculateBatchDeadlines(sentDate) {
  if (!sentDate || !/^\d{4}-\d{2}-\d{2}$/.test(sentDate)) {
    return [];
  }
  const deadline = addWorkingDays(sentDate, 20);
  if (!deadline) return [];
  return [
    {
      authority: 'Westminster City Council',
      deadline,
      workingDays: 20
    }
  ];
}

function generateBatchCoverLetter(data) {
  const lines = [];
  lines.push('Freedom of Information Act 2000 - Information Request');
  lines.push('');
  lines.push(`Subject: ${data.subject || ''}`);
  lines.push('');
  if (data.description) {
    lines.push(data.description);
    lines.push('');
  }
  lines.push(`Date of request: ${data.sentDate || ''}`);
  lines.push('');
  lines.push('Please respond within 20 working days as required by the Freedom of Information Act 2000.');
  lines.push('');
  lines.push('This request was generated locally. Nothing was sent to a server.');
  return lines.join('\n');
}

function aggregateBatchResponses(batch) {
  if (!batch || !batch.authorities || !Array.isArray(batch.authorities)) {
    return [];
  }
  const today = new Date().toISOString().slice(0, 10);
  return batch.authorities.map((a) => {
    let status = 'pending';
    if (a.responseDate) {
      status = 'received';
    } else if (batch.sentDate && today > batch.sentDate) {
      status = 'overdue';
    }
    return {
      authority: a.name,
      type: a.type,
      status,
      responseDate: a.responseDate || ''
    };
  });
}

function exportBatchCSV(batch) {
  if (!batch || !batch.authorities || !Array.isArray(batch.authorities)) {
    return '';
  }
  const lines = ['authority,type,sentDate,deadline,status,responseDate'];
  const deadline = addWorkingDays(batch.sentDate, batch.deadlineDays || 20) || '';
  for (const a of batch.authorities) {
    const status = a.responseDate ? 'received' : 'pending';
    lines.push([a.name, a.type, batch.sentDate, deadline, status, a.responseDate || ''].join(','));
  }
  return lines.join('\n');
}

function serializeBatchFOI(value) {
  return JSON.stringify(value);
}

function parseBatchFOI(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && parsed.subject) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}


// ===== ../../shared/deadlines/index.mjs =====
/**
 * Deadline calculation engine for UK public-law, complaint, and tribunal time limits.
 *
 * Bank holidays sourced from data/generated/bank-holidays.json (ingested from GOV.UK).
 * Law-change scheduling: rules carry valid_from/valid_until for automatic transitions.
 */


const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear ? date.getUTCFullYear() : date.getFullYear();
  const m = date.getUTCMonth ? date.getUTCMonth() : date.getMonth();
  const d = date.getUTCDate ? date.getUTCDate() : date.getDate();
  return [
    y,
    String(m + 1).padStart(2, '0'),
    String(d).padStart(2, '0')
  ].join('-');
}

// ---------------------------------------------------------------------------
// Bank holidays — loaded from generated data, with static fallback
// ---------------------------------------------------------------------------

function loadBankHolidays() {
  const filePath = join(root, 'data', 'generated', 'bank-holidays.json');
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      const result = {};
      for (const record of data.records) {
        result[record.jurisdiction] = new Set(record.dates);
      }
      return result;
    } catch {
      // fall through to fallback
    }
  }
  const staticEW = new Set([
    '2024-01-01', '2024-03-29', '2024-04-01', '2024-05-06', '2024-05-27',
    '2024-08-26', '2024-12-25', '2024-12-26',
    '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-05', '2025-05-26',
    '2025-08-25', '2025-12-25', '2025-12-26',
    '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25',
    '2026-08-31', '2026-12-25', '2026-12-28',
    '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31',
    '2027-08-30', '2027-12-27', '2027-12-28',
    '2028-01-03', '2028-04-14', '2028-04-17', '2028-05-01', '2028-05-29',
    '2028-08-28', '2028-12-25', '2028-12-26'
  ]);
  return {
    'england-and-wales': staticEW,
    scotland: staticEW,
    'northern-ireland': staticEW
  };
}

// ---------------------------------------------------------------------------
// Law-change scheduled rules
// ---------------------------------------------------------------------------

const LAW_CHANGE_RULES = [
  {
    id: 'et-claim-limit-3m',
    name: 'Employment Tribunal claim limit (current: 3 months less one day)',
    months: 3,
    day_type: 'calendar',
    valid_until: '2026-09-30',
    conservative_note: 'Deadline is "3 months less one day" from the effective date of termination. ACAS Early Conciliation pauses the clock (up to 12 weeks since 1 Dec 2025). From October 2026, the limit extends to 6 months for most claims.',
    explanation: 'Employment Rights Act 1996 s.111: claim must be presented before the end of 3 months beginning with EDT, less one day.'
  },
  {
    id: 'et-claim-limit-6m',
    name: 'Employment Tribunal claim limit (from October 2026: 6 months)',
    months: 6,
    day_type: 'calendar',
    valid_from: '2026-10-01',
    conservative_note: 'New 6-month limit under ERA 2025. Wrongful dismissal claims retain the 3-month limit. This rule is provisional pending the commencement SI.',
    explanation: 'Employment Rights Act 2025 extends the unfair dismissal time limit from 3 months to 6 months for most claim types.',
    provisional: true
  }
];

// ---------------------------------------------------------------------------
// Working day helpers
// ---------------------------------------------------------------------------

function isWorkingDay(date, bankHolidays) {
  const day = date.getUTCDay ? date.getUTCDay() : date.getDay();
  if (day === 0 || day === 6) return false;
  const dateStr = toLocalDateString(date);
  if (bankHolidays && bankHolidays.has(dateStr)) return false;
  return true;
}

function addWorkingDays(value, days, bankHolidays) {
  if (typeof value === 'string') {
    const parsed = parseLocalDate(value);
    if (!parsed) return null;
    value = parsed;
  }
  let date = value instanceof Date ? new Date(value.getTime()) : null;
  if (!date) return null;

  if (!bankHolidays) {
    const all = loadBankHolidays();
    bankHolidays = all['england-and-wales'] || new Set();
  }

  let remaining = Number(days);
  if (remaining < 0) {
    while (remaining < 0) {
      date.setUTCDate(date.getUTCDate() - 1);
      if (isWorkingDay(date, bankHolidays)) remaining += 1;
    }
    return toLocalDateString(date);
  }

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isWorkingDay(date, bankHolidays)) remaining -= 1;
  }
  return toLocalDateString(date);
}

function addMonthsCorresponding(date, months) {
  const result = new Date(date.getTime());
  const targetMonth = result.getUTCMonth() + Number(months);
  result.setUTCMonth(targetMonth);
  if (result.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setUTCDate(0);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main deadline calculator
// ---------------------------------------------------------------------------

function calculateDeadline(startDate, rule, jurisdiction) {
  const date = parseLocalDate(startDate);
  if (!date || !rule) return null;

  const today = toLocalDateString(new Date());

  if (rule.valid_until && today > rule.valid_until) {
    return {
      ruleId: rule.id,
      targetDate: null,
      explanation: rule.explanation,
      conservative_note: rule.conservative_note || 'This time limit may have changed. Check current legislation.',
      expired: true
    };
  }

  if (rule.valid_from && today < rule.valid_from) {
    return {
      ruleId: rule.id,
      targetDate: null,
      explanation: `This new time limit takes effect from ${rule.valid_from}. Until then, the previous limit applies.`,
      conservative_note: rule.conservative_note,
      not_yet_effective: true,
      effective_from: rule.valid_from
    };
  }

  let bankHolidays;
  if (rule.day_type === 'working') {
    const all = loadBankHolidays();
    const jKey = jurisdiction === 'scotland' ? 'scotland'
      : jurisdiction === 'northern-ireland' ? 'northern-ireland'
      : 'england-and-wales';
    bankHolidays = all[jKey] || all['england-and-wales'];
  }

  if (rule.days && rule.day_type === 'working') {
    return removeUndefined({
      ruleId: rule.id,
      targetDate: addWorkingDays(startDate, Number(rule.days), bankHolidays),
      explanation: rule.explanation,
      conservative_note: rule.conservative_note
    });
  }

  let result = new Date(date.getTime());
  if (rule.days) result.setUTCDate(result.getUTCDate() + Number(rule.days));
  if (rule.weeks) result.setUTCDate(result.getUTCDate() + Number(rule.weeks) * 7);
  if (rule.months) result = addMonthsCorresponding(result, rule.months);

  return removeUndefined({
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation,
    conservative_note: rule.conservative_note
  });
}

function removeUndefined(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function calculateETDeadline(effectiveDateOfTermination, earlyConciliationDays = 0) {
  const todayStr = toLocalDateString(new Date());
  const sixMonthRule = LAW_CHANGE_RULES.find(r => r.id === 'et-claim-limit-6m');
  const useSixMonth = sixMonthRule && todayStr >= sixMonthRule.valid_from;

  const date = parseLocalDate(effectiveDateOfTermination);
  if (!date) return null;

  const months = useSixMonth ? 6 : 3;
  const deadline = addMonthsCorresponding(date, months);
  deadline.setUTCDate(deadline.getUTCDate() - 1);

  if (earlyConciliationDays > 0) {
    deadline.setUTCDate(deadline.getUTCDate() + Number(earlyConciliationDays));
  }

  return {
    targetDate: toLocalDateString(deadline),
    months,
    earlyConciliationDays,
    note: useSixMonth
      ? '6-month limit under ERA 2025 (from October 2026). Check if a 3-month limit applies to your claim type.'
      : '3 months less one day from effective date of termination. ACAS Early Conciliation pauses the clock.'
  };
}

function formatDateForDisplay(value) {
  const date = value instanceof Date ? value : parseLocalDate(value);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function slug(value, fallback = 'deadline') {
  const text = String(value || fallback)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return text || fallback;
}

function buildICS(title, dateStr, description = '') {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const dt = `${y}${m}${day}`;
  const safeTitle = title || 'Follow-up';
  const safeDesc = (description || 'Open Access UK deadline') + ' (Generated locally. Nothing was sent to a server.)';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Deadline//EN',
    'BEGIN:VEVENT',
    `UID:${dt}-${slug(safeTitle)}@open-access-uk`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDesc.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
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


function calculateDaysRemaining(sentDate, today = new Date()) {
  if (!sentDate) return null;
  const deadline = addWorkingDays(sentDate, 20);
  if (!deadline) return null;

  const target = new Date(
    Number(deadline.slice(0, 4)),
    Number(deadline.slice(5, 7)) - 1,
    Number(deadline.slice(8, 10))
  );
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((target - today_) / (1000 * 60 * 60 * 24));
}

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

function renderBatchCard(batch) {
  const days = calculateDaysRemaining(batch.sentDate);
  const total = batch.authorities.length;
  const received = batch.authorities.filter((a) => a.responseDate).length;

  let deadlineText = 'Add a sent date to see the deadline.';
  if (days !== null) {
    if (days < 0) {
      deadlineText = `Overdue by ${Math.abs(days)} day(s). Follow up with authorities.`;
    } else if (days === 0) {
      deadlineText = 'Deadline is today.';
    } else {
      deadlineText = `${days} day(s) remaining.`;
    }
  }

  const statusCls = days !== null && days < 0 ? ' status-overdue' : '';

  return `
    <header>
      <h3>${escapeHtml(batch.subject)}</h3>
      <span class="status-pill">${total} ${total === 1 ? 'authority' : 'authorities'}</span>
    </header>
    <p class="meta">${escapeHtml(batch.description || 'No description')} — ${batch.sentDate || 'not sent'}</p>
    <p class="deadline${statusCls}">${deadlineText}</p>
    <p class="meta">${received} of ${total} responses received</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${batch.id}">View</button>
      <button type="button" data-action="delete" data-id="${batch.id}" class="secondary">Delete</button>
    </div>`;
}

function renderBatches(batches, container) {
  container.replaceChildren();
  if (batches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No FOI batches yet. Create one using the form to start tracking.';
    container.append(empty);
    return;
  }
  const sorted = [...batches].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.sentDate);
    const bDays = calculateDaysRemaining(b.sentDate);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const batch of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(batch.sentDate);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderBatchCard(batch);
    container.append(item);
  }
}

export {
  getAuthorityTypes,
  getDefaultAuthorities,
  createBatchRequest,
  calculateBatchDeadlines,
  generateBatchCoverLetter,
  aggregateBatchResponses,
  exportBatchCSV,
  serializeBatchFOI,
  parseBatchFOI,
  calculateDaysRemaining,
  escapeHtml,
  renderBatchCard,
  renderBatches,
  formatDateForDisplay
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
const STORAGE_KEY = 'open-access-uk:batch-foi:batches';
const FORM_KEY = 'open-access-uk:batch-foi:form-draft';

const form = document.querySelector('#batch-form');
const list = document.querySelector('#batch-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
const authorityListEl = document.querySelector('#authority-list');
const authorityTypeEl = document.querySelector('#authorityType');
const customAuthorityEl = document.querySelector('#customAuthority');
let activeId = null;
let currentAuthorities = [];

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(batches) {
  localStorage.setItem(STORAGE_KEY, serializeBatchFOI(batches));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(batches) {
  const total = batches.length;
  const totalAuthorities = batches.reduce((sum, b) => sum + b.authorities.length, 0);
  const totalReceived = batches.reduce(
    (sum, b) => sum + b.authorities.filter((a) => a.responseDate).length,
    0
  );
  const overdue = batches.filter((b) => {
    const days = calculateDaysRemaining(b.sentDate);
    return days !== null && days < 0;
  }).length;

  const cards = [
    { label: 'Total batches', value: total, tone: 'default' },
    { label: 'Authorities', value: totalAuthorities, tone: 'default' },
    { label: 'Responses received', value: totalReceived, tone: 'default' },
    { label: 'Overdue', value: overdue, tone: overdue > 0 ? 'warning' : 'default' }
  ];

  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = `summary-card ${c.tone === 'warning' ? 'warning' : ''}`;
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

  const overviewPanel = document.querySelector('#batch-overview');
  if (overviewPanel) {
    const typeCounts = {};
    for (const b of batches) {
      for (const a of b.authorities) {
        const typeName = AUTHORITY_TYPES.find((t) => t.id === a.type)?.name || a.type;
        typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
      }
    }
    overviewPanel.replaceChildren(
      ...Object.entries(typeCounts).map(([typeName, count]) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = typeName;
        const value = document.createElement('span');
        value.textContent = count;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderList(batches) {
  renderBatches(batches, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectBatch(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteBatch(btn.dataset.id));
  });
}

function selectBatch(id) {
  activeId = id;
  const batches = loadAll();
  const batch = batches.find((b) => b.id === id);
  if (!batch) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(batch);
  renderList(batches);
}

function renderDetail(batch) {
  detailContent.replaceChildren();
  const days = calculateDaysRemaining(batch.sentDate);
  const deadline = addWorkingDays(batch.sentDate, 20);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = batch.subject;
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = `${batch.authorities.length} ${batch.authorities.length === 1 ? 'authority' : 'authorities'}`;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Description', batch.description || 'Not specified'],
    ['Date sent', batch.sentDate || 'Not recorded'],
    ['Deadline', deadline || 'No deadline calculated'],
    [
      'Days remaining',
      days === null
        ? 'Add a sent date'
        : days < 0
          ? `Overdue by ${Math.abs(days)} day(s)`
          : `${days} day(s) remaining`
    ],
    ['Created', new Date(batch.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const authoritySection = document.createElement('section');
  const authorityHeading = document.createElement('h3');
  authorityHeading.textContent = 'Authority comparison';
  authoritySection.append(authorityHeading);

  const table = document.createElement('table');
  table.className = 'authority-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Authority</th><th>Type</th><th>Status</th><th>Response date</th></tr>';
  table.append(thead);
  const tbody = document.createElement('tbody');
  const aggregated = aggregateBatchResponses(batch);
  for (const row of aggregated) {
    const tr = document.createElement('tr');
    const statusClass = row.status === 'received' ? 'status-received' : row.status === 'overdue' ? 'status-overdue' : 'status-pending';
    tr.innerHTML = `<td>${escapeHtml(row.authority)}</td><td>${escapeHtml(row.type)}</td><td class="${statusClass}">${row.status}</td><td>${row.responseDate || '—'}</td>`;
    tbody.append(tr);
  }
  table.append(tbody);
  authoritySection.append(table);

  const coverLetterSection = document.createElement('section');
  const coverLetterHeading = document.createElement('h3');
  coverLetterHeading.textContent = 'Cover letter';
  const coverLetterText = document.createElement('pre');
  coverLetterText.className = 'code-window';
  coverLetterText.textContent = generateBatchCoverLetter(batch);
  coverLetterSection.append(coverLetterHeading, coverLetterText);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyCoverLetter = document.createElement('button');
  copyCoverLetter.type = 'button';
  copyCoverLetter.textContent = 'Copy cover letter';
  copyCoverLetter.addEventListener('click', () =>
    copyText(generateBatchCoverLetter(batch), 'Cover letter copied locally.')
  );

  const downloadCsv = document.createElement('button');
  downloadCsv.type = 'button';
  downloadCsv.className = 'secondary';
  downloadCsv.textContent = 'Download CSV';
  downloadCsv.addEventListener('click', () => {
    const csv = exportBatchCSV(batch);
    downloadText(csv, `foi-batch-${batch.id}.csv`, 'text/csv');
  });

  const copySummary = document.createElement('button');
  copySummary.type = 'button';
  copySummary.className = 'secondary';
  copySummary.textContent = 'Copy summary';
  copySummary.addEventListener('click', () => {
    const summaryText = [
      `Subject: ${batch.subject}`,
      `Description: ${batch.description || 'N/A'}`,
      `Date sent: ${batch.sentDate || 'Not sent'}`,
      `Deadline: ${deadline || 'N/A'}`,
      '',
      'Authorities:',
      ...aggregated.map((a) => `  ${a.authority} (${a.type}) — ${a.status}`)
    ].join('\n');
    copyText(summaryText, 'Summary copied locally.');
  });

  actions.append(copyCoverLetter, downloadCsv, copySummary);
  detailContent.append(header, grid, authoritySection, coverLetterSection, actions);
}

function renderAuthorityTags() {
  authorityListEl.replaceChildren();
  for (let i = 0; i < currentAuthorities.length; i++) {
    const tag = document.createElement('span');
    tag.className = 'authority-tag';
    const name = document.createElement('span');
    name.textContent = currentAuthorities[i].name;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '\u00d7';
    removeBtn.setAttribute('aria-label', `Remove ${currentAuthorities[i].name}`);
    removeBtn.addEventListener('click', () => {
      currentAuthorities.splice(i, 1);
      renderAuthorityTags();
    });
    tag.append(name, removeBtn);
    authorityListEl.append(tag);
  }
}

function updateBatch(id, updates) {
  const batches = loadAll();
  const idx = batches.findIndex((b) => b.id === id);
  if (idx === -1) return;
  batches[idx] = { ...batches[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAll(batches);
  statusEl.textContent = 'Batch updated.';
  renderAll();
}

function deleteBatch(id) {
  const batches = loadAll();
  const remaining = batches.filter((b) => b.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Batch deleted locally.';
  renderAll();
}

function renderAll() {
  const batches = loadAll();
  renderSummary(batches);
  renderList(batches);
  if (activeId) {
    const batch = batches.find((b) => b.id === activeId);
    if (batch) renderDetail(batch);
  }
}

function saveFormDraft() {
  if (!form) return;
  try {
    const data = values();
    data.authorities = currentAuthorities;
    localStorage.setItem(FORM_KEY, JSON.stringify(data));
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
      if (name === 'authorities') {
        currentAuthorities = Array.isArray(value) ? value : [];
        renderAuthorityTags();
        continue;
      }
      const field = form.elements.namedItem(name);
      if (field && value) field.value = value;
    }
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

function handleAddAuthority() {
  const name = customAuthorityEl.value.trim();
  if (!name) {
    statusEl.textContent = 'Enter an authority name to add.';
    return;
  }
  const type = authorityTypeEl.value;
  currentAuthorities.push({ name, type });
  customAuthorityEl.value = '';
  renderAuthorityTags();
  saveFormDraft();
  statusEl.textContent = `Added ${name}.`;
}

function handleAdd(event) {
  event.preventDefault();
  const data = values();
  if (!data.subject?.trim()) {
    statusEl.textContent = 'Add a subject before saving.';
    return;
  }
  if (currentAuthorities.length === 0) {
    statusEl.textContent = 'Add at least one authority before saving.';
    return;
  }
  const batches = loadAll();
  const now = new Date().toISOString();
  const newBatch = createBatchRequest({
    subject: data.subject,
    description: data.description,
    authorities: currentAuthorities,
    sentDate: data.sentDate,
    deadlineDays: 20,
    createdAt: now,
    updatedAt: now
  });
  batches.push(newBatch);
  saveAll(batches);
  form.reset();
  currentAuthorities = [];
  renderAuthorityTags();
  clearFormDraft();
  activeId = newBatch.id;
  statusEl.textContent = `Batch created for ${newBatch.authorities.length} authorities.`;
  renderAll();
}

function handleExport(format) {
  const batches = loadAll();
  if (batches.length === 0) {
    statusEl.textContent = 'No batches to export.';
    return;
  }
  if (format === 'csv') {
    const headers = ['id,subject,sentDate,deadlineDays,authorities,createdAt'];
    const rows = batches.map((b) => [
      b.id,
      csvField(b.subject),
      b.sentDate,
      b.deadlineDays,
      b.authorities.length,
      b.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'foi-batches.csv', 'text/csv');
  } else {
    downloadText(serializeBatchFOI(batches), 'foi-batches.json', 'application/json');
  }
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function handleClearAll() {
  const batches = loadAll();
  if (batches.length === 0) {
    statusEl.textContent = 'No batches to clear.';
    return;
  }
  if (!confirm(`Delete all ${batches.length} batch(es) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All batches cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleAdd);
form.addEventListener('input', saveFormDraft);

const exportCsvBtn = document.querySelector('#exportCsv');
const exportJsonBtn = document.querySelector('#exportJson');
const clearAllBtn = document.querySelector('#clearAll');
const loadSampleBtn = document.querySelector('#loadSample');
const addAuthorityBtn = document.querySelector('#addAuthority');

exportCsvBtn?.addEventListener('click', () => handleExport('csv'));
exportJsonBtn?.addEventListener('click', () => handleExport('json'));
clearAllBtn?.addEventListener('click', handleClearAll);
addAuthorityBtn?.addEventListener('click', handleAddAuthority);

customAuthorityEl?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddAuthority();
  }
});

loadSampleBtn?.addEventListener('click', () => {
  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - 15);
  const sample = createBatchRequest({
    subject: 'Park maintenance spending data 2025-2026',
    description: 'Total expenditure on park maintenance across all borough parks for the financial year 2025-2026, broken down by category.',
    authorities: [
      { name: 'Westminster City Council', type: 'council' },
      { name: 'Birmingham City Council', type: 'council' },
      { name: 'Leeds City Council', type: 'council' }
    ],
    sentDate: past.toISOString().slice(0, 10)
  });
  const existing = loadAll();
  if (!existing.find((e) => e.subject === sample.subject)) {
    existing.push(sample);
  }
  saveAll(existing);
  statusEl.textContent = 'Loaded sample batch.';
  renderAll();
});

renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
