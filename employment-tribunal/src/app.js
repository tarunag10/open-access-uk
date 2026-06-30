// ===== src/app.js =====
// Employment Tribunal Case Builder — bundled app (all shared modules inlined)

// ===== ../shared/theme/index.mjs =====
const THEME_STORAGE_KEY = 'open-access-uk:theme';
const VALID_THEMES = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID_THEMES.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== ../shared/deadlines/index.mjs =====
function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toLocalDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkingDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  let remaining = Number(days);
  const result = new Date(date);
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  return toLocalDateString(result);
}

// ===== ../shared/employment/index.mjs =====
const CLAIM_TYPES = [
  { id: 'unfair-dismissal', name: 'Unfair Dismissal', deadlineMonths: 3, source: 'employment-rights-act-1996', description: 'Dismissal without fair reason or fair procedure' },
  { id: 'discrimination', name: 'Discrimination', deadlineMonths: 3, source: 'equality-act-2010', description: 'Direct/indirect discrimination, harassment, victimisation' },
  { id: 'wages', name: 'Unpaid Wages', deadlineMonths: 3, source: 'employment-rights-act-1996', description: 'Wrongful deduction from wages' },
  { id: 'breach-of-contract', name: 'Breach of Contract', deadlineMonths: 6, source: 'common-law', description: 'Breach of employment contract terms' },
  { id: 'redundancy', name: 'Redundancy', deadlineMonths: 6, source: 'employment-rights-act-1996', description: 'Redundancy pay, consultation, or selection disputes' }
];

