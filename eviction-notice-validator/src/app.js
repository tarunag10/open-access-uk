// eviction-notice-validator/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs eviction-notice-validator

// ===== ../../shared/eviction/dates.mjs =====
// Browser-safe civil date helpers. Kept equivalent to shared/deadlines helpers.
function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear ? date.getUTCFullYear() : date.getFullYear();
  const m = date.getUTCMonth ? date.getUTCMonth() : date.getMonth();
  const d = date.getUTCDate ? date.getUTCDate() : date.getDate();
  return [y, String(m + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}


// ===== ../../shared/eviction/index.mjs =====
/**
 * Eviction notice validation — England.
 * Section 21 abolished 1 May 2026 (Renters' Rights Act 2025).
 * Section 8 grounds revised with effect from 1 May 2026.
 */


// ---------------------------------------------------------------------------
// RRA commencement date — the law changed on this date
// ---------------------------------------------------------------------------
const RRA_COMMENCEMENT = '2026-05-01';
const SECTION_21_COURT_DEADLINE = '2026-07-31';

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
      "Abolished in England on 1 May 2026 by the Renters' Rights Act 2025. Cannot be served on an in-scope private assured tenancy after that date.",
    source: 'housing-act-1988-s21',
    abolished: true,
    abolishedDate: '2026-05-01'
  },
  {
    id: 'section8-ground8',
    name: 'Section 8 - Ground 8 (Mandatory)',
    noticeDays: 28,
    description:
      'Ground 8: from 1 May 2026, at least 3 months (monthly rent) or 13 weeks (weekly/fortnightly rent), at notice and hearing, excluding qualifying unpaid Universal Credit amounts.',
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
      'Proceedings may start immediately after service. Under the revised rules, where only Grounds 7A and/or 14 are established, a possession order cannot take effect within 14 days beginning with service.',
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
    name: 'RRA Ground — Serious Rent Arrears',
    noticeDays: 28,
    description:
      'Ground 8: at least 3 months (monthly rent) or 13 weeks (weekly/fortnightly rent) at notice and hearing, after qualifying Universal Credit deductions. Four weeks’ notice.',
    source: 'renters-rights-act-2025'
  }
];

