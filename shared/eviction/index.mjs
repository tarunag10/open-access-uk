/**
 * Eviction notice validation — England.
 * Section 21 abolished 1 May 2026 (Renters' Rights Act 2025).
 * Section 8 grounds revised with effect from 1 May 2026.
 */

import { parseLocalDate, toLocalDateString } from '../deadlines/index.mjs';

// ---------------------------------------------------------------------------
// RRA commencement date — the law changed on this date
// ---------------------------------------------------------------------------
export const RRA_COMMENCEMENT = '2026-05-01';
export const SECTION_21_COURT_DEADLINE = '2026-07-31';

// ---------------------------------------------------------------------------
// Notice Types — Section 21 is flagged as abolished post-1 May 2026
// ---------------------------------------------------------------------------
const NOTICE_TYPES = [
  {
    id: 'section21',
    name: 'Section 21 (No-Fault)',
    noticeDays: 62,
    noticePeriodText: '2 calendar months',
    description:
      "Abolished in England on 1 May 2026 by the Renters' Rights Act 2025. Cannot be served on any tenancy after that date.",
    source: 'housing-act-1988-s21',
    abolished: true,
    abolishedDate: '2026-05-01'
  },
  {
    id: 'section8-ground8',
    name: 'Section 8 - Ground 8 (Mandatory)',
    noticeDays: 28,
    description:
      'At least 2 months rent arrears at time of notice and at hearing (pre-RRA). RRA raised threshold to at least 3 months arrears.',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'section8-ground10',
    name: 'Section 8 - Ground 10',
    noticeDays: 28,
    description: 'Some rent arrears at time of service and hearing',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'section8-ground11',
    name: 'Section 8 - Ground 11',
    noticeDays: 28,
    description: 'Persistent delay in paying rent',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'section8-ground12',
    name: 'Section 8 - Ground 12',
    noticeDays: 14,
    description: 'Breach of tenancy obligation',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'section8-ground14',
    name: 'Section 8 - Ground 14',
    noticeDays: 0,
    description:
      'Nuisance or anti-social behaviour — under pre-RRA law proceedings could commence immediately after notice; RRA retains immediacy.',
    source: 'housing-act-1988-s8'
  },
  // RRA-introduced grounds (post-1 May 2026)
  {
    id: 'rra-ground-landlord-sale',
    name: 'RRA Ground — Landlord Intends to Sell',
    noticeDays: 120,
    noticePeriodText: '4 calendar months',
    description:
      'Ground 1A: landlord intends to sell. Four months’ notice; possession date cannot be within the first 12 months of the tenancy.',
    source: 'renters-rights-act-2025'
  },
  {
    id: 'rra-ground-landlord-move-in',
    name: 'RRA Ground — Landlord or Family Move In',
    noticeDays: 120,
    noticePeriodText: '4 calendar months',
    description:
      'Ground 1: landlord or a close family member needs to move in. Four months’ notice; possession date cannot be within the first 12 months of the tenancy.',
    source: 'renters-rights-act-2025'
  },
  {
    id: 'rra-ground-serious-arrears',
    name: 'RRA Ground — Serious Rent Arrears (3+ months)',
    noticeDays: 28,
    description:
      'Ground 8: at least 3 months’ rent arrears at notice and hearing. Four weeks’ notice.',
    source: 'renters-rights-act-2025'
  }
];

const GROUNDS_OF_SECTION8 = [
  {
    id: 'ground8',
    noticeDays: 28,
    type: 'mandatory',
    requirement:
      'At least 3 months’ rent arrears at the notice date and hearing date for notices under the law in force from 1 May 2026. Earlier notices are subject to the former rules and transition limits.',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'ground10',
    noticeDays: 28,
    type: 'discretionary',
    requirement: 'Some rent arrears at time of service and hearing',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'ground11',
    noticeDays: 28,
    type: 'discretionary',
    requirement: 'Persistent delay in paying rent',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'ground12',
    noticeDays: 14,
    type: 'discretionary',
    requirement: 'Breach of any obligation of the tenancy',
    source: 'housing-act-1988-s8'
  },
  {
    id: 'ground14',
    noticeDays: 0,
    type: 'discretionary',
    requirement:
      'Nuisance or anti-social behaviour — proceedings may commence immediately after notice under pre-RRA and RRA law.',
    source: 'housing-act-1988-s8'
  },
  // RRA new grounds
  {
    id: 'rra-ground-landlord-sale',
    noticeDays: 120,
    type: 'mandatory',
    requirement:
      'The landlord intends to sell. The possession date must not fall within the tenancy’s first 12 months.',
    source: 'renters-rights-act-2025'
  },
  {
    id: 'rra-ground-landlord-move-in',
    noticeDays: 120,
    type: 'mandatory',
    requirement:
      'The landlord or a qualifying close family member genuinely intends to occupy the property. The possession date must not fall within the tenancy’s first 12 months.',
    source: 'renters-rights-act-2025'
  },
  {
    id: 'rra-ground-serious-arrears',
    noticeDays: 28,
    type: 'mandatory',
    requirement: 'At least 3 months rent arrears at the notice date and hearing date.',
    source: 'renters-rights-act-2025'
  }
];

