import {
  getAppealTypes,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline,
  generateMRText,
  generateSSCS1Text,
  getDescriptorGuidance,
  parseAppeals,
  serializeAppeals
} from '../../shared/appeals/index.mjs';

const APPEAL_STATUSES = [
  { value: 'mr_draft', label: 'MR draft', description: 'Mandatory reconsideration not yet sent.' },
  { value: 'mr_sent', label: 'MR sent', description: 'MR request sent to DWP.' },
  { value: 'mr_refused', label: 'MR refused', description: 'DWP refused the mandatory reconsideration.' },
  { value: 'mr_allowed', label: 'MR allowed', description: 'DWP changed the decision at MR stage.' },
  { value: 'tribunal_draft', label: 'Tribunal draft', description: 'SSCS1 form not yet sent.' },
  { value: 'tribunal_submitted', label: 'Tribunal submitted', description: 'Appeal submitted to HMCTS.' },
  { value: 'tribunal_hearing', label: 'Hearing listed', description: 'Tribunal hearing date set.' },
  { value: 'tribunal_allowed', label: 'Tribunal allowed', description: 'Appeal allowed by tribunal.' },
  { value: 'tribunal_refused', label: 'Tribunal refused', description: 'Appeal refused by tribunal.' },
  { value: 'closed', label: 'Closed', description: 'Appeal concluded or withdrawn.' }
];

function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `appeal-${stamp}-${random}`;
}

function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    benefitType: data.benefitType || 'pip',
    decisionDate: data.decisionDate || '',
    nationalInsurance: String(data.nationalInsurance || '').trim(),
    grounds: String(data.grounds || '').trim(),
    mrReference: String(data.mrReference || '').trim(),
    mrDecisionDate: data.mrDecisionDate || '',
    status: data.status || 'mr_draft',
    appealName: String(data.appealName || '').trim(),
    appealContact: String(data.appealContact || '').trim(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function parseAppealsList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

function serializeAppealsList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

function getStatusMeta(status) {
  return APPEAL_STATUSES.find((s) => s.value === status) || APPEAL_STATUSES[0];
}

function getBenefitName(benefitType) {
  const types = getAppealTypes();
  const found = types.find((b) => b.id === benefitType);
  return found ? found.name : benefitType;
}

function renderAppeals(appeals, container) {
  container.replaceChildren();
  if (appeals.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No appeals tracked yet. Use the form to generate an MR or tribunal letter.';
    container.append(empty);
    return;
  }
  const sorted = [...appeals].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  for (const appeal of sorted) {
    container.append(renderAppealCard(appeal));
  }
}

function renderAppealCard(appeal) {
  const item = document.createElement('article');
  item.className = 'request-item';
  if (appeal.id === window.__activeAppealId) item.classList.add('active');

  const head = document.createElement('header');
  const title = document.createElement('h3');
  title.textContent = getBenefitName(appeal.benefitType);
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = getStatusMeta(appeal.status).label;
  head.append(title, status);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const decided = appeal.decisionDate || 'No date';
  meta.textContent = `Decision: ${decided}`;

  const timeline = renderTimeline(appeal);

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  const viewBtn = document.createElement('button');
  viewBtn.type = 'button';
  viewBtn.textContent = 'View';
  viewBtn.addEventListener('click', () => {
    window.__selectAppeal(appeal.id);
  });
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'secondary';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    window.__deleteAppeal(appeal.id);
  });
  actions.append(viewBtn, deleteBtn);

  item.append(head, meta, timeline, actions);
  return item;
}

function renderTimeline(appeal) {
  const wrap = document.createElement('div');
  wrap.className = 'appeal-timeline';

  const mrDeadline = getMandatoryReconsiderationDeadline(appeal.benefitType);
  const tribunalDeadline = getTribunalDeadline(appeal.benefitType);

  if (appeal.decisionDate) {
    const d = document.createElement('p');
    d.className = 'timeline-item';
    d.textContent = `Decision date: ${formatDate(appeal.decisionDate)}`;
    wrap.append(d);
  }

  if (appeal.decisionDate && mrDeadline) {
    const deadline = computeMonthsDeadline(appeal.decisionDate, mrDeadline.months);
    const d = document.createElement('p');
    d.className = 'timeline-item';
    const overdue = isOverdue(deadline);
    if (overdue) {
      d.classList.add('overdue');
    }
    d.textContent = `MR deadline: ${deadline || 'unknown'}${overdue ? ' (overdue)' : ''}`;
    wrap.append(d);
  }

  if (appeal.mrDecisionDate && tribunalDeadline) {
    const deadline = computeMonthsDeadline(appeal.mrDecisionDate, tribunalDeadline.months);
    const d = document.createElement('p');
    d.className = 'timeline-item';
    const overdue = isOverdue(deadline);
    if (overdue) {
      d.classList.add('overdue');
    }
    d.textContent = `Tribunal deadline: ${deadline || 'unknown'}${overdue ? ' (overdue)' : ''}`;
    wrap.append(d);
  }

  return wrap;
}

function computeMonthsDeadline(dateStr, months) {
  if (!dateStr) return null;
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  d.setUTCMonth(d.getUTCMonth() + months);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return todayStr > dateStr;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
}

function generateLetterPreview(appeal) {
  const data = {
    benefitType: appeal.benefitType,
    decisionDate: appeal.decisionDate,
    nationalInsurance: appeal.nationalInsurance,
    grounds: appeal.grounds,
    mrDecisionDate: appeal.mrDecisionDate
  };

  if (appeal.status === 'mr_draft' || appeal.status === 'mr_sent') {
    return generateMRText(data);
  }
  return generateSSCS1Text(data);
}

export {
  APPEAL_STATUSES,
  createAppeal,
  parseAppealsList,
  serializeAppealsList,
  getStatusMeta,
  getBenefitName,
  renderAppeals,
  renderAppealCard,
  renderTimeline,
  generateLetterPreview,
  getDescriptorGuidance,
  getAppealTypes,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline
};
