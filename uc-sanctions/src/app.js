// uc-sanctions/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs uc-sanctions

// ===== ../../shared/uc-sanctions/index.mjs =====

const SANCTION_TYPES = [
  { id: 'higher-level', name: 'Higher-Level Sanction', deductionRate: 1.0, maxWeeks: 26, deductionDurationDays: 91, description: 'Serious failure to comply — 91-day fixed period for first failure, 182 days for repeat failures within 365 days. Deduction continues until compliance or end of fixed period.', source: 'welfare-reform-act-2012' },
  { id: 'medium-level', name: 'Medium-Level Sanction', deductionRate: 0.4, maxWeeks: 13, description: 'Medium-level failure — 14-day open period, deduction continues until compliance. Applies to failures such as not taking up an employment placement.', source: 'welfare-reform-act-2012' },
  { id: 'standard', name: 'Standard Sanction', deductionRate: 0.2, maxWeeks: 4, description: 'Failure to comply with claimant commitment — 7-day open period, deduction continues until compliance.', source: 'welfare-reform-act-2012' },
  { id: 'lower-level', name: 'Lower-Level Sanction', deductionRate: 0, deductionAmount: 'equivalent-to-missed-appointment', description: 'Failure to attend mandatory appointment without good reason — deduction equal to the missed appointment amount.', source: 'welfare-reform-act-2012' }
];