const DEPOSIT_PROTECTION_CHECKLIST = [
  { id: 'deposit-paid', description: 'Deposit was paid by the tenant', required: true },
  {
    id: 'protection-certificate',
    description: 'Deposit protected within 30 days in a government-approved scheme',
    required: true
  },
  {
    id: 'prescribed-information',
    description: 'Prescribed information served on tenant within 30 days of deposit being received',
    required: true
  },
  {
    id: 'scheme-name',
    description: 'Name and contact details of the tenancy deposit scheme used',
    required: true
  },
  {
    id: 'deposit-amount',
    description: 'Amount of deposit and how it is to be repaid',
    required: true
  },
  { id: 'landlord-contact', description: 'Landlord name and contact details', required: true }
];

// ---------------------------------------------------------------------------
// RRA Transition Period Check
// ---------------------------------------------------------------------------

/**
 * Checks whether a Section 21 notice is within the transition window.
 * Pre-1 May 2026: valid if served correctly.
 * 1 May – 31 July 2026: court proceedings may still be issued for
 *   a pre-abolition S21 notice (served before 1 May).
 * Post-31 July 2026: no S21 notice can be enforced.
 */
export function checkSection21Transition(noticeServedDate) {
  const served = parseLocalDate(noticeServedDate);
  if (!served)
    return {
      status: 'unknown',
      message: 'Cannot check transition status without a notice served date.'
    };

  const commencement = parseLocalDate(RRA_COMMENCEMENT);
  const courtDeadline = parseLocalDate(SECTION_21_COURT_DEADLINE);

  if (served < commencement) {
    return {
      status: 'transition',
      message: `This Section 21 notice was served before the law changed on 1 May 2026. It could only be used to start court proceedings by 31 July 2026. Existing proceedings started by that deadline may continue. Check the court record.`
    };
  }

  if (served >= commencement && served <= courtDeadline) {
    return {
      status: 'critical',
      message: `Section 21 was abolished on 1 May 2026. A notice served after abolition is invalid. If court proceedings were issued before 31 July 2026 on a pre-abolition notice, they may still proceed. Seek urgent advice from Shelter or a housing solicitor.`
    };
  }

  return {
    status: 'invalid',
    message:
      'Section 21 no-fault evictions were abolished in England on 1 May 2026. Any Section 21 notice served on or after that date is invalid and unenforceable. Landlords using Section 21 after abolition may face a civil penalty of up to £7,000.'
  };
}

// ---------------------------------------------------------------------------
// daysBetween — replaced with UTC-safe parseLocalDate from shared/deadlines
// ---------------------------------------------------------------------------

export function daysBetween(dateA, dateB) {
  const a = parseLocalDate(dateA);
  const b = parseLocalDate(dateB);
  if (!a || !b) return NaN;
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function addCalendarMonths(dateString, months) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return toLocalDateString(target);
}

// ---------------------------------------------------------------------------
// Notice type helpers
// ---------------------------------------------------------------------------

export function getNoticeTypes() {
  return NOTICE_TYPES.map((t) => ({ ...t }));
}

export function getGroundsOfSection8() {
  return GROUNDS_OF_SECTION8.map((g) => ({ ...g }));
}

export function getDepositProtectionChecklist() {
  return DEPOSIT_PROTECTION_CHECKLIST.map((c) => ({ ...c }));
}

// ---------------------------------------------------------------------------
// Validation — Section 21 (hard-blocked for post-abolition dates)
// ---------------------------------------------------------------------------

