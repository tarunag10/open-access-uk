// ===== src/app.js =====
// ===== src/app.js =====



const STORAGE_KEY = 'open-access-uk:foi-tracker:requests';
const FORM_KEY = 'open-access-uk:foi-tracker:form-draft';

const form = document.querySelector('#request-form');
const list = document.querySelector('#request-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
const formFields = form?.elements;
let activeId = null;

function loadAll() {
  return parseRequestList(localStorage.getItem(STORAGE_KEY));
}

function saveAll(requests) {
  localStorage.setItem(STORAGE_KEY, serializeRequestList(requests));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function populateSelect(select, entries, labelFor) {
  select.replaceChildren(
    ...entries.map(([value, data]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = labelFor(data, value);
      return option;
    })
  );
}

function renderSummary(requests) {
  const stats = buildSummary(requests);
  const breakdown = buildStatusBreakdown(requests);
  const cards = [
    { label: 'Total requests', value: stats.total, tone: 'default' },
    { label: 'Active', value: stats.active, tone: 'default' },
    { label: 'Overdue', value: stats.overdue, tone: stats.overdue > 0 ? 'warning' : 'default' },
    { label: 'Escalated', value: stats.escalated, tone: 'default' },
    { label: 'Responded or closed', value: stats.responded, tone: 'default' }
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

  const breakdownPanel = document.querySelector('#status-breakdown');
  if (breakdownPanel) {
    breakdownPanel.replaceChildren(
      ...STATUS_OPTIONS.map((s) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = s.label;
        const value = document.createElement('span');
        value.textContent = breakdown[s.value] || 0;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderList(requests) {
  list.replaceChildren();
  if (requests.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No FOI requests yet. Add one using the form to start tracking deadlines and escalations.';
    list.append(empty);
    return;
  }
  const sorted = [...requests].sort((a, b) => {
    const aOverdue = needsEscalation(a) ? 0 : 1;
    const bOverdue = needsEscalation(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
  for (const request of sorted) {
    const item = document.createElement('article');
    item.className = 'request-item';
    if (needsEscalation(request)) item.classList.add('overdue');
    if (request.id === activeId) item.classList.add('active');

    const head = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = request.authority || 'Untitled request';
    const status = document.createElement('span');
    status.className = 'status-pill';
    status.textContent = getStatusMeta(request.status).label;
    head.append(title, status);

    const meta = document.createElement('p');
    meta.className = 'meta';
    const subject = request.subject || 'No subject';
    const sent = request.sentDate || 'not sent';
    meta.textContent = `${subject} — sent ${sent}`;

    const days = daysUntilDeadline(request);
    const deadline = document.createElement('p');
    deadline.className = 'deadline';
    if (days === null) {
      deadline.textContent = 'Add a sent date to see the deadline.';
    } else if (days < 0) {
      deadline.textContent = `Overdue by ${Math.abs(days)} working day(s). Consider escalating.`;
    } else if (days === 0) {
      deadline.textContent = 'Deadline is today.';
    } else {
      deadline.textContent = `${days} working day(s) remaining.`;
    }

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => selectRequest(request.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'secondary';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteRequest(request.id));
    actions.append(viewBtn, deleteBtn);

    item.append(head, meta, deadline, actions);
    list.append(item);
  }
}

function selectRequest(id) {
  activeId = id;
  const requests = loadAll();
  const request = requests.find((r) => r.id === id);
  if (!request) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(request);
  renderList(requests);
}

function renderDetail(request) {
  detailContent.replaceChildren();
  const statusMeta = getStatusMeta(request.status);
  const authorityMeta = getAuthorityTypeMeta(request.authorityType);
  const days = daysUntilDeadline(request);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = request.authority || 'Untitled request';
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = statusMeta.label;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Authority type', authorityMeta.label],
    ['Subject', request.subject || 'Not specified'],
    ['Reference', request.reference || 'Not provided'],
    ['Sent date', request.sentDate || 'Not recorded'],
    ['Response date', request.responseDate || 'Not recorded'],
    [
      'Deadline',
      days === null
        ? 'Add a sent date'
        : days < 0
          ? `Overdue by ${Math.abs(days)} working day(s)`
          : `${days} working day(s) remaining`
    ],
    ['Created', new Date(request.createdAt).toLocaleString()],
    ['Updated', new Date(request.updatedAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const requestSection = document.createElement('section');
  const requestHeading = document.createElement('h3');
  requestHeading.textContent = 'Original request text';
  const requestText = document.createElement('p');
  requestText.className = 'body-text';
  requestText.textContent = request.requestText || 'No request text recorded.';
  requestSection.append(requestHeading, requestText);

  const responseSection = document.createElement('section');
  const responseHeading = document.createElement('h3');
  responseHeading.textContent = 'Response notes';
  const responseText = document.createElement('p');
  responseText.className = 'body-text';
  responseText.textContent = request.responseNotes || 'No response received yet.';
  responseSection.append(responseHeading, responseText);

  const escalationSection = document.createElement('section');
  const escalationHeading = document.createElement('h3');
  escalationHeading.textContent = 'Escalation notes';
  const escalationText = document.createElement('p');
  escalationText.className = 'body-text';
  escalationText.textContent = request.escalationNotes || 'No escalation started yet.';
  escalationSection.append(escalationHeading, escalationText);

  const checklistSection = document.createElement('section');
  const checklistHeading = document.createElement('h3');
  checklistHeading.textContent = 'Action checklist';
  const checklist = document.createElement('ul');
  for (const item of buildActionChecklist(request)) {
    const li = document.createElement('li');
    li.textContent = item;
    checklist.append(li);
  }
  checklistSection.append(checklistHeading, checklist);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const statusForm = document.createElement('div');
  statusForm.className = 'status-form';
  const statusLabel = document.createElement('label');
  statusLabel.htmlFor = 'detail-status';
  statusLabel.textContent = 'Update status';
  const statusSelect = document.createElement('select');
  statusSelect.id = 'detail-status';
  populateSelect(statusSelect, Object.entries(STATUS_OPTIONS), (s) => s.label);
  statusSelect.value = request.status;
  statusSelect.addEventListener('change', () => updateStatus(request.id, statusSelect.value));
  statusForm.append(statusLabel, statusSelect);

  const escalationBtn = document.createElement('button');
  escalationBtn.type = 'button';
  escalationBtn.textContent = 'Mark as escalated';
  escalationBtn.addEventListener('click', () => updateStatus(request.id, 'escalated'));

  const copyEscalation = document.createElement('button');
  copyEscalation.type = 'button';
  copyEscalation.className = 'secondary';
  copyEscalation.textContent = 'Copy internal review letter';
  copyEscalation.addEventListener('click', () =>
    copyText(
      buildEscalationLetter(request, { name: values().name, contact: values().contact }),
      'Internal review letter copied locally.'
    )
  );

  const copyIco = document.createElement('button');
  copyIco.type = 'button';
  copyIco.className = 'secondary';
  copyIco.textContent = 'Copy ICO complaint letter';
  copyIco.addEventListener('click', () =>
    copyText(
      buildIcoComplaintLetter(request, { name: values().name, contact: values().contact }),
      'ICO complaint letter copied locally.'
    )
  );

  const copyPack = document.createElement('button');
  copyPack.type = 'button';
  copyPack.className = 'secondary';
  copyPack.textContent = 'Copy handoff pack';
  copyPack.addEventListener('click', () =>
    copyText(
      buildHandoffPack(request, { name: values().name, contact: values().contact }),
      'Handoff pack copied locally.'
    )
  );

  const copyLocal = document.createElement('button');
  copyLocal.type = 'button';
  copyLocal.className = 'secondary';
  copyLocal.textContent = 'Copy local action pack';
  copyLocal.addEventListener('click', () =>
    copyText(buildLocalActionPack(request), 'Local action pack copied locally.')
  );

  const downloadPack = document.createElement('button');
  downloadPack.type = 'button';
  downloadPack.className = 'secondary';
  downloadPack.textContent = 'Download handoff pack';
  downloadPack.addEventListener('click', () =>
    downloadText(
      buildHandoffPack(request, { name: values().name, contact: values().contact }),
      `foi-handoff-${request.id}.md`,
      'text/markdown'
    )
  );

  const reminder = buildReminderEvent(request);
  if (reminder) {
    const reminderBtn = document.createElement('button');
    reminderBtn.type = 'button';
    reminderBtn.className = 'secondary';
    reminderBtn.textContent = 'Add mid-window reminder';
    reminderBtn.addEventListener('click', () => downloadIcs(reminder, 'foi-reminder.ics'));
    actions.append(reminderBtn);
  }
  const deadline = buildDeadlineEvent(request);
  if (deadline) {
    const deadlineBtn = document.createElement('button');
    deadlineBtn.type = 'button';
    deadlineBtn.className = 'secondary';
    deadlineBtn.textContent = 'Add deadline to calendar';
    deadlineBtn.addEventListener('click', () => downloadIcs(deadline, 'foi-deadline.ics'));
    actions.append(deadlineBtn);
  }

  actions.append(
    statusForm,
    escalationBtn,
    copyEscalation,
    copyIco,
    copyPack,
    copyLocal,
    downloadPack
  );
  detailContent.append(
    header,
    grid,
    requestSection,
    responseSection,
    escalationSection,
    checklistSection,
    actions
  );
}

function updateStatus(id, status) {
  const requests = loadAll();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return;
  requests[idx] = { ...requests[idx], status, updatedAt: new Date().toISOString() };
  if (status === 'escalated' && !requests[idx].escalationDate) {
    requests[idx].escalationDate = new Date().toISOString().slice(0, 10);
  }
  saveAll(requests);
  statusEl.textContent = `Status updated to ${getStatusMeta(status).label}.`;
  renderAll();
}

function deleteRequest(id) {
  const requests = loadAll();
  const remaining = requests.filter((r) => r.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Request deleted locally.';
  renderAll();
}

function renderAll() {
  const requests = loadAll();
  renderSummary(requests);
  renderList(requests);
  if (activeId) {
    const request = requests.find((r) => r.id === activeId);
    if (request) renderDetail(request);
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

function downloadIcs(event, filename) {
  const ics = createIcsEvent(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
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
  if (!data.authority?.trim()) {
    statusEl.textContent = 'Add an authority name before saving.';
    return;
  }
  const requests = loadAll();
  const now = new Date().toISOString();
  const newRequest = createRequest({ ...data, createdAt: now, updatedAt: now });
  requests.push(newRequest);
  saveAll(requests);
  form.reset();
  clearFormDraft();
  populateSelect(
    form.elements.namedItem('authorityType'),
    Object.entries(AUTHORITY_TYPES),
    (t) => t.label
  );
  populateSelect(form.elements.namedItem('status'), Object.entries(STATUS_OPTIONS), (s) => s.label);
  activeId = newRequest.id;
  statusEl.textContent = `Saved request for ${newRequest.authority}.`;
  renderAll();
}

function handleExport(format) {
  const requests = loadAll();
  if (requests.length === 0) {
    statusEl.textContent = 'No requests to export.';
    return;
  }
  if (format === 'csv') {
    downloadText(buildExportCsv(requests), 'foi-requests.csv', 'text/csv');
  } else {
    downloadText(buildExportJson(requests), 'foi-requests.json', 'application/json');
  }
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
        const r = createRequest(item);
        if (!merged.find((e) => e.id === r.id)) merged.push(r);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} request(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of FOI requests.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const requests = loadAll();
  if (requests.length === 0) {
    statusEl.textContent = 'No requests to clear.';
    return;
  }
  if (!confirm(`Delete all ${requests.length} FOI request(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All requests cleared from this browser.';
  renderAll();
}

// Initialise
populateSelect(
  form.elements.namedItem('authorityType'),
  Object.entries(AUTHORITY_TYPES),
  (t) => t.label
);
populateSelect(form.elements.namedItem('status'), Object.entries(STATUS_OPTIONS), (s) => s.label);
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
  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - 25);
  const recent = new Date(today);
  recent.setDate(recent.getDate() - 5);
  const sample = [
    createRequest({
      authority: 'Department for Education',
      authorityType: 'central',
      subject: 'SEND tribunal waiting times',
      requestText:
        'Please provide the average waiting time for SEND tribunal hearings in 2024 and 2025, broken down by region.',
      sentDate: past.toISOString().slice(0, 10),
      status: 'overdue',
      reference: 'DFE-2026-FOI-1234'
    }),
    createRequest({
      authority: 'Manchester City Council',
      authorityType: 'local',
      subject: 'Highway maintenance budget',
      requestText:
        'Please provide the highway maintenance budget for 2025/26 and the percentage spent on accessibility improvements.',
      sentDate: recent.toISOString().slice(0, 10),
      status: 'sent',
      reference: 'MCC-FOI-2026-0421'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.authority === s.authority && e.subject === s.subject)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample requests.';
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


// ===== src/theme.js =====
const __m1__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_foi_tracker_src_theme_js = (() => {
// <app>/src/theme.js

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

function initTheme(toggleSelector = '#theme-toggle') {
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

return { initTheme };
})();

// ===== ../shared/theme/index.mjs =====
const __m2__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_theme_index_mjs = (() => {
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

return { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme };
})();

// ===== ../shared/calendar/ics.mjs =====
const __m3__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_calendar_ics_mjs = (() => {

function compactDate(dateString) {
  return dateString.replace(/-/g, '');
}

function nextDay(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return toLocalDateString(date);
}

function escapeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// RFC 5545 line folding at 75 octets.
function foldIcsLine(line) {
  if (line.length <= 75) return line;
  const segments = [];
  let remaining = line;
  segments.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    segments.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return segments.join('\r\n');
}

function createIcsEvent({ title, date, description = '', uid } = {}) {
  const start = parseLocalDate(date);
  if (!start) return '';
  const end = nextDay(date);
  const stamp = `${compactDate(date)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Local//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid || `${compactDate(date)}-${escapeText(title)}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${compactDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

return { foldIcsLine, createIcsEvent };
})();

// ===== ../shared/deadlines/index.mjs =====
const __m4__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_deadlines_index_mjs = (() => {
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

function calculateDeadline(startDate, rule) {
  const date = parseLocalDate(startDate);
  if (!date || !rule) return null;

  if (rule.days && rule.day_type === 'working') {
    return {
      ruleId: rule.id,
      targetDate: addWorkingDays(startDate, Number(rule.days)),
      explanation: rule.explanation
    };
  }

  const result = new Date(date);
  if (rule.days) result.setDate(result.getDate() + Number(rule.days));
  if (rule.weeks) result.setDate(result.getDate() + Number(rule.weeks) * 7);
  if (rule.months) result.setMonth(result.getMonth() + Number(rule.months));

  return {
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation
  };
}

return { parseLocalDate, toLocalDateString, addWorkingDays, calculateDeadline };
})();

// ===== src/tracker.js =====
const __m5__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_foi_tracker_src_tracker_js = (() => {
// FOI Response Tracker - core logic
// Tracks FOI requests across public authorities with deadline calculation, escalation, and export.

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Drafting', description: 'Request not yet sent.' },
  { value: 'sent', label: 'Sent', description: 'Request sent, awaiting acknowledgement.' },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Authority has confirmed receipt.' },
  {
    value: 'partial',
    label: 'Partial response',
    description: 'Some information received, more pending.'
  },
  { value: 'responded', label: 'Responded', description: 'Full response received.' },
  { value: 'refused', label: 'Refused', description: 'Authority refused the request.' },
  {
    value: 'overdue',
    label: 'Overdue',
    description: 'Response deadline has passed without reply.'
  },
  {
    value: 'escalated',
    label: 'Escalated',
    description: 'Complaint to ICO or internal review started.'
  },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

const AUTHORITY_TYPES = [
  {
    value: 'central',
    label: 'Central government',
    examples: ['ministry', 'agency', 'HMRC', 'Home Office']
  },
  {
    value: 'local',
    label: 'Local council',
    examples: ['county council', 'borough council', 'city council']
  },
  { value: 'nhs', label: 'NHS body', examples: ['trust', 'integrated care board', 'GP practice'] },
  { value: 'police', label: 'Police', examples: ['constabulary', 'police and crime commissioner'] },
  {
    value: 'education',
    label: 'Education body',
    examples: ['university', 'college', 'academy trust']
  },
  {
    value: 'housing',
    label: 'Housing association',
    examples: ['registered provider', 'arms-length body']
  },
  {
    value: 'other',
    label: 'Other public body',
    examples: ['regulator', 'quango', 'executive agency']
  }
];

const FOI_RULE = {
  id: 'foi-response',
  name: 'Freedom of Information response',
  days: 20,
  day_type: 'working',
  risk_level: 'high',
  source_id: 'govuk-foi-request',
  explanation: 'Public authorities normally have 20 working days to respond to an FOI request.'
};

const ICO_COMPLAINT_WINDOW = {
  id: 'ico-complaint-window',
  name: 'ICO complaint window',
  weeks: 12,
  day_type: 'calendar',
  source_id: 'ico-foi-complaint',
  explanation:
    'You can complain to the ICO if you have not had a response within 20 working days, or are unhappy with the response.'
};

function generateRequestId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `foi-${stamp}-${random}`;
}

function createRequest(data = {}) {
  return {
    id: data.id || generateRequestId(),
    authority: String(data.authority || '').trim(),
    authorityType: data.authorityType || 'central',
    subject: String(data.subject || '').trim(),
    requestText: String(data.requestText || '').trim(),
    sentDate: data.sentDate || '',
    responseDate: data.responseDate || '',
    status: data.status || 'draft',
    reference: String(data.reference || '').trim(),
    responseNotes: String(data.responseNotes || '').trim(),
    escalationDate: data.escalationDate || '',
    escalationNotes: String(data.escalationNotes || '').trim(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function parseRequest(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createRequest(parsed);
  } catch {
    return null;
  }
}

function serializeRequest(request) {
  return JSON.stringify(createRequest(request));
}

function parseRequestList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createRequest(item));
  } catch {
    return [];
  }
}

function serializeRequestList(list) {
  return JSON.stringify(list.map((item) => createRequest(item)));
}

function getStatusMeta(status) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

function getAuthorityTypeMeta(type) {
  return AUTHORITY_TYPES.find((t) => t.value === type) || AUTHORITY_TYPES[0];
}

function isOverdue(request, today = new Date()) {
  if (!request.sentDate) return false;
  if (['responded', 'closed', 'refused', 'escalated'].includes(request.status)) return false;
  return computeDeadline(request.sentDate, today) < 0;
}

function computeDeadline(sentDate, today = new Date()) {
  if (!sentDate) return null;
  const sent = new Date(sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const target = addWorkingDaysLocal(sent, 20);
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today_) / (1000 * 60 * 60 * 24));
  return diff;
}

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkingDaysLocal(date, days) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  result.setHours(0, 0, 0, 0);
  return result;
}

function daysUntilDeadline(request, today = new Date()) {
  if (!request.sentDate) return null;
  return computeDeadline(request.sentDate, today);
}

function needsEscalation(request, today = new Date()) {
  if (!request.sentDate) return false;
  if (['escalated', 'closed', 'responded', 'refused'].includes(request.status)) return false;
  const days = computeDeadline(request.sentDate, today);
  return days !== null && days < 0;
}

function buildOverdueList(requests, today = new Date()) {
  return requests.filter((r) => needsEscalation(r, today));
}

function buildSummary(requests, today = new Date()) {
  const total = requests.length;
  const active = requests.filter((r) => !['closed', 'responded'].includes(r.status)).length;
  const overdue = requests.filter((r) => needsEscalation(r, today)).length;
  const escalated = requests.filter((r) => r.status === 'escalated').length;
  const responded = requests.filter((r) => ['responded', 'closed'].includes(r.status)).length;
  return { total, active, overdue, escalated, responded };
}

function buildStatusBreakdown(requests) {
  const breakdown = {};
  for (const option of STATUS_OPTIONS) {
    breakdown[option.value] = requests.filter((r) => r.status === option.value).length;
  }
  return breakdown;
}

function buildEscalationLetter(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const overdueDays = daysUntilDeadline(request, new Date()) || 0;
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const body = [
    `To: ${request.authority} Information Rights Team`,
    `Date: ${today}`,
    `Reference: ${request.reference || 'Not provided'}`,
    '',
    `Dear Information Rights Officer,`,
    '',
    `I am writing to request an internal review of the handling of my Freedom of Information request.`,
    '',
    `Subject: ${request.subject || 'Not specified'}`,
    `Date sent: ${request.sentDate || 'Not recorded'}`,
    `Status: ${getStatusMeta(request.status).label}`,
    '',
    `I submitted the request on ${request.sentDate || 'the date above'} and have not received a substantive response within the 20 working day window.${overdueDays < 0 ? ` The deadline was ${Math.abs(overdueDays)} working day(s) ago.` : ''}`,
    '',
    `Original request:`,
    request.requestText || '[Original request text]',
    '',
    `I would like you to:`,
    `1. Confirm receipt of this request for internal review.`,
    `2. Provide a substantive response or an estimated completion date.`,
    `3. Explain any lawful extension or exemption you are relying on, with reasons.`,
    '',
    `If I do not receive a satisfactory response, I plan to complain to the Information Commissioner's Office.`,
    '',
    `Yours sincerely,`,
    name,
    contact
  ];
  return body.join('\n');
}

function buildIcoComplaintLetter(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const body = [
    `To: Information Commissioner's Office`,
    `Date: ${today}`,
    '',
    `Dear ICO,`,
    '',
    `I am writing to complain about the handling of a Freedom of Information request by ${request.authority || '[Authority name]'}.`,
    '',
    `Request subject: ${request.subject || 'Not specified'}`,
    `Date sent: ${request.sentDate || 'Not recorded'}`,
    `Authority reference: ${request.reference || 'Not provided'}`,
    `Current status: ${getStatusMeta(request.status).label}`,
    '',
    `Summary of the issue:`,
    request.responseNotes ||
      'The authority has not provided a substantive response within the 20 working day window.',
    '',
    `Steps already taken:`,
    request.escalationNotes || 'I have written to the authority requesting an internal review.',
    '',
    `I would like the ICO to consider whether the authority has complied with the Freedom of Information Act 2000.`,
    '',
    `Yours sincerely,`,
    name,
    contact
  ];
  return body.join('\n');
}

function buildReminderEvent(request) {
  if (!request.sentDate) return null;
  const sent = new Date(request.sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const due = addWorkingDaysLocal(sent, 14);
  return {
    title: `FOI follow-up: ${request.authority || 'Authority'}`,
    description: `Halfway through the 20 working day window for: ${request.subject || 'request'}`,
    date: due.toISOString().slice(0, 10),
    uid: `foi-reminder-${request.id}-halfway`
  };
}

function buildDeadlineEvent(request) {
  if (!request.sentDate) return null;
  const sent = new Date(request.sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const due = addWorkingDaysLocal(sent, 20);
  return {
    title: `FOI response due: ${request.authority || 'Authority'}`,
    description: `20 working day deadline for: ${request.subject || 'request'}. Escalate if no response.`,
    date: due.toISOString().slice(0, 10),
    uid: `foi-deadline-${request.id}`
  };
}

function buildExportCsv(requests) {
  const headers = [
    'id',
    'authority',
    'authorityType',
    'subject',
    'sentDate',
    'responseDate',
    'status',
    'reference',
    'overdue',
    'createdAt',
    'updatedAt'
  ];
  const rows = requests.map((r) => [
    r.id,
    csvField(r.authority),
    r.authorityType,
    csvField(r.subject),
    r.sentDate,
    r.responseDate,
    r.status,
    csvField(r.reference),
    needsEscalation(r) ? 'yes' : 'no',
    r.createdAt,
    r.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildExportJson(requests) {
  return JSON.stringify(
    requests.map((r) => createRequest(r)),
    null,
    2
  );
}

function buildHandoffPack(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const sections = [
    `# FOI request pack: ${request.authority || 'Authority'}`,
    '',
    `## Request summary`,
    `- Authority: ${request.authority || 'Not specified'}`,
    `- Authority type: ${getAuthorityTypeMeta(request.authorityType).label}`,
    `- Subject: ${request.subject || 'Not specified'}`,
    `- Reference: ${request.reference || 'Not provided'}`,
    `- Date sent: ${request.sentDate || 'Not recorded'}`,
    `- Current status: ${getStatusMeta(request.status).label}`,
    `- Deadline: 20 working days from sent date`,
    '',
    `## Original request text`,
    request.requestText || '[Original request text]',
    '',
    `## Response received`,
    request.responseNotes || 'No substantive response received yet.',
    '',
    `## Escalation notes`,
    request.escalationNotes || 'No internal review or ICO complaint started yet.',
    '',
    `## Suggested next steps`,
    '1. Check whether the deadline has passed.',
    '2. If overdue, request an internal review from the authority.',
    '3. If still unresolved, complain to the ICO using the ICO complaint letter.',
    '4. Keep copies of all correspondence and timestamps.',
    '',
    `## Contact`,
    name,
    contact,
    `Pack generated: ${today}`,
    '',
    '> This pack is a drafting aid, not legal advice. Verify deadlines and routes against the current GOV.UK and ICO guidance.'
  ];
  return sections.join('\n');
}

function buildActionChecklist(request, today = new Date()) {
  const checklist = [
    'Save a copy of the sent request and any acknowledgement email.',
    'Note the sent date and the authority reference if provided.',
    'Mark your calendar for 14 working days (mid-window check) and 20 working days (deadline).',
    'If the deadline passes without a substantive response, request an internal review.',
    'If the internal review is unsatisfactory, complain to the ICO.',
    'Keep records of phone calls, names, and reference numbers.'
  ];
  if (request.status === 'refused') {
    checklist.push(
      'Check whether the cited exemption applies and whether a public interest balance favours disclosure.'
    );
    checklist.push('Consider asking the authority to carry out an internal review of the refusal.');
  }
  if (request.status === 'partial') {
    checklist.push('Clarify which parts of the request were answered and which were withheld.');
    checklist.push('Ask for reasons and exemption references for any withheld information.');
  }
  if (needsEscalation(request, today)) {
    checklist.unshift('Request is overdue: consider escalating to an internal review or the ICO.');
  }
  return checklist;
}

function buildLocalActionPack(request) {
  const checklist = buildActionChecklist(request);
  return [
    `# Local action pack: ${request.authority || 'Authority'}`,
    '',
    `## Evidence to keep`,
    '- Copy of the sent FOI request',
    '- Acknowledgement email or letter',
    '- Any response received, with dates',
    '- Reference numbers and contact names',
    '',
    `## Safety checks`,
    '- Avoid sharing unnecessary personal data in the request text.',
    '- Check the request does not identify a vulnerable third party.',
    '- Do not include payment card numbers, medical records, or full account numbers.',
    '',
    `## Action checklist`,
    ...checklist.map((item) => `- ${item}`),
    '',
    `## Escalation notes`,
    request.escalationNotes || 'No escalation started yet.',
    '',
    '> Drafting aid only. Verify deadlines, exemptions, and routes against current GOV.UK and ICO guidance.'
  ].join('\n');
}

return { STATUS_OPTIONS, AUTHORITY_TYPES, FOI_RULE, ICO_COMPLAINT_WINDOW, generateRequestId, createRequest, parseRequest, serializeRequest, parseRequestList, serializeRequestList, getStatusMeta, getAuthorityTypeMeta, isOverdue, computeDeadline, daysUntilDeadline, needsEscalation, buildOverdueList, buildSummary, buildStatusBreakdown, buildEscalationLetter, buildIcoComplaintLetter, buildReminderEvent, buildDeadlineEvent, buildExportCsv, buildExportJson, buildHandoffPack, buildActionChecklist, buildLocalActionPack };
})();

