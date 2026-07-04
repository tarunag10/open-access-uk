import {
  getSanctionTypes,
  getSanctionDeductionRates,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline,
  generateMRText,
  getGoodReasonsLibrary,
  getHardshipPaymentEligibility,
  generateHardshipPaymentRequest,
  serializeUCSanctions,
  parseUCSanctions
} from '../../shared/uc-sanctions/index.mjs';

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
    throw new Error(
      `Invalid sanction type "${sanctionType}". Must be one of: ${validTypes.join(', ')}`
    );
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
    empty.textContent =
      'No UC sanctions challenges yet. Add one using the form to start building your MR request.';
    container.append(empty);
    return;
  }
  const sorted = [...challenges].sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );
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
