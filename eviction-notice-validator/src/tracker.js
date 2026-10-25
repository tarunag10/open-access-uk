import {
  getNoticeTypes,
  getGroundsOfSection8,
  getDepositProtectionChecklist,
  validateSection21,
  validateSection8,
  generateChallengeText,
  getCourtTimeline,
  serializeEviction,
  parseEviction
} from '../../shared/eviction/index.mjs';
import {
  BUSINESS_TENANCY_SOURCES,
  validateBusinessTenancyNotice
} from '../../shared/eviction/business-tenancy.mjs';

const DEPOSIT_SCHEMES = [
  { value: 'dps', label: 'Deposit Protection Service (DPS)' },
  { value: 'mydeposits', label: 'mydeposits' },
  { value: 'tenancy-deposit-scheme', label: 'Tenancy Deposit Scheme (TDS)' }
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

function toSection8ValidationData(data, ground) {
  return {
    ground,
    noticeServedDate: data.noticeServedDate,
    possessionDate: data.possessionDate,
    tenancyStartDate: data.tenancyStartDate,
    noticeForm: data.noticeForm,
    serviceMethod: data.serviceMethod,
    rentArrearsMonths: data.rentArrearsMonths ? Number(data.rentArrearsMonths) : 0,
    rentArrearsMonthsAtNotice: data.rentArrearsMonths ? Number(data.rentArrearsMonths) : 0,
    rentArrearsMonthsAtHearing: data.rentArrearsMonthsAtHearing
      ? Number(data.rentArrearsMonthsAtHearing)
      : 0,
    landlordIntentionEvidence: data.landlordIntentionEvidence?.trim(),
    breachDescription: data.breachDescription,
    nuisanceDescription: data.nuisanceDescription
  };
}

function initBusinessTenancyUI() {
  if (typeof document === 'undefined') return;
  const businessForm = document.querySelector('#business-tenancy-form');
  const businessResult = document.querySelector('#business-result');
  const businessStatus = document.querySelector('#business-form-status');
  const businessTab = document.querySelector('#business-tab');
  const residentialTab = document.querySelector('#residential-tab');
  const businessPanel = document.querySelector('#business-tenancy-panel');
  const residentialPanel = document.querySelector('#tool');
  const section25Fields = document.querySelector('#section25-fields');
  const section26Fields = document.querySelector('#section26-fields');
  const form1Fields = document.querySelector('#form1-fields');
  const oppositionFields = document.querySelector('#opposition-fields');

  function selectWorkflow(workflow) {
    const isBusiness = workflow === 'business';
    if (businessPanel) businessPanel.hidden = !isBusiness;
    if (residentialPanel) residentialPanel.hidden = isBusiness;
    businessTab?.setAttribute('aria-selected', String(isBusiness));
    residentialTab?.setAttribute('aria-selected', String(!isBusiness));
    businessTab?.setAttribute('tabindex', isBusiness ? '0' : '-1');
    residentialTab?.setAttribute('tabindex', isBusiness ? '-1' : '0');
  }

  function updateFields() {
    const type = businessForm?.elements.namedItem('noticeType')?.value;
    const is25 = type === 'section25';
    const is26 = type === 'section26';
    const opposition = businessForm?.elements.namedItem('opposition')?.value === 'opposed';
    const responseOpposes =
      businessForm?.elements.namedItem('landlordResponse')?.value === 'opposes';
    const isForm1 = is25 && businessForm?.elements.namedItem('noticeForm')?.value === 'form1';
    if (section25Fields) section25Fields.hidden = !is25;
    if (section26Fields) section26Fields.hidden = !is26;
    if (form1Fields) form1Fields.hidden = !isForm1;
    if (oppositionFields)
      oppositionFields.hidden = !(is25 && opposition) && !(is26 && responseOpposes);
    const fieldRequired = [
      ['terminationDate', is25],
      ['opposition', is25],
      ['newTenancyDate', is26],
      ['proposedTerms', is26],
      ['landlordResponse', is26],
      ['proposedProperty', is26],
      ['landlordProposedTerms', isForm1]
    ];
    for (const [name, required] of fieldRequired) {
      const field = businessForm?.elements.namedItem(name);
      if (field) field.required = required;
    }
  }

  businessTab?.addEventListener('click', () => selectWorkflow('business'));
  residentialTab?.addEventListener('click', () => selectWorkflow('residential'));
  for (const [button, workflow] of [
    [businessTab, 'business'],
    [residentialTab, 'residential']
  ]) {
    button?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const nextWorkflow = workflow === 'business' ? 'residential' : 'business';
        selectWorkflow(nextWorkflow);
        (nextWorkflow === 'business' ? businessTab : residentialTab)?.focus();
      }
    });
  }
  businessForm?.addEventListener('change', updateFields);
  businessForm?.addEventListener('input', updateFields);
  businessForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = validateBusinessTenancyNotice(
      Object.fromEntries(new FormData(businessForm).entries())
    );
    const heading = document.createElement('p');
    heading.textContent = result.valid
      ? 'No issues found in the limited fields checked. This is not confirmation of validity.'
      : `${result.errors.length} item(s) need review.`;
    const list = document.createElement('ul');
    for (const message of [...result.errors, ...result.warnings]) {
      const item = document.createElement('li');
      item.textContent = message;
      list.append(item);
    }
    businessResult?.replaceChildren(heading, list);
    businessStatus.textContent = result.valid
      ? 'Checklist complete. Verify the notice against the current prescribed form and obtain legal advice as needed.'
      : 'Some details need review. This checklist does not determine legal validity.';
  });
  businessForm?.addEventListener('reset', () => {
    queueMicrotask(() => {
      updateFields();
      if (businessResult)
        businessResult.textContent = 'Complete the form to see date and completeness checks.';
      if (businessStatus) businessStatus.textContent = 'Business tenancy form cleared.';
    });
  });
  updateFields();
}

initBusinessTenancyUI();

export {
  DEPOSIT_SCHEMES,
  escapeHtml,
  getNoticeTypes,
  getGroundsOfSection8,
  getDepositProtectionChecklist,
  validateSection21,
  validateSection8,
  generateChallengeText,
  getCourtTimeline,
  serializeEviction,
  parseEviction,
  BUSINESS_TENANCY_SOURCES,
  validateBusinessTenancyNotice,
  initBusinessTenancyUI,
  toSection8ValidationData
};
