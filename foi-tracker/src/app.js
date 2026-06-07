import { initTheme } from './theme.js';
import { createIcsEvent } from '../../shared/calendar/ics.mjs';
import {
  AUTHORITY_TYPES,
  STATUS_OPTIONS,
  createRequest,
  parseRequestList,
  serializeRequestList,
  getStatusMeta,
  getAuthorityTypeMeta,
  daysUntilDeadline,
  needsEscalation,
  buildSummary,
  buildStatusBreakdown,
  buildEscalationLetter,
  buildIcoComplaintLetter,
  buildReminderEvent,
  buildDeadlineEvent,
  buildExportCsv,
  buildExportJson,
  buildHandoffPack,
  buildLocalActionPack,
  buildActionChecklist
} from './tracker.js';

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
