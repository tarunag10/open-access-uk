const NOTICE_TYPES = [
  { id: 'section21', name: 'Section 21 (No-Fault)', noticeDays: 62, description: 'No-fault eviction (being abolished for new tenancies)', source: 'housing-act-1988-s21' },
  { id: 'section8-ground8', name: 'Section 8 - Ground 8 (Mandatory)', noticeDays: 14, description: 'At least 2 months rent arrears (2+ months at notice and hearing)', source: 'housing-act-1988-s8' },
  { id: 'section8-ground10', name: 'Section 8 - Ground 10', noticeDays: 14, description: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'section8-ground11', name: 'Section 8 - Ground 11', noticeDays: 14, description: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'section8-ground12', name: 'Section 8 - Ground 12', noticeDays: 14, description: 'Breach of tenancy obligation', source: 'housing-act-1988-s8' },
  { id: 'section8-ground14', name: 'Section 8 - Ground 14', noticeDays: 14, description: 'Nuisance or anti-social behaviour', source: 'housing-act-1988-s8' }
];

const GROUNDS_OF_SECTION8 = [
  { id: 'ground8', noticeDays: 14, type: 'mandatory', requirement: 'At least 2 months rent arrears at time of notice and at hearing', source: 'housing-act-1988-s8' },
  { id: 'ground10', noticeDays: 14, type: 'discretionary', requirement: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'ground11', noticeDays: 14, type: 'discretionary', requirement: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'ground12', noticeDays: 14, type: 'discretionary', requirement: 'Breach of any obligation of the tenancy', source: 'housing-act-1988-s8' },
  { id: 'ground14', noticeDays: 14, type: 'discretionary', requirement: 'Nuisance or anti-social behaviour, or convicted of offence in connection with tenancy', source: 'housing-act-1988-s8' }
];

const DEPOSIT_PROTECTION_CHECKLIST = [
  { id: 'deposit-paid', description: 'Deposit was paid by the tenant', required: true },
  { id: 'protection-certificate', description: 'Deposit protected within 30 days in a government-approved scheme', required: true },
  { id: 'prescribed-information', description: 'Prescribed information served on tenant within 30 days of deposit being received', required: true },
  { id: 'scheme-name', description: 'Name and contact details of the tenancy deposit scheme used', required: true },
  { id: 'deposit-amount', description: 'Amount of deposit and how it is to be repaid', required: true },
  { id: 'landlord-contact', description: 'Landlord name and contact details', required: true }
];

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return NaN;
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function getNoticeTypes() {
  return NOTICE_TYPES.map((t) => ({ ...t }));
}

export function getGroundsOfSection8() {
  return GROUNDS_OF_SECTION8.map((g) => ({ ...g }));
}

export function getDepositProtectionChecklist() {
  return DEPOSIT_PROTECTION_CHECKLIST.map((c) => ({ ...c }));
}

export function validateSection21(data) {
  const errors = [];
  if (!data || !data.noticeServedDate) {
    errors.push('Notice served date is required');
    return { valid: false, errors };
  }
  if (data.possessionDate) {
    const days = daysBetween(data.noticeServedDate, data.possessionDate);
    if (!isNaN(days) && days < 62) {
      errors.push(`Notice period must be at least 2 months (62 days). Only ${days} days given.`);
    }
  }
  if (!data.prescribedForm) errors.push('Prescribed form (Form 6A) must be served with the notice');
  if (!data.depositProtected) errors.push('Deposit must be protected in a government-approved scheme');
  if (data.hmoLicense === false) errors.push('HMO licence required if property is a House in Multiple Occupation');
  if (!data.epcProvided) errors.push('Energy Performance Certificate (EPC) must be provided to the tenant');
  if (!data.gasSafetyCertificate) errors.push('Gas safety certificate must be provided to the tenant');
  return { valid: errors.length === 0, errors };
}

export function validateSection8(data) {
  const errors = [];
  if (!data || !data.ground) {
    errors.push('Ground is required');
    return { valid: false, errors };
  }
  const ground = GROUNDS_OF_SECTION8.find((g) => g.id === data.ground);
  if (!ground) {
    errors.push(`Invalid ground "${data.ground}". Must be one of: ${GROUNDS_OF_SECTION8.map((g) => g.id).join(', ')}`);
    return { valid: false, errors };
  }
  if (!data.noticeServedDate) {
    errors.push('Notice served date is required');
  }
  if (!data.serviceMethod) {
    errors.push('Service method is required (personal or first/second class post)');
  }
  if (data.ground === 'ground8' || data.ground === 'ground10') {
    if (!data.rentArrearsMonths || data.rentArrearsMonths < 2) {
      errors.push(`${ground.id} requires at least 2 months rent arrears at time of notice`);
    }
  }
  if (data.ground === 'ground12' && !data.breachDescription) {
    errors.push('Description of the breach of tenancy obligation is required');
  }
  if (data.ground === 'ground14' && !data.nuisanceDescription) {
    errors.push('Description of the nuisance or anti-social behaviour is required');
  }
  return { valid: errors.length === 0, errors };
}

const NOTICE_TYPE_MAP = {
  section21: 'Section 21',
  'section8-ground8': 'Section 8 (Ground 8)',
  'section8-ground10': 'Section 8 (Ground 10)',
  'section8-ground11': 'Section 8 (Ground 11)',
  'section8-ground12': 'Section 8 (Ground 12)',
  'section8-ground14': 'Section 8 (Ground 14)'
};

export function generateChallengeText(data) {
  const noticeName = NOTICE_TYPE_MAP[data.noticeType] || data.noticeType;
  const lines = [];
  lines.push(`RE: Challenge to ${noticeName} Notice`);
  lines.push('');
  lines.push(`Dear ${data.landlordName || '[Landlord Name]'},`);
  lines.push('');
  lines.push(`I am writing regarding the ${noticeName} notice served on ${data.tenantName || '[Tenant Name]'}.`);
  lines.push('');
  lines.push('I believe the above notice is invalid for the following reason(s):');
  lines.push('');
  for (const issue of (data.issues || [])) {
    lines.push(`- ${issue}`);
  }
  lines.push('');
  lines.push('I request that you withdraw this notice and confirm in writing that no further action will be taken.');
  lines.push('');
  lines.push('If you do not withdraw this notice, I may seek legal advice and apply to the court for an order for costs.');
  lines.push('');
  lines.push('Yours faithfully,');
  lines.push(data.tenantName || '[Tenant Name]');
  return lines.join('\n');
}

export function getCourtTimeline(noticeType) {
  const notice = NOTICE_TYPES.find((t) => t.id === noticeType) || NOTICE_TYPES[0];
  const noticeDays = notice.noticeDays;
  return [
    { name: 'Notice Period', minDays: noticeDays, description: `${notice.name} notice period` },
    { name: 'Possession Hearing', minDays: 28, description: 'Court possession hearing (typically 28+ days after notice expires)' },
    { name: 'Bailiff Warrant', minDays: 28, description: 'Bailiff enforcement if tenant does not leave (28+ days after court order)' }
  ];
}

export function serializeEviction(value) {
  return JSON.stringify(value);
}

export function parseEviction(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