const GROUNDS_OF_SECTION8 = [
  {
    id: 'ground8',
    noticeDays: 28,
    type: 'mandatory',
    requirement:
      'From 1 May 2026: at least 3 months (monthly rent) or 13 weeks (weekly/fortnightly rent) at notice and hearing, after qualifying Universal Credit deductions. Earlier notices use former thresholds and transition limits.',
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
      'Proceedings may start immediately after service. The revised rules separately restrict when a possession order can take effect (14 days beginning with service where only Grounds 7A and/or 14 are established).',
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
    requirement:
      'At least 3 months (monthly rent) or 13 weeks (weekly/fortnightly rent) at notice and hearing, after qualifying Universal Credit deductions.',
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
 * 1 May – 31 July 2026: a court claim may still be requested for
 *   a pre-abolition S21 notice (served before 1 May).
 * After 31 July 2026, no new claim request; saved pending proceedings may continue.
 */
function checkSection21Transition(noticeServedDate) {
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
      message: `This Section 21 notice was served before the law changed on 1 May 2026. It could only be used to start court proceedings by 31 July 2026. A timely request to issue a claim may preserve pending proceedings. Check the notice’s own time limits and the court record.`
    };
  }

  if (served >= commencement && served <= courtDeadline) {
    return {
      status: 'critical',
      message: `Section 21 was abolished on 1 May 2026. A notice served after abolition is invalid. A timely request to issue a claim on a pre-abolition notice may preserve pending proceedings. Seek urgent advice from Shelter or a housing solicitor.`
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

function daysBetween(dateA, dateB) {
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
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return toLocalDateString(target);
}

// ---------------------------------------------------------------------------
// Notice type helpers
// ---------------------------------------------------------------------------

function getNoticeTypes() {
  return NOTICE_TYPES.map((t) => ({ ...t }));
}

function getGroundsOfSection8() {
  return GROUNDS_OF_SECTION8.map((g) => ({ ...g }));
}

function getDepositProtectionChecklist() {
  return DEPOSIT_PROTECTION_CHECKLIST.map((c) => ({ ...c }));
}

// ---------------------------------------------------------------------------
// Validation — Section 21 (hard-blocked for post-abolition dates)
// ---------------------------------------------------------------------------

function validateSection21(data) {
  const errors = [];

  // Check if Section 21 is valid at all
  if (!data || !data.noticeServedDate) {
    errors.push('Notice served date is required');
    return { valid: false, errors, transition: null };
  }

  if (data.tenancyType !== 'private-assured') {
    errors.push(
      'Confirm a private assured tenancy in England. PRP social housing and other or unknown tenancy types are outside this checklist.'
    );
    return { valid: false, errors, transition: null };
  }
  for (const key of ['noticeServedDate', 'possessionDate', 'claimRequestedDate']) {
    if (data[key] && !parseLocalDate(data[key])) errors.push(`A valid ${key} is required.`);
  }
  const transition = checkSection21Transition(data.noticeServedDate);
  if (transition.status === 'invalid' || transition.status === 'critical') {
    errors.push(transition.message);
    return { valid: false, errors, transition };
  }

  if (!data.claimRequestedDate) {
    errors.push(
      'For a pre-1 May 2026 Section 21 notice, confirm whether the court was requested to issue the claim by 31 July 2026.'
    );
  } else if (data.claimRequestedDate > SECTION_21_COURT_DEADLINE) {
    errors.push('A Section 21 possession claim could not be started after 31 July 2026.');
  } else if (data.possessionDate && data.claimRequestedDate < data.possessionDate) {
    errors.push(
      'The Section 21 claim request date is earlier than the date stated in the notice. Check the court record and notice.'
    );
  }

  if (!data.possessionDate) {
    errors.push('The date the notice requires possession is required to check the notice period.');
  } else {
    const earliestAfterNotice = addCalendarMonths(data.noticeServedDate, 2);
    if (earliestAfterNotice && data.possessionDate < earliestAfterNotice) {
      errors.push(
        `The Section 21 notice period must be at least 2 calendar months. The earliest date based on service is ${earliestAfterNotice}.`
      );
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

// Money comparisons are in pence; blank/unknown inputs must not become zero.
function pence(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  const rounded = Math.round(value * 100);
  return Number.isSafeInteger(rounded) && Math.abs(value * 100 - rounded) < 0.000001
    ? rounded
    : null;
}

function checkRentArrears(data, revised, errors) {
  const frequency = data.rentFrequency;
  if (!['monthly', 'weekly', 'fortnightly'].includes(frequency)) {
    errors.push(
      'Confirm whether rent is payable monthly, weekly or fortnightly. Other or unknown payment periods require specialist review.'
    );
    return;
  }
  const rent = pence(data.rentAmount);
  if (rent === null || rent === 0) {
    errors.push('Enter a positive rent amount per payment period, to the nearest penny.');
    return;
  }
  const periods =
    frequency === 'monthly'
      ? revised
        ? 3
        : 2
      : frequency === 'weekly'
        ? revised
          ? 13
          : 8
        : revised
          ? 6.5
          : 4;
  const threshold = rent * periods;
  const label = frequency === 'monthly' ? `${revised ? 3 : 2} months` : `${revised ? 13 : 8} weeks`;
  for (const stage of ['Notice', 'Hearing']) {
    const arrears = pence(data[`arrearsAmountAt${stage}`]);
    const uc = revised ? pence(data[`qualifyingUcArrearsAt${stage}`]) : 0;
    if (arrears === null) {
      errors.push(
        `Confirm unpaid rent at the ${stage.toLowerCase()} date in pounds. An unknown hearing-date position is not a failed ground.`
      );
      continue;
    }
    if (uc === null || uc > arrears) {
      errors.push(
        `Confirm qualifying unpaid Universal Credit arrears at the ${stage.toLowerCase()} date (0 if none), no greater than total arrears. Only rent unpaid because an entitled UC housing award has not yet been received is disregarded.`
      );
      continue;
    }
    if (arrears - uc < threshold) {
      errors.push(
        `Ground 8 requires at least ${label} rent unpaid at the ${stage.toLowerCase()} date (${(threshold / 100).toFixed(2)} pounds), after any qualifying Universal Credit deduction.`
      );
    }
  }
}

function validateSection8(data) {
  const errors = [];
  const warnings = [];
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
  if (data.tenancyType !== 'private-assured') {
    errors.push(
      'Confirm a private assured tenancy in England. PRP social housing and other or unknown tenancy types are outside this checklist.'
    );
  }
  if (!parseLocalDate(data.noticeServedDate)) {
    errors.push('A valid notice served date is required');
  }
  for (const key of [
    'possessionDate',
    'claimRequestedDate',
    'orderEffectiveDate',
    'tenancyStartDate'
  ]) {
    if (data[key] && !parseLocalDate(data[key])) errors.push(`A valid ${key} is required.`);
  }
  if (!data.serviceMethod) {
    errors.push('Service method is required (personal or first/second class post)');
  }
  const noticeDate = parseLocalDate(data.noticeServedDate);
  const isPostCommencement = noticeDate && noticeDate >= parseLocalDate(RRA_COMMENCEMENT);
  if (noticeDate && !isPostCommencement) {
    const annualExpiry = addCalendarMonths(data.noticeServedDate, 12);
    const requestDate = parseLocalDate(data.claimRequestedDate);
    warnings.push(
      'Pre-1 May 2026 notice: a timely request to the court to issue a claim may preserve the old rules until proceedings conclude. Check the notice, claim request and court record; actual court issue can be later.'
    );
    if (!requestDate) {
      errors.push(
        'Confirm the date the court was requested to issue the claim for this pre-1 May 2026 Section 8 notice.'
      );
    } else if (
      data.claimRequestedDate >= annualExpiry ||
      data.claimRequestedDate > SECTION_21_COURT_DEADLINE
    ) {
      errors.push(
        `The claim request must be before ${annualExpiry} and no later than 31 July 2026 for this pre-1 May 2026 Section 8 notice (subject to statutory savings).`
      );
    } else if (
      requestDate < noticeDate ||
      (data.ground !== 'ground14' &&
        data.possessionDate &&
        data.claimRequestedDate < data.possessionDate)
    ) {
      errors.push(
        'The claim request predates service or the date proceedings could begin. Check the court record.'
      );
    }
  }
  const expectedForm =
    noticeDate && noticeDate >= parseLocalDate(RRA_COMMENCEMENT) ? 'form3a' : 'form3';
  if (data.noticeForm !== expectedForm) {
    errors.push(
      `Check that the correct notice form was used for the service date: ${expectedForm === 'form3a' ? 'Form 3A (or substantially similar form)' : 'the pre-1 May 2026 Form 3'}.`
    );
  }
  const needsPossessionDate = data.ground !== 'ground14';
  if (needsPossessionDate && !data.possessionDate) {
    errors.push('The date the notice requires possession is required to check the notice period.');
  } else if (
    needsPossessionDate &&
    noticeDate &&
    data.possessionDate &&
    !['rra-ground-landlord-sale', 'rra-ground-landlord-move-in'].includes(data.ground)
  ) {
    const minimumNoticeDays = isPostCommencement
      ? ground.noticeDays
      : ['ground8', 'ground10', 'ground11'].includes(data.ground)
        ? 14
        : ground.noticeDays;
    const allowedDays = daysBetween(data.noticeServedDate, data.possessionDate);
    if (Number.isFinite(allowedDays) && allowedDays < minimumNoticeDays) {
      errors.push(
        `${ground.id} requires at least ${minimumNoticeDays} days' notice for this service date. Only ${allowedDays} days are allowed.`
      );
    }
  }

  if (['ground8', 'rra-ground-serious-arrears'].includes(data.ground)) {
    if (data.ground === 'rra-ground-serious-arrears' && noticeDate && !isPostCommencement) {
      errors.push(
        'The revised Ground 8 threshold applies to notices served on or after 1 May 2026.'
      );
    }
    checkRentArrears(data, isPostCommencement, errors);
    return { valid: errors.length === 0, errors, warnings };
  }

  // RRA grounds: landlord sale or move-in
  if (data.ground === 'rra-ground-landlord-sale' || data.ground === 'rra-ground-landlord-move-in') {
    if (parseLocalDate(data.noticeServedDate) < parseLocalDate(RRA_COMMENCEMENT)) {
      errors.push(
        'Grounds 1 and 1A under the revised law apply to notices served on or after 1 May 2026.'
      );
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
      errors.push(
        'Intended possession date is required to check notice timing and the 12-month protected period.'
      );
    } else if (data.tenancyStartDate) {
      const earliestPossession = new Date(`${data.tenancyStartDate}T00:00:00Z`);
      earliestPossession.setUTCFullYear(earliestPossession.getUTCFullYear() + 1);
      const earliestDate = toLocalDateString(earliestPossession);
      if (data.possessionDate < earliestDate) {
        errors.push(
          `For Ground 1 or 1A, possession cannot be required before the tenancy's first anniversary (${earliestDate}).`
        );
      }
      const earliestAfterNotice = addCalendarMonths(data.noticeServedDate, 4);
      if (earliestAfterNotice && data.possessionDate < earliestAfterNotice) {
        errors.push(
          `Ground 1 and 1A require at least 4 calendar months' notice. The earliest date based on service is ${earliestAfterNotice}.`
        );
      }
    }
    return { valid: errors.length === 0, errors };
  }

  if (
    data.ground === 'ground10' &&
    (!Number.isFinite(data.rentArrearsMonths) || data.rentArrearsMonths <= 0)
  ) {
    errors.push('Ground 10 requires unpaid rent; confirm the position at service and hearing.');
  }
  if (data.ground === 'ground12' && !data.breachDescription) {
    errors.push('Description of the breach of tenancy obligation is required');
  }
  if (data.ground === 'ground14' && !data.nuisanceDescription) {
    errors.push('Description of the nuisance or anti-social behaviour is required');
  }
  let earliestOrderDate;
  if (data.ground === 'ground14' && isPostCommencement) {
    const date = new Date(noticeDate);
    date.setUTCDate(date.getUTCDate() + 14);
    earliestOrderDate = toLocalDateString(date);
    warnings.push(
      `Proceedings may start immediately after service; this is not immediate eviction. Where only Grounds 7A and/or 14 are established, a possession order cannot take effect before ${earliestOrderDate}. Court-dispensed notice and mixed-ground cases need specialist review.`
    );
    if (
      data.orderEffectiveDate &&
      parseLocalDate(data.orderEffectiveDate) &&
      data.orderEffectiveDate < earliestOrderDate
    ) {
      errors.push(
        `The possession order cannot take effect before ${earliestOrderDate} on this Ground 14-only basis.`
      );
    }
  }
  return { valid: errors.length === 0, errors, warnings, earliestOrderDate };
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
  'rra-ground-serious-arrears': 'RRA Ground — Serious Rent Arrears'
};

function generateChallengeText(data) {
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

function getCourtTimeline(noticeType) {
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

function serializeEviction(value) {
  return JSON.stringify(value);
}

function parseEviction(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// ===== ../../shared/eviction/business-tenancy.mjs =====
/**
 * Preliminary checks for business tenancy renewal notices under Part II of
 * the Landlord and Tenant Act 1954. This is a date and completeness checklist,
 * not a determination of statutory validity.
 */


const BUSINESS_TENANCY_SOURCES = {
  guidance:
    'https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords',
  prescribedForms:
    'https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords/forms-prescribed-under-the-landlord-and-tenant-act-1954-part-2-notices-regulations-2004',
  section25: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/25',
  section26: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/26',
  section30: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/30',
  section29A: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/29A',
  section29B: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/29B',
  part56: 'https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56',
  practiceDirection56:
    'https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56/pd_part56',
  telecomJurisdiction: 'https://www.legislation.gov.uk/uksi/2026/569/regulation/3/made'
};

function addDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return toLocalDateString(date);
}

function calculateApplicationDeadline(data, warnings) {
  const is25 = data.noticeType === 'section25';
  const is26 = data.noticeType === 'section26';
  const statutoryDate = parseLocalDate(
    is25 ? data.terminationDate : is26 ? data.newTenancyDate : null
  );
  const result = {
    statutoryDate: statutoryDate
      ? is25
        ? data.terminationDate
        : addDays(data.newTenancyDate, -1)
      : null,
    statutoryEndpoint: is25
      ? 'on-or-before-termination-date'
      : is26
        ? 'immediately-before-new-tenancy-date'
        : 'not-calculated',
    extensionDate: null,
    earliestDate: null,
    status: statutoryDate ? 'calculated' : 'incomplete',
    jurisdiction: 'court'
  };

  if (is26 && parseLocalDate(data.serviceDate)) {
    result.earliestDate = addMonths(data.serviceDate, 2);
    const counterNoticeDate = parseLocalDate(data.counterNoticeDate);
    if (
      counterNoticeDate &&
      data.landlordResponse === 'opposes' &&
      counterNoticeDate >= parseLocalDate(data.serviceDate) &&
      counterNoticeDate < parseLocalDate(result.earliestDate)
    ) {
      result.earliestDate = data.counterNoticeDate;
      warnings.push(
        'A Section 24(1) application may be issued before the usual two-month waiting period only after the landlord has given a Section 26(6) counter-notice. The date entered cannot establish the time it was given or the counter-notice’s validity.'
      );
    }
  }

  if (data.extensionStatus === 'yes') {
    const agreementDate = parseLocalDate(data.extensionAgreementDate);
    const extensionDate = parseLocalDate(data.extendedPeriodEndDate);
    const serviceDate = parseLocalDate(data.serviceDate);
    if (!agreementDate || !extensionDate || !statutoryDate || !serviceDate) {
      result.status = 'incomplete';
      warnings.push(
        'Enter the date of the Section 29B agreement and the agreed extended period end date. The extension cannot be assessed from incomplete dates.'
      );
    } else {
      // The Section 26 statutory period ends immediately before its proposed start date.
      const statutoryEndBoundary = is25 ? data.terminationDate : addDays(data.newTenancyDate, -1);
      if (agreementDate < serviceDate) {
        result.status = 'review-required';
        warnings.push(
          'The recorded first Section 29B agreement predates service of the notice/request. Section 29B permits an extension agreement only after the notice or request; do not rely on the displayed extension date.'
        );
      } else if (agreementDate > parseLocalDate(statutoryEndBoundary)) {
        result.status = 'review-required';
        warnings.push(
          'The recorded Section 29B agreement date is after the statutory period. It may not extend time under section 29B(1); obtain urgent advice and do not rely on the displayed extended date.'
        );
      } else if (extensionDate <= parseLocalDate(statutoryEndBoundary)) {
        result.status = 'review-required';
        warnings.push(
          'The recorded extended period end date does not fall after the statutory period as section 29B requires. Check the agreement terms.'
        );
      } else {
        const furtherAgreementDate = parseLocalDate(data.furtherExtensionAgreementDate);
        const finalExtensionDate = parseLocalDate(data.finalExtendedPeriodEndDate);
        if (
          Boolean(data.furtherExtensionAgreementDate) !== Boolean(data.finalExtendedPeriodEndDate)
        ) {
          result.status = 'incomplete';
          warnings.push(
            'Enter both dates for the further section 29B extension, or clear both fields.'
          );
        } else if (furtherAgreementDate && finalExtensionDate) {
          if (furtherAgreementDate > extensionDate || finalExtensionDate <= extensionDate) {
            result.status = 'review-required';
            warnings.push(
              'The further extension dates do not show an agreement made before the earlier period ended and a later new end date. Check the agreements urgently.'
            );
          } else {
            result.extensionDate = data.finalExtendedPeriodEndDate;
            result.status = 'review-required';
          }
        } else {
          result.extensionDate = data.extendedPeriodEndDate;
          result.status = 'review-required';
        }
        warnings.push(
          'The displayed extended date is a preliminary estimate from the dates entered. Check that each agreement satisfies section 29B and that no further extension changes the current period.'
        );
      }
    }
  } else if (data.extensionStatus === 'unsure') {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push(
      'It is not known whether the parties made a Section 29B agreement extending the application period. Check all agreements before relying on the statutory date.'
    );
  } else if (data.extensionStatus && data.extensionStatus !== 'no') {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push('State whether the parties agreed an extension under section 29B.');
  } else if (!data.extensionStatus) {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push(
      'Confirm whether the parties agreed any extension under section 29B before relying on the displayed statutory date.'
    );
  }

  if (data.telecomTenancy === 'yes') {
    const possiblyWithinSpecialJurisdiction =
      data.telecomSubsistingAgreement !== 'no' && data.telecomPrimaryPurposeCodeRights !== 'no';
    if (possiblyWithinSpecialJurisdiction) {
      result.jurisdiction = 'tribunal-review-required';
      warnings.push(
        'From 30 July 2026, specified proceedings for a subsisting telecommunications agreement whose primary purpose is to confer electronic communications code rights are heard by the First-tier Tribunal or Upper Tribunal. Confirm whether this agreement meets both statutory conditions; this checker cannot determine the correct forum or tribunal procedure.'
      );
    }
  }
  return result;
}

function addMonths(value, months) {
  const date = parseLocalDate(value);
  if (!date) return null;
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return toLocalDateString(target);
}

function checkNoticeWindow(serviceDate, anchorDate, label, errors) {
  const served = parseLocalDate(serviceDate);
  const anchor = parseLocalDate(anchorDate);
  if (!served || !anchor) {
    errors.push(
      `Enter both the date the notice/request was served and the proposed ${label} date to check the 6-to-12-month window.`
    );
    return;
  }
  const earliest = parseLocalDate(addMonths(anchorDate, -12));
  const latest = parseLocalDate(addMonths(anchorDate, -6));
  if (served < earliest || served > latest) {
    errors.push(
      `The service date entered falls outside the statutory 6-to-12-month window before the proposed ${label} date. Check the prescribed form, service rules and exact dates.`
    );
  }
}

function validateBusinessTenancyNotice(data = {}) {
  const errors = [];
  const warnings = [
    'This is a preliminary checklist only. It does not confirm that Part II applies, that the tenancy qualifies for renewal, that a notice was correctly completed or served, or that a court/tribunal application is valid or in time.',
    'Check the current prescribed notice form and the full GOV.UK guidance. The parties should obtain specialist advice before serving a notice or allowing a court deadline to expire.'
  ];

  if (!['section25', 'section26'].includes(data.noticeType)) {
    errors.push('Choose a Section 25 landlord notice or Section 26 tenant request.');
  }
  if (!data.propertyAddress?.trim()) errors.push('Enter the business premises address.');
  if (!data.landlordName?.trim()) errors.push('Enter the landlord name.');
  if (!data.tenantName?.trim()) errors.push('Enter the tenant name.');
  if (!data.landlordAddressForService?.trim())
    errors.push('Enter the landlord address shown on the notice/request.');
  if (!data.tenantAddressForService?.trim())
    errors.push('Enter the tenant address shown on the notice/request.');
  if (!data.noticeDate) errors.push('Enter the date shown on the notice/request.');
  if (!data.serviceMethod)
    errors.push(
      'Record how the notice/request was served. This checklist cannot determine whether that method was valid.'
    );
  if (data.contractedOut === 'yes') {
    errors.push(
      'The form indicates that the tenancy may have been contracted out of Part II. The renewal procedure may not apply; review the lease and contracting-out documents with a specialist.'
    );
  } else if (data.contractedOut === 'unsure') {
    warnings.push(
      'It is not known whether the tenancy was contracted out of Part II. Review the lease and contracting-out documents before relying on the renewal procedure.'
    );
  } else if (data.contractedOut !== 'no') {
    errors.push('State whether the tenancy was contracted out of Part II, or select “Not sure”.');
  }

  const is25 = data.noticeType === 'section25';
  if (data.noticeType === 'section25' || data.noticeType === 'section26') {
    const dateField = is25 ? 'terminationDate' : 'newTenancyDate';
    const dateLabel = is25 ? 'termination' : 'new tenancy start';
    if (!data.serviceDate) errors.push('Enter the date the notice/request was served.');
    if (!data[dateField]) errors.push(`Enter the proposed ${dateLabel} date.`);
    checkNoticeWindow(data.serviceDate, data[dateField], dateLabel, errors);

    const proposed = parseLocalDate(data[dateField]);
    const expiry = parseLocalDate(data.leaseExpiryDate);
    if (!expiry)
      errors.push('Enter the current lease expiry date so the proposed date can be checked.');
    else if (proposed && proposed < expiry) {
      errors.push(
        `The proposed ${dateLabel} date is before the lease expiry date entered. Verify the lease and statutory date rules.`
      );
    }
  }

  if (is25) {
    const expectedForm =
      data.opposition === 'opposed'
        ? ['form2', 'form7']
        : data.opposition === 'unopposed'
          ? ['form1']
          : [];
    if (!data.noticeForm) errors.push('Select which prescribed Section 25 form was used.');
    else if (expectedForm.length && !expectedForm.includes(data.noticeForm))
      errors.push(
        'The selected Section 25 form does not match whether the landlord opposes renewal. Confirm the current prescribed form and notice wording.'
      );
    if (data.noticeForm === 'form7')
      warnings.push(
        'Form 7 applies to a special case where the tenant may have rights under the Leasehold Reform Act 1967. This checklist does not assess eligibility.'
      );
    if (!['opposed', 'unopposed'].includes(data.opposition)) {
      errors.push('State whether the landlord opposes the grant of a new tenancy.');
    }
    if (data.opposition === 'opposed' && !data.oppositionGrounds?.trim()) {
      errors.push(
        'For an opposed Section 25 notice, enter the Section 30 ground or grounds stated in the notice.'
      );
    }
    if (data.opposition === 'unopposed' && !data.landlordProposedTerms?.trim()) {
      errors.push('For Form 1, enter the landlord’s proposed new tenancy terms from the schedule.');
    }
    if (data.opposition === 'unopposed' && data.oppositionGrounds?.trim()) {
      warnings.push(
        'The landlord has selected an unopposed notice but entered opposition grounds. Check the notice type and its prescribed wording.'
      );
    }
  }

  if (data.noticeType === 'section26') {
    if (data.noticeForm !== 'form3')
      errors.push(
        'Select the prescribed Section 26 Form 3 used, and check it against the current official version.'
      );
    if (!data.proposedProperty?.trim())
      errors.push('Enter the property (or part of the property) proposed for the new tenancy.');
    if (!data.proposedTerms?.trim())
      errors.push('Enter the tenant’s proposed terms for the new tenancy.');
    if (data.landlordResponse === 'opposes' && !data.counterNoticeDate) {
      errors.push(
        'Enter the date the landlord served a counter-notice opposing the Section 26 request.'
      );
    }
    const requestDate = parseLocalDate(data.serviceDate);
    const responseDate = parseLocalDate(data.counterNoticeDate);
    if (requestDate && responseDate) {
      const twoMonthsAfter = parseLocalDate(addMonths(data.serviceDate, 2));
      if (responseDate < requestDate) {
        errors.push(
          'The counter-notice date entered is before the request date. Verify the documents and dates.'
        );
      } else if (responseDate > twoMonthsAfter) {
        errors.push(
          'The counter-notice date entered is more than two calendar months after the request date. Verify service, any agreed extension and court orders.'
        );
      }
    }
    if (data.landlordResponse === 'opposes' && !data.oppositionGrounds?.trim()) {
      errors.push(
        'Record the Section 30 ground or grounds stated in the landlord’s counter-notice.'
      );
    }
    if (data.landlordResponse === 'unknown') {
      warnings.push(
        'A landlord wishing to oppose a Section 26 request generally must serve a counter-notice within two months. Confirm the response and check the calculated earliest application date.'
      );
    }
  }

  const applicationDeadline = calculateApplicationDeadline(data, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    applicationDeadline,
    status: errors.length === 0 ? 'check-required' : 'review-required',
    checkedFields: [
      'noticeType',
      'parties',
      'serviceDate',
      'proposed date',
      'lease expiry',
      'contracting out',
      'opposition details'
    ]
  };
}


// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}


// ===== src/tracker.js (imports resolved) =====

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

function optionalNumber(value) {
  return value === undefined || value === null || String(value).trim() === ''
    ? undefined
    : Number(value);
}

function toSection8ValidationData(data, ground) {
  return {
    ground,
    tenancyType: data.tenancyType,
    noticeServedDate: data.noticeServedDate,
    possessionDate: data.possessionDate,
    orderEffectiveDate: data.orderEffectiveDate,
    claimRequestedDate: data.claimRequestedDate,
    tenancyStartDate: data.tenancyStartDate,
    noticeForm: data.noticeForm,
    serviceMethod: data.serviceMethod,
    rentFrequency: data.rentFrequency,
    rentAmount: optionalNumber(data.rentAmount),
    arrearsAmountAtNotice: optionalNumber(data.arrearsAmountAtNotice),
    arrearsAmountAtHearing: optionalNumber(data.arrearsAmountAtHearing),
    qualifyingUcArrearsAtNotice: optionalNumber(data.qualifyingUcArrearsAtNotice),
    qualifyingUcArrearsAtHearing: optionalNumber(data.qualifyingUcArrearsAtHearing),
    rentArrearsMonths: optionalNumber(data.rentArrearsMonths),
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
    heading.textContent =
      result.valid &&
      result.applicationDeadline.status === 'calculated' &&
      result.applicationDeadline.jurisdiction === 'court'
        ? 'No issues found in the limited fields checked. This is not confirmation of validity.'
        : result.errors.length
          ? `${result.errors.length} item(s) need review.`
          : 'Deadline or extension details need review.';
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
  toSection8ValidationData,
  parseLocalDate,
  toLocalDateString
};


// ===== App logic =====
function initTheme(toggleSelector = '#theme-toggle') {
  let stored = null;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Storage may be unavailable; the theme still works for this session.
  }
  const toggle = document.querySelector(toggleSelector);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  let theme = resolveInitialTheme({ stored, prefersDark });
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
    }
  }
  applyTheme();
  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    applyTheme();
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep the applied theme even when storage is unavailable.
    }
  });
}

const STORAGE_KEY = 'open-access-uk:eviction-notice-validator:validations';
const FORM_KEY = 'open-access-uk:eviction-notice-validator:form-draft';

const form = document.querySelector('#validation-form');
const list = document.querySelector('#result-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
const section21Options = document.querySelector('#section21-options');
const section8Options = document.querySelector('#section8-options');
const section21TransitionOptions = document.querySelector('#section21-transition-options');
const section21PostAbolition = document.querySelector('#section21-post-abolition');
const landlordIntentionOptions = document.querySelector('#landlord-intention-options');
const seriousArrearsOptions = document.querySelector('#serious-arrears-options');
const ground10ArrearsOptions = document.querySelector('#ground10-arrears-options');
const ground14OrderOptions = document.querySelector('#ground14-order-options');
let activeId = null;

function loadAll() {
  return parseEviction(localStorage.getItem(STORAGE_KEY));
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, serializeEviction(records));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(records) {
  const total = records.length;
  const valid = records.filter((r) => r.result?.valid).length;
  const invalid = records.filter((r) => r.result && !r.result.valid).length;
  const issues = records.filter((r) => r.result?.errors?.length > 0).length;

  const cards = [
    { label: 'Total checked', value: total, tone: 'default' },
    { label: 'No listed issues found', value: valid, tone: 'success' },
    { label: 'Issues found', value: invalid, tone: 'danger' },
    { label: 'Issues found', value: issues, tone: 'warning' }
  ];

  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = `summary-card ${c.tone === 'success' ? 'success' : c.tone === 'danger' ? 'danger' : c.tone === 'warning' ? 'warning' : ''}`;
      const label = document.createElement('p');
      label.className = 'summary-label';
      label.textContent = c.label;
      const value = document.createElement('p');
      value.className = 'summary-value';
      value.textContent = String(c.value);
      card.append(label, value);
      return card;
    })
  );

  const timelinePanel = document.querySelector('#court-timeline');
  if (timelinePanel) {
    const noticeType = form?.elements.namedItem('noticeType')?.value || 'section21';
    const timeline = getCourtTimeline(noticeType);
    timelinePanel.replaceChildren(
      ...timeline.map((stage) => {
        const row = document.createElement('div');
        row.className = 'stage';
        const name = document.createElement('span');
        name.className = 'stage-name';
        name.textContent = stage.name;
        const days = document.createElement('span');
        days.className = 'stage-days';
        days.textContent = stage.periodText || `${stage.minDays}+ days`;
        row.append(name, days);
        return row;
      })
    );
  }
}

function renderList(records) {
  list.replaceChildren();
  if (records.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No checks saved yet. Use the form to review notice details.';
    list.append(empty);
    return;
  }
  const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  for (const record of sorted) {
    const item = document.createElement('article');
    item.className = 'complaint-item';
    if (activeId === record.id) item.classList.add('active');
    const __app_noticeName = NOTICE_TYPE_MAP[record.noticeType] || record.noticeType;
    const isValid = record.result?.valid;
    const statusClass = isValid ? 'valid' : record.result?.errors?.length > 0 ? 'invalid' : '';

    item.innerHTML = `
      <header>
        <h3>${escapeHtml(record.tenantName || 'Untitled')}</h3>
        <span class="status-pill ${statusClass}">${isValid ? 'No listed issues found' : record.result?.errors?.length > 0 ? 'Issues flagged' : 'Pending'}</span>
      </header>
      <p class="meta">${escapeHtml(__app_noticeName)} — ${escapeHtml(record.landlordName || 'No landlord')} — ${record.noticeServedDate || 'No date'}</p>
      <div class="item-actions">
        <button type="button" data-action="view" data-id="${record.id}">View</button>
        <button type="button" data-action="delete" data-id="${record.id}" class="secondary">Delete</button>
      </div>`;
    list.append(item);
  }

  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectRecord(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
  });
}

