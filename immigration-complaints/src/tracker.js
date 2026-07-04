import {
  getComplaintTypes,
  getComplaintDeadlines,
  generateComplaintText,
  getEscalationRoute,
  getRequiredDocuments,
  generateICIBIText,
  getHomeOfficeContactInfo,
  serializeImmigration,
  parseImmigration
} from '../../shared/immigration/index.mjs';

const COMPLAINT_TYPES = getComplaintTypes();

function typeById(id) {
  return COMPLAINT_TYPES.find((t) => t.id === id) || null;
}

function calculateDaysRemaining(sentDate, typeId, today = new Date()) {
  const deadline = getComplaintDeadlines(typeId, sentDate);
  if (!deadline || !deadline.deadlineDate) return null;

  const match = String(deadline.deadlineDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const target = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((target - today_) / (1000 * 60 * 60 * 24));
}

function filterByType(complaints, typeId) {
  if (!typeId) return complaints;
  return complaints.filter((c) => c.complaintType === typeId);
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

function renderComplaintCard(complaint) {
  const type = typeById(complaint.complaintType);
  const days = calculateDaysRemaining(complaint.dateSubmitted, complaint.complaintType);

  let deadlineText = 'Add a submission date to see the deadline.';
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
      <h3>${escapeHtml(complaint.complainantName || 'Untitled complaint')}</h3>
      <span class="status-pill type-${complaint.complaintType}">${type ? type.name : complaint.complaintType}</span>
    </header>
    <p class="meta">${escapeHtml(complaint.description || 'No description')} — ${complaint.dateSubmitted || 'not submitted'}</p>
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
    empty.textContent = 'No immigration complaints yet. Add one using the form to start tracking.';
    container.append(empty);
    return;
  }
  const sorted = [...complaints].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.dateSubmitted, a.complaintType);
    const bDays = calculateDaysRemaining(b.dateSubmitted, b.complaintType);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const complaint of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(complaint.dateSubmitted, complaint.complaintType);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderComplaintCard(complaint);
    container.append(item);
  }
}

export {
  COMPLAINT_TYPES,
  typeById,
  calculateDaysRemaining,
  filterByType,
  renderComplaintCard,
  renderComplaints,
  escapeHtml,
  getComplaintTypes,
  getComplaintDeadlines,
  generateComplaintText,
  getEscalationRoute,
  getRequiredDocuments,
  generateICIBIText,
  getHomeOfficeContactInfo,
  serializeImmigration,
  parseImmigration
};
