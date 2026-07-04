// accessible-formats-request/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs accessible-formats-request

// ===== ../../shared/accessible-formats/index.mjs =====
const FORMATS = [
  {
    id: 'braille',
    name: 'Braille',
    description: 'Grade 2 (Contracted) Braille',
    supplier: 'RNIB',
    source: 'rnib-braille-standards',
    minLeadTime: '2 weeks'
  },
  {
    id: 'large-print',
    name: 'Large Print',
    description: 'Minimum 16pt font, sans-serif, high contrast',
    supplier: 'RNIB',
    source: 'rnib-large-print',
    minLeadTime: '1 week'
  },
  {
    id: 'audio',
    name: 'Audio Format',
    description: 'MP3 or DAISY format with clear narration',
    supplier: 'RNIB',
    source: 'rnib-audio',
    minLeadTime: '1 week'
  },
  {
    id: 'easy-read',
    name: 'Easy Read',
    description: 'Simplified language, images, Mencap standards',
    supplier: 'Mencap',
    source: 'mencap-easy-read',
    minLeadTime: '2 weeks'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Electronic format via email',
    supplier: 'Self',
    source: 'accessibility-act',
    minLeadTime: 'Immediate'
  },
  {
    id: 'telephone',
    name: 'Telephone',
    description: 'Information provided over the phone',
    supplier: 'Self',
    source: 'accessibility-act',
    minLeadTime: 'Immediate'
  },
  {
    id: 'bsl',
    name: 'British Sign Language',
    description: 'BSL interpreter or video relay',
    supplier: 'RNID',
    source: 'rnid-bsl',
    minLeadTime: '1 week'
  },
  {
    id: 'welsh',
    name: 'Welsh Language',
    description: 'Cymraeg / Welsh language format',
    supplier: 'Welsh Language Commissioner',
    source: 'welsh-language-standards',
    minLeadTime: '1 week'
  }
];

const FORMAT_REQUIREMENTS = {
  braille: [
    'Grade 2 (Contracted) Braille',
    'Nemeth code for mathematics',
    'Proper formatting with line spacing',
    'Cover sheet with print and Braille'
  ],
  'large-print': [
    'Minimum 16pt sans-serif font (Arial or Verdana)',
    'High contrast black on white or yellow',
    'Left-aligned text, no justified alignment',
    'Minimum 1.5 line spacing'
  ],
  audio: [
    'MP3 or DAISY format',
    'Clear, slow narration',
    'Consistent volume levels',
    'Track markers for navigation'
  ],
  'easy-read': [
    'Simplified language at reading age 8-9',
    'One idea per sentence',
    'Supporting images on each page',
    'Mencap Easy Read standards',
    'Clear layout with white space'
  ],
  email: [
    'Accessible HTML or plain text',
    'Descriptive subject line',
    'Structured headings',
    'Alt text for images'
  ],
  telephone: [
    'Dedicated phone line or callback',
    'Clear, slow speech',
    'Written summary available on request'
  ],
  bsl: [
    'Qualified BSL interpreter',
    'Video relay service available',
    'British Sign Language video recording'
  ],
  welsh: [
    'Translated by certified Welsh translator',
    'Cymraeg formatting standards',
    'Welsh Language Commissioner compliance'
  ]
};

const ORGANISATION_ROUTES = {
  braille: {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for transcription'
  },
  'large-print': {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for large print conversion'
  },
  audio: {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for audio recording'
  },
  'easy-read': {
    name: 'Mencap',
    website: 'https://www.mencap.org.uk',
    process: 'Submit document for Easy Read adaptation'
  },
  email: {
    name: 'Self (organisations own email)',
    website: null,
    process: 'Request electronic copy via email'
  },
  telephone: {
    name: 'Self (organisations phone line)',
    website: null,
    process: 'Request telephone information directly'
  },
  bsl: {
    name: 'RNID (Royal National Institute for Deaf People)',
    website: 'https://rnid.org.uk',
    process: 'Arrange BSL interpreter or video relay'
  },
  welsh: {
    name: 'Welsh Language Commissioner',
    website: 'https://www.welshlanguagecommissioner.wales',
    process: 'Request Welsh language format'
  }
};

function getFormats() {
  return [...FORMATS];
}

function getFormatDetails(formatId) {
  const format = FORMATS.find((f) => f.id === formatId);
  return format ? { ...format } : null;
}

