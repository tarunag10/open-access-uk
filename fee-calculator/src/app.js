// fee-calculator/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs fee-calculator

// ===== ../../shared/fees-calculator/index.mjs =====
const FEE_SCHEDULES = {
  'county-court': [
    { claimRange: 'Up to £300', fee: 35, source: 'hmcts-county-court-fees' },
    { claimRange: '£300.01 - £1,000', fee: 80, source: 'hmcts-county-court-fees' },
    { claimRange: '£1,000.01 - £5,000', fee: 115, source: 'hmcts-county-court-fees' },
    { claimRange: '£5,000.01 - £10,000', fee: 205, source: 'hmcts-county-court-fees' },
    { claimRange: '£10,000.01 - £50,000', fee: 455, source: 'hmcts-county-court-fees' },
    { claimRange: '£50,000.01 - £100,000', fee: 10000, source: 'hmcts-county-court-fees' }
  ],
  'employment-tribunal': [
    { claimRange: 'No fee (discrimination)', fee: 0, source: 'et-fee-exemption' },
    { claimRange: 'No fee (all claims from 2017)', fee: 0, source: 'et-fee-exemption' }
  ],
  'family-court': [
    { claimRange: 'Under £1,000', fee: 215, source: 'hmcts-family-court-fees' },
    { claimRange: '£1,000 - £5,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: '£5,001 - £15,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: '£15,001 - £50,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: 'Over £50,000', fee: 335, source: 'hmcts-family-court-fees' }
  ],
  'immigration-tribunal': [
    { claimRange: 'Tier 1 (Asylum)', fee: 80, source: 'hmcts-immigration-fees' },
    { claimRange: 'Tier 2 (Immigration)', fee: 140, source: 'hmcts-immigration-fees' }
  ],
  'property-tribunal': [
    { claimRange: 'Under £30,000', fee: 0, source: 'property-tribunal-fee' },
    { claimRange: '£30,000 - £100,000', fee: 0, source: 'property-tribunal-fee' },
    { claimRange: 'Over £100,000', fee: 0, source: 'property-tribunal-fee' }
  ]
};

const FEE_BANDS = {
  'county-court': [
    { min: 0, max: 300, fee: 35 },
    { min: 300.01, max: 1000, fee: 80 },
    { min: 1000.01, max: 5000, fee: 115 },
    { min: 5000.01, max: 10000, fee: 205 },
    { min: 10000.01, max: 50000, fee: 455 },
    { min: 50000.01, max: 100000, fee: 10000 }
  ],
  'employment-tribunal': [
    { min: 0, max: Infinity, fee: 0 }
  ],
  'family-court': [
    { min: 0, max: Infinity, fee: 335 }
  ],
  'immigration-tribunal': [
    { min: 0, max: Infinity, fee: 140 }
  ],
  'property-tribunal': [
    { min: 0, max: Infinity, fee: 0 }
  ]
};

const EXEMPTIONS = [
  { id: 'domestic-violence', name: 'Domestic Violence', description: 'Fee waiver for victims of domestic violence' },
  { id: 'asylum', name: 'Asylum Seekers', description: 'Fee exemption for asylum seekers and refugees' },
  { id: 'benefits', name: 'Benefits Recipients', description: 'Fee waiver for those receiving qualifying benefits' },
  { id: 'low-income', name: 'Low Income', description: 'Fee reduction or waiver based on low income' }
];

function getFeeCategories() {
  return Object.keys(FEE_SCHEDULES);
}

function getFeeSchedules(category) {
  return FEE_SCHEDULES[category] || [];
}

function calculateFee(category, claimAmount) {
  const amount = Number(claimAmount);
  if (Number.isNaN(amount) || amount < 0) return null;

  const bands = FEE_BANDS[category];
  if (!bands) return null;

  for (const band of bands) {
    if (amount >= band.min && amount <= band.max) {
      return band.fee;
    }
  }
  return null;
}

function getHelpWithFeesEligibility(income, savings, benefits) {
  const monthlyIncome = Number(income);
  const totalSavings = Number(savings);
  const receivingBenefits = Boolean(benefits);

  if (receivingBenefits) {
    return {
      eligible: true,
      reason: 'Eligible: receiving qualifying benefits (Universal Credit, income-based JSA, income-based ESA, Income Support, Pension Guarantee Credit, Working Tax Credit, 24+ Advanced Learning Loan)'
    };
  }

  const threshold = 3000;
  const savingsThreshold = 16000;

  if (monthlyIncome < threshold && totalSavings < savingsThreshold) {
    return {
      eligible: true,
      reason: `Eligible: monthly income (£${monthlyIncome}) below threshold (£${threshold}) and savings (£${totalSavings}) below threshold (£${savingsThreshold})`
    };
  }

  return {
    eligible: false,
    reason: `Not eligible: income (£${monthlyIncome}) or savings (£${totalSavings}) exceed Help with Fees thresholds`
  };
}

function getExemptions() {
  return EXEMPTIONS.map(e => e.id);
}

function generateFeeEstimate(category, claimAmount, extras = {}) {
  const items = [];
  const baseFee = calculateFee(category, claimAmount);

  if (baseFee !== null) {
    items.push({ description: `Court/Tribunal fee (${category})`, amount: baseFee });
  }

  if (extras.hearing) {
    items.push({ description: 'Additional hearing fee', amount: 50 });
  }

  if (extras.expedited) {
    items.push({ description: 'Expedited procedure fee', amount: 100 });
  }

  if (extras.witness) {
    const witnessFee = typeof extras.witness === 'number' ? extras.witness : 25;
    items.push({ description: 'Witness fee', amount: witnessFee });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    category,
    claimAmount: Number(claimAmount),
    items,
    totalFee
  };
}

function getFeeRemissionForm() {
  return {
    reference: 'EX160',
    name: 'Request for a fee remission'
  };
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

const CATEGORY_LABELS = {
  'county-court': 'County Court',
  'employment-tribunal': 'Employment Tribunal',
  'family-court': 'Family Court',
  'immigration-tribunal': 'Immigration Tribunal',
  'property-tribunal': 'Property Tribunal'
};

function formatCurrency(amount) {
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function renderFeeResult(estimate, eligibility) {
  let html = '<div class="fee-breakdown">';
  html += `<p class="fee-total">${formatCurrency(estimate.totalFee)}</p>`;
  html += `<p class="fee-category">${escapeHtml(CATEGORY_LABELS[estimate.category] || estimate.category)} — Claim: ${formatCurrency(estimate.claimAmount)}</p>`;

  if (estimate.items.length > 1) {
    html += '<ul class="fee-items">';
    for (const item of estimate.items) {
      html += `<li>${escapeHtml(item.description)}: ${formatCurrency(item.amount)}</li>`;
    }
    html += '</ul>';
  }

  if (eligibility) {
    html += `<div class="hwf-result ${eligibility.eligible ? 'eligible' : 'ineligible'}">`;
    html += `<strong>Help with Fees:</strong> ${eligibility.eligible ? 'Likely eligible' : 'Not eligible'}`;
    html += `<br/><span>${escapeHtml(eligibility.reason)}</span>`;
    html += '</div>';

    if (eligibility.eligible) {
      const form = getFeeRemissionForm();
      html += `<p class="hwf-form">Apply using form <strong>${escapeHtml(form.reference)}</strong> (${escapeHtml(form.name)})</p>`;
    }
  }

  html += '</div>';
  return html;
}

function renderCalcCard(calc) {
  const label = CATEGORY_LABELS[calc.category] || calc.category;
  return `
    <header>
      <h4>${escapeHtml(label)}</h4>
      <span class="fee-badge">${formatCurrency(calc.totalFee)}</span>
    </header>
    <p class="meta">Claim: ${formatCurrency(calc.claimAmount)} — ${calc.createdAt}</p>
    <div class="item-actions">
      <button type="button" data-action="recalc" data-category="${escapeHtml(calc.category)}" data-amount="${calc.claimAmount}">Recalculate</button>
      <button type="button" data-action="delete" data-id="${calc.id}" class="secondary">Delete</button>
    </div>`;
}

function renderCalcList(calcs, container) {
  container.replaceChildren();
  if (calcs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No calculations yet. Use the form above to calculate a fee.';
    container.append(empty);
    return;
  }
  const sorted = [...calcs].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const calc of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    item.innerHTML = renderCalcCard(calc);
    container.append(item);
  }
}

export {
  CATEGORY_LABELS,
  formatCurrency,
  escapeHtml,
  renderFeeResult,
  renderCalcCard,
  renderCalcList,
  getFeeCategories,
  getFeeSchedules,
  calculateFee,
  getHelpWithFeesEligibility,
  getExemptions,
  generateFeeEstimate,
  getFeeRemissionForm,
  serializeFeesCalculator,
  parseFeesCalculator
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
const STORAGE_KEY = 'open-access-uk:fee-calculator:calculations';
const FORM_KEY = 'open-access-uk:fee-calculator:form-draft';

const form = document.querySelector('#fee-form');
const resultEl = document.querySelector('#fee-result');
const calcList = document.querySelector('#calc-list');
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

function saveAll(calcs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calcs));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function generateId() {
  return 'fee-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function renderAll() {
  const calcs = loadAll();
  renderCalcList(calcs, calcList);
  calcList.querySelectorAll('[data-action="recalc"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      form.elements.category.value = btn.dataset.category;
      form.elements.claimAmount.value = btn.dataset.amount;
      form.dispatchEvent(new Event('submit'));
    });
  });
  calcList.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const remaining = loadAll().filter((c) => c.id !== btn.dataset.id);
      saveAll(remaining);
      statusEl.textContent = 'Calculation deleted.';
      renderAll();
    });
  });
}

