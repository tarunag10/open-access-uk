import {
  createComplaintRecord,
  getComplaintStages,
  getNextStage,
  getDeadlineForStage,
  generateComplaintSummary,
  serializeComplaints,
  parseComplaints
} from '../../shared/complaints/index.mjs';

const ORGANISATION_TYPES = [
  { value: 'gp', label: 'GP Practice' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'trust', label: 'NHS Trust' },
  { value: 'ccg', label: 'Clinical Commissioning Group' }
];

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkingDaysLocal(date, days) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toLocalDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function calculateDaysRemaining(sentDate, stageId, today = new Date()) {
  const stage = getComplaintStages().find((s) => s.id === stageId);
  if (!stage || !sentDate) return null;

  const deadlineInfo = getDeadlineForStage(stageId, sentDate);
  if (!deadlineInfo) return null;

  let targetDate = null;
  if (deadlineInfo.responseDate) {
    targetDate = parseLocalDate(deadlineInfo.responseDate);
  } else if (deadlineInfo.deadlineDate) {
    targetDate = parseLocalDate(deadlineInfo.deadlineDate);
  }

  if (!targetDate) return null;

  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((targetDate - today_) / (1000 * 60 * 60 * 24));
}

function filterByStage(complaints, stageId) {
  if (!stageId) return complaints;
  return complaints.filter((c) => c.stage === stageId);
}

function renderTimeline(complaint) {
  const stages = getComplaintStages();
  const currentIdx = stages.findIndex((s) => s.id === complaint.stage);

  let html = '<ol class="timeline" aria-label="Complaint stages">';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isComplete = i < currentIdx;
    const isCurrent = i === currentIdx;
    const cls = isComplete
      ? 'timeline-complete'
      : isCurrent
        ? 'timeline-current'
        : 'timeline-future';
    html += `<li class="${cls}" aria-current="${isCurrent ? 'step' : 'false'}">`;
    html += `<strong>${stage.name}</strong>`;
    html += `<span>${stage.description}</span>`;
    html += '</li>';
  }
  html += '</ol>';
  return html;
}

function renderComplaintCard(complaint) {
  const stage = getComplaintStages().find((s) => s.id === complaint.stage);
  const days = calculateDaysRemaining(complaint.sentDate, complaint.stage);

  let deadlineText = 'Add a sent date to see the deadline.';
  if (days !== null) {
    if (days < 0) {
      deadlineText = `Overdue by ${Math.abs(days)} day(s). Consider escalating.`;
    } else if (days === 0) {
      deadlineText = 'Deadline is today.';
    } else {
      deadlineText = `${days} day(s) remaining.`;
    }
  }

  const statusCls = days !== null && days < 0 ? ' status-overdue' : '';

  return `
    <header>
      <h3>${escapeHtml(complaint.trustName || 'Untitled complaint')}</h3>
      <span class="status-pill stage-${complaint.stage}">${stage ? stage.name : complaint.stage}</span>
    </header>
    <p class="meta">${escapeHtml(complaint.description || 'No description')} — ${complaint.sentDate || 'not sent'}</p>
    <p class="deadline${statusCls}">${deadlineText}</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${complaint.id}">View</button>
      <button type="button" data-action="delete" data-id="${complaint.id}" class="secondary">Delete</button>
    </div>`;
}

function renderComplaints(complaints, container) {
  container.replaceChildren();
  if (complaints.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No NHS complaints yet. Add one using the form to start tracking complaint stages.';
    container.append(empty);
    return;
  }
  const sorted = [...complaints].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.sentDate, a.stage);
    const bDays = calculateDaysRemaining(b.sentDate, b.stage);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const complaint of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(complaint.sentDate, complaint.stage);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderComplaintCard(complaint);
    container.append(item);
  }
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
  ORGANISATION_TYPES,
  calculateDaysRemaining,
  filterByStage,
  renderTimeline,
  renderComplaintCard,
  renderComplaints,
  escapeHtml,
  createComplaintRecord,
  getComplaintStages,
  getNextStage,
  getDeadlineForStage,
  generateComplaintSummary,
  serializeComplaints,
  parseComplaints
};
