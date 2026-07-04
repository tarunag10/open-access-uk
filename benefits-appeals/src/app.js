// benefits-appeals/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs benefits-appeals

// ===== ../../shared/appeals/index.mjs =====

const BENEFIT_TYPES = [
  { id: 'pip', name: 'Personal Independence Payment (PIP)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-pip' },
  { id: 'uc', name: 'Universal Credit (UC)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-uc-mandatory-reconsideration' },
  { id: 'esa', name: 'Employment and Support Allowance (ESA)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-esa' }
];

const PIP_DESCRIPTORS = [
  { category: 'daily_living', label: 'Daily living', activities: [
    'Preparing food', 'Taking nutrition', 'Managing therapy or monitoring a health condition',
    'Washing and bathing', 'Dressing and undressing', 'Communicating verbally',
    'Reading and understanding signs, symbols and words', 'Engaging with other people face to face',
    'Budgeting and managing money', 'Coping with social engagement'
  ]},
  { category: 'mobility', label: 'Mobility', activities: [
    'Planning and following journeys', 'Moving around'
  ]}
];

const ESA_DESCRIPTORS = [
  { category: 'coping_with_physical_demands', label: 'Coping with physical demands', activities: [
    'Mobilising', 'Standing and sitting', 'Reaching', 'Picking up and moving objects',
    'Communication', 'Manual dexterity', 'Continence', 'Consciousness'
  ]},
  { category: 'coping_with_social_demands', label: 'Coping with social demands', activities: [
    'Understanding communication', 'Engaging in social engagement',
    'Coping with social engagement', 'Appropriateness of behaviour'
  ]},
  { category: 'coping_with_unpredictable_situations', label: 'Coping with unpredictable situations', activities: [
    'Awareness of danger', 'Adapting to change', 'Getting about safely'
  ]}
];

const UC_DESCRIPTORS = [];

function findBenefit(id) {
  return BENEFIT_TYPES.find((b) => b.id === id) || null;
}

function getAppealTypes() {
  return [...BENEFIT_TYPES];
}

function getMandatoryReconsiderationDeadline(benefitType) {
  const benefit = findBenefit(benefitType);
  if (!benefit) return null;
  return { months: benefit.mrDeadlineMonths, source: benefit.source };
}

function getTribunalDeadline(benefitType) {
  const benefit = findBenefit(benefitType);
  if (!benefit) return null;
  return { months: benefit.tribunalDeadlineMonths, source: benefit.source };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function findBenefitName(benefitType) {
  const benefit = findBenefit(benefitType);
  return benefit ? benefit.name : benefitType;
}

function generateMRText(data) {
  const { benefitType, decisionDate, nationalInsurance, grounds } = data;
  const benefitName = findBenefitName(benefitType);
  const formattedDate = formatDate(decisionDate);

  return [
    'Mandatory Reconsideration',
    '',
    `Benefit type: ${benefitName}`,
    `Date of decision: ${formattedDate}`,
    `National Insurance number: ${nationalInsurance}`,
    '',
    'Reasons for disagreement:',
    grounds
  ].join('\n');
}

function generateSSCS1Text(data) {
  const { benefitType, decisionDate, mrDecisionDate, nationalInsurance, grounds } = data;
  const benefitName = findBenefitName(benefitType);
  const formattedDecision = formatDate(decisionDate);
  const formattedMR = formatDate(mrDecisionDate);

  return [
    'SSCS1 - Appeal form',
    '',
    `Benefit type: ${benefitName}`,
    `Date of original decision: ${formattedDecision}`,
    `Date of Mandatory Reconsideration notice: ${formattedMR}`,
    `National Insurance number: ${nationalInsurance}`,
    '',
    'Grounds of appeal:',
    grounds
  ].join('\n');
}

function getDescriptorGuidance(benefitType) {
  switch (benefitType) {
    case 'pip': return [...PIP_DESCRIPTORS];
    case 'esa': return [...ESA_DESCRIPTORS];
    case 'uc': return [...UC_DESCRIPTORS];
    default: return [];
  }
}

function serializeAppeals(value) {
  return JSON.stringify(value || {});
}

function parseAppeals(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [name, entries] of Object.entries(parsed)) {
      if (Array.isArray(entries)) clean[name] = entries;
    }
    return clean;
  } catch {
    return {};
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

const APPEAL_STATUSES = [
  { value: 'mr_draft', label: 'MR draft', description: 'Mandatory reconsideration not yet sent.' },
  { value: 'mr_sent', label: 'MR sent', description: 'MR request sent to DWP.' },
  { value: 'mr_refused', label: 'MR refused', description: 'DWP refused the mandatory reconsideration.' },
  { value: 'mr_allowed', label: 'MR allowed', description: 'DWP changed the decision at MR stage.' },
  { value: 'tribunal_draft', label: 'Tribunal draft', description: 'SSCS1 form not yet sent.' },
  { value: 'tribunal_submitted', label: 'Tribunal submitted', description: 'Appeal submitted to HMCTS.' },
  { value: 'tribunal_hearing', label: 'Hearing listed', description: 'Tribunal hearing date set.' },
  { value: 'tribunal_allowed', label: 'Tribunal allowed', description: 'Appeal allowed by tribunal.' },
  { value: 'tribunal_refused', label: 'Tribunal refused', description: 'Appeal refused by tribunal.' },
  { value: 'closed', label: 'Closed', description: 'Appeal concluded or withdrawn.' }
];

function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `appeal-${stamp}-${random}`;
}

