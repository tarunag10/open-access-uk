// fee-calculator/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs fee-calculator

// ===== ../../shared/fees-calculator/index.mjs =====
// Fees checked against HMCTS guidance on 27 October 2026.
const OPTIONS = {
  'county-court': [
    ['money', 'Money claim issue fee', null],
    ['possession', 'Possession claim', 415],
    ['n244-notice', 'General application on notice (N244, where no other fee applies)', 321],
    [
      'n244-consent',
      'General application by consent or without notice (N244, where no other fee applies)',
      126
    ],
    ['vary', 'Vary judgment or suspend enforcement', 16],
    ['small-hearing', 'Small claims track hearing', null],
    ['fast-hearing', 'Fast track hearing', 619],
    ['multi-hearing', 'Intermediate or multi-track hearing', 1334],
    ['warrant-control', 'Warrant of control', 96],
    ['warrant-possession', 'Warrant of possession', 152],
    ['warrant-delivery', 'Warrant of delivery', 152],
    ['attachment', 'Attachment of earnings', 139],
    ['charging', 'Charging order', 139],
    ['third-party', 'Third-party debt order', 139],
    ['information', 'Order to obtain information from debtor', 69]
  ],
  'family-court': [
    ['divorce', 'Divorce, nullity or dissolution', 628],
    ['separation', 'Judicial separation', 426],
    ['financial', 'Financial order (not by consent)', 321],
    ['consent', 'Financial order by consent', 62],
    ['children', 'New Children Act application (specified orders)', 270],
    ['non-molestation', 'Non-molestation order', 0],
    ['occupation', 'Occupation order', 0]
  ],
  'immigration-tribunal': [
    ['paper', 'First-tier appeal without a hearing', 82],
    ['hearing', 'First-tier appeal with a hearing', 144]
  ],
  'property-tribunal': [
    ['service-charge', 'Leasehold service charge or administration charge application', 114, 227],
    ['enfranchisement', 'Leasehold enfranchisement application', 114, 227],
    ['pitch', 'Mobile home pitch fee determination', 23, 0],
    ['mobile-terms', 'Mobile homes: written statement or terms order (PH1–PH3)', 114, 227],
    ['rent-increase', 'Appeal a rent increase', 47, 0],
    ['electrical', 'Electrical safety standards application', 200, 300]
  ],
  'employment-tribunal': [['claim', 'Employment tribunal claim', 0]]
};
function getFeeCategories() {
  return Object.keys(OPTIONS);
}
function getFeeSchedules(category) {
  return OPTIONS[category] || [];
}
function validAmount(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== '' &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0 &&
    Math.abs(Math.round(Number(value) * 100) - Number(value) * 100) < 1e-7
  );
}
function calculateFee(category, amount) {
  if (category !== 'county-court' || !validAmount(amount)) return null;
  const n = Number(amount);
  for (const [max, fee] of [
    [300, 35],
    [500, 50],
    [1000, 70],
    [1500, 80],
    [3000, 115],
    [5000, 205],
    [10000, 455]
  ])
    if (n <= max) return fee;
  return n <= 200000 ? Math.floor(Math.round(n * 100) / 20) / 100 : 10000;
}
function calculateSelection(category, type, amount, hearing = false) {
  const option = OPTIONS[category]?.find((x) => x[0] === type);
  if (!option) return null;
  let fee = option[2];
  if (type === 'money' && category === 'county-court') fee = calculateFee(category, amount);
  if (type === 'small-hearing' && category === 'county-court') {
    if (!validAmount(amount)) return null;
    const n = Number(amount);
    fee = n <= 300 ? 27 : n <= 500 ? 59 : n <= 1000 ? 85 : n <= 1500 ? 123 : n <= 3000 ? 181 : 346;
  }
  if (fee === null) return null;
  return {
    label: option[1],
    fee,
    hearing: category === 'property-tribunal' && hearing ? option[3] : 0,
    total: fee + (category === 'property-tribunal' && hearing ? option[3] : 0)
  };
}
function getHelpWithFeesEligibility() {
  return {
    eligible: null,
    reason: 'Eligibility depends on your circumstances. Use the official Help with Fees service.'
  };
}
function getExemptions() {
  return [];
}
function generateFeeEstimate(category, claimAmount) {
  const fee = calculateFee(category, claimAmount);
  return {
    category,
    claimAmount,
    items: fee === null ? [] : [{ description: 'Money claim issue fee', amount: fee }],
    totalFee: fee
  };
}
function getFeeRemissionForm() {
  return { reference: 'EX160', name: 'Help with Fees' };
}
function serializeFeesCalculator(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
function parseFeesCalculator(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
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
export { OPTIONS, calculateSelection };


// ===== App logic =====
const form = document.querySelector('#fee-form');
const result = document.querySelector('#fee-result');
const statusEl = document.querySelector('#form-status');
const category = form.elements.category;
const application = form.elements.application;
const amount = form.elements.claimAmount;
const hearing = form.elements.hearing;
const amountFields = document.querySelector('#amount-fields');
const hearingFields = document.querySelector('#hearing-fields');
function updateFields() {
  const needsAmount = category.value === 'county-court' && ['money', 'small-hearing'].includes(application.value);
  amountFields.hidden = !needsAmount;
  amount.required = needsAmount;
  hearingFields.hidden = category.value !== 'property-tribunal';
}
function updateOptions() {
  application.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a proceeding';
  application.append(placeholder);
  for (const [id, label] of OPTIONS[category.value] || []) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = label;
    application.append(option);
  }
  updateFields();
}
category.addEventListener('change', updateOptions);
application.addEventListener('change', updateFields);
form.addEventListener('submit', event => {
  event.preventDefault();
  const estimate = calculateSelection(category.value, application.value, amount.value, hearing.value === 'yes');
  if (!estimate) { statusEl.textContent = 'Select a proceeding and enter a valid amount where required.'; result.textContent = ''; return; }
  const currency = value => new Intl.NumberFormat('en-GB', {style:'currency',currency:'GBP'}).format(value);
  result.replaceChildren();
  const total = document.createElement('p'); total.className = 'fee-total'; total.textContent = currency(estimate.total); result.append(total);
  const detail = document.createElement('p'); detail.textContent = estimate.label + ': ' + currency(estimate.fee) + (category.value === 'property-tribunal' && hearing.value === 'yes' ? '; hearing: ' + currency(estimate.hearing) : ''); result.append(detail);
  statusEl.textContent = 'Fee estimate: ' + currency(estimate.total);
  try {
    const entries = loadHistory();
    entries.push({id: 'fee-' + Date.now() + '-' + Math.random().toString(36).slice(2), version: 2, label: estimate.label, total: estimate.total, date: new Date().toISOString().slice(0,10)});
    localStorage.setItem(historyKey, JSON.stringify(entries.slice(-20))); renderHistory();
  } catch { statusEl.textContent += '. Could not save to browser history.'; }
});
document.querySelector('#clearForm').addEventListener('click', () => { form.reset(); updateOptions(); result.textContent = 'Select a proceeding and click Calculate.'; statusEl.textContent = ''; });
const historyKey = 'open-access-uk:fee-calculator:calculations';
const list = document.querySelector('#calc-list');
function loadHistory() { try { const value = JSON.parse(localStorage.getItem(historyKey) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function renderHistory() {
  list.replaceChildren();
  const entries = loadHistory();
  if (!entries.length) { list.textContent = 'No saved calculations.'; return; }
  for (const entry of entries.slice().reverse()) {
    const item = document.createElement('article'); item.className = 'complaint-item';
    const description = document.createElement('p');
    description.textContent = entry.version === 2 ? `${entry.label}: £${Number(entry.total).toFixed(2)} (${entry.date})` : `Older calculation (${entry.createdAt || 'date unknown'}): fee may be incorrect. Recalculate using the form.`;
    item.append(description);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete';
    remove.addEventListener('click', () => { localStorage.setItem(historyKey, JSON.stringify(loadHistory().filter(x => x.id !== entry.id))); renderHistory(); });
    item.append(remove); list.append(item);
  }
}
renderHistory();
updateOptions();
const themeButton = document.querySelector('#theme-toggle');
function applyTheme(theme) { document.documentElement.dataset.theme = theme; themeButton.setAttribute('aria-pressed', String(theme === 'dark')); themeButton.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme'; }
let currentTheme = resolveInitialTheme({stored: localStorage.getItem(THEME_STORAGE_KEY), prefersDark: matchMedia('(prefers-color-scheme: dark)').matches});
applyTheme(currentTheme);
themeButton.addEventListener('click', () => { currentTheme = nextTheme(currentTheme); localStorage.setItem(THEME_STORAGE_KEY, currentTheme); applyTheme(currentTheme); });
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => { const open = navToggle.getAttribute('aria-expanded') !== 'true'; navToggle.setAttribute('aria-expanded', String(open)); primaryNav?.classList.toggle('is-open', open); });
