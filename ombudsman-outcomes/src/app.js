// ===== src/app.js =====
// Ombudsman Outcomes Database — bundled app (all shared modules inlined)

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

// ===== ../shared/ombudsman-outcomes/index.mjs (inlined) =====
const OMBUDSMEN = [
  { id: 'PHSO', name: 'Parliamentary and Health Service Ombudsman', sectors: ['NHS', 'UK Government'], source: 'phso-annual-report', website: 'https://www.ombudsman.org.uk' },
  { id: 'housing', name: 'Housing Ombudsman', sectors: ['Social Housing'], source: 'housing-ombudsman-report', website: 'https://www.housing-ombudsman.org.uk' },
  { id: 'financial', name: 'Financial Ombudsman Service', sectors: ['Finance', 'Insurance', 'Banking'], source: 'fos-annual-report', website: 'https://www.financial-ombudsman.org.uk' },
  { id: 'rail', name: 'Rail Ombudsman', sectors: ['Rail', 'Transport'], source: 'rail-ombudsman-report', website: 'https://www.railombudsman.org' },
  { id: 'legal', name: 'Legal Ombudsman', sectors: ['Legal Services'], source: 'leo-annual-report', website: 'https://www.legalombudsman.org.uk' },
  { id: 'local-government', name: 'Local Government Ombudsman', sectors: ['Councils', 'Local Services'], source: 'lgo-annual-report', website: 'https://www.lgo.org.uk' },
  { id: 'water', name: 'Consumer Council for Water', sectors: ['Water', 'Drainage'], source: 'ccw-annual-report', website: 'https://www.ccw.org.uk' },
  { id: 'energy', name: 'Ombudsman Services: Energy', sectors: ['Energy', 'Gas', 'Electricity'], source: 'ombudsman-energy-report', website: 'https://www.ombudsman-services.org' },
  { id: 'telecoms', name: 'Ombudsman Services: Communications', sectors: ['Telecoms', 'Internet', 'TV'], source: 'ombudsman-comms-report', website: 'https://www.ombudsman-services.org' },
  { id: 'police', name: 'Independent Office for Police Conduct', sectors: ['Police'], source: 'iopc-annual-report', website: 'https://www.policeconduct.gov.uk' },
  { id: 'immigration', name: 'Immigration Services Commissioner', sectors: ['Immigration', 'Asylum'], source: 'oisc-annual-report', website: 'https://www.gov.uk/government/organisations/office-of-the-immigration-services-commissioner' }
];