function selectRecord(id) {
  activeId = id;
  const records = loadAll();
  const record = records.find((r) => r.id === id);
  if (!record) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(record);
  renderList(records);
}

function renderDetail(record) {
  detailContent.replaceChildren();
  const __app_noticeName = NOTICE_TYPE_MAP[record.noticeType] || record.noticeType;
  const timeline = getCourtTimeline(record.noticeType);
  const isValid = record.result?.valid;

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = record.tenantName || 'Untitled notice';
  const status = document.createElement('span');
  status.className = `status-pill ${isValid ? 'valid' : 'invalid'}`;
  status.textContent = isValid ? 'No listed issues found' : 'Issues flagged';
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Notice type', __app_noticeName],
    ['Tenant', record.tenantName || 'Not specified'],
    ['Landlord', record.landlordName || 'Not specified'],
    ['Property', record.propertyAddress || 'Not specified'],
    ['Notice served', record.noticeServedDate || 'Not recorded'],
    ['Notice proceedings date', record.possessionDate || 'Not recorded'],
    ['Claim issue requested', record.claimRequestedDate || 'Not recorded'],
    ['Historical court issue date (not the request date)', record.proceedingsIssuedDate || 'Not recorded'],
    ['Tenancy category', record.tenancyType || 'Not recorded'],
    ['Order effective date entered', record.orderEffectiveDate || 'Not recorded'],
    ['Earliest order effective date (preliminary)', record.result?.earliestOrderDate || 'Not calculated'],
    ['Rent frequency', record.rentFrequency || 'Not recorded'],
    ...['rentAmount', 'arrearsAmountAtNotice', 'arrearsAmountAtHearing', 'qualifyingUcArrearsAtNotice', 'qualifyingUcArrearsAtHearing'].map((key, index) => [
      ['Rent per period', 'Unpaid rent at notice', 'Unpaid rent at hearing', 'Qualifying UC arrears at notice', 'Qualifying UC arrears at hearing'][index],
      record[key] !== undefined && record[key] !== '' ? `£${record[key]}` : 'Not recorded'
    ]),
    ['Tenancy started', record.tenancyStartDate || 'Not recorded'],
    ['Landlord intention evidence entered', record.landlordIntentionEvidence || 'Not recorded'],
    ['Deposit amount', record.depositAmount ? `£${record.depositAmount}` : 'Not specified'],
    [
      'Deposit scheme',
      DEPOSIT_SCHEMES.find((s) => s.value === record.depositScheme)?.label || 'Not specified'
    ],
    ['Created', new Date(record.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const issuesSection = document.createElement('section');
  const issuesHeading = document.createElement('h3');
  issuesHeading.textContent = isValid ? 'No listed issues found' : 'Issues flagged';
  issuesSection.append(issuesHeading);
  const issueList = document.createElement('ul');
  issueList.className = `issue-list${isValid ? ' valid' : ''}`;
  const issues =
    record.result?.errors ||
    (isValid ? ['No listed issues found in this limited checklist.'] : ['No validation data available']);
  for (const issue of issues) {
    const li = document.createElement('li');
    li.textContent = issue;
    issueList.append(li);
  }
  issuesSection.append(issueList);
  const warningsSection = document.createElement('section');
  const warningsHeading = document.createElement('h3');
  warningsHeading.textContent = 'Important limitations and next steps';
  const warningsList = document.createElement('ul');
  for (const warning of record.result?.warnings || []) {
    const item = document.createElement('li');
    item.textContent = warning;
    warningsList.append(item);
  }
  warningsSection.append(warningsHeading, warningsList);
  warningsSection.hidden = !record.result?.warnings?.length;

  const timelineSection = document.createElement('section');
  const timelineHeading = document.createElement('h3');
  timelineHeading.textContent = 'Court timeline';
  timelineSection.append(timelineHeading);
  const timelineInfo = document.createElement('div');
  timelineInfo.className = 'timeline-info';
  for (const stage of timeline) {
    const row = document.createElement('div');
    row.className = 'stage';
    const name = document.createElement('span');
    name.className = 'stage-name';
    name.textContent = stage.name;
    const days = document.createElement('span');
    days.className = 'stage-days';
    days.textContent = stage.periodText || `${stage.minDays}+ days`;
    row.append(name, days);
    timelineInfo.append(row);
  }
  timelineSection.append(timelineInfo);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyChallenge = document.createElement('button');
  copyChallenge.type = 'button';
  copyChallenge.textContent = 'Copy challenge letter';
  copyChallenge.addEventListener('click', () => {
    const text = generateChallengeText({
      noticeType: record.noticeType,
      tenantName: record.tenantName,
      landlordName: record.landlordName,
      issues: record.result?.errors || []
    });
    copyText(text, 'Challenge letter copied locally.');
  });

  const downloadChallenge = document.createElement('button');
  downloadChallenge.type = 'button';
  downloadChallenge.className = 'secondary';
  downloadChallenge.textContent = 'Download challenge letter';
  downloadChallenge.addEventListener('click', () => {
    const text = generateChallengeText({
      noticeType: record.noticeType,
      tenantName: record.tenantName,
      landlordName: record.landlordName,
      issues: record.result?.errors || []
    });
    downloadText(text, 'eviction-challenge-letter.txt', 'text/plain');
  });

  const printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.className = 'secondary';
  printBtn.textContent = 'Print';
  printBtn.addEventListener('click', () => window.print());

  actions.append(copyChallenge, downloadChallenge, printBtn);
  detailContent.append(header, grid, issuesSection, warningsSection, timelineSection, actions);
}

function updateNoticeType() {
  const noticeType = form?.elements.namedItem('noticeType')?.value;
  const isS21 = noticeType === 'section21';
  const isSaleOrMoveIn = ['rra-ground-landlord-sale', 'rra-ground-landlord-move-in'].includes(noticeType);
  const isSeriousArrears = ['section8-ground8', 'rra-ground-serious-arrears'].includes(noticeType);
  const servedDate = form?.elements.namedItem('noticeServedDate')?.value;
  const isPreAbolitionS21 = isS21 && servedDate && servedDate < '2026-05-01';
  const isPostAbolitionS21 = isS21 && servedDate && servedDate >= '2026-05-01';
  if (section21Options) section21Options.hidden = !isPreAbolitionS21;
  if (section8Options) section8Options.hidden = isS21;
  if (landlordIntentionOptions) landlordIntentionOptions.hidden = !isSaleOrMoveIn;
  if (seriousArrearsOptions) seriousArrearsOptions.hidden = !isSeriousArrears;
  if (ground10ArrearsOptions) ground10ArrearsOptions.hidden = noticeType !== 'section8-ground10';
  if (ground14OrderOptions) ground14OrderOptions.hidden = noticeType !== 'section8-ground14';
  if (section21TransitionOptions) {
    section21TransitionOptions.hidden = !(servedDate && servedDate < '2026-05-01');
  }
  if (section21PostAbolition) section21PostAbolition.hidden = !isPostAbolitionS21;
}

function deleteRecord(id) {
  const records = loadAll();
  const remaining = records.filter((r) => r.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Record deleted locally.';
  renderAll();
}

function renderAll() {
  const records = loadAll();
  renderSummary(records);
  renderList(records);
  if (activeId) {
    const record = records.find((r) => r.id === activeId);
    if (record) renderDetail(record);
  }
}

function saveFormDraft() {
  if (!form) return;
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch {
    /* ignore */
  }
}

function restoreFormDraft() {
  if (!form) return;
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const [name, value] of Object.entries(data)) {
      const field = form.elements.namedItem(name);
      if (field && value !== undefined && value !== null) {
        if (field.type === 'checkbox') field.checked = value === field.value;
        else field.value = value;
      }
    }
    updateNoticeType();
  } catch {
    /* ignore */
  }
}

function clearFormDraft() {
  localStorage.removeItem(FORM_KEY);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    statusEl.textContent = message;
  } catch {
    statusEl.textContent = 'Copy failed. You can still select and copy the text manually.';
  }
}