function empParseLocalDate(value) {
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

function empToLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return [y, String(m + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}

function empAddMonths(value, months) {
  const date = empParseLocalDate(value);
  if (!date) return null;
  date.setUTCMonth(date.getUTCMonth() + months);
  return empToLocalDateString(date);
}

function getClaimTypes() {
  return [...CLAIM_TYPES];
}

function getACASDeadline(dismissalDate) {
  const date = empParseLocalDate(dismissalDate);
  if (!date) return null;
  date.setUTCMonth(date.getUTCMonth() + 3);
  date.setUTCDate(date.getUTCDate() - 1);
  return empToLocalDateString(date);
}

function getET1Deadline(acasCertDate) {
  const date = empParseLocalDate(acasCertDate);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + 42);
  return empToLocalDateString(date);
}

function getRemedyCalculator(data) {
  const age = Number(data?.age) || 0;
  const yearsOfService = Math.min(Number(data?.yearsOfService) || 0, 20);
  const weeklyPay = Number(data?.weeklyPay) || 0;
  const compensatory = Number(data?.compensatory) || 0;
  const basicAward = age * yearsOfService * weeklyPay;
  const compensatoryAward = compensatory;
  return {
    basicAward,
    compensatoryAward,
    total: basicAward + compensatoryAward
  };
}

function claimTypeName(claimType) {
  const found = CLAIM_TYPES.find((c) => c.id === claimType);
  return found ? found.name : claimType || 'Unknown';
}

function generateET1Text(data) {
  const lines = [];
  lines.push('ET1 Claim Form');
  lines.push('');
  lines.push(`Claimant: ${data.claimantName || ''}`);
  lines.push(`Employer: ${data.employerName || ''}`);
  if (data.employerAddress) lines.push(`Employer Address: ${data.employerAddress}`);
  lines.push(`Claim Type: ${claimTypeName(data.claimType)}`);
  if (data.employmentStartDate) lines.push(`Employment Start: ${data.employmentStartDate}`);
  if (data.employmentEndDate) lines.push(`Employment End: ${data.employmentEndDate}`);
  if (data.dismissalDate) lines.push(`Dismissal Date: ${data.dismissalDate}`);
  if (data.weeklyPay !== undefined) lines.push(`Weekly Pay: ${data.weeklyPay}`);
  lines.push('');
  lines.push('Grounds:');
  lines.push(data.grounds || '');
  return lines.join('\n');
}

function generateACASText(data) {
  const lines = [];
  lines.push('ACAS Early Conciliation Notification');
  lines.push('');
  lines.push(`Claimant: ${data.claimantName || ''}`);
  lines.push(`Employer: ${data.employerName || ''}`);
  if (data.employerAddress) lines.push(`Employer Address: ${data.employerAddress}`);
  lines.push(`Claim Type: ${claimTypeName(data.claimType)}`);
  if (data.employmentStartDate) lines.push(`Employment Start: ${data.employmentStartDate}`);
  if (data.employmentEndDate) lines.push(`Employment End: ${data.employmentEndDate}`);
  if (data.weeklyPay !== undefined) lines.push(`Weekly Pay: ${data.weeklyPay}`);
  lines.push('');
  lines.push('Grounds:');
  lines.push(data.grounds || '');
  return lines.join('\n');
}

function getChronologyTemplate() {
  return [
    { label: 'Employment Start', dateField: 'employmentStartDate' },
    { label: 'Notice Given', dateField: 'noticeDate' },
    { label: 'Dismissal Date', dateField: 'dismissalDate' },
    { label: 'ACAS Early Conciliation', dateField: 'acasDate' },
    { label: 'ET1 Submitted', dateField: 'et1Date' },
    { label: 'Preliminary Hearing', dateField: 'prelimHearingDate' },
    { label: 'Final Hearing', dateField: 'finalHearingDate' }
  ];
}

function serializeEmployment(value) {
  return JSON.stringify(value);
}

function parseEmployment(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ===== src/tracker.js (inlined) =====
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

function renderClaimCard(claim) {
  const claimType = CLAIM_TYPES.find((c) => c.id === claim.claimType);
  const typeName = claimType ? claimType.name : claim.claimType || 'Unknown';

  const acasDeadline = getACASDeadline(claim.dismissalDate);
  const et1Deadline = claim.acasCertDate ? getET1Deadline(claim.acasCertDate) : null;

  let deadlineText = 'Add a dismissal date to see ACAS deadline.';
  if (acasDeadline) {
    deadlineText = `ACAS deadline: ${acasDeadline}`;
  }
  if (et1Deadline) {
    deadlineText += ` | ET1 deadline: ${et1Deadline}`;
  }

  return `
    <header>
      <h3>${escapeHtml(claim.employerName || 'Untitled claim')}</h3>
      <span class="status-pill claim-${claim.claimType}">${typeName}</span>
    </header>
    <p class="meta">${escapeHtml(claim.claimantName || 'No claimant')} — ${claim.dismissalDate || 'No dismissal date'}</p>
    <p class="deadline">${deadlineText}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${claim.id}">View</button>
      <button type="button" data-action="delete" data-id="${claim.id}" class="secondary">Delete</button>
    </div>`;
}

function renderClaims(claims, container) {
  container.replaceChildren();
  if (claims.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No employment tribunal claims yet. Add one using the form to start building your ET1.';
    container.append(empty);
    return;
  }
  const sorted = [...claims].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  for (const claim of sorted) {
    const item = document.createElement('article');
    item.className = 'claim-item';
    item.innerHTML = renderClaimCard(claim);
    container.append(item);
  }
}

function renderTimeline(claim) {
  const chronology = getChronologyTemplate();
  let html = '<ol class="timeline" aria-label="Claim chronology">';
  for (const step of chronology) {
    const date = claim[step.dateField] || '';
    const cls = date ? 'timeline-complete' : 'timeline-future';
    html += `<li class="${cls}">`;
    html += `<strong>${step.label}</strong>`;
    html += `<span>${date || 'Not yet recorded'}</span>`;
    html += '</li>';
  }
  html += '</ol>';
  return html;
}

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
const STORAGE_KEY = 'open-access-uk:employment-tribunal:claims';
const FORM_KEY = 'open-access-uk:employment-tribunal:form-draft';

const form = document.querySelector('#claim-form');
const list = document.querySelector('#claim-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
let activeId = null;

function loadAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(claims) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function generateClaimId() {
  return 'et-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function createClaimRecord(data) {
  return {
    id: generateClaimId(),
    createdAt: new Date().toISOString(),
    claimType: data.claimType || 'unfair-dismissal',
    claimantName: data.claimantName || '',
    employerName: data.employerName || '',
    employerAddress: data.employerAddress || '',
    employmentStartDate: data.employmentStartDate || '',
    employmentEndDate: data.employmentEndDate || '',
    dismissalDate: data.dismissalDate || '',
    weeklyPay: data.weeklyPay || '',
    grounds: data.grounds || '',
    acasCertDate: data.acasCertDate || '',
    et1Date: data.et1Date || '',
    ...data
  };
}

function renderSummary(claims) {
  const total = claims.length;
  const unfairDismissal = claims.filter((c) => c.claimType === 'unfair-dismissal').length;
  const discrimination = claims.filter((c) => c.claimType === 'discrimination').length;
  const wages = claims.filter((c) => c.claimType === 'wages').length;

  const cards = [
    { label: 'Total claims', value: total, tone: 'default' },
    { label: 'Unfair Dismissal', value: unfairDismissal, tone: 'default' },
    { label: 'Discrimination', value: discrimination, tone: 'default' },
    { label: 'Unpaid Wages', value: wages, tone: 'default' }
  ];

  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = 'summary-card';
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

  const deadlinePanel = document.querySelector('#deadline-tracker');
  if (deadlinePanel) {
    deadlinePanel.replaceChildren(
      ...CLAIM_TYPES.map((ct) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = ct.name;
        const value = document.createElement('span');
        value.textContent = `${ct.deadlineMonths} months`;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderList(claims) {
  renderClaims(claims, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectClaim(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteClaim(btn.dataset.id));
  });
}

function selectClaim(id) {
  activeId = id;
  const claims = loadAll();
  const claim = claims.find((c) => c.id === id);
  if (!claim) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(claim);
  renderList(claims);
}

function renderDetail(claim) {
  detailContent.replaceChildren();
  const claimType = CLAIM_TYPES.find((c) => c.id === claim.claimType);
  const typeName = claimType ? claimType.name : claim.claimType || 'Unknown';

  const acasDeadline = getACASDeadline(claim.dismissalDate);
  const et1Deadline = claim.acasCertDate ? getET1Deadline(claim.acasCertDate) : null;

  const remedy = getRemedyCalculator({
    age: claim.age || 0,
    yearsOfService: claim.yearsOfService || 0,
    weeklyPay: claim.weeklyPay || 0,
    compensatory: claim.compensatory || 0
  });

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = claim.employerName || 'Untitled claim';
  const status = document.createElement('span');
  status.className = `status-pill claim-${claim.claimType}`;
  status.textContent = typeName;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Claim type', typeName],
    ['Claimant', claim.claimantName || 'Not specified'],
    ['Employer address', claim.employerAddress || 'Not specified'],
    ['Employment start', claim.employmentStartDate || 'Not recorded'],
    ['Employment end', claim.employmentEndDate || 'Not recorded'],
    ['Dismissal date', claim.dismissalDate || 'Not recorded'],
    ['Weekly pay', claim.weeklyPay ? `£${claim.weeklyPay}` : 'Not specified'],
    ['ACAS deadline', acasDeadline || 'Add dismissal date'],
    ['ET1 deadline', et1Deadline || 'Complete ACAS conciliation first'],
    ['Basic award', `£${remedy.basicAward.toLocaleString()}`],
    ['Compensatory award', `£${remedy.compensatoryAward.toLocaleString()}`],
    ['Total estimated remedy', `£${remedy.total.toLocaleString()}`],
    ['Created', new Date(claim.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const timelineSection = document.createElement('section');
  const timelineHeading = document.createElement('h3');
  timelineHeading.textContent = 'Claim chronology';
  timelineSection.append(timelineHeading);
  timelineSection.insertAdjacentHTML('beforeend', renderTimeline(claim));

  const groundsSection = document.createElement('section');
  const groundsHeading = document.createElement('h3');
  groundsHeading.textContent = 'Grounds';
  const groundsText = document.createElement('p');
  groundsText.className = 'body-text';
  groundsText.textContent = claim.grounds || 'No grounds recorded yet.';
  groundsSection.append(groundsHeading, groundsText);

  const et1Section = document.createElement('section');
  const et1Heading = document.createElement('h3');
  et1Heading.textContent = 'Generated ET1 text';
  const et1Text = document.createElement('pre');
  et1Text.className = 'code-window';
  et1Text.textContent = generateET1Text(claim);
  et1Section.append(et1Heading, et1Text);

  const acasSection = document.createElement('section');
  const acasHeading = document.createElement('h3');
  acasHeading.textContent = 'ACAS conciliation text';
  const acasText = document.createElement('pre');
  acasText.className = 'code-window';
  acasText.textContent = generateACASText(claim);
  acasSection.append(acasHeading, acasText);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyEt1 = document.createElement('button');
  copyEt1.type = 'button';
  copyEt1.textContent = 'Copy ET1 text';
  copyEt1.addEventListener('click', () =>
    copyText(generateET1Text(claim), 'ET1 text copied locally.')
  );

  const copyAcas = document.createElement('button');
  copyAcas.type = 'button';
  copyAcas.className = 'secondary';
  copyAcas.textContent = 'Copy ACAS text';
  copyAcas.addEventListener('click', () =>
    copyText(generateACASText(claim), 'ACAS text copied locally.')
  );

  const downloadEt1 = document.createElement('button');
  downloadEt1.type = 'button';
  downloadEt1.className = 'secondary';
  downloadEt1.textContent = 'Download ET1';
  downloadEt1.addEventListener('click', () =>
    downloadText(generateET1Text(claim), 'et1-claim.txt', 'text/plain')
  );

  actions.append(copyEt1, copyAcas, downloadEt1);
  detailContent.append(header, grid, timelineSection, groundsSection, et1Section, acasSection, actions);
}

function deleteClaim(id) {
  const claims = loadAll();
  const remaining = claims.filter((c) => c.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Claim deleted locally.';
  renderAll();
}

function renderAll() {
  const claims = loadAll();
  renderSummary(claims);
  renderList(claims);
  if (activeId) {
    const claim = claims.find((c) => c.id === activeId);
    if (claim) renderDetail(claim);
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

function handleAdd(event) {
  event.preventDefault();
  const data = values();
  if (!data.claimantName?.trim()) {
    statusEl.textContent = 'Add a claimant name before saving.';
    return;
  }
  if (!data.employerName?.trim()) {
    statusEl.textContent = 'Add an employer name before saving.';
    return;
  }
  const claims = loadAll();
  const now = new Date().toISOString();
  const newClaim = createClaimRecord({
    ...data,
    createdAt: now,
    updatedAt: now
  });
  claims.push(newClaim);
  saveAll(claims);
  form.reset();
  clearFormDraft();
  activeId = newClaim.id;
  statusEl.textContent = `Saved claim for ${newClaim.employerName}.`;
  renderAll();
}

function handleExport(format) {
  const claims = loadAll();
  if (claims.length === 0) {
    statusEl.textContent = 'No claims to export.';
    return;
  }
  if (format === 'csv') {
    const headers = ['id', 'claimType', 'claimantName', 'employerName', 'dismissalDate', 'weeklyPay', 'createdAt'];
    const rows = claims.map((c) => [
      c.id,
      c.claimType || '',
      csvField(c.claimantName),
      csvField(c.employerName),
      c.dismissalDate || '',
      c.weeklyPay || '',
      c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'employment-tribunal-claims.csv', 'text/csv');
  } else {
    downloadText(JSON.stringify(claims), 'employment-tribunal-claims.json', 'application/json');
  }
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('not a list');
      const existing = loadAll();
      const merged = [...existing];
      for (const item of parsed) {
        const c = createClaimRecord(item);
        if (!merged.find((e) => e.id === c.id)) merged.push(c);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} claim(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of claims.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const claims = loadAll();
  if (claims.length === 0) {
    statusEl.textContent = 'No claims to clear.';
    return;
  }
  if (!confirm(`Delete all ${claims.length} claim(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All claims cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleAdd);
form.addEventListener('input', saveFormDraft);

const exportCsvBtn = document.querySelector('#exportCsv');
const exportJsonBtn = document.querySelector('#exportJson');
const importInput = document.querySelector('#importJson');
const clearAllBtn = document.querySelector('#clearAll');
const loadSampleBtn = document.querySelector('#loadSample');

exportCsvBtn?.addEventListener('click', () => handleExport('csv'));
exportJsonBtn?.addEventListener('click', () => handleExport('json'));
importInput?.addEventListener('change', handleImport);
clearAllBtn?.addEventListener('click', handleClearAll);
loadSampleBtn?.addEventListener('click', () => {
  const sample = [
    createClaimRecord({
      claimType: 'unfair-dismissal',
      claimantName: 'Jane Smith',
      employerName: 'Acme Corp Ltd',
      employerAddress: '123 Business Park, London, EC1A 1BB',
      employmentStartDate: '2020-03-15',
      employmentEndDate: '2026-05-30',
      dismissalDate: '2026-05-30',
      weeklyPay: '500',
      grounds: 'I was dismissed without a fair reason. My employer did not follow a fair procedure. I was not given proper notice or an opportunity to respond to the allegations.'
    }),
    createClaimRecord({
      claimType: 'discrimination',
      claimantName: 'John Doe',
      employerName: 'Tech Solutions UK',
      employerAddress: '45 Innovation Drive, Manchester, M1 1AE',
      employmentStartDate: '2019-06-01',
      employmentEndDate: '2026-04-15',
      dismissalDate: '2026-04-15',
      weeklyPay: '650',
      grounds: 'I was discriminated against on the grounds of disability. Reasonable adjustments were not made for my condition.'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.employerName === s.employerName && e.claimantName === s.claimantName)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample claims.';
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