const OUTCOME_STATISTICS = {
  PHSO: { totalCases: 7800, upheldRate: 42, notUpheldRate: 38, partiallyUpheldRate: 20, yearlyTrend: [{ year: 2022, cases: 7200 }, { year: 2023, cases: 7500 }, { year: 2024, cases: 7800 }], sectorBreakdown: [{ sector: 'NHS', cases: 6500 }, { sector: 'UK Government', cases: 1300 }] },
  housing: { totalCases: 12000, upheldRate: 55, notUpheldRate: 30, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 9800 }, { year: 2023, cases: 10900 }, { year: 2024, cases: 12000 }], sectorBreakdown: [{ sector: 'Social Housing', cases: 12000 }] },
  financial: { totalCases: 420000, upheldRate: 38, notUpheldRate: 45, partiallyUpheldRate: 17, yearlyTrend: [{ year: 2022, cases: 390000 }, { year: 2023, cases: 410000 }, { year: 2024, cases: 420000 }], sectorBreakdown: [{ sector: 'Finance', cases: 180000 }, { sector: 'Insurance', cases: 120000 }, { sector: 'Banking', cases: 120000 }] },
  rail: { totalCases: 3500, upheldRate: 35, notUpheldRate: 50, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 3000 }, { year: 2023, cases: 3200 }, { year: 2024, cases: 3500 }], sectorBreakdown: [{ sector: 'Rail', cases: 2800 }, { sector: 'Transport', cases: 700 }] },
  legal: { totalCases: 8200, upheldRate: 44, notUpheldRate: 35, partiallyUpheldRate: 21, yearlyTrend: [{ year: 2022, cases: 7600 }, { year: 2023, cases: 7900 }, { year: 2024, cases: 8200 }], sectorBreakdown: [{ sector: 'Legal Services', cases: 8200 }] },
  'local-government': { totalCases: 15000, upheldRate: 48, notUpheldRate: 32, partiallyUpheldRate: 20, yearlyTrend: [{ year: 2022, cases: 14000 }, { year: 2023, cases: 14500 }, { year: 2024, cases: 15000 }], sectorBreakdown: [{ sector: 'Councils', cases: 10000 }, { sector: 'Local Services', cases: 5000 }] },
  water: { totalCases: 2800, upheldRate: 50, notUpheldRate: 35, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 2400 }, { year: 2023, cases: 2600 }, { year: 2024, cases: 2800 }], sectorBreakdown: [{ sector: 'Water', cases: 2000 }, { sector: 'Drainage', cases: 800 }] },
  energy: { totalCases: 45000, upheldRate: 58, notUpheldRate: 28, partiallyUpheldRate: 14, yearlyTrend: [{ year: 2022, cases: 40000 }, { year: 2023, cases: 42000 }, { year: 2024, cases: 45000 }], sectorBreakdown: [{ sector: 'Energy', cases: 20000 }, { sector: 'Gas', cases: 12000 }, { sector: 'Electricity', cases: 13000 }] },
  telecoms: { totalCases: 38000, upheldRate: 52, notUpheldRate: 33, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 35000 }, { year: 2023, cases: 36000 }, { year: 2024, cases: 38000 }], sectorBreakdown: [{ sector: 'Telecoms', cases: 22000 }, { sector: 'Internet', cases: 10000 }, { sector: 'TV', cases: 6000 }] },
  police: { totalCases: 5200, upheldRate: 30, notUpheldRate: 55, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 4800 }, { year: 2023, cases: 5000 }, { year: 2024, cases: 5200 }], sectorBreakdown: [{ sector: 'Police', cases: 5200 }] },
  immigration: { totalCases: 1200, upheldRate: 25, notUpheldRate: 60, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 1000 }, { year: 2023, cases: 1100 }, { year: 2024, cases: 1200 }], sectorBreakdown: [{ sector: 'Immigration', cases: 800 }, { sector: 'Asylum', cases: 400 }] }
};