function downloadText(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = `Downloaded ${filename}. Nothing was sent to a server.`;
}

function generateValidationId() {
  return 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function handleValidate(event) {
  event.preventDefault();
  const data = values();
  if (!data.tenantName?.trim()) {
    statusEl.textContent = 'Add a tenant name before validating.';
    return;
  }
  if (!data.landlordName?.trim()) {
    statusEl.textContent = 'Add a landlord name before validating.';
    return;
  }

  const noticeType = data.noticeType;
  let result;

  if (noticeType === 'section21') {
    result = validateSection21({
      tenancyType: data.tenancyType,
      noticeServedDate: data.noticeServedDate,
      prescribedForm: data.prescribedForm === 'true',
      depositProtected: data.depositProtected === 'true',
      hmoLicense: data.hmoLicense === 'true' ? true : undefined,
      epcProvided: data.epcProvided === 'true',
      gasSafetyCertificate: data.gasSafetyCertificate === 'true',
      claimRequestedDate: data.claimRequestedDate,
      possessionDate: data.possessionDate
    });
  } else {
    const groundId = noticeType.replace('section8-', '');
    result = validateSection8(toSection8ValidationData(data, groundId));
  }

  const record = {
    id: generateValidationId(),
    createdAt: new Date().toISOString(),
    noticeType,
    tenantName: data.tenantName,
    landlordName: data.landlordName,
    propertyAddress: data.propertyAddress,
    noticeDate: data.noticeDate,
    noticeServedDate: data.noticeServedDate,
    possessionDate: data.possessionDate,
    claimRequestedDate: data.claimRequestedDate,
    tenancyStartDate: data.tenancyStartDate,
    landlordIntentionEvidence: data.landlordIntentionEvidence,
    tenancyType: data.tenancyType,
    rentFrequency: data.rentFrequency,
    rentAmount: data.rentAmount,
    arrearsAmountAtNotice: data.arrearsAmountAtNotice,
    arrearsAmountAtHearing: data.arrearsAmountAtHearing,
    qualifyingUcArrearsAtNotice: data.qualifyingUcArrearsAtNotice,
    qualifyingUcArrearsAtHearing: data.qualifyingUcArrearsAtHearing,
    rentArrearsMonths: data.rentArrearsMonths,
    orderEffectiveDate: data.orderEffectiveDate,
    depositAmount: data.depositAmount,
    depositScheme: data.depositScheme,
    groundsDetails: data.groundsDetails,
    result
  };

  const records = loadAll();
  records.push(record);
  saveAll(records);
  form.reset();
  clearFormDraft();
  activeId = record.id;
  updateNoticeType();
  const issueCount = result.errors?.length || 0;
  statusEl.textContent = result.valid
    ? 'No listed issues found in this preliminary checklist. This is not confirmation that the notice is valid; check the full statutory requirements and obtain advice.'
    : `${issueCount} item(s) flagged for review. This preliminary checklist does not determine whether a notice is valid.`;
  renderAll();
}

function handleClearAll() {
  const records = loadAll();
  if (records.length === 0) {
    statusEl.textContent = 'No records to clear.';
    return;
  }
  if (!confirm(`Delete all ${records.length} saved check(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All records cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleValidate);
form.addEventListener('input', saveFormDraft);
form.addEventListener('change', () => {
  updateNoticeType();
  saveFormDraft();
});

const clearAllBtn = document.querySelector('#clearAll');

clearAllBtn?.addEventListener('click', handleClearAll);
updateNoticeType();
renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