function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    benefitType: data.benefitType || 'pip',
    decisionDate: data.decisionDate || '',
    nationalInsurance: String(data.nationalInsurance || '').trim(),
    grounds: String(data.grounds || '').trim(),
    mrReference: String(data.mrReference || '').trim(),
    mrDecisionDate: data.mrDecisionDate || '',
    status: data.status || 'mr_draft',
    appealName: String(data.appealName || '').trim(),
    appealContact: String(data.appealContact || '').trim(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function parseAppealsList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

function serializeAppealsList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

function getStatusMeta(status) {
  return APPEAL_STATUSES.find((s) => s.value === status) || APPEAL_STATUSES[0];
}

function getBenefitName(benefitType) {
  const types = getAppealTypes();
  const found = types.find((b) => b.id === benefitType);
  return found ? found.name : benefitType;
}

function renderAppeals(appeals, container) {
  container.replaceChildren();
  if (appeals.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No appeals tracked yet. Use the form to generate an MR or tribunal letter.';
    container.append(empty);
    return;
  }
  const sorted = [...appeals].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  for (const appeal of sorted) {
    container.append(renderAppealCard(appeal));
  }
}

function renderAppealCard(appeal) {
  const item = document.createElement('article');
  item.className = 'request-item';
  if (appeal.id === window.__activeAppealId) item.classList.add('active');

  const head = document.createElement('header');
  const title = document.createElement('h3');
  title.textContent = getBenefitName(appeal.benefitType);
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = getStatusMeta(appeal.status).label;
  head.append(title, status);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const decided = appeal.decisionDate || 'No date';
  meta.textContent = `Decision: ${decided}`;

  const timeline = renderTimeline(appeal);

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  const viewBtn = document.createElement('button');
  viewBtn.type = 'button';
  viewBtn.textContent = 'View';
  viewBtn.addEventListener('click', () => {
    window.__selectAppeal(appeal.id);
  });
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'secondary';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    window.__deleteAppeal(appeal.id);
  });
  actions.append(viewBtn, deleteBtn);

  item.append(head, meta, timeline, actions);
  return item;
}

function renderTimeline(appeal) {
  const wrap = document.createElement('div');
  wrap.className = 'appeal-timeline';

  const mrDeadline = getMandatoryReconsiderationDeadline(appeal.benefitType);
  const tribunalDeadline = getTribunalDeadline(appeal.benefitType);

  if (appeal.decisionDate) {
    const d = document.createElement('p');
    d.className = 'timeline-item';
    d.textContent = `Decision date: ${formatDate(appeal.decisionDate)}`;
    wrap.append(d);
  }

  if (appeal.decisionDate && mrDeadline) {
    const deadline = computeMonthsDeadline(appeal.decisionDate, mrDeadline.months);
    const d = document.createElement('p');
    d.className = 'timeline-item';
    const overdue = isOverdue(deadline);
    if (overdue) {
      d.classList.add('overdue');
    }
    d.textContent = `MR deadline: ${deadline || 'unknown'}${overdue ? ' (overdue)' : ''}`;
    wrap.append(d);
  }

  if (appeal.mrDecisionDate && tribunalDeadline) {
    const deadline = computeMonthsDeadline(appeal.mrDecisionDate, tribunalDeadline.months);
    const d = document.createElement('p');
    d.className = 'timeline-item';
    const overdue = isOverdue(deadline);
    if (overdue) {
      d.classList.add('overdue');
    }
    d.textContent = `Tribunal deadline: ${deadline || 'unknown'}${overdue ? ' (overdue)' : ''}`;
    wrap.append(d);
  }

  return wrap;
}

function computeMonthsDeadline(dateStr, months) {
  if (!dateStr) return null;
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  d.setUTCMonth(d.getUTCMonth() + months);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return todayStr > dateStr;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
}

function generateLetterPreview(appeal) {
  const data = {
    benefitType: appeal.benefitType,
    decisionDate: appeal.decisionDate,
    nationalInsurance: appeal.nationalInsurance,
    grounds: appeal.grounds,
    mrDecisionDate: appeal.mrDecisionDate
  };

  if (appeal.status === 'mr_draft' || appeal.status === 'mr_sent') {
    return generateMRText(data);
  }
  return generateSSCS1Text(data);
}