const TYPICAL_OUTCOMES = {
  PHSO: [
    { issueType: 'complaint-handling', outcomes: [{ description: 'Service failure identified, apology recommended', frequency: 45 }, { description: 'Remedy offered including financial redress', frequency: 30 }, { description: 'No service failure identified', frequency: 25 }] },
    { issueType: 'clinical-negligence', outcomes: [{ description: 'Service failure with recommended action', frequency: 40 }, { description: 'No further action required', frequency: 35 }, { description: 'Escalated for further investigation', frequency: 25 }] }
  ],
  housing: [
    { issueType: 'disrepair', outcomes: [{ description: 'Landlord ordered to carry out repairs within 28 days', frequency: 50 }, { description: 'Compensation awarded for inconvenience', frequency: 35 }, { description: 'Complaint not upheld', frequency: 15 }] },
    { issueType: 'complaint-handling', outcomes: [{ description: 'Complaint process found to be inadequate', frequency: 45 }, { description: 'Landlord required to apologise', frequency: 30 }, { description: 'No maladministration found', frequency: 25 }] }
  ],
  financial: [
    { issueType: 'complaint-handling', outcomes: [{ description: 'Firm required to reconsider decision', frequency: 40 }, { description: 'Financial compensation awarded', frequency: 35 }, { description: 'Complaint not upheld', frequency: 25 }] },
    { issueType: 'product-sale', outcomes: [{ description: 'Product sold was unsuitable, refund ordered', frequency: 42 }, { description: 'Compensation for consequential losses', frequency: 30 }, { description: 'Firm action found reasonable', frequency: 28 }] },
    { issueType: 'insurance-claim', outcomes: [{ description: 'Claim should have been paid, payment ordered', frequency: 45 }, { description: 'Partial payment recommended', frequency: 30 }, { description: 'Insurer decision upheld', frequency: 25 }] }
  ],
  rail: [
    { issueType: 'delay-repay', outcomes: [{ description: 'Delay Repay compensation confirmed as owed', frequency: 50 }, { description: 'Train operator decision upheld', frequency: 35 }, { description: 'Additional goodwill payment recommended', frequency: 15 }] }
  ],
  legal: [
    { issueType: 'service-failure', outcomes: [{ description: 'Firm required to apologise and remedial work', frequency: 45 }, { description: 'Financial compensation for poor service', frequency: 35 }, { description: 'No service failure identified', frequency: 20 }] }
  ],
  'local-government': [
    { issueType: 'maladministration', outcomes: [{ description: 'Council decision found to be flawed, action recommended', frequency: 48 }, { description: 'Apology and small compensation', frequency: 30 }, { description: 'No maladministration found', frequency: 22 }] }
  ],
  water: [
    { issueType: 'billing', outcomes: [{ description: 'Billing error corrected, refund issued', frequency: 50 }, { description: 'Goodwill payment for inconvenience', frequency: 30 }, { description: 'Bill found correct', frequency: 20 }] }
  ],
  energy: [
    { issueType: 'billing', outcomes: [{ description: 'Account balance corrected', frequency: 48 }, { description: 'Compensation for billing errors', frequency: 32 }, { description: 'Supplier decision upheld', frequency: 20 }] },
    { issueType: 'metering', outcomes: [{ description: 'Meter reading disputed, investigation ordered', frequency: 40 }, { description: 'Refund for overcharge', frequency: 35 }, { description: 'Meter installation found correct', frequency: 25 }] }
  ],
  telecoms: [
    { issueType: 'service', outcomes: [{ description: 'Provider required to fix issue and compensate', frequency: 45 }, { description: 'Contract terms found unfair, remedied', frequency: 30 }, { description: 'Provider decision upheld', frequency: 25 }] }
  ],
  police: [
    { issueType: 'conduct', outcomes: [{ description: 'Misconduct identified, disciplinary action', frequency: 25 }, { description: 'Learning recommended for officers', frequency: 40 }, { description: 'Conduct found acceptable', frequency: 35 }] }
  ],
  immigration: [
    { issueType: 'service', outcomes: [{ description: 'Decision found incorrect, reconsideration ordered', frequency: 30 }, { description: 'Decision upheld but process delay acknowledged', frequency: 45 }, { description: 'Complaint not upheld', frequency: 25 }] }
  ]
};

const COMPENSATION_RANGES = {
  PHSO: { ranges: [{ category: 'Inconvenience and distress', min: 100, max: 2000, typical: 500 }, { category: 'Financial loss', min: 200, max: 10000, typical: 1500 }, { category: 'Service failure', min: 100, max: 5000, typical: 750 }], averageCompensation: 850 },
  housing: { ranges: [{ category: 'Disrepair', min: 500, max: 10000, typical: 2000 }, { category: 'Inconvenience', min: 250, max: 3000, typical: 750 }, { category: 'Loss of amenities', min: 500, max: 5000, typical: 1200 }], averageCompensation: 1400 },
  financial: { ranges: [{ category: 'Financial loss', min: 100, max: 50000, typical: 5000 }, { category: 'Distress and inconvenience', min: 100, max: 5000, typical: 800 }, { category: 'Cost of goods', min: 50, max: 20000, typical: 3000 }], averageCompensation: 2900 },
  rail: { ranges: [{ category: 'Delay compensation', min: 20, max: 500, typical: 100 }, { category: 'Inconvenience', min: 25, max: 300, typical: 75 }, { category: 'Additional travel costs', min: 10, max: 200, typical: 50 }], averageCompensation: 75 },
  legal: { ranges: [{ category: 'Loss and damage', min: 200, max: 20000, typical: 3000 }, { category: 'Inconvenience', min: 100, max: 3000, typical: 500 }, { category: 'Service failure', min: 100, max: 5000, typical: 1000 }], averageCompensation: 1500 },
  'local-government': { ranges: [{ category: 'Financial loss', min: 100, max: 10000, typical: 1500 }, { category: 'Inconvenience', min: 100, max: 2000, typical: 400 }, { category: 'Distress', min: 100, max: 3000, typical: 500 }], averageCompensation: 800 },
  water: { ranges: [{ category: 'Billing error', min: 25, max: 2000, typical: 300 }, { category: 'Service failure', min: 50, max: 1500, typical: 400 }, { category: 'Inconvenience', min: 25, max: 500, typical: 100 }], averageCompensation: 250 },
  energy: { ranges: [{ category: 'Billing error', min: 50, max: 5000, typical: 500 }, { category: 'Service failure', min: 50, max: 3000, typical: 400 }, { category: 'Inconvenience', min: 25, max: 1000, typical: 150 }], averageCompensation: 350 },
  telecoms: { ranges: [{ category: 'Service failure', min: 25, max: 3000, typical: 400 }, { category: 'Inconvenience', min: 25, max: 1500, typical: 200 }, { category: 'Contractual loss', min: 50, max: 5000, typical: 600 }], averageCompensation: 400 },
  police: { ranges: [{ category: 'Misconduct', min: 500, max: 20000, typical: 3000 }, { category: 'Inconvenience', min: 100, max: 3000, typical: 500 }, { category: 'Distress', min: 200, max: 5000, typical: 1000 }], averageCompensation: 1500 },
  immigration: { ranges: [{ category: 'Service failure', min: 100, max: 2000, typical: 500 }, { category: 'Inconvenience', min: 50, max: 1000, typical: 200 }, { category: 'Financial loss', min: 100, max: 3000, typical: 600 }], averageCompensation: 400 }
};

