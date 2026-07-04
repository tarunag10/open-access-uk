// nhs-complaints-tracker/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs nhs-complaints-tracker

// ===== ../../shared/complaints/index.mjs =====

const NHS_STAGES = [
  {
    id: 'pals',
    name: 'PALS (Patient Advice and Liaison Service)',
    description: 'Informal resolution through hospital PALS',
    acknowledgementDays: 3,
    responseWorkingDays: 25,
    source: 'nhs-england-complaints'
  },
  {
    id: 'formal',
    name: 'Formal Complaint',
    description: 'Written formal complaint to the trust',
    acknowledgementDays: 3,
    responseWorkingDays: 25,
    source: 'nhs-england-complaints'
  },
  {
    id: 'phso',
    name: 'Parliamentary and Health Service Ombudsman',
    description: 'Escalation to PHSO after trust responds',
    deadlineMonths: 12,
    source: 'phso-complaints'
  }
];

function generateId() {
  return 'cmp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function addMonths(value, months) {
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return null;
  let [, y, m, d] = parts.map(Number);
  m += months;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return [y, String(m).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}

const VALID_STAGES = NHS_STAGES.map((s) => s.id);

function createComplaintRecord(data) {
  if (!data || !data.patientName) {
    throw new Error('patientName is required');
  }
  const stage = data.stage || 'pals';
  if (!VALID_STAGES.includes(stage)) {
    throw new Error(`Invalid stage "${stage}". Must be one of: ${VALID_STAGES.join(', ')}`);
  }
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'open',
    patientName: data.patientName,
    stage,
    sentDate: data.sentDate || '',
    trustName: data.trustName || '',
    reference: data.reference || '',
    notes: data.notes || '',
    responseDate: data.responseDate || '',
    ...data
  };
}

function getComplaintStages() {
  return [...NHS_STAGES];
}

function getNextStage(currentStage) {
  const idx = NHS_STAGES.findIndex((s) => s.id === currentStage);
  if (idx < 0 || idx >= NHS_STAGES.length - 1) return null;
  return NHS_STAGES[idx + 1].id;
}

function getDeadlineForStage(stageId, sentDate) {
  const stage = NHS_STAGES.find((s) => s.id === stageId);
  if (!stage || !sentDate) return null;

  const result = { stageId, sentDate };

  if (stage.acknowledgementDays) {
    const ack = addWorkingDays(sentDate, stage.acknowledgementDays);
    if (!ack) return null;
    result.acknowledgementDate = ack;
    result.acknowledgementDays = stage.acknowledgementDays;
  }

  if (stage.responseWorkingDays) {
    const resp = addWorkingDays(sentDate, stage.responseWorkingDays);
    if (!resp) return null;
    result.responseDate = resp;
    result.responseWorkingDays = stage.responseWorkingDays;
  }

  if (stage.deadlineMonths) {
    const dl = addMonths(sentDate, stage.deadlineMonths);
    if (!dl) return null;
    result.deadlineDate = dl;
    result.deadlineMonths = stage.deadlineMonths;
  }

  return result;
}

function stageName(stageId) {
  const stage = NHS_STAGES.find((s) => s.id === stageId);
  return stage ? stage.name : stageId;
}

function generateComplaintSummary(complaint) {
  const lines = [];
  lines.push(`Complaint: ${complaint.patientName}`);
  lines.push(`Stage: ${stageName(complaint.stage)}`);
  if (complaint.trustName) lines.push(`Trust: ${complaint.trustName}`);
  if (complaint.reference) lines.push(`Reference: ${complaint.reference}`);
  if (complaint.sentDate) lines.push(`Sent: ${complaint.sentDate}`);
  if (complaint.notes) lines.push(`Notes: ${complaint.notes}`);
  return lines.join('\n');
}

function serializeComplaints(complaints) {
  return JSON.stringify(complaints);
}

