import {
  getFormats,
  getFormatDetails,
  generateRequestText,
  getFormatRequirements,
  getOrganisationRoutes,
  getEqualityActRights,
  getMonitoringInfo,
  serializeAccessibleFormats,
  parseAccessibleFormats
} from '../../shared/accessible-formats/index.mjs';

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
