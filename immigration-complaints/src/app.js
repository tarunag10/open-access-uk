// ===== src/app.js =====
// Immigration Complaint Tool — bundled app (all shared modules inlined)

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

// ===== ../shared/immigration/index.mjs (inlined) =====
const COMPLAINT_TYPES = [
  { id: 'visa-delay', name: 'Visa Processing Delay', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Delay in processing visa applications' },
  { id: 'brp-issue', name: 'Biometric Residence Permit Issue', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Issues with BRP card (incorrect details, not received, damaged)' },
  { id: 'sponsorship-complaint', name: 'Sponsorship Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about sponsor licence decisions' },
  { id: 'right-to-rent', name: 'Right to Rent Dispute', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Disputes about right to rent checks' },
  { id: 'asylum-support', name: 'Asylum Support Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about asylum support decisions' },
  { id: 'immigration-detention', name: 'Immigration Detention Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about detention conditions or decisions' }
];

const ESCALATION_ROUTE = ['Home Office', 'ICIBI', 'Parliamentary Ombudsman'];

const REQUIRED_DOCUMENTS = {
  'visa-delay': [
    'Copy of visa application and confirmation email',
    'Application reference number',
    'Proof of submission date',
    'Any correspondence with Home Office',
    'Evidence of urgency (e.g. travel bookings, employment start date)'
  ],
  'brp-issue': [
    'Copy of BRP card (front and back)',
    'Passport or travel document',
    'Application reference number',
    'Proof of collection or delivery attempt',
    'Any correspondence with Home Office'
  ],
  'sponsorship-complaint': [
    'Sponsor licence reference number',
    'Worker reference number',
    'Copy of sponsorship documents',
    'Any correspondence with Home Office',
    'Evidence of financial or reputational impact'
  ],
  'right-to-rent': [
    'Right to Rent check code or share code',
    'Passport or immigration document',
    'Tenancy agreement',
    'Any correspondence with landlord or agent',
    'Evidence of right to rent status'
  ],
  'asylum-support': [
    'Asylum support application reference',
    'National Asylum Support Service (NASS) letter',
    'Evidence of financial hardship',
    'Any correspondence with Home Office',
    'Medical or welfare evidence (if relevant)'
  ],
  'immigration-detention': [
    'Detention centre name and location',
    'Date of detention',
    'Immigration detention reference number',
    'Any correspondence with Home Office',
    'Medical or welfare evidence (if relevant)',
    'Legal representation details'
  ]
};

const HOME_OFFICE_CONTACTS = {
  'visa-delay': { email: 'ukvisafree@fcdo.gov.uk', phone: '0300 123 2241', post: 'UK Visas and Immigration, PO Box 306, Liverpool, L2 8PJ' },
  'brp-issue': { email: 'BRPcollection@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Biometric Residence Permits, PO Box 583, Glasgow, G3 8HN' },
  'sponsorship-complaint': { email: 'sponsorshipcomplaints@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Sponsorship and Licensing, PO Box 306, Liverpool, L2 8PJ' },
  'right-to-rent': { email: 'righttorent@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Immigration Enforcement, PO Box 306, Liverpool, L2 8PJ' },
  'asylum-support': { email: 'asylumsupport@homeoffice.gov.uk', phone: '0808 801 0800', post: 'Asylum Support, PO Box 306, Liverpool, L2 8PJ' },
  'immigration-detention': { email: 'irc@homeoffice.gov.uk', phone: '0808 801 0800', post: 'Immigration Enforcement, PO Box 306, Liverpool, L2 8PJ' }
};

function immigrationTypeById(id) {
  return COMPLAINT_TYPES.find((t) => t.id === id) || null;
}

function getComplaintTypes() {
  return [...COMPLAINT_TYPES];
}

function getComplaintDeadlines(typeId, startDate) {
  const type = immigrationTypeById(typeId);
  if (!type || !startDate) return null;
  const deadlineDate = addWorkingDays(startDate, type.deadlineWorkingDays);
  return {
    type: type.id,
    typeName: type.name,
    deadlineWorkingDays: type.deadlineWorkingDays,
    startDate,
    deadlineDate,
    varies: typeId === 'asylum-support'
  };
}

function generateComplaintText(data) {
  if (!data || !data.complainantName) throw new Error('complainantName is required');
  if (!data.type) throw new Error('type is required');
  const type = immigrationTypeById(data.type);
  const typeName = type ? type.name : data.type;
  const lines = [
    'COMPLAINT TO THE HOME OFFICE',
    '',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'To: Home Office Complaints',
    '',
    `I am writing to make a formal complaint regarding: ${typeName}.`,
    '',
    `Complainant Name: ${data.complainantName}`,
    `Complainant Address: ${data.complainantAddress || 'Not provided'}`,
    `Application Reference: ${data.applicationReference || 'Not provided'}`,
    `Date Submitted: ${data.dateSubmitted || 'Not provided'}`,
    '',
    'Description of Issue:',
    `${data.descriptionOfIssue || 'Not provided'}`,
    '',
    'Desired Outcome:',
    `${data.desiredOutcome || 'Not provided'}`,
    '',
    'I look forward to receiving your acknowledgement within 5 working days and a full response within 20 working days.',
    '',
    'Yours sincerely,',
    data.complainantName
  ];
  return lines.join('\n');
}

function getEscalationRoute(typeId) {
  const type = immigrationTypeById(typeId);
  if (!type) return null;
  return [...ESCALATION_ROUTE];
}

function getRequiredDocuments(typeId) {
  const docs = REQUIRED_DOCUMENTS[typeId];
  if (!docs) return null;
  return [...docs];
}

function generateICIBIText(data) {
  if (!data || !data.complainantName) throw new Error('complainantName is required');
  const lines = [
    'ICIBI COMPLAINT ESCALATION',
    '',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'To: Independent Chief Inspector of Borders and Immigration (ICIBI)',
    '',
    'I am escalating a complaint that has not been resolved through the standard Home Office complaints process.',
    '',
    `Complainant Name: ${data.complainantName}`,
    `Original Complaint Date: ${data.originalComplaintDate || 'Not provided'}`,
    `Home Office Reference: ${data.homeOfficeReference || 'Not provided'}`,
    `Complaint Type: ${data.complaintType || 'Not provided'}`,
    '',
    'Summary of Complaint:',
    `${data.summary || 'Not provided'}`,
    '',
    'The Home Office has failed to provide a satisfactory response within the required timeframe. I request that the ICIBI investigate this matter.',
    '',
    'Yours sincerely,',
    data.complainantName
  ];
  return lines.join('\n');
}

function getHomeOfficeContactInfo(typeId) {
  const info = HOME_OFFICE_CONTACTS[typeId];
  if (!info) return null;
  return { ...info };
}

function serializeImmigration(value) {
  return JSON.stringify(value);
}

function parseImmigration(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ===== src/tracker.js (inlined) =====
function typeById(id) {
  return COMPLAINT_TYPES.find((t) => t.id === id) || null;
}

function calculateDaysRemaining(sentDate, typeId, today = new Date()) {
  const deadline = getComplaintDeadlines(typeId, sentDate);
  if (!deadline || !deadline.deadlineDate) return null;

  const match = String(deadline.deadlineDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const target = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((target - today_) / (1000 * 60 * 60 * 24));
}

function filterByType(complaints, typeId) {
  if (!typeId) return complaints;
  return complaints.filter((c) => c.complaintType === typeId);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderComplaintCard(complaint) {
  const type = typeById(complaint.complaintType);
  const days = calculateDaysRemaining(complaint.dateSubmitted, complaint.complaintType);

  let deadlineText = 'Add a submission date to see the deadline.';
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
      <h3>${escapeHtml(complaint.complainantName || 'Untitled complaint')}</h3>
      <span class="status-pill type-${complaint.complaintType}">${type ? type.name : complaint.complaintType}</span>
    </header>
    <p class="meta">${escapeHtml(complaint.description || 'No description')} — ${complaint.dateSubmitted || 'not submitted'}</p>
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
      'No immigration complaints yet. Add one using the form to start tracking.';
    container.append(empty);
    return;
  }
  const sorted = [...complaints].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.dateSubmitted, a.complaintType);
    const bDays = calculateDaysRemaining(b.dateSubmitted, b.complaintType);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const complaint of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(complaint.dateSubmitted, complaint.complaintType);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderComplaintCard(complaint);
    container.append(item);
  }
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
const STORAGE_KEY = 'open-access-uk:immigration-complaints:complaints';
const FORM_KEY = 'open-access-uk:immigration-complaints:form-draft';

const form = document.querySelector('#complaint-form');
const list = document.querySelector('#complaint-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
let activeId = null;

function loadAll() {
  return parseImmigration(localStorage.getItem(STORAGE_KEY));
}

function saveAll(complaints) {
  localStorage.setItem(STORAGE_KEY, serializeImmigration(complaints));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function generateComplaintId() {
  return 'icmp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function createImmigrationComplaint(data) {
  return {
    id: generateComplaintId(),
    createdAt: new Date().toISOString(),
    status: 'open',
    complaintType: data.complaintType || 'visa-delay',
    complainantName: data.complainantName,
    complainantAddress: data.complainantAddress || '',
    applicationReference: data.applicationReference || '',
    dateSubmitted: data.dateSubmitted || '',
    description: data.description || '',
    desiredOutcome: data.desiredOutcome || ''
  };
}

function renderSummary(complaints) {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'open').length;
  const visaDelay = complaints.filter((c) => c.complaintType === 'visa-delay').length;
  const brpIssue = complaints.filter((c) => c.complaintType === 'brp-issue').length;
  const sponsorship = complaints.filter((c) => c.complaintType === 'sponsorship-complaint').length;

  const cards = [
    { label: 'Total complaints', value: total, tone: 'default' },
    { label: 'Open', value: open, tone: 'default' },
    { label: 'Visa delays', value: visaDelay, tone: 'default' },
    { label: 'BRP issues', value: brpIssue, tone: 'default' },
    { label: 'Sponsorship', value: sponsorship, tone: 'default' }
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

  const breakdownPanel = document.querySelector('#type-breakdown');
  if (breakdownPanel) {
    breakdownPanel.replaceChildren(
      ...COMPLAINT_TYPES.map((t) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = t.name;
        const value = document.createElement('span');
        value.textContent = complaints.filter((c) => c.complaintType === t.id).length;
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
  const type = typeById(complaint.complaintType);
  const days = calculateDaysRemaining(complaint.dateSubmitted, complaint.complaintType);
  const contacts = getHomeOfficeContactInfo(complaint.complaintType);
  const docs = getRequiredDocuments(complaint.complaintType);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = complaint.complainantName || 'Untitled complaint';
  const status = document.createElement('span');
  status.className = `status-pill type-${complaint.complaintType}`;
  status.textContent = type ? type.name : complaint.complaintType;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Complaint type', type ? type.name : complaint.complaintType],
    ['Application reference', complaint.applicationReference || 'Not provided'],
    ['Date submitted', complaint.dateSubmitted || 'Not recorded'],
    ['Description', complaint.description || 'Not specified'],
    ['Desired outcome', complaint.desiredOutcome || 'Not specified'],
    [
      'Deadline',
      days === null
        ? 'Add a submission date'
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

  const contactSection = document.createElement('section');
  const contactHeading = document.createElement('h3');
  contactHeading.textContent = 'Home Office contact';
  contactSection.append(contactHeading);
  if (contacts) {
    const contactList = document.createElement('div');
    contactList.className = 'body-text';
    contactList.textContent = `Email: ${contacts.email}\nPhone: ${contacts.phone}\nPost: ${contacts.post}`;
    contactSection.append(contactList);
  }

  const docsSection = document.createElement('section');
  const docsHeading = document.createElement('h3');
  docsHeading.textContent = 'Document checklist';
  docsSection.append(docsHeading);
  if (docs) {
    const ul = document.createElement('ul');
    ul.className = 'body-text';
    for (const doc of docs) {
      const li = document.createElement('li');
      li.textContent = doc;
      ul.append(li);
    }
    docsSection.append(ul);
  }

  const escalationSection = document.createElement('section');
  const escalationHeading = document.createElement('h3');
  escalationHeading.textContent = 'Escalation route';
  escalationSection.append(escalationHeading);
  const route = getEscalationRoute(complaint.complaintType);
  if (route) {
    const routeText = document.createElement('div');
    routeText.className = 'body-text';
    routeText.textContent = route.join(' → ');
    escalationSection.append(routeText);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyComplaint = document.createElement('button');
  copyComplaint.type = 'button';
  copyComplaint.textContent = 'Copy complaint letter';
  copyComplaint.addEventListener('click', () =>
    copyText(buildComplaintLetter(complaint), 'Complaint letter copied locally.')
  );

  const copyICIBI = document.createElement('button');
  copyICIBI.type = 'button';
  copyICIBI.className = 'secondary';
  copyICIBI.textContent = 'Copy ICIBI escalation';
  copyICIBI.addEventListener('click', () =>
    copyText(buildICIBILetter(complaint), 'ICIBI letter copied locally.')
  );

  actions.append(copyComplaint, copyICIBI);
  detailContent.append(header, grid, contactSection, docsSection, escalationSection, actions);
}

function buildComplaintLetter(complaint) {
  return generateComplaintText({
    complainantName: complaint.complainantName,
    type: complaint.complaintType,
    complainantAddress: complaint.complainantAddress,
    applicationReference: complaint.applicationReference,
    dateSubmitted: complaint.dateSubmitted,
    descriptionOfIssue: complaint.description,
    desiredOutcome: complaint.desiredOutcome
  });
}

function buildICIBILetter(complaint) {
  return generateICIBIText({
    complainantName: complaint.complainantName,
    originalComplaintDate: complaint.dateSubmitted,
    homeOfficeReference: complaint.applicationReference,
    complaintType: typeById(complaint.complaintType)?.name || complaint.complaintType,
    summary: complaint.description
  });
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
  if (!data.complainantName?.trim()) {
    statusEl.textContent = 'Add a complainant name before saving.';
    return;
  }
  const complaints = loadAll();
  const newComplaint = createImmigrationComplaint({
    complaintType: data.complaintType,
    complainantName: data.complainantName,
    complainantAddress: data.complainantAddress,
    applicationReference: data.applicationReference,
    dateSubmitted: data.dateSubmitted,
    description: data.description,
    desiredOutcome: data.desiredOutcome
  });
  complaints.push(newComplaint);
  saveAll(complaints);
  form.reset();
  clearFormDraft();
  activeId = newComplaint.id;
  statusEl.textContent = `Saved complaint for ${newComplaint.complainantName}.`;
  renderAll();
}

function handleExport(format) {
  const complaints = loadAll();
  if (complaints.length === 0) {
    statusEl.textContent = 'No complaints to export.';
    return;
  }
  if (format === 'csv') {
    const headers = ['id', 'complainantName', 'complaintType', 'applicationReference', 'dateSubmitted', 'status', 'createdAt'];
    const rows = complaints.map((c) => [
      c.id,
      csvField(c.complainantName),
      c.complaintType,
      csvField(c.applicationReference),
      c.dateSubmitted,
      c.status,
      c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'immigration-complaints.csv', 'text/csv');
  } else {
    downloadText(serializeImmigration(complaints), 'immigration-complaints.json', 'application/json');
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
        const c = createImmigrationComplaint(item);
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
  const sample = [
    createImmigrationComplaint({
      complainantName: 'Jane Smith',
      complaintType: 'visa-delay',
      applicationReference: 'GWF987654321',
      dateSubmitted: '2026-05-15',
      description: 'Visitor visa application submitted over 8 weeks ago, no decision received. Travel booked for 1 July 2026.',
      desiredOutcome: 'Immediate decision on application or expedited processing due to travel dates.'
    }),
    createImmigrationComplaint({
      complainantName: 'Ahmed Khan',
      complaintType: 'brp-issue',
      applicationReference: 'BRP-2026-555123',
      dateSubmitted: '2026-06-10',
      description: 'BRP card received with incorrect name spelling. Collection appointment missed due to post office delay.',
      desiredOutcome: 'Corrected BRP card issued with accurate details.'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.complainantName === s.complainantName && e.description === s.description)) {
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