function parseComplaints(value) {
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

const ORGANISATION_TYPES = [
  { value: 'gp', label: 'GP Practice' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'trust', label: 'NHS Trust' },
  { value: 'ccg', label: 'Clinical Commissioning Group' }
];

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

function calculateDaysRemaining(sentDate, stageId, today = new Date()) {
  const stage = getComplaintStages().find((s) => s.id === stageId);
  if (!stage || !sentDate) return null;

  const deadlineInfo = getDeadlineForStage(stageId, sentDate);
  if (!deadlineInfo) return null;

  let targetDate = null;
  if (deadlineInfo.responseDate) {
    targetDate = parseLocalDate(deadlineInfo.responseDate);
  } else if (deadlineInfo.deadlineDate) {
    targetDate = parseLocalDate(deadlineInfo.deadlineDate);
  }

  if (!targetDate) return null;

  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((targetDate - today_) / (1000 * 60 * 60 * 24));
}

function filterByStage(complaints, stageId) {
  if (!stageId) return complaints;
  return complaints.filter((c) => c.stage === stageId);
}

function renderTimeline(complaint) {
  const stages = getComplaintStages();
  const currentIdx = stages.findIndex((s) => s.id === complaint.stage);

  let html = '<ol class="timeline" aria-label="Complaint stages">';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isComplete = i < currentIdx;
    const isCurrent = i === currentIdx;
    const cls = isComplete
      ? 'timeline-complete'
      : isCurrent
        ? 'timeline-current'
        : 'timeline-future';
    html += `<li class="${cls}" aria-current="${isCurrent ? 'step' : 'false'}">`;
    html += `<strong>${stage.name}</strong>`;
    html += `<span>${stage.description}</span>`;
    html += '</li>';
  }
  html += '</ol>';
  return html;
}

function renderComplaintCard(complaint) {
  const stage = getComplaintStages().find((s) => s.id === complaint.stage);
  const days = calculateDaysRemaining(complaint.sentDate, complaint.stage);

  let deadlineText = 'Add a sent date to see the deadline.';
  if (days !== null) {
    if (days < 0) {
      deadlineText = `Overdue by ${Math.abs(days)} day(s). Consider escalating.`;
    } else if (days === 0) {
      deadlineText = 'Deadline is today.';
    } else {
      deadlineText = `${days} day(s) remaining.`;
    }
  }

  const statusCls = days !== null && days < 0 ? ' status-overdue' : '';

  return `
    <header>
      <h3>${escapeHtml(complaint.trustName || 'Untitled complaint')}</h3>
      <span class="status-pill stage-${complaint.stage}">${stage ? stage.name : complaint.stage}</span>
    </header>
    <p class="meta">${escapeHtml(complaint.description || 'No description')} — ${complaint.sentDate || 'not sent'}</p>
    <p class="deadline${statusCls}">${deadlineText}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${complaint.id}">View</button>
      <button type="button" data-action="delete" data-id="${complaint.id}" class="secondary">Delete</button>
    </div>`;
}

function renderComplaints(complaints, container) {
  container.replaceChildren();
  if (complaints.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No NHS complaints yet. Add one using the form to start tracking complaint stages.';
    container.append(empty);
    return;
  }
  const sorted = [...complaints].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.sentDate, a.stage);
    const bDays = calculateDaysRemaining(b.sentDate, b.stage);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const complaint of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(complaint.sentDate, complaint.stage);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderComplaintCard(complaint);
    container.append(item);
  }
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

export {
  ORGANISATION_TYPES,
  calculateDaysRemaining,
  filterByStage,
  renderTimeline,
  renderComplaintCard,
  renderComplaints,
  escapeHtml,
  createComplaintRecord,
  getComplaintStages,
  getNextStage,
  getDeadlineForStage,
  generateComplaintSummary,
  serializeComplaints,
  parseComplaints
};

// ===== Theme init =====
function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let stored;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
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
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  });
}