export {
  APPEAL_STATUSES,
  createAppeal,
  parseAppealsList,
  serializeAppealsList,
  getStatusMeta,
  getBenefitName,
  renderAppeals,
  renderAppealCard,
  renderTimeline,
  generateLetterPreview,
  getDescriptorGuidance,
  getAppealTypes,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline
};


// ===== App logic =====
const STORAGE_KEY = 'open-access-uk:benefits-appeals:appeals';
const FORM_KEY = 'open-access-uk:benefits-appeals:form-draft';

const form = document.querySelector('#appeal-form');
const listEl = document.querySelector('#appeal-list');
const summaryEl = document.querySelector('#summary');
const statusEl = document.querySelector('#status');
const letterPreview = document.querySelector('#letter-preview');
const letterActions = document.querySelector('#letter-actions');
let activeAppealId = null;

function loadAll() {
  return parseAppealsList(localStorage.getItem(STORAGE_KEY));
}

function saveAll(appeals) {
  localStorage.setItem(STORAGE_KEY, serializeAppealsList(appeals));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function selectAppeal(id) {
  activeAppealId = id;
  const appeals = loadAll();
  const appeal = appeals.find((a) => a.id === id);
  if (!appeal) {
    letterPreview.textContent = '';
    letterActions.hidden = true;
    renderAll();
    return;
  }
  const text = generateLetterPreview(appeal);
  letterPreview.textContent = text;
  letterActions.hidden = false;
  renderAll();
}

function deleteAppeal(id) {
  const appeals = loadAll();
  const remaining = appeals.filter((a) => a.id !== id);
  saveAll(remaining);
  if (activeAppealId === id) {
    activeAppealId = null;
    letterPreview.textContent = '';
    letterActions.hidden = true;
  }
  statusEl.textContent = 'Appeal deleted locally.';
  renderAll();
}

function renderAll() {
  const appeals = loadAll();
  renderSummary(appeals);
  renderAppeals(appeals, listEl);
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
  if (!data.decisionDate) {
    statusEl.textContent = 'Add a decision date before saving.';
    return;
  }
  const appeals = loadAll();
  const now = new Date().toISOString();
  const newAppeal = createAppeal({ ...data, createdAt: now, updatedAt: now });
  appeals.push(newAppeal);
  saveAll(appeals);
  form.reset();
  clearFormDraft();
  activeAppealId = newAppeal.id;
  statusEl.textContent = `Saved appeal for ${findBenefitName(newAppeal.benefitType)}.`;
  const text = generateLetterPreview(newAppeal);
  letterPreview.textContent = text;
  letterActions.hidden = false;
  renderAll();
}

function handleExport() {
  const appeals = loadAll();
  if (appeals.length === 0) {
    statusEl.textContent = 'No appeals to export.';
    return;
  }
  downloadText(serializeAppealsList(appeals), 'benefits-appeals.json', 'application/json');
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
        const a = createAppeal(item);
        if (!merged.find((e) => e.id === a.id)) merged.push(a);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} appeal(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of appeals.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const appeals = loadAll();
  if (appeals.length === 0) {
    statusEl.textContent = 'No appeals to clear.';
    return;
  }
  if (!confirm(`Delete all ${appeals.length} appeal(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeAppealId = null;
  letterPreview.textContent = '';
  letterActions.hidden = true;
  statusEl.textContent = 'All appeals cleared from this browser.';
  renderAll();
}

// Initialise
restoreFormDraft();
renderAll();
initTheme('#theme-toggle');

form?.addEventListener('submit', handleAdd);
form?.addEventListener('input', saveFormDraft);

document.querySelector('#copyLetter')?.addEventListener('click', () => {
  copyText(letterPreview.textContent, 'Letter copied locally.');
});

document.querySelector('#downloadLetter')?.addEventListener('click', () => {
  downloadText(letterPreview.textContent, 'benefits-appeal-letter.txt', 'text/plain');
});

document.querySelector('#printLetter')?.addEventListener('click', () => {
  window.print();
});

document.querySelector('#exportJson')?.addEventListener('click', handleExport);
document.querySelector('#importJson')?.addEventListener('change', handleImport);
document.querySelector('#clearAll')?.addEventListener('click', handleClearAll);

document.querySelector('#loadSample')?.addEventListener('click', () => {
  const sample = [
    createAppeal({
      benefitType: 'pip',
      decisionDate: '2026-05-01',
      nationalInsurance: 'AB 12 34 56 C',
      grounds:
        'I disagree with the decision because my condition significantly affects my daily living activities. I have difficulty preparing food, dressing myself, and engaging with people face to face. The assessment did not accurately reflect my capabilities on a bad day.',
      status: 'mr_draft'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.benefitType === s.benefitType && e.decisionDate === s.decisionDate)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample appeal.';
  renderAll();
});

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
