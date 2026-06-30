import {
  getAuthorityTypes,
  getDefaultAuthorities,
  createBatchRequest,
  calculateBatchDeadlines,
  generateBatchCoverLetter,
  aggregateBatchResponses,
  exportBatchCSV,
  serializeBatchFOI,
  parseBatchFOI
} from '../../shared/batch-foi/index.mjs';

import { addWorkingDays, formatDateForDisplay } from '../../shared/deadlines/index.mjs';

function calculateDaysRemaining(sentDate, today = new Date()) {
  if (!sentDate) return null;
  const deadline = addWorkingDays(sentDate, 20);
  if (!deadline) return null;

  const target = new Date(
    Number(deadline.slice(0, 4)),
    Number(deadline.slice(5, 7)) - 1,
    Number(deadline.slice(8, 10))
  );
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  return Math.round((target - today_) / (1000 * 60 * 60 * 24));
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

function renderBatchCard(batch) {
  const days = calculateDaysRemaining(batch.sentDate);
  const total = batch.authorities.length;
  const received = batch.authorities.filter((a) => a.responseDate).length;

  let deadlineText = 'Add a sent date to see the deadline.';
  if (days !== null) {
    if (days < 0) {
      deadlineText = `Overdue by ${Math.abs(days)} day(s). Follow up with authorities.`;
    } else if (days === 0) {
      deadlineText = 'Deadline is today.';
    } else {
      deadlineText = `${days} day(s) remaining.`;
    }
  }

  const statusCls = days !== null && days < 0 ? ' status-overdue' : '';

  return `
    <header>
      <h3>${escapeHtml(batch.subject)}</h3>
      <span class="status-pill">${total} ${total === 1 ? 'authority' : 'authorities'}</span>
    </header>
    <p class="meta">${escapeHtml(batch.description || 'No description')} — ${batch.sentDate || 'not sent'}</p>
    <p class="deadline${statusCls}">${deadlineText}</p>
    <p class="meta">${received} of ${total} responses received</p>
    <div class="item-actions">
      <button type="button" data-action="view" data-id="${batch.id}">View</button>
      <button type="button" data-action="delete" data-id="${batch.id}" class="secondary">Delete</button>
    </div>`;
}

function renderBatches(batches, container) {
  container.replaceChildren();
  if (batches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No FOI batches yet. Create one using the form to start tracking.';
    container.append(empty);
    return;
  }
  const sorted = [...batches].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.sentDate);
    const bDays = calculateDaysRemaining(b.sentDate);
    const aOverdue = aDays !== null && aDays < 0 ? 0 : 1;
    const bOverdue = bDays !== null && bDays < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  for (const batch of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    const days = calculateDaysRemaining(batch.sentDate);
    if (days !== null && days < 0) item.classList.add('overdue');
    item.innerHTML = renderBatchCard(batch);
    container.append(item);
  }
}

export {
  getAuthorityTypes,
  getDefaultAuthorities,
  createBatchRequest,
  calculateBatchDeadlines,
  generateBatchCoverLetter,
  aggregateBatchResponses,
  exportBatchCSV,
  serializeBatchFOI,
  parseBatchFOI,
  calculateDaysRemaining,
  escapeHtml,
  renderBatchCard,
  renderBatches,
  formatDateForDisplay
};
