import {
  getFeeCategories,
  getFeeSchedules,
  calculateFee,
  getHelpWithFeesEligibility,
  getExemptions,
  generateFeeEstimate,
  getFeeRemissionForm,
  serializeFeesCalculator,
  parseFeesCalculator
} from '../../shared/fees-calculator/index.mjs';

const CATEGORY_LABELS = {
  'county-court': 'County Court',
  'employment-tribunal': 'Employment Tribunal',
  'family-court': 'Family Court',
  'immigration-tribunal': 'Immigration Tribunal',
  'property-tribunal': 'Property Tribunal'
};

function formatCurrency(amount) {
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function renderFeeResult(estimate, eligibility) {
  let html = '<div class="fee-breakdown">';
  html += `<p class="fee-total">${formatCurrency(estimate.totalFee)}</p>`;
  html += `<p class="fee-category">${escapeHtml(CATEGORY_LABELS[estimate.category] || estimate.category)} — Claim: ${formatCurrency(estimate.claimAmount)}</p>`;

  if (estimate.items.length > 1) {
    html += '<ul class="fee-items">';
    for (const item of estimate.items) {
      html += `<li>${escapeHtml(item.description)}: ${formatCurrency(item.amount)}</li>`;
    }
    html += '</ul>';
  }

  if (eligibility) {
    html += `<div class="hwf-result ${eligibility.eligible ? 'eligible' : 'ineligible'}">`;
    html += `<strong>Help with Fees:</strong> ${eligibility.eligible ? 'Likely eligible' : 'Not eligible'}`;
    html += `<br/><span>${escapeHtml(eligibility.reason)}</span>`;
    html += '</div>';

    if (eligibility.eligible) {
      const form = getFeeRemissionForm();
      html += `<p class="hwf-form">Apply using form <strong>${escapeHtml(form.reference)}</strong> (${escapeHtml(form.name)})</p>`;
    }
  }

  html += '</div>';
  return html;
}

function renderCalcCard(calc) {
  const label = CATEGORY_LABELS[calc.category] || calc.category;
  return `
    <header>
      <h4>${escapeHtml(label)}</h4>
      <span class="fee-badge">${formatCurrency(calc.totalFee)}</span>
    </header>
    <p class="meta">Claim: ${formatCurrency(calc.claimAmount)} — ${calc.createdAt}</p>
    <div class="item-actions">
      <button type="button" data-action="recalc" data-category="${escapeHtml(calc.category)}" data-amount="${calc.claimAmount}">Recalculate</button>
      <button type="button" data-action="delete" data-id="${calc.id}" class="secondary">Delete</button>
    </div>`;
}

function renderCalcList(calcs, container) {
  container.replaceChildren();
  if (calcs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No calculations yet. Use the form above to calculate a fee.';
    container.append(empty);
    return;
  }
  const sorted = [...calcs].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  for (const calc of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    item.innerHTML = renderCalcCard(calc);
    container.append(item);
  }
}

export {
  CATEGORY_LABELS,
  formatCurrency,
  escapeHtml,
  renderFeeResult,
  renderCalcCard,
  renderCalcList,
  getFeeCategories,
  getFeeSchedules,
  calculateFee,
  getHelpWithFeesEligibility,
  getExemptions,
  generateFeeEstimate,
  getFeeRemissionForm,
  serializeFeesCalculator,
  parseFeesCalculator
};