// ===== App logic =====
const STORAGE_KEY = 'open-access-uk:nhs-complaints-tracker:complaints';
const FORM_KEY = 'open-access-uk:nhs-complaints-tracker:form-draft';

const form = document.querySelector('#complaint-form');
const list = document.querySelector('#complaint-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
let activeId = null;

function loadAll() {
  return parseComplaints(localStorage.getItem(STORAGE_KEY));
}

function saveAll(complaints) {
  localStorage.setItem(STORAGE_KEY, serializeComplaints(complaints));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(complaints) {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'open').length;
  const pals = complaints.filter((c) => c.stage === 'pals').length;
  const formal = complaints.filter((c) => c.stage === 'formal').length;
  const phso = complaints.filter((c) => c.stage === 'phso').length;

  const cards = [
    { label: 'Total complaints', value: total, tone: 'default' },
    { label: 'Open', value: open, tone: 'default' },
    { label: 'PALS', value: pals, tone: 'default' },
    { label: 'Formal', value: formal, tone: 'default' },
    { label: 'PHSO', value: phso, tone: 'default' }
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

  const breakdownPanel = document.querySelector('#stage-breakdown');
  if (breakdownPanel) {
    breakdownPanel.replaceChildren(
      ...NHS_STAGES.map((s) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = s.name;
        const value = document.createElement('span');
        value.textContent = complaints.filter((c) => c.stage === s.id).length;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderList(complaints) {
  renderComplaints(complaints, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectComplaint(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteComplaint(btn.dataset.id));
  });
}

function selectComplaint(id) {
  activeId = id;
  const complaints = loadAll();
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(complaint);
  renderList(complaints);
}

function renderDetail(complaint) {
  detailContent.replaceChildren();
  const stage = NHS_STAGES.find((s) => s.id === complaint.stage);
  const days = calculateDaysRemaining(complaint.sentDate, complaint.stage);
  const orgType = ORGANISATION_TYPES.find((t) => t.value === complaint.organisationType);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = complaint.trustName || 'Untitled complaint';
  const status = document.createElement('span');
  status.className = `status-pill stage-${complaint.stage}`;
  status.textContent = stage ? stage.name : complaint.stage;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Organisation type', orgType ? orgType.label : complaint.organisationType || 'Not specified'],
    ['Description', complaint.description || 'Not specified'],
    ['Reference', complaint.reference || 'Not provided'],
    ['Sent date', complaint.sentDate || 'Not recorded'],
    ['Response date', complaint.responseDate || 'Not recorded'],
    [
      'Deadline',
      days === null
        ? 'Add a sent date'
        : days < 0
          ? `Overdue by ${Math.abs(days)} day(s)`
          : `${days} day(s) remaining`
    ],
    ['Created', new Date(complaint.createdAt).toLocaleString()]
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
  timelineHeading.textContent = 'Complaint timeline';
  timelineSection.append(timelineHeading);
  timelineSection.insertAdjacentHTML('beforeend', renderTimeline(complaint));

  const notesSection = document.createElement('section');
  const notesHeading = document.createElement('h3');
  notesHeading.textContent = 'Outcome / Response';
  const notesText = document.createElement('p');
  notesText.className = 'body-text';
  notesText.textContent = complaint.outcome || complaint.notes || 'No outcome recorded yet.';
  notesSection.append(notesHeading, notesText);

  const summarySection = document.createElement('section');
  const summaryHeading = document.createElement('h3');
  summaryHeading.textContent = 'Complaint summary';
  const summaryText = document.createElement('pre');
  summaryText.className = 'code-window';
  summaryText.textContent = generateComplaintSummary(complaint);
  summarySection.append(summaryHeading, summaryText);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const stageForm = document.createElement('div');
  stageForm.className = 'status-form';
  const stageLabel = document.createElement('label');
  stageLabel.htmlFor = 'detail-stage';
  stageLabel.textContent = 'Update stage';
  const stageSelect = document.createElement('select');
  stageSelect.id = 'detail-stage';
  for (const s of NHS_STAGES) {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    stageSelect.append(opt);
  }
  stageSelect.value = complaint.stage;
  stageSelect.addEventListener('change', () => updateStage(complaint.id, stageSelect.value));
  stageForm.append(stageLabel, stageSelect);

  const nextStage = getNextStage(complaint.stage);
  const advanceBtn = document.createElement('button');
  advanceBtn.type = 'button';
  advanceBtn.textContent = nextStage ? `Advance to ${stageName(nextStage)}` : 'Final stage reached';
  advanceBtn.disabled = !nextStage;
  advanceBtn.addEventListener('click', () => {
    if (nextStage) updateStage(complaint.id, nextStage);
  });

  const copySummary = document.createElement('button');
  copySummary.type = 'button';
  copySummary.className = 'secondary';
  copySummary.textContent = 'Copy summary';
  copySummary.addEventListener('click', () =>
    copyText(generateComplaintSummary(complaint), 'Summary copied locally.')
  );

  const copyPalsLetter = document.createElement('button');
  copyPalsLetter.type = 'button';
  copyPalsLetter.className = 'secondary';
  copyPalsLetter.textContent = 'Copy PALS letter';
  copyPalsLetter.addEventListener('click', () =>
    copyText(buildPalsLetter(complaint), 'PALS letter copied locally.')
  );

  const copyPhsoLetter = document.createElement('button');
  copyPhsoLetter.type = 'button';
  copyPhsoLetter.className = 'secondary';
  copyPhsoLetter.textContent = 'Copy PHSO escalation letter';
  copyPhsoLetter.addEventListener('click', () =>
    copyText(buildPhsoLetter(complaint), 'PHSO letter copied locally.')
  );

  actions.append(stageForm, advanceBtn, copySummary, copyPalsLetter, copyPhsoLetter);
  detailContent.append(header, grid, timelineSection, notesSection, summarySection, actions);
}

function buildPalsLetter(complaint) {
  const today = new Date().toISOString().slice(0, 10);
  const body = [
    `To: ${complaint.trustName || '[Trust name]'} PALS`,
    `Date: ${today}`,
    `Reference: ${complaint.reference || 'Not provided'}`,
    '',
    `Dear PALS,`,
    '',
    `I am writing to raise a concern regarding my care / the care of ${complaint.patientName || '[Patient name]'}.`,
    '',
    `Organisation: ${complaint.trustName || 'Not specified'}`,
    `Date sent: ${complaint.sentDate || 'Not recorded'}`,
    '',
    `Details of concern:`,
    complaint.description || '[Description of concern]',
    '',
    `I would appreciate it if you could look into this matter and get back to me.`,
    '',
    `Yours sincerely,`,
    complaint.patientName || '[Your name]'
  ];
  return body.join('\n');
}

function buildPhsoLetter(complaint) {
  const today = new Date().toISOString().slice(0, 10);
  const body = [
    `To: Parliamentary and Health Service Ombudsman`,
    `Date: ${today}`,
    '',
    `Dear PHSO,`,
    '',
    `I am writing to complain about the handling of my complaint by ${complaint.trustName || '[Trust name]'}.`,
    '',
    `Complainant: ${complaint.patientName || '[Your name]'}`,
    `Trust: ${complaint.trustName || 'Not specified'}`,
    `Original complaint date: ${complaint.sentDate || 'Not recorded'}`,
    `Trust reference: ${complaint.reference || 'Not provided'}`,
    `Current stage: ${stageName(complaint.stage)}`,
    '',
    `Summary of the complaint:`,
    complaint.description || '[Description of complaint]',
    '',
    `Outcome received:`,
    complaint.outcome || complaint.notes || 'No satisfactory response received.',
    '',
    `I would like the PHSO to investigate whether the trust has handled this complaint properly.`,
    '',
    `Yours sincerely,`,
    complaint.patientName || '[Your name]'
  ];
  return body.join('\n');
}

function updateStage(id, stage) {
  const complaints = loadAll();
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) return;
  complaints[idx] = { ...complaints[idx], stage, updatedAt: new Date().toISOString() };
  saveAll(complaints);
  statusEl.textContent = `Stage updated to ${stageName(stage)}.`;
  renderAll();
}

function deleteComplaint(id) {
  const complaints = loadAll();
  const remaining = complaints.filter((c) => c.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Complaint deleted locally.';
  renderAll();
}

function renderAll() {
  const complaints = loadAll();
  renderSummary(complaints);
  renderList(complaints);
  if (activeId) {
    const complaint = complaints.find((c) => c.id === activeId);
    if (complaint) renderDetail(complaint);
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
  if (!data.organisationName?.trim()) {
    statusEl.textContent = 'Add an organisation name before saving.';
    return;
  }
  const complaints = loadAll();
  const now = new Date().toISOString();
  const newComplaint = createComplaintRecord({
    patientName: data.organisationName,
    trustName: data.organisationName,
    organisationType: data.organisationType,
    stage: data.stage,
    sentDate: data.sentDate,
    reference: data.reference,
    description: data.description,
    notes: data.description,
    outcome: data.outcome,
    createdAt: now,
    updatedAt: now
  });
  complaints.push(newComplaint);
  saveAll(complaints);
  form.reset();
  clearFormDraft();
  activeId = newComplaint.id;
  statusEl.textContent = `Saved complaint for ${newComplaint.trustName}.`;
  renderAll();
}

function handleExport(format) {
  const complaints = loadAll();
  if (complaints.length === 0) {
    statusEl.textContent = 'No complaints to export.';
    return;
  }
  if (format === 'csv') {
    const headers = [
      'id',
      'trustName',
      'organisationType',
      'stage',
      'sentDate',
      'reference',
      'status',
      'createdAt'
    ];
    const rows = complaints.map((c) => [
      c.id,
      csvField(c.trustName),
      c.organisationType || '',
      c.stage,
      c.sentDate,
      csvField(c.reference),
      c.status,
      c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'nhs-complaints.csv', 'text/csv');
  } else {
    downloadText(
      serializeComplaints(complaints.map((c) => createComplaintRecord(c))),
      'nhs-complaints.json',
      'application/json'
    );
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
        const c = createComplaintRecord(item);
        if (!merged.find((e) => e.id === c.id)) merged.push(c);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} complaint(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of complaints.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const complaints = loadAll();
  if (complaints.length === 0) {
    statusEl.textContent = 'No complaints to clear.';
    return;
  }
  if (!confirm(`Delete all ${complaints.length} complaint(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All complaints cleared from this browser.';
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
  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - 30);
  const recent = new Date(today);
  recent.setDate(recent.getDate() - 10);
  const sample = [
    createComplaintRecord({
      patientName: 'Manchester Royal Infirmary',
      trustName: 'Manchester Royal Infirmary',
      organisationType: 'hospital',
      stage: 'formal',
      sentDate: past.toISOString().slice(0, 10),
      reference: 'MRI-FORMAL-2026-001',
      description: 'Delayed discharge and poor communication during inpatient stay in March 2026.',
      notes: 'Trust acknowledged complaint on time but response not yet received.'
    }),
    createComplaintRecord({
      patientName: 'Riverside Medical Practice',
      trustName: 'Riverside Medical Practice',
      organisationType: 'gp',
      stage: 'pals',
      sentDate: recent.toISOString().slice(0, 10),
      reference: 'RMP-PALS-2026-004',
      description:
        'Difficulty accessing repeat prescriptions and long wait times for appointments.',
      notes: 'PALS contacted, awaiting initial response.'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.trustName === s.trustName && e.description === s.description)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample complaints.';
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