const DECISION_TIMESCALES = {
  PHSO: { averageDays: 365, medianDays: 340, percentile90Days: 520, bySector: [{ sector: 'NHS', averageDays: 380 }, { sector: 'UK Government', averageDays: 320 }] },
  housing: { averageDays: 90, medianDays: 75, percentile90Days: 150, bySector: [{ sector: 'Social Housing', averageDays: 90 }] },
  financial: { averageDays: 60, medianDays: 45, percentile90Days: 120, bySector: [{ sector: 'Finance', averageDays: 65 }, { sector: 'Insurance', averageDays: 55 }, { sector: 'Banking', averageDays: 60 }] },
  rail: { averageDays: 30, medianDays: 25, percentile90Days: 60, bySector: [{ sector: 'Rail', averageDays: 30 }, { sector: 'Transport', averageDays: 28 }] },
  legal: { averageDays: 120, medianDays: 100, percentile90Days: 200, bySector: [{ sector: 'Legal Services', averageDays: 120 }] },
  'local-government': { averageDays: 180, medianDays: 160, percentile90Days: 300, bySector: [{ sector: 'Councils', averageDays: 175 }, { sector: 'Local Services', averageDays: 185 }] },
  water: { averageDays: 60, medianDays: 50, percentile90Days: 90, bySector: [{ sector: 'Water', averageDays: 55 }, { sector: 'Drainage', averageDays: 65 }] },
  energy: { averageDays: 45, medianDays: 35, percentile90Days: 90, bySector: [{ sector: 'Energy', averageDays: 40 }, { sector: 'Gas', averageDays: 45 }, { sector: 'Electricity', averageDays: 50 }] },
  telecoms: { averageDays: 40, medianDays: 30, percentile90Days: 80, bySector: [{ sector: 'Telecoms', averageDays: 35 }, { sector: 'Internet', averageDays: 40 }, { sector: 'TV', averageDays: 45 }] },
  police: { averageDays: 150, medianDays: 130, percentile90Days: 250, bySector: [{ sector: 'Police', averageDays: 150 }] },
  immigration: { averageDays: 90, medianDays: 80, percentile90Days: 150, bySector: [{ sector: 'Immigration', averageDays: 85 }, { sector: 'Asylum', averageDays: 95 }] }
};

function getOmbudsmen() {
  return OMBUDSMEN.map((o) => o.id);
}

function getOmbudsmanDetails(id) {
  const ombudsman = OMBUDSMEN.find((o) => o.id === id);
  return ombudsman ? { ...ombudsman } : null;
}

function getOutcomeStatistics(ombudsmanId) {
  const stats = OUTCOME_STATISTICS[ombudsmanId];
  return stats ? { ombudsmanId, ...stats } : null;
}