function generateRequestText(data) {
  const lines = [];
  lines.push('Accessible Format Request');
  lines.push('');
  lines.push(`To: ${data.organisationName}`);
  lines.push('');
  lines.push(`From: ${data.requestorName}`);
  lines.push(`Address: ${data.requestorAddress}`);
  lines.push('');
  lines.push(`Requested Format: ${data.format}`);
  lines.push(
    `Documents: ${Array.isArray(data.documents) ? data.documents.join(', ') : data.documents}`
  );
  lines.push(`Deadline: ${data.deadline}`);
  lines.push('');
  if (data.reason) {
    lines.push(`Reason: ${data.reason}`);
  }
  lines.push('');
  lines.push('This request is made under the Equality Act 2010, which requires public');
  lines.push(
    'authorities to provide information in accessible formats as a reasonable adjustment.'
  );
  lines.push('');
  lines.push('Please confirm receipt of this request and provide a timeline for delivery.');
  return lines.join('\n');
}

function getFormatRequirements(formatId) {
  const reqs = FORMAT_REQUIREMENTS[formatId];
  return reqs ? [...reqs] : [];
}

function getOrganisationRoutes(formatId) {
  const route = ORGANISATION_ROUTES[formatId];
  return route ? { ...route } : null;
}

function getEqualityActRights() {
  return {
    title: 'Equality Act 2010 - Reasonable Adjustments',
    description:
      'Under the Equality Act 2010, public authorities must make reasonable adjustments to ensure disabled people are not placed at a substantial disadvantage.',
    rights: [
      'Right to request information in an accessible format',
      'Right to reasonable adjustments without charge',
      'Right to receive information within a reasonable timeframe',
      'Right to complain to the Equality and Human Rights Commission if rights are not upheld'
    ]
  };
}

function getMonitoringInfo() {
  return {
    name: 'Equality and Human Rights Commission',
    description:
      'The Equality and Human Rights Commission (EHRC) monitors and enforces equality legislation in England, Scotland and Wales.',
    website: 'https://www.equalityhumanrights.com',
    complaintProcess:
      'You can contact the EHRC if your reasonable adjustment rights under the Equality Act 2010 are not being met.'
  };
}

function serializeAccessibleFormats(value) {
  return JSON.stringify(value);
}

function parseAccessibleFormats(value) {
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
  { value: 'council', label: 'Local Authority / Council' },
  { value: 'nhs', label: 'NHS Organisation' },
  { value: 'government', label: 'Government Department' },
  { value: 'school', label: 'School / Academy' },
  { value: 'university', label: 'University' },
  { value: 'other', label: 'Other Public Authority' }
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

function renderRequestCard(request) {
  const format = getFormatDetails(request.format);
  const orgType = ORGANISATION_TYPES.find((t) => t.value === request.organisationType);

  return `
    <header>
      <h3>${escapeHtml(request.organisationName || 'Untitled request')}</h3>
      <span class="status-pill format-${request.format}">${format ? format.name : request.format}</span>
    </header>
    <p class="meta">${escapeHtml(orgType ? orgType.label : request.organisationType || 'Unknown type')} — ${request.deadline || 'No deadline set'}</p>
    <p class="meta">${escapeHtml(request.documents || 'No documents specified')}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${request.id}">View</button>
      <button type="button" data-action="delete" data-id="${request.id}" class="secondary">Delete</button>
    </div>`;
}

function renderRequestList(requests, container) {
  container.replaceChildren();
  if (requests.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No requests yet. Use the form to generate an accessible formats request.';
    container.append(empty);
    return;
  }
  const sorted = [...requests].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const request of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    item.innerHTML = renderRequestCard(request);
    container.append(item);
  }
}

function renderFormatRequirements(formatId, container) {
  const reqs = getFormatRequirements(formatId);
  container.replaceChildren();
  if (reqs.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No specific requirements for this format.';
    container.append(p);
    return;
  }
  for (const req of reqs) {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    const label = document.createElement('span');
    label.textContent = req;
    row.append(label);
    container.append(row);
  }
}

