import {
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getTypicalOutcomes,
  getUnsourcedStatsNotice,
  getCompensationRanges,
  getDecisionTimescales,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes
} from '../../shared/ombudsman-outcomes/index.mjs';

function getIssueTypes(ombudsmanId) {
  const ombudsman = getOmbudsmanDetails(ombudsmanId);
  if (!ombudsman) return [];
  return [
    { value: 'complaint-handling', label: 'Complaint handling' },
    { value: 'clinical-negligence', label: 'Clinical negligence' },
    { value: 'disrepair', label: 'Disrepair' },
    { value: 'maladministration', label: 'Maladministration' },
    { value: 'billing', label: 'Billing' },
    { value: 'service', label: 'Service' }
  ];
}

function getAvailableIssueTypes(ombudsmanId) {
  const ombudsman = getOmbudsmanDetails(ombudsmanId);
  if (!ombudsman) return [];
  const outcomes = getTypicalOutcomes(ombudsmanId, 'complaint-handling');
  if (outcomes && outcomes.length > 0) {
    return [{ value: 'complaint-handling', label: 'Complaint handling' }];
  }
  return [];
}

function formatCurrency(amount) {
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  }
  return String(amount || 'Varies');
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-GB').format(num || 0);
}

function renderOmbudsmanSummary(ombudsmanId) {
  const details = getOmbudsmanDetails(ombudsmanId);
  const timescales = getDecisionTimescales(ombudsmanId);
  const compensation = getCompensationRanges(ombudsmanId);

  if (!details) return '';

  const lines = [];
  lines.push(details.name);
  lines.push(`Sectors: ${details.sectors.join(', ')}`);
  lines.push(`Website: ${details.website}`);
  if (timescales) {
    lines.push(`Initial response: ${timescales.initialResponse}`);
    lines.push(`Full investigation: ${timescales.fullInvestigation}`);
  }
  if (compensation) {
    lines.push(`Typical compensation: ${compensation.typical}`);
  }
  lines.push('');
  lines.push(getUnsourcedStatsNotice());
  return lines.join('\n');
}

function renderOutcomeResults(ombudsmanId, issueType) {
  const details = getOmbudsmanDetails(ombudsmanId);
  const compensation = getCompensationRanges(ombudsmanId);
  const timescales = getDecisionTimescales(ombudsmanId);

  if (!details) return '';

  const sections = [];
  sections.push(`<p class="uncited-warning" role="note">${getUnsourcedStatsNotice()}</p>`);

  sections.push(`<h4>About ${details.name}</h4>`);
  sections.push(`<p>Sectors: ${details.sectors.join(', ')}</p>`);
  sections.push(`<p><a href="${details.website}" rel="noopener noreferrer">Visit website</a></p>`);

  if (compensation) {
    sections.push(`<h4>Compensation</h4>`);
    sections.push(`<p>Typical: ${compensation.typical}</p>`);
    if (compensation.max) sections.push(`<p>Maximum: ${compensation.max}</p>`);
    if (compensation.note) sections.push(`<p>${compensation.note}</p>`);
  }

  if (timescales) {
    sections.push(`<h4>Decision timescales</h4>`);
    sections.push(`<p>Initial response: ${timescales.initialResponse}</p>`);
    sections.push(`<p>Full investigation: ${timescales.fullInvestigation}</p>`);
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
  getUnsourcedStatsNotice,
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
