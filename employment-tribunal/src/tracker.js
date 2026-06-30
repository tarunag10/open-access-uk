import {
  getClaimTypes,
  getACASDeadline,
  getET1Deadline,
  getRemedyCalculator,
  generateET1Text,
  generateACASText,
  getChronologyTemplate,
  serializeEmployment,
  parseEmployment
} from '../../shared/employment/index.mjs';

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

function renderClaimCard(claim) {
  const claimTypes = getClaimTypes();
  const claimType = claimTypes.find((c) => c.id === claim.claimType);
  const typeName = claimType ? claimType.name : claim.claimType || 'Unknown';

  const acasDeadline = getACASDeadline(claim.dismissalDate);
  const et1Deadline = claim.acasCertDate ? getET1Deadline(claim.acasCertDate) : null;

  let deadlineText = 'Add a dismissal date to see ACAS deadline.';
  if (acasDeadline) {
    deadlineText = `ACAS deadline: ${acasDeadline}`;
  }
  if (et1Deadline) {
    deadlineText += ` | ET1 deadline: ${et1Deadline}`;
  }

  return `
    <header>
      <h3>${escapeHtml(claim.employerName || 'Untitled claim')}</h3>
      <span class="status-pill claim-${claim.claimType}">${typeName}</span>
    </header>
    <p class="meta">${escapeHtml(claim.claimantName || 'No claimant')} — ${claim.dismissalDate || 'No dismissal date'}</p>
    <p class="deadline">${deadlineText}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${claim.id}">View</button>
      <button type="button" data-action="delete" data-id="${claim.id}" class="secondary">Delete</button>
    </div>`;
}

function renderClaims(claims, container) {
  container.replaceChildren();
  if (claims.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No employment tribunal claims yet. Add one using the form to start building your ET1.';
    container.append(empty);
    return;
  }
  const sorted = [...claims].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  for (const claim of sorted) {
    const item = document.createElement('article');
    item.className = 'claim-item';
    item.innerHTML = renderClaimCard(claim);
    container.append(item);
  }
}

function renderTimeline(claim) {
  const chronology = getChronologyTemplate();
  let html = '<ol class="timeline" aria-label="Claim chronology">';
  for (const step of chronology) {
    const date = claim[step.dateField] || '';
    const cls = date ? 'timeline-complete' : 'timeline-future';
    html += `<li class="${cls}">`;
    html += `<strong>${step.label}</strong>`;
    html += `<span>${date || 'Not yet recorded'}</span>`;
    html += '</li>';
  }
  html += '</ol>';
  return html;
}

export {
  getClaimTypes,
  getACASDeadline,
  getET1Deadline,
  getRemedyCalculator,
  generateET1Text,
  generateACASText,
  getChronologyTemplate,
  serializeEmployment,
  parseEmployment,
  escapeHtml,
  renderClaimCard,
  renderClaims,
  renderTimeline
};
