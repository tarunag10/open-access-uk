import { addWorkingDays } from '../deadlines/index.mjs';

const SANCTION_TYPES = [
  { id: 'higher-level', name: 'Higher-Level Sanction', deductionRate: 1.0, maxWeeks: 26, description: 'Serious failure to comply (not attending interview, not taking steps to seek work)', source: 'welfare-reform-act-2012' },
  { id: 'standard', name: 'Standard Sanction', deductionRate: 0.2, maxWeeks: 4, description: 'Failure to comply with claimant commitment', source: 'welfare-reform-act-2012' },
  { id: 'lower-level', name: 'Lower-Level Sanction', deductionRate: 0, deductionAmount: 'equivalent-to-missed-appointment', description: 'Failure to attend mandatory appointment without good reason', source: 'welfare-reform-act-2012' }
];

const GOOD_REASONS = [
  { id: 'hospital-appointment', label: 'Hospital or medical appointment', description: 'You had a hospital appointment, GP visit, or other medical commitment that you could not rearrange.' },
  { id: 'caring-responsibility', label: 'Caring responsibility', description: 'You had to care for a child, vulnerable adult, or family member and there was no alternative care available.' },
  { id: 'interview-running-late', label: 'Interview running late', description: 'Your previous appointment ran over or you were kept waiting, causing you to miss the next one.' },
  { id: 'transport-failure', label: 'Transport failure', description: 'Your transport was cancelled, broke down, or was severely delayed through no fault of your own.' },
  { id: 'mental-health-episode', label: 'Mental health episode', description: 'You experienced a mental health crisis, severe anxiety episode, or other mental health condition that prevented you attending.' }
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function findSanctionType(id) {
  return SANCTION_TYPES.find((t) => t.id === id) || null;
}

export function getSanctionTypes() {
  return [...SANCTION_TYPES];
}

export function getSanctionDeductionRates(type) {
  const sanction = findSanctionType(type);
  if (!sanction) return null;
  return { ...sanction };
}

export function getMandatoryReconsiderationDeadline() {
  return { months: 1, source: 'welfare-reform-act-2012' };
}

export function getTribunalDeadline() {
  return { months: 1, source: 'welfare-reform-act-2012' };
}

export function generateMRText(data) {
  const { claimantName, sanctionType, decisionDate, reasonForSanction, groundsForChallenge, goodReasons } = data;
  const sanction = findSanctionType(sanctionType);
  const sanctionName = sanction ? sanction.name : sanctionType;
  const formattedDate = formatDate(decisionDate);

  const lines = [
    'Mandatory Reconsideration',
    '',
    `Claimant: ${claimantName}`,
    `Sanction type: ${sanctionName}`,
    `Date of decision: ${formattedDate}`,
    '',
    'Reason for sanction as stated by DWP:',
    reasonForSanction,
    '',
    'Grounds for challenge:',
    groundsForChallenge
  ];

  if (goodReasons) {
    lines.push('');
    lines.push('Good reasons for non-compliance:');
    lines.push(goodReasons);
  }

  return lines.join('\n');
}

export function getGoodReasonsLibrary() {
  return [...GOOD_REASONS];
}

export function getHardshipPaymentEligibility(data) {
  const { isUCClaimant, sanctionInForce, cannotMeetBasicNeeds } = data;
  if (!isUCClaimant) {
    return { eligible: false, reason: 'You must be a Universal Credit claimant to apply for a hardship payment.' };
  }
  if (!sanctionInForce) {
    return { eligible: false, reason: 'A hardship payment requires an active sanction to be in force.' };
  }
  if (!cannotMeetBasicNeeds) {
    return { eligible: false, reason: 'You must demonstrate that you cannot meet your basic needs (rent, food, heating) due to the sanction.' };
  }
  return { eligible: true, reason: '' };
}

export function generateHardshipPaymentRequest(data) {
  const { claimantName, sanctionType, decisionDate, reasonForHardship } = data;
  const sanction = findSanctionType(sanctionType);
  const sanctionName = sanction ? sanction.name : sanctionType;
  const formattedDate = formatDate(decisionDate);

  return [
    'Hardship Payment Request',
    '',
    `Claimant: ${claimantName}`,
    `Sanction type: ${sanctionName}`,
    `Date of sanction decision: ${formattedDate}`,
    '',
    'Reason for hardship:',
    reasonForHardship,
    '',
    'I am requesting an advance hardship payment as I am unable to meet my basic needs due to the sanction deduction from my Universal Credit.'
  ].join('\n');
}

export function serializeUCSanctions(value) {
  return JSON.stringify(value || {});
}

export function parseUCSanctions(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [name, entries] of Object.entries(parsed)) {
      if (Array.isArray(entries)) clean[name] = entries;
    }
    return clean;
  } catch {
    return {};
  }
}
