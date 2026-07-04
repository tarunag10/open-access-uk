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
    description: 'Abolished in England on 1 May 2026 by the Renters\' Rights Act 2025. Cannot be served on any tenancy after that date.',
    source: 'housing-act-1988-s21',
    abolished: true,
    abolishedDate: '2026-05-01'
  },
  { id: 'section8-ground8', name: 'Section 8 - Ground 8 (Mandatory)', noticeDays: 14, description: 'At least 2 months rent arrears at time of notice and at hearing (pre-RRA). RRA raised threshold to at least 3 months arrears.', source: 'housing-act-1988-s8' },
  { id: 'section8-ground10', name: 'Section 8 - Ground 10', noticeDays: 14, description: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'section8-ground11', name: 'Section 8 - Ground 11', noticeDays: 14, description: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'section8-ground12', name: 'Section 8 - Ground 12', noticeDays: 14, description: 'Breach of tenancy obligation', source: 'housing-act-1988-s8' },
  { id: 'section8-ground14', name: 'Section 8 - Ground 14', noticeDays: 14, description: 'Nuisance or anti-social behaviour — under pre-RRA law proceedings could commence immediately after notice; RRA retains immediacy.', source: 'housing-act-1988-s8' },
  // RRA-introduced grounds (post-1 May 2026)
  { id: 'rra-ground-landlord-sale', name: 'RRA Ground — Landlord Intends to Sell', noticeDays: 60, description: 'Landlord intends to sell the property (new RRA mandatory ground). Notice period: 2 months.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-landlord-move-in', name: 'RRA Ground — Landlord or Family Move In', noticeDays: 60, description: 'Landlord or close family member needs to move into the property (new RRA mandatory ground). Notice period: 2 months.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-serious-arrears', name: 'RRA Ground — Serious Rent Arrears (3+ months)', noticeDays: 14, description: 'At least 3 months rent arrears at time of notice and at hearing (RRA replaces pre-RRA Ground 8 threshold of 2 months).', source: 'renters-rights-act-2025' }
];

