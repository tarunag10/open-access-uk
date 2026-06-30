// ===== src/app.js =====
// Deadline Cascade Visualizer — bundled app

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

function formatDateForDisplay(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildICS(title, dateStr, description) {
  const date = parseLocalDate(dateStr);
  if (!date) return null;
  const dtStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('');
  return [
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtStr}`,
    `DTEND;VALUE=DATE:${dtStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT'
  ].join('\r\n');
}

// ===== ../shared/cascade/index.mjs =====
const CASCADE_TEMPLATES = [
  {
    id: 'foi-complaint',
    name: 'FOI Complaint',
    description: 'Track FOI request through internal review and ICO complaint',
    steps: [
      { name: 'Initial FOI Request', offsetDays: 0, workingDays: false, description: 'Submit FOI request' },
      { name: 'Response Deadline', offsetDays: 20, workingDays: true, description: 'Authority must respond within 20 working days' },
      { name: 'Internal Review', offsetDays: 40, workingDays: true, description: 'Request internal review if unsatisfied' },
      { name: 'ICO Complaint', offsetDays: 60, workingDays: true, description: 'Complain to ICO if still unsatisfied' }
    ],
    source: 'foia-2000'
  },
  {
    id: 'nhs-complaint',
    name: 'NHS Complaint',
    description: 'Track NHS complaint through PALS, formal, and PHSO stages',
    steps: [
      { name: 'PALS Contact', offsetDays: 0, workingDays: false, description: 'Contact Patient Advice and Liaison Service' },
      { name: 'PALS Acknowledgement', offsetDays: 3, workingDays: true, description: 'PALS should acknowledge within 3 working days' },
      { name: 'PALS Response', offsetDays: 25, workingDays: true, description: 'PALS should respond within 25 working days' },
      { name: 'Formal Complaint', offsetDays: 30, workingDays: false, description: 'Submit formal written complaint to trust' },
      { name: 'Trust Response', offsetDays: 55, workingDays: true, description: 'Trust should respond within 25 working days' },
      { name: 'PHSO Complaint', offsetDays: 365, workingDays: false, description: 'Escalate to Parliamentary and Health Service Ombudsman within 12 months' }
    ],
    source: 'nhs-england-complaints'
  },
  {
    id: 'housing-repair',
    name: 'Housing Repair',
    description: 'Track repair request through housing ombudsman stages',
    steps: [
      { name: 'Repair Reported', offsetDays: 0, workingDays: false, description: 'Report repair to landlord' },
      { name: 'Emergency Deadline', offsetDays: 1, workingDays: false, description: 'Emergency repairs should be completed within 24 hours' },
      { name: 'Urgent Deadline', offsetDays: 5, workingDays: true, description: 'Urgent repairs within 5 working days' },
      { name: 'Routine Deadline', offsetDays: 28, workingDays: false, description: 'Routine repairs within 28 calendar days' },
      { name: 'Stage 1 Complaint', offsetDays: 56, workingDays: false, description: 'Landlord Stage 1 investigation (56 days)' },
      { name: 'Stage 2 Complaint', offsetDays: 112, workingDays: false, description: 'Landlord Stage 2 review (56 days)' },
      { name: 'Housing Ombudsman', offsetDays: 180, workingDays: false, description: 'Escalate to Housing Ombudsman' }
    ],
    source: 'housing-ombudsman-guidance'
  },
  {
    id: 'benefits-appeal',
    name: 'Benefits Appeal',
    description: 'Track benefits appeal through mandatory reconsideration and tribunal',
    steps: [
      { name: 'Decision Received', offsetDays: 0, workingDays: false, description: 'Receive benefits decision' },
      { name: 'Mandatory Reconsideration', offsetDays: 30, workingDays: false, description: 'Request mandatory reconsideration within 1 calendar month' },
      { name: 'MR Response', offsetDays: 56, workingDays: false, description: 'DWP should respond within 8 weeks' },
      { name: 'Tribunal Appeal', offsetDays: 77, workingDays: false, description: 'Appeal to First-tier Tribunal within 1 calendar month of MR decision' },
      { name: 'Tribunal Hearing', offsetDays: 180, workingDays: false, description: 'Tribunal hearing typically scheduled within 6 months' }
    ],
    source: 'dwp-appeals-guidance'
  }
];

function getCascadeTemplates() {
  return CASCADE_TEMPLATES;
}

function getTemplate(templateId) {
  const template = CASCADE_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return template;
}

function buildCascade(templateId, startDate) {
  const date = parseLocalDate(startDate);
  if (!date) throw new Error('Invalid start date');
  const template = getTemplate(templateId);

  return template.steps.map((step, index) => {
    let deadline;
    if (index === 0) {
      deadline = toLocalDateString(date);
    } else if (step.workingDays) {
      deadline = addWorkingDays(startDate, step.offsetDays);
    } else {
      const result = new Date(date.getTime());
      result.setUTCDate(result.getUTCDate() + step.offsetDays);
      deadline = toLocalDateString(result);
    }

    return {
      name: step.name,
      deadline,
      description: step.description,
      index,
      workingDays: step.workingDays
    };
  });
}

function getStepStatus(step, currentDate) {
  const current = parseLocalDate(currentDate);
  const deadline = parseLocalDate(step.deadline);
  if (!current || !deadline) return 'unknown';

  if (current > deadline) return 'overdue';
  if (current.getTime() === deadline.getTime()) return 'completed';
  return 'current';
}

function calculateCascadeProgress(cascade, currentDate) {
  if (!cascade || cascade.length === 0) return 0;
  const current = parseLocalDate(currentDate);
  if (!current) return 0;

  let completed = 0;
  for (const step of cascade) {
    const deadline = parseLocalDate(step.deadline);
    if (deadline && current >= deadline) completed++;
  }

  return Math.round((completed / cascade.length) * 100);
}

function exportCascadeICS(cascade) {
  if (!cascade || cascade.length === 0) return '';

  const events = [];
  for (const step of cascade) {
    const event = buildICS(step.name, step.deadline, step.description);
    if (event) {
      const lines = event.split('\r\n');
      for (const line of lines) {
        if (!line.startsWith('BEGIN:VCALENDAR') &&
            !line.startsWith('VERSION:2.0') &&
            !line.startsWith('PRODID:') &&
            !line.startsWith('END:VCALENDAR')) {
          events.push(line);
        }
      }
    }
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Cascade//EN',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');
}

function serializeCascade(value) {
  try { return JSON.stringify(value); } catch { return null; }
}

function parseCascade(value) {
  if (value === null || value === undefined) return null;
  try { return JSON.parse(value); } catch { return null; }
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
const STORAGE_KEY = 'open-access-uk:deadline-cascade:cascades';

const form = document.querySelector('#cascade-form');
const list = document.querySelector('#cascade-list');
const summary = document.querySelector('#summary');
const timelinePanel = document.querySelector('#cascade-timeline');
const statusEl = document.querySelector('#form-status');

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

function saveAll(cascades) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cascades));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function templateClass(templateId) {
  const map = { 'foi-complaint': 'template-foi', 'nhs-complaint': 'template-nhs', 'housing-repair': 'template-housing', 'benefits-appeal': 'template-benefits' };
  return map[templateId] || '';
}

function templateLabel(templateId) {
  const t = CASCADE_TEMPLATES.find(x => x.id === templateId);
  return t ? t.name : templateId;
}

function getOverallStatus(cascade, today) {
  const todayDate = parseLocalDate(today);
  if (!todayDate) return 'upcoming';
  for (const step of cascade) {
    const status = getStepStatus(step, today);
    if (status === 'overdue') return 'overdue';
  }
  const progress = calculateCascadeProgress(cascade, today);
  if (progress === 100) return 'completed';
  return 'active';
}

function renderSummary(cascades) {
  const total = cascades.length;
  const today = new Date().toISOString().slice(0, 10);
  const active = cascades.filter(c => getOverallStatus(c.cascade, today) === 'active').length;
  const overdue = cascades.filter(c => getOverallStatus(c.cascade, today) === 'overdue').length;
  const completed = cascades.filter(c => getOverallStatus(c.cascade, today) === 'completed').length;

  const cards = [
    { label: 'Total cascades', value: total },
    { label: 'Active', value: active },
    { label: 'Overdue', value: overdue, tone: overdue > 0 ? 'warning' : '' },
    { label: 'Completed', value: completed }
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
}

function renderTimeline(cascade, today) {
  const container = document.createElement('div');
  container.className = 'cascade-timeline';
  container.setAttribute('role', 'list');
  container.setAttribute('aria-label', 'Deadline timeline');

  const progress = calculateCascadeProgress(cascade, today);

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-valuenow', String(progress));
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-label', `Cascade progress: ${progress}%`);
  const fill = document.createElement('div');
  fill.className = 'progress-bar-fill';
  fill.style.width = `${progress}%`;
  progressBar.append(fill);
  container.append(progressBar);

  for (const step of cascade) {
    const status = getStepStatus(step, today);
    const li = document.createElement('li');
    li.className = `step-${status}`;
    li.setAttribute('role', 'listitem');

    const strong = document.createElement('strong');
    strong.textContent = step.name;

    const span = document.createElement('span');
    span.textContent = `${formatDateForDisplay(step.deadline)} — ${step.description}`;

    if (status === 'overdue') {
      const badge = document.createElement('span');
      badge.textContent = ' [OVERDUE]';
      badge.style.color = 'var(--danger)';
      badge.style.fontWeight = '700';
      strong.append(badge);
    }

    li.append(strong, span);
    container.append(li);
  }

  return container;
}

function renderCascadeCard(cascade, today) {
  const progress = calculateCascadeProgress(cascade, today);
  const status = getOverallStatus(cascade, today);
  const daysLeft = (() => {
    const last = cascade[cascade.length - 1];
    if (!last) return null;
    const deadline = parseLocalDate(last.deadline);
    const current = parseLocalDate(today);
    if (!deadline || !current) return null;
    return Math.round((deadline - current) / (1000 * 60 * 60 * 24));
  })();

  let statusText = `${progress}% complete`;
  if (status === 'overdue') statusText = 'Overdue';
  if (status === 'completed') statusText = 'Completed';

  let daysText = '';
  if (daysLeft !== null) {
    if (daysLeft < 0) daysText = ` · ${Math.abs(daysLeft)} day(s) past final deadline`;
    else if (daysLeft === 0) daysText = ' · Final deadline is today';
    else daysText = ` · ${daysLeft} day(s) to final deadline`;
  }

  return `
    <header>
      <h3>${escapeHtml(cascade.name || templateLabel(cascade.templateId))}</h3>
      <span class="status-pill ${templateClass(cascade.templateId)}">${templateLabel(cascade.templateId)}</span>
    </header>
    <p class="meta">Started ${cascade.startDate} · ${cascade.cascade.length} steps${daysText}</p>
    <p class="deadline${status === 'overdue' ? ' status-overdue' : ''}">${statusText}</p>
    <div class="progress-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar-fill" style="width:${progress}%"></div>
    </div>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${cascade.id}">View</button>
      <button type="button" data-action="delete" data-id="${cascade.id}" class="secondary">Delete</button>
    </div>`;
}

function renderList(cascades) {
  list.replaceChildren();
  if (cascades.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No cascades yet. Build one using the form above to start tracking deadlines.';
    list.append(empty);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...cascades].sort((a, b) => {
    const aStatus = getOverallStatus(a.cascade, today);
    const bStatus = getOverallStatus(b.cascade, today);
    const priority = { overdue: 0, active: 1, completed: 2, upcoming: 3 };
    const aP = priority[aStatus] ?? 3;
    const bP = priority[bStatus] ?? 3;
    if (aP !== bP) return aP - bP;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const cascade of sorted) {
    const item = document.createElement('article');
    item.className = 'cascade-item';
    const status = getOverallStatus(cascade.cascade, today);
    if (status === 'overdue') item.classList.add('overdue');
    item.innerHTML = renderCascadeCard(cascade, today);
    list.append(item);
  }

  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectCascade(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteCascade(btn.dataset.id));
  });
}

let activeId = null;

function selectCascade(id) {
  activeId = id;
  const cascades = loadAll();
  const cascade = cascades.find(c => c.id === id);
  if (!cascade) return;
  const today = new Date().toISOString().slice(0, 10);
  timelinePanel.replaceChildren();
  timelinePanel.append(renderTimeline(cascade.cascade, today));
  renderList(cascades);
}

function deleteCascade(id) {
  const cascades = loadAll().filter(c => c.id !== id);
  saveAll(cascades);
  if (activeId === id) {
    activeId = null;
    timelinePanel.replaceChildren();
  }
  statusEl.textContent = 'Cascade deleted locally.';
  renderAll();
}

function renderAll() {
  const cascades = loadAll();
  renderSummary(cascades);
  renderList(cascades);
  if (activeId) selectCascade(activeId);
}

function handleBuild(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.startDate) {
    statusEl.textContent = 'Select a start date before building.';
    return;
  }

  let cascade;
  try {
    cascade = buildCascade(data.template, data.startDate);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    return;
  }

  const record = {
    id: 'csc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    templateId: data.template,
    name: data.cascadeName || '',
    startDate: data.startDate,
    cascade
  };

  const cascades = loadAll();
  cascades.push(record);
  saveAll(cascades);

  activeId = record.id;
  statusEl.textContent = `Built ${templateLabel(data.template)} cascade with ${cascade.length} steps.`;
  renderAll();
  selectCascade(record.id);
}

