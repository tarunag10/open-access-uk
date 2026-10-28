const CLAIM_TYPES = [
  {
    id: 'unfair-dismissal',
    name: 'Unfair Dismissal',
    deadlineMonths: 3,
    source: 'employment-rights-act-1996',
    description:
      'Dismissal without fair reason or fair procedure. Deadline: 3 months less one day from effective date of termination. Early conciliation pauses the clock.'
  },
  {
    id: 'discrimination',
    name: 'Discrimination',
    deadlineMonths: 3,
    source: 'equality-act-2010',
    description: 'Direct/indirect discrimination, harassment, victimisation'
  },
  {
    id: 'wages',
    name: 'Unpaid Wages',
    deadlineMonths: 3,
    source: 'employment-rights-act-1996',
    description: 'Wrongful deduction from wages'
  },
  {
    id: 'breach-of-contract',
    name: 'Breach of Contract',
    deadlineMonths: 6,
    source: 'common-law',
    description: 'Breach of employment contract terms'
  },
  {
    id: 'redundancy',
    name: 'Redundancy',
    deadlineMonths: 6,
    source: 'employment-rights-act-1996',
    description: 'Redundancy pay, consultation, or selection disputes'
  }
];

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
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return [y, String(m + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}

export function getClaimTypes() {
  return [...CLAIM_TYPES];
}

/**
 * Calculate ET claim deadline: 3 months less one day from effective date of termination,
 * with optional early conciliation clock-stop. Since 1 Dec 2025, early conciliation
 * may last up to 12 weeks and pauses the statutory time limit.
 */
export function getACASDeadline(dismissalDate, earlyConciliationDays = 0, claimType = null) {
  const date = parseLocalDate(dismissalDate);
  if (!date) return null;

  // The statutory transition turns on the relevant event date, not today's date.
  // The six-month period applies to most claim types from 1 October 2026; check
  // claim-specific and jurisdictional exceptions separately.
  const legacyMonths = CLAIM_TYPES.find((claim) => claim.id === claimType)?.deadlineMonths || 3;
  const months = dismissalDate >= '2026-10-01' ? 6 : legacyMonths;
  const day = date.getUTCDate();
  const targetMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)
  ).getUTCDate();
  targetMonth.setUTCDate(Math.min(day, lastDay) - 1);
  if (earlyConciliationDays > 0) {
    targetMonth.setUTCDate(targetMonth.getUTCDate() + Number(earlyConciliationDays));
  }

  return {
    targetDate: toLocalDateString(targetMonth),
    months,
    earlyConciliationDays,
    note:
      months === 6
        ? 'Six-month time limit for most claims from 1 October 2026; confirm claim-specific and jurisdictional exceptions.'
        : 'Three months less one day from the effective date of termination. ACAS Early Conciliation pauses the clock.'
  };
}

export function formatDateForDisplay(value) {
  const date = parseLocalDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

export function getCompletedServiceYears(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start || !end || end < start) return null;
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(
    Date.UTC(start.getUTCFullYear() + years, start.getUTCMonth(), start.getUTCDate())
  );
  // For a 29 February start, the anniversary is treated as 28 February in non-leap years.
  if (anniversary.getUTCMonth() !== start.getUTCMonth()) anniversary.setUTCDate(0);
  if (end < anniversary) years--;
  return Math.max(0, years);
}

export function getET1Deadline(acasCertDate) {
  const date = parseLocalDate(acasCertDate);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + 42);
  return toLocalDateString(date);
}

export function getRemedyCalculator(data) {
  const age = Number(data?.ageAtDismissal);
  const yearsOfService = Number(data?.yearsOfService);
  const weeklyPay = Number(data?.weeklyPay);
  const dismissalDate = parseLocalDate(data?.dismissalDate);
  if (
    !Number.isInteger(age) ||
    age < 16 ||
    age > 120 ||
    !Number.isFinite(yearsOfService) ||
    yearsOfService < 0 ||
    !Number.isFinite(weeklyPay) ||
    weeklyPay < 0 ||
    !dismissalDate ||
    data.dismissalDate < '2025-04-06'
  ) {
    return { basicAward: null, compensatoryAward: null, total: null };
  }
  const cappedYears = Math.min(Math.floor(yearsOfService), 20);
  const weeklyPayLimit = data.dismissalDate >= '2026-04-06' ? 751 : 719;
  const cappedWeeklyPay = Math.min(weeklyPay, weeklyPayLimit);
  let weeks = 0;
  for (let year = 0; year < cappedYears; year++) {
    const ageForYear = age - year;
    weeks += ageForYear >= 41 ? 1.5 : ageForYear >= 22 ? 1 : 0.5;
  }
  const basicAward = Math.round(weeks * cappedWeeklyPay * 100) / 100;
  const compensatoryAward = null;
  return {
    basicAward,
    compensatoryAward,
    total: null
  };
}

function claimTypeName(claimType) {
  const found = CLAIM_TYPES.find((c) => c.id === claimType);
  return found ? found.name : claimType || 'Unknown';
}

export function generateET1Text(data) {
  const lines = [];
  lines.push('ET1 Claim Form');
  lines.push('');
  lines.push(`Claimant: ${data.claimantName || ''}`);
  lines.push(`Employer: ${data.employerName || ''}`);
  if (data.employerAddress) lines.push(`Employer Address: ${data.employerAddress}`);
  lines.push(`Claim Type: ${claimTypeName(data.claimType)}`);
  if (data.employmentStartDate) lines.push(`Employment Start: ${data.employmentStartDate}`);
  if (data.employmentEndDate) lines.push(`Employment End: ${data.employmentEndDate}`);
  if (data.dismissalDate) lines.push(`Dismissal Date: ${data.dismissalDate}`);
  if (data.weeklyPay !== undefined) lines.push(`Weekly Pay: ${data.weeklyPay}`);
  lines.push('');
  lines.push('Grounds:');
  lines.push(data.grounds || '');
  return lines.join('\n');
}

export function generateACASText(data) {
  const lines = [];
  lines.push('ACAS Early Conciliation Notification');
  lines.push('');
  lines.push(`Claimant: ${data.claimantName || ''}`);
  lines.push(`Employer: ${data.employerName || ''}`);
  if (data.employerAddress) lines.push(`Employer Address: ${data.employerAddress}`);
  lines.push(`Claim Type: ${claimTypeName(data.claimType)}`);
  if (data.employmentStartDate) lines.push(`Employment Start: ${data.employmentStartDate}`);
  if (data.employmentEndDate) lines.push(`Employment End: ${data.employmentEndDate}`);
  if (data.weeklyPay !== undefined) lines.push(`Weekly Pay: ${data.weeklyPay}`);
  lines.push('');
  lines.push('Grounds:');
  lines.push(data.grounds || '');
  return lines.join('\n');
}

export function getChronologyTemplate() {
  return [
    { label: 'Employment Start', dateField: 'employmentStartDate' },
    { label: 'Notice Given', dateField: 'noticeDate' },
    { label: 'Dismissal Date', dateField: 'dismissalDate' },
    { label: 'ACAS Early Conciliation', dateField: 'acasDate' },
    { label: 'ET1 Submitted', dateField: 'et1Date' },
    { label: 'Preliminary Hearing', dateField: 'prelimHearingDate' },
    { label: 'Final Hearing', dateField: 'finalHearingDate' }
  ];
}

export function serializeEmployment(value) {
  return JSON.stringify(value);
}

export function parseEmployment(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
