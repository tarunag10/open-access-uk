import {
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getTypicalOutcomes,
  getCompensationRanges,
  getDecisionTimescales,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes
} from '../../shared/ombudsman-outcomes/index.mjs';

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