function getTypicalOutcomes(ombudsmanId, issueType) {
  const entries = TYPICAL_OUTCOMES[ombudsmanId];
  if (!entries) return null;
  const match = entries.find((e) => e.issueType === issueType);
  return match ? { ombudsmanId, issueType, outcomes: match.outcomes.map((o) => ({ ...o })) } : { ombudsmanId, issueType, outcomes: [] };
}

function getCompensationRanges(ombudsmanId) {
  const data = COMPENSATION_RANGES[ombudsmanId];
  return data ? { ombudsmanId, ...data } : null;
}

function getDecisionTimescales(ombudsmanId) {
  const data = DECISION_TIMESCALES[ombudsmanId];
  return data ? { ombudsmanId, ...data } : null;
}

function serializeOmbudsmanOutcomes(value) {
  return JSON.stringify(value);
}

function parseOmbudsmanOutcomes(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ===== src/tracker.js (inlined) =====
const ISSUE_TYPES = [
  { value: 'complaint-handling', label: 'Complaint handling' },
  { value: 'clinical-negligence', label: 'Clinical negligence' },
  { value: 'disrepair', label: 'Disrepair' },
  { value: 'product-sale', label: 'Product sale' },
  { value: 'insurance-claim', label: 'Insurance claim' },
  { value: 'delay-repay', label: 'Delay Repay' },
  { value: 'service-failure', label: 'Service failure' },
  { value: 'maladministration', label: 'Maladministration' },
  { value: 'billing', label: 'Billing' },
  { value: 'metering', label: 'Metering' },
  { value: 'service', label: 'Service' },
  { value: 'conduct', label: 'Conduct' }
];

function getAvailableIssueTypes(ombudsmanId) {
  const results = [];
  for (const t of ISSUE_TYPES) {
    const outcomes = getTypicalOutcomes(ombudsmanId, t.value);
    if (outcomes && outcomes.outcomes.length > 0) {
      results.push(t);
    }
  }
  return results;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-GB').format(num);
}

function renderOmbudsmanSummary(ombudsmanId) {
  const details = getOmbudsmanDetails(ombudsmanId);
  const stats = getOutcomeStatistics(ombudsmanId);
  const timescales = getDecisionTimescales(ombudsmanId);
  const compensation = getCompensationRanges(ombudsmanId);

  if (!details || !stats) return '';

  const lines = [];
  lines.push(`${details.name}`);
  lines.push(`Sectors: ${details.sectors.join(', ')}`);
  lines.push(`Total cases: ${formatNumber(stats.totalCases)}`);
  lines.push(`Upheld: ${stats.upheldRate}% | Not upheld: ${stats.notUpheldRate}% | Partially upheld: ${stats.partiallyUpheldRate}%`);
  if (timescales) {
    lines.push(`Average decision time: ${timescales.averageDays} days (median: ${timescales.medianDays} days)`);
  }
  if (compensation) {
    lines.push(`Average compensation: ${formatCurrency(compensation.averageCompensation)}`);
  }
  return lines.join('\n');
}

function renderOutcomeResults(ombudsmanId, issueType) {
  const details = getOmbudsmanDetails(ombudsmanId);
  const outcomes = getTypicalOutcomes(ombudsmanId, issueType);
  const compensation = getCompensationRanges(ombudsmanId);
  const timescales = getDecisionTimescales(ombudsmanId);
  const stats = getOutcomeStatistics(ombudsmanId);

  if (!details) return '';

  const sections = [];

  if (stats) {
    sections.push(`<h4>Overall statistics</h4>`);
    sections.push(`<div class="stat-row"><span>Total cases:</span><span>${formatNumber(stats.totalCases)}</span></div>`);
    sections.push(`<div class="stat-row"><span>Upheld rate:</span><span>${stats.upheldRate}%</span></div>`);
    sections.push(`<div class="stat-row"><span>Not upheld rate:</span><span>${stats.notUpheldRate}%</span></div>`);
    sections.push(`<div class="stat-row"><span>Partially upheld rate:</span><span>${stats.partiallyUpheldRate}%</span></div>`);
  }

  if (outcomes && outcomes.outcomes.length > 0) {
    sections.push(`<h4>Typical outcomes for: ${issueType}</h4>`);
    for (const o of outcomes.outcomes) {
      sections.push(`<div class="outcome-row"><span>${o.description}</span><span>${o.frequency}%</span></div>`);
    }
  } else if (outcomes && outcomes.outcomes.length === 0) {
    sections.push(`<p class="empty-state">No typical outcomes data for this issue type with ${details.name}.</p>`);
  }

  if (compensation) {
    sections.push(`<h4>Compensation ranges</h4>`);
    for (const range of compensation.ranges) {
      sections.push(`<div class="comp-row"><span>${range.category}</span><span>${formatCurrency(range.min)} – ${formatCurrency(range.max)} (typical: ${formatCurrency(range.typical)})</span></div>`);
    }
    sections.push(`<div class="stat-row total"><span>Average compensation:</span><span>${formatCurrency(compensation.averageCompensation)}</span></div>`);
  }

  if (timescales) {
    sections.push(`<h4>Decision timescales</h4>`);
    sections.push(`<div class="stat-row"><span>Average:</span><span>${timescales.averageDays} days</span></div>`);
    sections.push(`<div class="stat-row"><span>Median:</span><span>${timescales.medianDays} days</span></div>`);
    sections.push(`<div class="stat-row"><span>90th percentile:</span><span>${timescales.percentile90Days} days</span></div>`);
    if (timescales.bySector && timescales.bySector.length > 0) {
      sections.push(`<h4>By sector</h4>`);
      for (const s of timescales.bySector) {
        sections.push(`<div class="stat-row"><span>${s.sector}:</span><span>${s.averageDays} days</span></div>`);
      }
    }
  }

  return sections.join('');
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
const STORAGE_KEY = 'open-access-uk:ombudsman-outcomes:lookups';

const form = document.querySelector('#lookup-form');
const ombudsmanSelect = document.querySelector('#ombudsman');
const issueTypeSelect = document.querySelector('#issueType');
const resultsSection = document.querySelector('#results');
const resultsContent = document.querySelector('#results-content');
const resultsHeading = document.querySelector('#results-heading');
const summary = document.querySelector('#summary');
const lookupList = document.querySelector('#lookup-list');
const statusEl = document.querySelector('#form-status');

function loadAll() {
  return parseOmbudsmanOutcomes(localStorage.getItem(STORAGE_KEY));
}

function saveAll(lookups) {
  localStorage.setItem(STORAGE_KEY, serializeOmbudsmanOutcomes(lookups));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function populateOmbudsmanSelect() {
  const ids = getOmbudsmen();
  ombudsmanSelect.replaceChildren();
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'Choose an ombudsman...';
  ombudsmanSelect.append(defaultOpt);
  for (const id of ids) {
    const details = getOmbudsmanDetails(id);
    if (!details) continue;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = details.name;
    ombudsmanSelect.append(opt);
  }
}

function populateIssueTypes(ombudsmanId) {
  issueTypeSelect.replaceChildren();
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'Choose an issue type...';
  issueTypeSelect.append(defaultOpt);
  if (!ombudsmanId) return;
  const types = getAvailableIssueTypes(ombudsmanId);
  for (const t of types) {
    const opt = document.createElement('option');
    opt.value = t.value;
    opt.textContent = t.label;
    issueTypeSelect.append(opt);
  }
}

function renderSummary() {
  const lookups = loadAll();
  const total = lookups.length;
  const ombudsmen = new Set(lookups.map((l) => l.ombudsmanId)).size;

  const cards = [
    { label: 'Total lookups', value: total, tone: 'default' },
    { label: 'Ombudsmen used', value: ombudsmen, tone: 'default' }
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

function renderLookupList() {
  const lookups = loadAll();
  lookupList.replaceChildren();
  if (lookups.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No lookups yet. Use the form to look up ombudsman outcomes.';
    lookupList.append(empty);
    return;
  }
  const sorted = [...lookups].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const lookup of sorted) {
    const item = document.createElement('article');
    item.className = 'lookup-item';
    const details = getOmbudsmanDetails(lookup.ombudsmanId);
    const name = details ? details.name : lookup.ombudsmanId;
    item.innerHTML = `
      <header>
        <h3>${escapeHtml(name)}</h3>
        <span class="status-pill">${lookup.issueType}</span>
      </header>
      <p class="meta">${new Date(lookup.createdAt).toLocaleDateString()}</p>
      <div class="item-actions">
        <button type="button" data-action="view" data-id="${lookup.id}">View</button>
        <button type="button" data-action="delete" data-id="${lookup.id}" class="secondary">Delete</button>
      </div>`;
    lookupList.append(item);
  }
  lookupList.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => viewLookup(btn.dataset.id));
  });
  lookupList.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteLookup(btn.dataset.id));
  });
}