export function validateSection21(data) {
  const errors = [];

  // Check if Section 21 is valid at all
  if (!data || !data.noticeServedDate) {
    errors.push('Notice served date is required');
    return { valid: false, errors, transition: null };
  }

  const transition = checkSection21Transition(data.noticeServedDate);
  if (transition.status === 'invalid' || transition.status === 'critical') {
    errors.push(transition.message);
    return { valid: false, errors, transition };
  }

  if (!data.proceedingsIssuedDate) {
    errors.push('For a pre-1 May 2026 Section 21 notice, confirm whether court proceedings were issued by 31 July 2026.');
  } else if (data.proceedingsIssuedDate > SECTION_21_COURT_DEADLINE) {
    errors.push('A Section 21 possession claim could not be started after 31 July 2026.');
  } else if (data.possessionDate && data.proceedingsIssuedDate < data.possessionDate) {
    errors.push('The Section 21 possession claim date is earlier than the date stated in the notice. Check the court record and notice.');
  }

  if (!data.possessionDate) {
    errors.push('The date the notice requires possession is required to check the notice period.');
  } else {
    const earliestAfterNotice = addCalendarMonths(data.noticeServedDate, 2);
    if (earliestAfterNotice && data.possessionDate < earliestAfterNotice) {
      errors.push(`The Section 21 notice period must be at least 2 calendar months. The earliest date based on service is ${earliestAfterNotice}.`);
    }
  }
  if (!data.prescribedForm) errors.push('Prescribed form (Form 6A) must be served with the notice');
  if (!data.depositProtected)
    errors.push('Deposit must be protected in a government-approved scheme');
  if (data.hmoLicense === false)
    errors.push('HMO licence required if property is a House in Multiple Occupation');
  if (!data.epcProvided)
    errors.push('Energy Performance Certificate (EPC) must be provided to the tenant');
  if (!data.gasSafetyCertificate)
    errors.push('Gas safety certificate must be provided to the tenant');

  return { valid: errors.length === 0, errors, transition };
}

// ---------------------------------------------------------------------------
// Validation — Section 8 / RRA Grounds
// ---------------------------------------------------------------------------

