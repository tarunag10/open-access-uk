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
    const deadlineHeading = document.createElement('h3');
    deadlineHeading.textContent = 'Application deadline (preliminary estimate)';
    const deadlineSummary = document.createElement('p');
    deadlineSummary.textContent =
      result.applicationDeadline.status === 'incomplete'
        ? 'Deadline not calculated. Enter the relevant notice date and confirm any agreed extension.'
        : `Deadline status: ${result.applicationDeadline.status.replaceAll('-', ' ')}. This is not confirmation that an application is valid or in time.`;
    const deadlineList = document.createElement('dl');
    function addDeadline(label, value) {
      if (!value) return;
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      const time = document.createElement('time');
      time.dateTime = value;
      time.textContent = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(new Date(`${value}T00:00:00Z`));
      description.append(time);
      deadlineList.append(term, description);
    }
    addDeadline('Section 29A statutory period ends', result.applicationDeadline.statutoryDate);
    addDeadline(
      'Latest date indicated by recorded Section 29B agreement',
      result.applicationDeadline.extensionDate
    );
    addDeadline('Earliest Section 24(1) application date', result.applicationDeadline.earliestDate);
    const jurisdiction = document.createElement('p');
    jurisdiction.textContent = `Forum indicated for review: ${result.applicationDeadline.jurisdiction === 'court' ? 'court, subject to jurisdiction checks' : 'tribunal jurisdiction may apply; specialist forum check required'}.`;
    const list = document.createElement('ul');
    for (const message of [...result.errors, ...result.warnings]) {
      const item = document.createElement('li');
      item.textContent = message;
      list.append(item);
    }
    businessResult?.replaceChildren(
      heading,
      deadlineHeading,
      deadlineSummary,
      deadlineList,
      jurisdiction,
      list
    );
    businessStatus.textContent =
      result.valid && result.applicationDeadline.status === 'calculated'
        ? 'Checklist complete. Verify the notice against the current prescribed form and obtain legal advice as needed.'
        : 'Some dates or legal details need review. This checklist does not determine legal validity.';
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
