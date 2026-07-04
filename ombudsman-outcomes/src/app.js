// ombudsman-outcomes/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs ombudsman-outcomes

// ===== ../../shared/ombudsman-outcomes/index.mjs =====
/**
 * Ombudsman outcomes data and routing.
 *
 * OUTCOME_STATISTICS and TYPICAL_OUTCOMES contain illustrative figures
 * that are being re-sourced from each ombudsman's published annual report.
 */

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

// Statistics are illustrative and currently hidden behind a flag.
// They will return with per-figure citations from published annual reports.
const SHOW_UNSOURCED_STATS = false;

const OUTCOME_STATISTICS = {
  PHSO: { totalCases: 7800, upheldRate: 42, notUpheldRate: 38, partiallyUpheldRate: 20, yearlyTrend: [{ year: 2022, cases: 7200 }, { year: 2023, cases: 7500 }, { year: 2024, cases: 7800 }], sectorBreakdown: [{ sector: 'NHS', cases: 6500 }, { sector: 'UK Government', cases: 1300 }] },
  housing: { totalCases: 12000, upheldRate: 55, notUpheldRate: 30, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 9800 }, { year: 2023, cases: 10900 }, { year: 2024, cases: 12000 }], sectorBreakdown: [{ sector: 'Social Housing', cases: 12000 }] },
  financial: { totalCases: 420000, upheldRate: 38, notUpheldRate: 45, partiallyUpheldRate: 17, yearlyTrend: [{ year: 2022, cases: 390000 }, { year: 2023, cases: 410000 }, { year: 2024, cases: 420000 }], sectorBreakdown: [{ sector: 'Finance', cases: 180000 }, { sector: 'Insurance', cases: 120000 }, { sector: 'Banking', cases: 120000 }] },
  rail: { totalCases: 3500, upheldRate: 35, notUpheldRate: 50, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 3000 }, { year: 2023, cases: 3200 }, { year: 2024, cases: 3500 }], sectorBreakdown: [{ sector: 'Rail', cases: 2800 }, { sector: 'Transport', cases: 700 }] },
  legal: { totalCases: 8200, upheldRate: 44, notUpheldRate: 35, partiallyUpheldRate: 21, yearlyTrend: [{ year: 2022, cases: 7600 }, { year: 2023, cases: 7900 }, { year: 2024, cases: 8200 }], sectorBreakdown: [{ sector: 'Legal Services', cases: 8200 }] }
};

// Flag to show notice about unsourced statistics
function getUnsourcedStatsNotice() {
  return "Outcome statistics are being re-sourced from each ombudsman's published annual report and will return with citations. The ombudsman routing and lookup features remain available.";
}

function getOmbudsmen() {
  return OMBUDSMEN.map((o) => ({ ...o }));
}

function getOutcomeStatistics(ombudsmanId) {
  if (!SHOW_UNSOURCED_STATS) return null;
  const stats = OUTCOME_STATISTICS[ombudsmanId];
  return stats ? { ...stats } : null;
}

function findOmbudsmanForIssue(issueType, nation) {
  // Simplified routing logic — returns the most likely ombudsman
  const issue = (issueType || '').toLowerCase();
  const country = (nation || '').toLowerCase();

  if (issue.includes('nhs') || issue.includes('health') || issue.includes('gp') || issue.includes('hospital')) {
    if (country === 'scotland') return 'PHSO';
    if (country === 'wales') return 'PHSO';
    if (country === 'northern-ireland') return 'PHSO';
    return 'PHSO';
  }
  if (issue.includes('housing') || issue.includes('repair') || issue.includes('landlord')) return 'housing';
  if (issue.includes('bank') || issue.includes('insurance') || issue.includes('finance') || issue.includes('pension')) return 'financial';
  if (issue.includes('rail') || issue.includes('train')) return 'rail';
  if (issue.includes('solicitor') || issue.includes('lawyer') || issue.includes('legal')) return 'legal';
  if (issue.includes('council') || issue.includes('local government') || issue.includes('social care')) return 'local-government';
  if (issue.includes('water') || issue.includes('drainage')) return 'water';
  if (issue.includes('energy') || issue.includes('gas') || issue.includes('electricity')) return 'energy';
  if (issue.includes('phone') || issue.includes('broadband') || issue.includes('mobile') || issue.includes('internet')) return 'telecoms';
  if (issue.includes('police')) return 'police';
  if (issue.includes('immigration') || issue.includes('visa') || issue.includes('home office')) return 'immigration';

  return null;
}

function getCompensationRanges(ombudsmanId) {
  const ranges = {
    PHSO: { typical: '£500–£5,000', max: '£10,000+', note: 'For distress and inconvenience' },
    housing: { typical: '£100–£3,000', max: '£10,000+', note: 'Based on severity and duration of maladministration' },
    financial: { typical: '£100–£5,000', max: '£430,000', note: 'FOS awards are binding up to £430,000 (2025/26 limit)' },
    rail: { typical: '£50–£1,000', max: '£5,000', note: 'Compensation for delay, missed connections, and poor complaint handling' },
    legal: { typical: '£500–£5,000', max: '£50,000+', note: 'Based on distress, inconvenience, and financial loss' }
  };
  return ranges[ombudsmanId] || { typical: 'Varies', max: 'Varies', note: 'Contact the ombudsman for guidance' };
}

function getDecisionTimescales(ombudsmanId) {
  const timescales = {
    PHSO: { initialResponse: '3–6 months', fullInvestigation: '6–12 months' },
    housing: { initialResponse: '4–8 weeks', fullInvestigation: '3–6 months' },
    financial: { initialResponse: '2–4 weeks', fullInvestigation: '3–9 months' },
    rail: { initialResponse: '2–4 weeks', fullInvestigation: '3–6 months' },
    legal: { initialResponse: '4–8 weeks', fullInvestigation: '6–12 months' }
  };
  return timescales[ombudsmanId] || { initialResponse: 'Varies', fullInvestigation: 'Varies' };
}

function getTypicalOutcomes(ombudsmanId, issueType) {
  return []; // Being re-sourced — returns empty until citations are added
}

function serializeOmbudsman(value) {
  return JSON.stringify(value);
}

function parseOmbudsman(value) {
  try {
    return JSON.parse(value || '[]');
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

function getIssueTypes(ombudsmanId) {
  const ombudsman = getOmbudsmanDetails(ombudsmanId);
  if (!ombudsman) return [];
  const stats = getOutcomeStatistics(ombudsmanId);
  if (!stats) return [];
  return [
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
}

function getAvailableIssueTypes(ombudsmanId) {
  const ombudsman = getOmbudsmanDetails(ombudsmanId);
  if (!ombudsman) return [];
  const allTypes = getIssueTypes(ombudsmanId);
  const results = [];
  for (const t of allTypes) {
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
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getTypicalOutcomes,
  getCompensationRanges,
  getDecisionTimescales,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes,
  getIssueTypes,
  getAvailableIssueTypes,
  formatCurrency,
  formatNumber,
  renderOmbudsmanSummary,
  renderOutcomeResults,
  escapeHtml
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