const GOOD_REASONS = [
  { id: 'hospital-appointment', label: 'Hospital or medical appointment', description: 'You had a hospital appointment, GP visit, or other medical commitment that you could not rearrange.' },
  { id: 'caring-responsibility', label: 'Caring responsibility', description: 'You had to care for a child, vulnerable adult, or family member and there was no alternative care available.' },
  { id: 'interview-running-late', label: 'Interview running late', description: 'Your previous appointment ran over or you were kept waiting, causing you to miss the next one.' },
  { id: 'transport-failure', label: 'Transport failure', description: 'Your transport was cancelled, broke down, or was severely delayed through no fault of your own.' },
  { id: 'mental-health-episode', label: 'Mental health episode', description: 'You experienced a mental health crisis, severe anxiety episode, or other mental health condition that prevented you attending.' }
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function findSanctionType(id) {
  return SANCTION_TYPES.find((t) => t.id === id) || null;
}

function getSanctionTypes() {
  return [...SANCTION_TYPES];
}

function getSanctionDeductionRates(type) {
  const sanction = findSanctionType(type);
  if (!sanction) return null;
  return { ...sanction };
}

function getMandatoryReconsiderationDeadline() {
  return { months: 1, source: 'welfare-reform-act-2012' };
}

function getTribunalDeadline() {
  return { months: 1, source: 'welfare-reform-act-2012' };
}

function generateMRText(data) {
  const { claimantName, sanctionType, decisionDate, reasonForSanction, groundsForChallenge, goodReasons } = data;
  const sanction = findSanctionType(sanctionType);
  const sanctionName = sanction ? sanction.name : sanctionType;
  const formattedDate = formatDate(decisionDate);

  const lines = [
    'Mandatory Reconsideration',
    '',
    `Claimant: ${claimantName}`,
    `Sanction type: ${sanctionName}`,
    `Date of decision: ${formattedDate}`,
    '',
    'Reason for sanction as stated by DWP:',
    reasonForSanction,
    '',
    'Grounds for challenge:',
    groundsForChallenge
  ];

  if (goodReasons) {
    lines.push('');
    lines.push('Good reasons for non-compliance:');
    lines.push(goodReasons);
  }

  return lines.join('\n');
}

function getGoodReasonsLibrary() {
  return [...GOOD_REASONS];
}

function getHardshipPaymentEligibility(data) {
  const { isUCClaimant, sanctionInForce, cannotMeetBasicNeeds } = data;
  if (!isUCClaimant) {
    return { eligible: false, reason: 'You must be a Universal Credit claimant to apply for a hardship payment.' };
  }
  if (!sanctionInForce) {
    return { eligible: false, reason: 'A hardship payment requires an active sanction to be in force.' };
  }
  if (!cannotMeetBasicNeeds) {
    return { eligible: false, reason: 'You must demonstrate that you cannot meet your basic needs (rent, food, heating) due to the sanction.' };
  }
  return { eligible: true, reason: '' };
}

function generateHardshipPaymentRequest(data) {
  const { claimantName, sanctionType, decisionDate, reasonForHardship } = data;
  const sanction = findSanctionType(sanctionType);
  const sanctionName = sanction ? sanction.name : sanctionType;
  const formattedDate = formatDate(decisionDate);

  return [
    'Hardship Payment Request',
    '',
    `Claimant: ${claimantName}`,
    `Sanction type: ${sanctionName}`,
    `Date of sanction decision: ${formattedDate}`,
    '',
    'Reason for hardship:',
    reasonForHardship,
    '',
    'I am requesting an advance hardship payment as I am unable to meet my basic needs due to the sanction deduction from my Universal Credit.'
  ].join('\n');
}

function serializeUCSanctions(value) {
  return JSON.stringify(value || {});
}

function parseUCSanctions(value) {
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

function createChallengeRecord(data) {
  if (!data || !data.claimantName) {
    throw new Error('claimantName is required');
  }
  const validTypes = getSanctionTypes().map((t) => t.id);
  const sanctionType = data.sanctionType || 'standard';
  if (!validTypes.includes(sanctionType)) {
    throw new Error(`Invalid sanction type "${sanctionType}". Must be one of: ${validTypes.join(', ')}`);
  }
  return {
    id: 'uc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    status: 'draft',
    claimantName: data.claimantName,
    nino: data.nino || '',
    sanctionType,
    decisionDate: data.decisionDate || '',
    reasonForSanction: data.reasonForSanction || '',
    groundsForChallenge: data.groundsForChallenge || '',
    goodReasons: data.goodReasons || '',
    hardshipReason: data.hardshipReason || '',
    mrText: '',
    hardshipText: '',
    ...data
  };
}

function renderChallengeCard(challenge) {
  const sanction = getSanctionDeductionRates(challenge.sanctionType);
  const statusCls = challenge.status === 'submitted' ? 'status-submitted' : '';

  return `
    <header>
      <h3>${escapeHtml(challenge.claimantName)}</h3>
      <span class="status-pill sanction-${challenge.sanctionType}">${sanction ? sanction.name : challenge.sanctionType}</span>
    </header>
    <p class="meta">Decision: ${challenge.decisionDate || 'Not recorded'} — Status: ${challenge.status}</p>
    <p class="deadline${statusCls}">${challenge.reasonForSanction ? escapeHtml(challenge.reasonForSanction.slice(0, 100)) : 'No reason recorded'}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${challenge.id}">View</button>
      <button type="button" data-action="delete" data-id="${challenge.id}" class="secondary">Delete</button>
    </div>`;
}

function renderChallenges(challenges, container) {
  if (typeof document === 'undefined') return;
  container.replaceChildren();
  if (challenges.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No UC sanctions challenges yet. Add one using the form to start building your MR request.';
    container.append(empty);
    return;
  }
  const sorted = [...challenges].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const challenge of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    item.innerHTML = renderChallengeCard(challenge);
    container.append(item);
  }
}

export {
  getSanctionTypes,
  getSanctionDeductionRates,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline,
  generateMRText,
  getGoodReasonsLibrary,
  getHardshipPaymentEligibility,
  generateHardshipPaymentRequest,
  serializeUCSanctions,
  parseUCSanctions,
  escapeHtml,
  createChallengeRecord,
  renderChallengeCard,
  renderChallenges
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
const STORAGE_KEY = 'open-access-uk:uc-sanctions:challenges';
const FORM_KEY = 'open-access-uk:uc-sanctions:form-draft';

const form = document.querySelector('#challenge-form');
const list = document.querySelector('#challenge-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
const outputWindow = document.querySelector('#output-window');
let activeId = null;
let currentOutput = '';

function loadAll() {
  return parseUCSanctions(localStorage.getItem(STORAGE_KEY));
}

function saveAll(challenges) {
  localStorage.setItem(STORAGE_KEY, serializeUCSanctions(challenges));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(challenges) {
  const total = challenges.length;
  const draft = challenges.filter((c) => c.status === 'draft').length;
  const submitted = challenges.filter((c) => c.status === 'submitted').length;
  const higherLevel = challenges.filter((c) => c.sanctionType === 'higher-level').length;
  const standard = challenges.filter((c) => c.sanctionType === 'standard').length;
  const lowerLevel = challenges.filter((c) => c.sanctionType === 'lower-level').length;

  const cards = [
    { label: 'Total challenges', value: total, tone: 'default' },
    { label: 'Draft', value: draft, tone: 'default' },
    { label: 'Submitted', value: submitted, tone: 'default' },
    { label: 'Higher-level', value: higherLevel, tone: 'default' },
    { label: 'Standard', value: standard, tone: 'default' },
    { label: 'Lower-level', value: lowerLevel, tone: 'default' }
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

function renderList(challenges) {
  renderChallenges(challenges, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectChallenge(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteChallenge(btn.dataset.id));
  });
}

function selectChallenge(id) {
  activeId = id;
  const challenges = loadAll();
  const challenge = challenges.find((c) => c.id === id);
  if (!challenge) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(challenge);
  renderList(challenges);
}

function renderDetail(challenge) {
  detailContent.replaceChildren();
  const sanction = getSanctionDeductionRates(challenge.sanctionType);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = challenge.claimantName;
  const status = document.createElement('span');
  status.className = `status-pill sanction-${challenge.sanctionType}`;
  status.textContent = sanction ? sanction.name : challenge.sanctionType;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['NINO', challenge.nino || 'Not provided'],
    ['Decision date', challenge.decisionDate || 'Not recorded'],
    ['Deduction rate', sanction ? `${sanction.deductionRate * 100}% of standard allowance` : 'N/A'],
    ['Max duration', sanction ? `${sanction.maxWeeks || 'N/A'} weeks` : 'N/A'],
    ['Status', challenge.status],
    ['Created', new Date(challenge.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const reasonSection = document.createElement('section');
  const reasonHeading = document.createElement('h3');
  reasonHeading.textContent = 'Reason for sanction (DWP)';
  const reasonText = document.createElement('p');
  reasonText.className = 'body-text';
  reasonText.textContent = challenge.reasonForSanction || 'No reason recorded.';
  reasonSection.append(reasonHeading, reasonText);

  const groundsSection = document.createElement('section');
  const groundsHeading = document.createElement('h3');
  groundsHeading.textContent = 'Grounds for challenge';
  const groundsText = document.createElement('p');
  groundsText.className = 'body-text';
  groundsText.textContent = challenge.groundsForChallenge || 'No grounds recorded.';
  groundsSection.append(groundsHeading, groundsText);

  const goodReasonsSection = document.createElement('section');
  const goodReasonsHeading = document.createElement('h3');
  goodReasonsHeading.textContent = 'Good reasons';
  const goodReasonsText = document.createElement('p');
  goodReasonsText.className = 'body-text';
  goodReasonsText.textContent = challenge.goodReasons || 'No good reasons recorded.';
  goodReasonsSection.append(goodReasonsHeading, goodReasonsText);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const statusForm = document.createElement('div');
  statusForm.className = 'status-form';
  const statusLabel = document.createElement('label');
  statusLabel.htmlFor = 'detail-status';
  statusLabel.textContent = 'Update status';
  const statusSelect = document.createElement('select');
  statusSelect.id = 'detail-status';
  for (const s of ['draft', 'submitted', 'won', 'lost']) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    statusSelect.append(opt);
  }
  statusSelect.value = challenge.status;
  statusSelect.addEventListener('change', () => updateStatus(challenge.id, statusSelect.value));
  statusForm.append(statusLabel, statusSelect);

  const copyMrBtn = document.createElement('button');
  copyMrBtn.type = 'button';
  copyMrBtn.className = 'secondary';
  copyMrBtn.textContent = 'Copy MR request';
  copyMrBtn.addEventListener('click', () => {
    const text = generateMRText(challenge);
    copyText(text, 'MR request copied.');
  });

  const copyHardshipBtn = document.createElement('button');
  copyHardshipBtn.type = 'button';
  copyHardshipBtn.className = 'secondary';
  copyHardshipBtn.textContent = 'Copy hardship request';
  copyHardshipBtn.addEventListener('click', () => {
    const text = generateHardshipPaymentRequest({
      claimantName: challenge.claimantName,
      sanctionType: challenge.sanctionType,
      decisionDate: challenge.decisionDate,
      reasonForHardship: challenge.hardshipReason || 'I cannot meet my basic needs due to the sanction.'
    });
    copyText(text, 'Hardship request copied.');
  });

  actions.append(statusForm, copyMrBtn, copyHardshipBtn);
  detailContent.append(header, grid, reasonSection, groundsSection, goodReasonsSection, actions);
}

function updateStatus(id, status) {
  const challenges = loadAll();
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return;
  challenges[idx] = { ...challenges[idx], status, updatedAt: new Date().toISOString() };
  saveAll(challenges);
  statusEl.textContent = `Status updated to ${status}.`;
  renderAll();
}

function deleteChallenge(id) {
  const challenges = loadAll();
  const remaining = challenges.filter((c) => c.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Challenge deleted locally.';
  renderAll();
}

function renderAll() {
  const challenges = loadAll();
  renderSummary(challenges);
  renderList(challenges);
  if (activeId) {
    const challenge = challenges.find((c) => c.id === activeId);
    if (challenge) renderDetail(challenge);
  }
}

function renderGoodReasons() {
  const container = document.querySelector('#good-reasons-list');
  if (!container) return;
  const reasons = getGoodReasonsLibrary();
  container.replaceChildren(
    ...reasons.map((r) => {
      const item = document.createElement('article');
      item.className = 'good-reason-item';
      const title = document.createElement('strong');
      title.textContent = r.label;
      const desc = document.createElement('p');
      desc.textContent = r.description;
      item.append(title, desc);
      return item;
    })
  );
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
  const challenges = loadAll();
  const now = new Date().toISOString();
  const newChallenge = createChallengeRecord({
    ...data,
    createdAt: now,
    updatedAt: now
  });
  challenges.push(newChallenge);
  saveAll(challenges);
  form.reset();
  clearFormDraft();
  activeId = newChallenge.id;
  statusEl.textContent = `Saved challenge for ${newChallenge.claimantName}.`;
  renderAll();
}

function handleGenerateMr() {
  const data = values();
  if (!data.claimantName?.trim()) {
    statusEl.textContent = 'Add a claimant name before generating.';
    return;
  }
  const text = generateMRText(data);
  currentOutput = text;
  outputWindow.textContent = text;
  statusEl.textContent = 'MR request generated. Copy or download it below.';
}

function handleGenerateHardship() {
  const data = values();
  if (!data.claimantName?.trim()) {
    statusEl.textContent = 'Add a claimant name before generating.';
    return;
  }
  const text = generateHardshipPaymentRequest({
    claimantName: data.claimantName,
    sanctionType: data.sanctionType,
    decisionDate: data.decisionDate,
    reasonForHardship: data.hardshipReason || 'I cannot meet my basic needs due to the sanction.'
  });
  currentOutput = text;
  outputWindow.textContent = text;
  statusEl.textContent = 'Hardship payment request generated. Copy or download it below.';
}

function handleExport() {
  const challenges = loadAll();
  if (challenges.length === 0) {
    statusEl.textContent = 'No challenges to export.';
    return;
  }
  downloadText(serializeUCSanctions(challenges), 'uc-sanctions-challenges.json', 'application/json');
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
      const existing = loadAll();
      const merged = { ...existing };
      for (const [name, entries] of Object.entries(parsed)) {
        if (Array.isArray(entries)) {
          merged[name] = merged[name] || [];
          for (const entry of entries) {
            if (!merged[name].find((e) => e.id === entry.id)) {
              merged[name].push(entry);
            }
          }
        }
      }
      saveAll(merged);
      statusEl.textContent = 'Imported challenges locally.';
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON object of challenges.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const challenges = loadAll();
  if (challenges.length === 0) {
    statusEl.textContent = 'No challenges to clear.';
    return;
  }
  if (!confirm(`Delete all challenges from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All challenges cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();
renderGoodReasons();

form.addEventListener('submit', handleAdd);
form.addEventListener('input', saveFormDraft);

const generateMrBtn = document.querySelector('#generateMr');
const generateHardshipBtn = document.querySelector('#generateHardship');
const exportJsonBtn = document.querySelector('#exportJson');
const importInput = document.querySelector('#importJson');
const clearAllBtn = document.querySelector('#clearAll');
const loadSampleBtn = document.querySelector('#loadSample');
const copyOutputBtn = document.querySelector('#copyOutput');
const downloadOutputBtn = document.querySelector('#downloadOutput');
const printOutputBtn = document.querySelector('#printOutput');

generateMrBtn?.addEventListener('click', handleGenerateMr);
generateHardshipBtn?.addEventListener('click', handleGenerateHardship);
exportJsonBtn?.addEventListener('click', handleExport);
importInput?.addEventListener('change', handleImport);
clearAllBtn?.addEventListener('click', handleClearAll);

copyOutputBtn?.addEventListener('click', () => {
  if (currentOutput) copyText(currentOutput, 'Output copied.');
  else statusEl.textContent = 'No output to copy. Generate an MR or hardship request first.';
});

downloadOutputBtn?.addEventListener('click', () => {
  if (currentOutput) downloadText(currentOutput, 'uc-sanctions-output.txt', 'text/plain');
  else statusEl.textContent = 'No output to download.';
});

printOutputBtn?.addEventListener('click', () => {
  if (currentOutput) {
    const win = window.open('', '_blank');
    win.document.write(`<pre>${escapeHtml(currentOutput)}</pre>`);
    win.print();
  } else {
    statusEl.textContent = 'No output to print.';
  }
});

loadSampleBtn?.addEventListener('click', () => {
  const sample = [
    createChallengeRecord({
      claimantName: 'Jane Doe',
      nino: 'QQ 12 34 56 C',
      sanctionType: 'higher-level',
      decisionDate: '2026-05-15',
      reasonForSanction: 'Failed to attend mandatory work-focused interview on 15 May 2026',
      groundsForChallenge: 'I was not notified of the interview date. The letter was sent to my old address.',
      goodReasons: 'I had informed DWP of my address change on 1 May 2026.',
      hardshipReason: 'I cannot pay my rent or buy food because my entire standard allowance has been sanctioned.'
    }),
    createChallengeRecord({
      claimantName: 'John Smith',
      sanctionType: 'standard',
      decisionDate: '2026-06-01',
      reasonForSanction: 'Failure to accept a voluntary job opportunity',
      groundsForChallenge: 'The job was 40 miles away with no public transport. I applied for 3 jobs closer to home.',
      goodReasons: 'Transport failure - no bus route available to the location.'
    })
  ];
  const existing = loadAll();
  for (const s of sample) {
    if (!existing.find((e) => e.claimantName === s.claimantName)) {
      existing.push(s);
    }
  }
  saveAll(existing);
  statusEl.textContent = 'Loaded sample challenges.';
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
