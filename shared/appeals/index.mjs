import { addWorkingDays } from '../deadlines/index.mjs';

const BENEFIT_TYPES = [
  { id: 'pip', name: 'Personal Independence Payment (PIP)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-pip' },
  { id: 'uc', name: 'Universal Credit (UC)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-uc-mandatory-reconsideration' },
  { id: 'esa', name: 'Employment and Support Allowance (ESA)', mrDeadlineMonths: 1, tribunalDeadlineMonths: 1, source: 'govuk-esa' }
];

const PIP_DESCRIPTORS = [
  { category: 'daily_living', label: 'Daily living', activities: [
    'Preparing food', 'Taking nutrition', 'Managing therapy or monitoring a health condition',
    'Washing and bathing', 'Dressing and undressing', 'Communicating verbally',
    'Reading and understanding signs, symbols and words', 'Engaging with other people face to face',
    'Budgeting and managing money', 'Coping with social engagement'
  ]},
  { category: 'mobility', label: 'Mobility', activities: [
    'Planning and following journeys', 'Moving around'
  ]}
];

const ESA_DESCRIPTORS = [
  { category: 'coping_with_physical_demands', label: 'Coping with physical demands', activities: [
    'Mobilising', 'Standing and sitting', 'Reaching', 'Picking up and moving objects',
    'Communication', 'Manual dexterity', 'Continence', 'Consciousness'
  ]},
  { category: 'coping_with_social_demands', label: 'Coping with social demands', activities: [
    'Understanding communication', 'Engaging in social engagement',
    'Coping with social engagement', 'Appropriateness of behaviour'
  ]},
  { category: 'coping_with_unpredictable_situations', label: 'Coping with unpredictable situations', activities: [
    'Awareness of danger', 'Adapting to change', 'Getting about safely'
  ]}
];

const UC_DESCRIPTORS = [];

function findBenefit(id) {
  return BENEFIT_TYPES.find((b) => b.id === id) || null;
}

export function getAppealTypes() {
  return [...BENEFIT_TYPES];
}

export function getMandatoryReconsiderationDeadline(benefitType) {
  const benefit = findBenefit(benefitType);
  if (!benefit) return null;
  return { months: benefit.mrDeadlineMonths, source: benefit.source };
}

export function getTribunalDeadline(benefitType) {
  const benefit = findBenefit(benefitType);
  if (!benefit) return null;
  return { months: benefit.tribunalDeadlineMonths, source: benefit.source };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function findBenefitName(benefitType) {
  const benefit = findBenefit(benefitType);
  return benefit ? benefit.name : benefitType;
}

export function generateMRText(data) {
  const { benefitType, decisionDate, nationalInsurance, grounds } = data;
  const benefitName = findBenefitName(benefitType);
  const formattedDate = formatDate(decisionDate);

  return [
    'Mandatory Reconsideration',
    '',
    `Benefit type: ${benefitName}`,
    `Date of decision: ${formattedDate}`,
    `National Insurance number: ${nationalInsurance}`,
    '',
    'Reasons for disagreement:',
    grounds
  ].join('\n');
}

export function generateSSCS1Text(data) {
  const { benefitType, decisionDate, mrDecisionDate, nationalInsurance, grounds } = data;
  const benefitName = findBenefitName(benefitType);
  const formattedDecision = formatDate(decisionDate);
  const formattedMR = formatDate(mrDecisionDate);

  return [
    'SSCS1 - Appeal form',
    '',
    `Benefit type: ${benefitName}`,
    `Date of original decision: ${formattedDecision}`,
    `Date of Mandatory Reconsideration notice: ${formattedMR}`,
    `National Insurance number: ${nationalInsurance}`,
    '',
    'Grounds of appeal:',
    grounds
  ].join('\n');
}

export function getDescriptorGuidance(benefitType) {
  switch (benefitType) {
    case 'pip': return [...PIP_DESCRIPTORS];
    case 'esa': return [...ESA_DESCRIPTORS];
    case 'uc': return [...UC_DESCRIPTORS];
    default: return [];
  }
}

export function serializeAppeals(value) {
  return JSON.stringify(value || {});
}

export function parseAppeals(value) {
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