function viewLookup(id) {
  const lookups = loadAll();
  const lookup = lookups.find((l) => l.id === id);
  if (!lookup) return;
  ombudsmanSelect.value = lookup.ombudsmanId;
  populateIssueTypes(lookup.ombudsmanId);
  issueTypeSelect.value = lookup.issueType;
  showResults(lookup.ombudsmanId, lookup.issueType);
}

function deleteLookup(id) {
  const lookups = loadAll();
  const remaining = lookups.filter((l) => l.id !== id);
  saveAll(remaining);
  statusEl.textContent = 'Lookup deleted.';
  renderSummary();
  renderLookupList();
}

function showResults(ombudsmanId, issueType) {
  const html = renderOutcomeResults(ombudsmanId, issueType);
  const details = getOmbudsmanDetails(ombudsmanId);
  resultsHeading.textContent = details ? `${details.name} — ${issueType}` : 'Results';
  resultsContent.innerHTML = html;
  resultsSection.hidden = false;
}

function handleSubmit(event) {
  event.preventDefault();
  const data = values();
  if (!data.ombudsman) {
    statusEl.textContent = 'Select an ombudsman first.';
    return;
  }
  if (!data.issueType) {
    statusEl.textContent = 'Select an issue type.';
    return;
  }
  const lookups = loadAll();
  const id = 'lkp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const newLookup = {
    id,
    ombudsmanId: data.ombudsman,
    issueType: data.issueType,
    createdAt: new Date().toISOString()
  };
  lookups.push(newLookup);
  saveAll(lookups);
  showResults(data.ombudsman, data.issueType);
  statusEl.textContent = `Outcome lookup saved.`;
  renderSummary();
  renderLookupList();
}