export {
  ORGANISATION_TYPES,
  escapeHtml,
  renderRequestCard,
  renderRequestList,
  renderFormatRequirements,
  getFormats,
  getFormatDetails,
  generateRequestText,
  getFormatRequirements,
  getOrganisationRoutes,
  getEqualityActRights,
  getMonitoringInfo,
  serializeAccessibleFormats,
  parseAccessibleFormats
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
const STORAGE_KEY = 'open-access-uk:accessible-formats-request:requests';
const FORM_KEY = 'open-access-uk:accessible-formats-request:form-draft';

const form = document.querySelector('#request-form');
const list = document.querySelector('#request-list');
const outputContent = document.querySelector('#output-content');
const formatRequirements = document.querySelector('#format-requirements');
const statusEl = document.querySelector('#form-status');
let activeId = null;

function loadAll() {
  return parseAccessibleFormats(localStorage.getItem(STORAGE_KEY));
}

function saveAll(requests) {
  localStorage.setItem(STORAGE_KEY, serializeAccessibleFormats(requests));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function generateId() {
  return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function renderOutput(data) {
  const requestText = generateRequestText(data);
  const route = getOrganisationRoutes(data.format);
  const rights = getEqualityActRights();
  const monitoring = getMonitoringInfo();

  let html = '<div class="output-section">';
  html += '<h4>Request letter</h4>';
  html += `<pre class="code-window">${escapeHtml(requestText)}</pre>`;
  html += '</div>';

  html += '<div class="output-section">';
  html += `<h4>${rights.title}</h4>`;
  html += `<p>${escapeHtml(rights.description)}</p>`;
  html += '<ul>';
  for (const r of rights.rights) {
    html += `<li>${escapeHtml(r)}</li>`;
  }
  html += '</ul>';
  html += '</div>';

  if (route) {
    html += '<div class="output-section">';
    html += `<h4>Supplier: ${escapeHtml(route.name)}</h4>`;
    if (route.website) {
      html += `<p><a href="${route.website}" target="_blank" rel="noopener noreferrer">${route.website}</a></p>`;
    }
    html += `<p>${escapeHtml(route.process)}</p>`;
    html += '</div>';
  }

  html += '<div class="output-section">';
  html += `<h4>Monitoring body: ${escapeHtml(monitoring.name)}</h4>`;
  html += `<p>${escapeHtml(monitoring.description)}</p>`;
  html += `<p><a href="${monitoring.website}" target="_blank" rel="noopener noreferrer">${monitoring.website}</a></p>`;
  html += '</div>';

  outputContent.innerHTML = html;

  renderFormatRequirements(data.format, formatRequirements);
}

function renderList(requests) {
  renderRequestList(requests, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (req) {
        renderOutput(req);
        activeId = req.id;
      }
    });
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteRequest(btn.dataset.id));
  });
}

function renderAll() {
  const requests = loadAll();
  renderList(requests);
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

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function handleAdd(event) {
  event.preventDefault();
  const data = values();
  if (!data.requestorName?.trim() || !data.organisationName?.trim() || !data.documents?.trim()) {
    statusEl.textContent = 'Please fill in your name, organisation name, and documents.';
    return;
  }
  const requests = loadAll();
  const now = new Date().toISOString();
  const newRequest = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    ...data
  };
  requests.push(newRequest);
  saveAll(requests);
  renderOutput(data);
  activeId = newRequest.id;
  form.reset();
  clearFormDraft();
  statusEl.textContent = `Request generated for ${newRequest.organisationName}.`;
  renderAll();
}

function handleExport(format) {
  const requests = loadAll();
  if (requests.length === 0) {
    statusEl.textContent = 'No requests to export.';
    return;
  }
  if (format === 'csv') {
    const headers = [
      'id',
      'requestorName',
      'organisationName',
      'organisationType',
      'format',
      'documents',
      'deadline',
      'createdAt'
    ];
    const rows = requests.map((r) => [
      r.id,
      csvField(r.requestorName),
      csvField(r.organisationName),
      r.organisationType || '',
      r.format,
      csvField(r.documents),
      r.deadline || '',
      r.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'accessible-format-requests.csv', 'text/csv');
  } else {
    downloadText(
      serializeAccessibleFormats(requests),
      'accessible-format-requests.json',
      'application/json'
    );
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
        if (!merged.find((e) => e.id === item.id)) merged.push(item);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} request(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of requests.';
    }
  };
  reader.readAsText(file);
}

function deleteRequest(id) {
  const requests = loadAll();
  const remaining = requests.filter((r) => r.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    outputContent.innerHTML =
      '<div class="empty-state">Select a request to view its details.</div>';
  }
  statusEl.textContent = 'Request deleted locally.';
  renderAll();
}

function handleClearAll() {
  const requests = loadAll();
  if (requests.length === 0) {
    statusEl.textContent = 'No requests to clear.';
    return;
  }
  if (!confirm(`Delete all ${requests.length} request(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  outputContent.innerHTML =
    '<div class="empty-state">Fill in the form and click "Generate request" to create your letter.</div>';
  statusEl.textContent = 'All requests cleared from this browser.';
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
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      requestorName: 'Jane Smith',
      requestorAddress: '123 High Street, London, SW1A 1AA',
      organisationName: 'Manchester City Council',
      organisationType: 'council',
      format: 'braille',
      documents: 'Council tax bill, Housing application form',
      deadline: '2026-07-31',
      reason: 'I am blind and require braille to read correspondence.'
    },
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      requestorName: 'John Doe',
      requestorAddress: '456 Oak Avenue, Birmingham, B1 1AA',
      organisationName: 'NHS England',
      organisationType: 'nhs',
      format: 'easy-read',
      documents: 'Annual report 2026, Patient information leaflet',
      deadline: '2026-08-15',
      reason: 'I have a learning disability and need easy read versions.'
    }
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.organisationName === s.organisationName && e.format === s.format)) {
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