const GROUNDS_OF_SECTION8 = [
  { id: 'ground8', noticeDays: 14, type: 'mandatory', requirement: 'At least 2 months rent arrears at time of notice and at hearing (pre-RRA). Under RRA the threshold rises to at least 3 months.', source: 'housing-act-1988-s8' },
  { id: 'ground10', noticeDays: 14, type: 'discretionary', requirement: 'Some rent arrears at time of service and hearing', source: 'housing-act-1988-s8' },
  { id: 'ground11', noticeDays: 14, type: 'discretionary', requirement: 'Persistent delay in paying rent', source: 'housing-act-1988-s8' },
  { id: 'ground12', noticeDays: 14, type: 'discretionary', requirement: 'Breach of any obligation of the tenancy', source: 'housing-act-1988-s8' },
  { id: 'ground14', noticeDays: 0, type: 'discretionary', requirement: 'Nuisance or anti-social behaviour — proceedings may commence immediately after notice under pre-RRA and RRA law.', source: 'housing-act-1988-s8' },
  // RRA new grounds
  { id: 'rra-ground-landlord-sale', noticeDays: 60, type: 'mandatory', requirement: 'Landlord genuinely intends to sell the property. Cannot be used if landlord has owned property for less than 12 months (anti-avoidance).', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-landlord-move-in', noticeDays: 60, type: 'mandatory', requirement: 'Landlord or a close family member (parent, child, sibling, grandparent) genuinely needs to move into the property.', source: 'renters-rights-act-2025' },
  { id: 'rra-ground-serious-arrears', noticeDays: 14, type: 'mandatory', requirement: 'At least 3 months rent arrears at time of notice and at hearing.', source: 'renters-rights-act-2025' }
];

const DEPOSIT_PROTECTION_CHECKLIST = [
  { id: 'deposit-paid', description: 'Deposit was paid by the tenant', required: true },
  { id: 'protection-certificate', description: 'Deposit protected within 30 days in a government-approved scheme', required: true },
  { id: 'prescribed-information', description: 'Prescribed information served on tenant within 30 days of deposit being received', required: true },
  { id: 'scheme-name', description: 'Name and contact details of the tenancy deposit scheme used', required: true },
  { id: 'deposit-amount', description: 'Amount of deposit and how it is to be repaid', required: true },
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
  if (!served) return { status: 'unknown', message: 'Cannot check transition status without a notice served date.' };

  const commencement = parseLocalDate(RRA_COMMENCEMENT);
  const courtDeadline = parseLocalDate(SECTION_21_COURT_DEADLINE);

  if (served < commencement) {
    return {
      status: 'transition',
      message: `This Section 21 notice was served before the law changed on 1 May 2026. Court proceedings must be issued by 31 July 2026. After that date, no Section 21 notice can be enforced.`
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
    message: 'Section 21 no-fault evictions were abolished in England on 1 May 2026. Any Section 21 notice served on or after that date is invalid and unenforceable. Landlords using Section 21 after abolition may face a civil penalty of up to £7,000.'
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

  if (data.possessionDate) {
    const days = daysBetween(data.noticeServedDate, data.possessionDate);
    if (!isNaN(days) && days < 59) {
      errors.push(`Notice period must be at least "2 months" (which is at least 59 days depending on the months). Only ${days} days given.`);
    } else if (!isNaN(days) && days < 62) {
      errors.push(`The notice period of ${days} days may be short of the required "at least 2 months" for the specific months involved. Check with Shelter or a solicitor.`);
    }
  }
  if (!data.prescribedForm) errors.push('Prescribed form (Form 6A) must be served with the notice');
  if (!data.depositProtected) errors.push('Deposit must be protected in a government-approved scheme');
  if (data.hmoLicense === false) errors.push('HMO licence required if property is a House in Multiple Occupation');
  if (!data.epcProvided) errors.push('Energy Performance Certificate (EPC) must be provided to the tenant');
  if (!data.gasSafetyCertificate) errors.push('Gas safety certificate must be provided to the tenant');

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
    errors.push(`Invalid ground "${data.ground}". Must be one of: ${GROUNDS_OF_SECTION8.map((g) => g.id).join(', ')}`);
    return { valid: false, errors };
  }
  if (!data.noticeServedDate) {
    errors.push('Notice served date is required');
  }
  if (!data.serviceMethod) {
    errors.push('Service method is required (personal or first/second class post)');
  }

  // RRA ground: serious arrears (3+ months)
  if (data.ground === 'rra-ground-serious-arrears') {
    if (!data.rentArrearsMonths || data.rentArrearsMonths < 3) {
      errors.push(`RRA Ground (Serious Rent Arrears) requires at least 3 months rent arrears at time of notice and at hearing. ${data.rentArrearsMonths || 0} month(s) provided.`);
    }
    return { valid: errors.length === 0, errors };
  }

  // RRA grounds: landlord sale or move-in
  if (data.ground === 'rra-ground-landlord-sale' || data.ground === 'rra-ground-landlord-move-in') {
    if (!data.landlordIntentionEvidence) {
      errors.push(`Evidence of the landlord's intention is required for this ground. Provide a description of the circumstances.`);
    }
    return { valid: errors.length === 0, errors };
  }

  // Pre-RRA grounds
  if (data.ground === 'ground8' || data.ground === 'ground10') {
    const threshold = data.ground === 'ground8' ? 2 : 0;
    if (!data.rentArrearsMonths || data.rentArrearsMonths < threshold) {
      errors.push(`${ground.id} requires at least ${threshold} month(s) of rent arrears at time of notice`);
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
  lines.push(`I am writing regarding the ${noticeName} notice served on ${data.tenantName || '[Tenant Name]'}.`);
  lines.push('');
  lines.push('I believe there are issues with this notice for the following reason(s):');
  lines.push('');
  for (const issue of (data.issues || [])) {
    lines.push(`- ${issue}`);
  }
  lines.push('');
  lines.push('I request that you address these issues and confirm in writing that no further action will be taken.');
  lines.push('');
  lines.push('This letter is for information purposes. I may seek independent legal advice about my options.');
  lines.push('');
  lines.push('Yours faithfully,');
  lines.push(data.tenantName || '[Tenant Name]');
  return lines.join('\n');
}

export function getCourtTimeline(noticeType) {
  const notice = NOTICE_TYPES.find((t) => t.id === noticeType) || NOTICE_TYPES[0];
  const baseDays = notice && notice.noticeDays !== undefined ? notice.noticeDays : 14;
  return [
    { name: 'Notice Period', minDays: baseDays, description: `${notice ? notice.name : 'Unknown'} notice period` },
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