export function validateSection8(data) {
  const errors = [];
  if (!data || !data.ground) {
    errors.push('Ground is required');
    return { valid: false, errors };
  }
  const ground = GROUNDS_OF_SECTION8.find((g) => g.id === data.ground);
  if (!ground) {
    errors.push(
      `Invalid ground "${data.ground}". Must be one of: ${GROUNDS_OF_SECTION8.map((g) => g.id).join(', ')}`
    );
    return { valid: false, errors };
  }
  if (!data.noticeServedDate) {
    errors.push('Notice served date is required');
  }
  if (!data.serviceMethod) {
    errors.push('Service method is required (personal or first/second class post)');
  }
  const noticeDate = parseLocalDate(data.noticeServedDate);
  const expectedForm = noticeDate && noticeDate >= parseLocalDate(RRA_COMMENCEMENT) ? 'form3a' : 'form3';
  if (data.noticeForm !== expectedForm) {
    errors.push(`Check that the correct notice form was used for the service date: ${expectedForm === 'form3a' ? 'Form 3A (or substantially similar form)' : 'the pre-1 May 2026 Form 3'}.`);
  }
  const needsPossessionDate = data.ground !== 'ground14';
  if (needsPossessionDate && !data.possessionDate) {
    errors.push('The date the notice requires possession is required to check the notice period.');
  } else if (needsPossessionDate && noticeDate && data.possessionDate && !['rra-ground-landlord-sale', 'rra-ground-landlord-move-in'].includes(data.ground)) {
    const isPostCommencement = noticeDate >= parseLocalDate(RRA_COMMENCEMENT);
    const minimumNoticeDays = isPostCommencement
      ? ground.noticeDays
      : ['ground8', 'ground10', 'ground11'].includes(data.ground)
        ? 14
        : ground.noticeDays;
    const allowedDays = daysBetween(data.noticeServedDate, data.possessionDate);
    if (Number.isFinite(allowedDays) && allowedDays < minimumNoticeDays) {
      errors.push(`${ground.id} requires at least ${minimumNoticeDays} days' notice for this service date. Only ${allowedDays} days are allowed.`);
    }
  }

  // RRA ground: serious arrears (3+ months)
  if (data.ground === 'rra-ground-serious-arrears') {
    if (parseLocalDate(data.noticeServedDate) < parseLocalDate(RRA_COMMENCEMENT)) {
      errors.push('The revised Ground 8 threshold applies to notices served on or after 1 May 2026.');
    }
    if (!data.rentArrearsMonthsAtNotice || data.rentArrearsMonthsAtNotice < 3) {
      errors.push(
        `Ground 8 requires at least 3 months rent arrears at the notice date. ${data.rentArrearsMonthsAtNotice || 0} month(s) provided.`
      );
    }
    if (!data.rentArrearsMonthsAtHearing || data.rentArrearsMonthsAtHearing < 3) {
      errors.push('Ground 8 also requires at least 3 months rent arrears at the hearing. This tool cannot determine the hearing-date position in advance.');
    }
    return { valid: errors.length === 0, errors };
  }

  // RRA grounds: landlord sale or move-in
  if (data.ground === 'rra-ground-landlord-sale' || data.ground === 'rra-ground-landlord-move-in') {
    if (parseLocalDate(data.noticeServedDate) < parseLocalDate(RRA_COMMENCEMENT)) {
      errors.push('Grounds 1 and 1A under the revised law apply to notices served on or after 1 May 2026.');
    }
    if (!data.landlordIntentionEvidence) {
      errors.push(
        `Evidence of the landlord's intention is required for this ground. Provide a description of the circumstances.`
      );
    }
    if (!data.tenancyStartDate) {
      errors.push('Tenancy start date is required to check the 12-month protected period.');
    }
    if (!data.possessionDate) {
      errors.push('Intended possession date is required to check notice timing and the 12-month protected period.');
    } else if (data.tenancyStartDate) {
      const earliestPossession = new Date(`${data.tenancyStartDate}T00:00:00Z`);
      earliestPossession.setUTCFullYear(earliestPossession.getUTCFullYear() + 1);
      const earliestDate = toLocalDateString(earliestPossession);
      if (data.possessionDate < earliestDate) {
        errors.push(`For Ground 1 or 1A, possession cannot be required before the tenancy's first anniversary (${earliestDate}).`);
      }
      const earliestAfterNotice = addCalendarMonths(data.noticeServedDate, 4);
      if (earliestAfterNotice && data.possessionDate < earliestAfterNotice) {
        errors.push(`Ground 1 and 1A require at least 4 calendar months' notice. The earliest date based on service is ${earliestAfterNotice}.`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  // Pre-RRA grounds
  if (data.ground === 'ground8' || data.ground === 'ground10') {
    const threshold = data.ground === 'ground8' && noticeDate >= parseLocalDate(RRA_COMMENCEMENT) ? 3 : data.ground === 'ground8' ? 2 : 0;
    if (data.rentArrearsMonths === undefined || data.rentArrearsMonths < threshold || (data.ground === 'ground10' && data.rentArrearsMonths <= 0)) {
      errors.push(
        `${ground.id} requires at least ${threshold} month(s) of rent arrears at time of notice`
      );
    }
    if (data.ground === 'ground8' && noticeDate >= parseLocalDate(RRA_COMMENCEMENT)) {
      if (!data.rentArrearsMonthsAtHearing || data.rentArrearsMonthsAtHearing < 3) {
        errors.push('Ground 8 under the revised law also requires at least 3 months rent arrears at the hearing. This tool cannot determine the hearing-date position in advance.');
      }
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

// ---------------------------------------------------------------------------
// Maps and helpers
// ---------------------------------------------------------------------------

const NOTICE_TYPE_MAP = {
  section21: 'Section 21',
  'section8-ground8': 'Section 8 (Ground 8)',
  'section8-ground10': 'Section 8 (Ground 10)',
  'section8-ground11': 'Section 8 (Ground 11)',
  'section8-ground12': 'Section 8 (Ground 12)',
  'section8-ground14': 'Section 8 (Ground 14)',
  'rra-ground-landlord-sale': 'RRA Ground — Landlord Intends to Sell',
  'rra-ground-landlord-move-in': 'RRA Ground — Landlord or Family Move In',
  'rra-ground-serious-arrears': 'RRA Ground — Serious Rent Arrears (3+ months)'
};

export function generateChallengeText(data) {
  const noticeName = NOTICE_TYPE_MAP[data.noticeType] || data.noticeType;
  const lines = [];
  lines.push(`RE: Challenge to ${noticeName} Notice`);
  lines.push('');
  lines.push(`Dear ${data.landlordName || '[Landlord Name]'},`);
  lines.push('');
  lines.push(
    `I am writing regarding the ${noticeName} notice served on ${data.tenantName || '[Tenant Name]'}.`
  );
  lines.push('');
  lines.push('I believe there are issues with this notice for the following reason(s):');
  lines.push('');
  for (const issue of data.issues || []) {
    lines.push(`- ${issue}`);
  }
  lines.push('');
  lines.push(
    'I request that you address these issues and confirm in writing that no further action will be taken.'
  );
  lines.push('');
  lines.push(
    'This letter is for information purposes. I may seek independent legal advice about my options.'
  );
  lines.push('');
  lines.push('Yours faithfully,');
  lines.push(data.tenantName || '[Tenant Name]');
  return lines.join('\n');
}

export function getCourtTimeline(noticeType) {
  const notice = NOTICE_TYPES.find((t) => t.id === noticeType) || NOTICE_TYPES[0];
  const baseDays = notice && notice.noticeDays !== undefined ? notice.noticeDays : 14;
  return [
    {
      name: 'Notice Period',
      minDays: baseDays,
      periodText: notice.noticePeriodText || `${baseDays}+ days`,
      description: `${notice ? notice.name : 'Unknown'} notice period`
    },
    {
      name: 'Possession Hearing',
      minDays: 28,
      description: 'Court possession hearing (typically 28+ days after notice expires)'
    },
    {
      name: 'Bailiff Warrant',
      minDays: 28,
      description: 'Bailiff enforcement if tenant does not leave (28+ days after court order)'
    }
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