function handleExport(format) {
  const cascades = loadAll();
  if (cascades.length === 0) {
    statusEl.textContent = 'No cascades to export.';
    return;
  }

  if (format === 'ics') {
    const allEvents = [];
    for (const c of cascades) {
      for (const step of c.cascade) {
        const event = buildICS(step.name, step.deadline, step.description);
        if (event) allEvents.push(event);
      }
    }
    if (allEvents.length === 0) {
      statusEl.textContent = 'No events to export.';
      return;
    }
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Open Access UK//Deadline Cascade//EN',
      ...allEvents,
      'END:VCALENDAR'
    ].join('\r\n');
    downloadText(ics, 'deadline-cascade.ics', 'text/calendar');
  } else if (format === 'csv') {
    const headers = ['cascade', 'step', 'deadline', 'description', 'workingDays'];
    const rows = [];
    for (const c of cascades) {
      for (const step of c.cascade) {
        rows.push([
          csvField(c.name || templateLabel(c.templateId)),
          csvField(step.name),
          step.deadline,
          csvField(step.description),
          step.workingDays ? 'yes' : 'no'
        ]);
      }
    }
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadText(csv, 'deadline-cascade.csv', 'text/csv');
  } else {
    downloadText(serializeCascade(cascades), 'deadline-cascade.json', 'application/json');
  }
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
        if (!merged.find(e => e.id === item.id)) merged.push(item);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} cascade(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of cascades.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const cascades = loadAll();
  if (cascades.length === 0) {
    statusEl.textContent = 'No cascades to clear.';
    return;
  }
  if (!confirm(`Delete all ${cascades.length} cascade(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  timelinePanel.replaceChildren();
  statusEl.textContent = 'All cascades cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
form.addEventListener('submit', handleBuild);

document.querySelector('#exportIcs')?.addEventListener('click', () => handleExport('ics'));
document.querySelector('#exportCsv')?.addEventListener('click', () => handleExport('csv'));
document.querySelector('#exportJson')?.addEventListener('click', () => handleExport('json'));
document.querySelector('#importJson')?.addEventListener('change', handleImport);
document.querySelector('#clearAll')?.addEventListener('click', handleClearAll);
document.querySelector('#loadSample')?.addEventListener('click', () => {
  const sample = [
    {
      id: 'csc-sample-1',
      createdAt: new Date().toISOString(),
      templateId: 'foi-complaint',
      name: 'Sample FOI to City Council',
      startDate: '2026-06-01',
      cascade: buildCascade('foi-complaint', '2026-06-01')
    },
    {
      id: 'csc-sample-2',
      createdAt: new Date().toISOString(),
      templateId: 'nhs-complaint',
      name: 'Sample NHS complaint',
      startDate: '2026-05-15',
      cascade: buildCascade('nhs-complaint', '2026-05-15')
    }
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find(e => e.id === s.id)) merged.push(s);
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample cascades.';
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