function handleExport() {
  const lookups = loadAll();
  if (lookups.length === 0) {
    statusEl.textContent = 'No lookups to export.';
    return;
  }
  const results = lookups.map((l) => {
    const details = getOmbudsmanDetails(l.ombudsmanId);
    const stats = getOutcomeStatistics(l.ombudsmanId);
    const outcomes = getTypicalOutcomes(l.ombudsmanId, l.issueType);
    const compensation = getCompensationRanges(l.ombudsmanId);
    const timescales = getDecisionTimescales(l.ombudsmanId);
    return { ...l, ombudsmanDetails: details, statistics: stats, typicalOutcomes: outcomes, compensation, timescales };
  });
  const blob = new Blob([serializeOmbudsmanOutcomes(results)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ombudsman-outcomes.json';
  link.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = 'Downloaded ombudsman-outcomes.json. Nothing was sent to a server.';
}

function handleClearAll() {
  const lookups = loadAll();
  if (lookups.length === 0) {
    statusEl.textContent = 'No lookups to clear.';
    return;
  }
  if (!confirm(`Delete all ${lookups.length} lookup(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  resultsSection.hidden = true;
  statusEl.textContent = 'All lookups cleared from this browser.';
  renderSummary();
  renderLookupList();
}

// ===== Initialise =====
populateOmbudsmanSelect();
renderSummary();
renderLookupList();

ombudsmanSelect.addEventListener('change', () => {
  populateIssueTypes(ombudsmanSelect.value);
});

form.addEventListener('submit', handleSubmit);

document.querySelector('#exportJson')?.addEventListener('click', handleExport);
document.querySelector('#clearAll')?.addEventListener('click', handleClearAll);

initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