function saveFormDraft() {
  if (!form) return;
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch { /* ignore */ }
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
  } catch { /* ignore */ }
}

function clearFormDraft() {
  localStorage.removeItem(FORM_KEY);
}

function handleCalculate(event) {
  event.preventDefault();
  const data = values();
  const category = data.category;
  const claimAmount = Number(data.claimAmount);

  if (!claimAmount || claimAmount < 0) {
    statusEl.textContent = 'Enter a valid claim amount.';
    return;
  }

  const estimate = generateFeeEstimate(category, claimAmount);
  let eligibility = null;
  if (data.benefitsStatus === 'yes' || (Number(data.monthlyIncome) < 3000 && Number(data.savingsAmount) < 16000)) {
    eligibility = getHelpWithFeesEligibility(data.monthlyIncome || 0, data.savingsAmount || 0, data.benefitsStatus === 'yes');
  }

  resultEl.innerHTML = renderFeeResult(estimate, eligibility);
  statusEl.textContent = `Fee estimated: ${formatCurrency(estimate.totalFee)}`;

  const calc = {
    id: generateId(),
    category,
    claimAmount,
    applicantType: data.applicantType,
    totalFee: estimate.totalFee,
    eligibility,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const calcs = loadAll();
  calcs.push(calc);
  if (calcs.length > 20) calcs.splice(0, calcs.length - 20);
  saveAll(calcs);
  renderAll();
}

function handleClear() {
  form.reset();
  clearFormDraft();
  resultEl.innerHTML = '<p class="empty-state">Enter a claim amount and click Calculate to see the fee estimate.</p>';
  statusEl.textContent = '';
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleCalculate);
form.addEventListener('input', saveFormDraft);
document.querySelector('#clearForm')?.addEventListener('click', handleClear);

renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
