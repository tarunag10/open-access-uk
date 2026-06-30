import { addWorkingDays } from '../deadlines/index.mjs';

const CLAIM_TYPES = [
  { id: 'unfair-dismissal', name: 'Unfair Dismissal', deadlineMonths: 3, source: 'employment-rights-act-1996', description: 'Dismissal without fair reason or fair procedure' },
  { id: 'discrimination', name: 'Discrimination', deadlineMonths: 3, source: 'equality-act-2010', description: 'Direct/indirect discrimination, harassment, victimisation' },
  { id: 'wages', name: 'Unpaid Wages', deadlineMonths: 3, source: 'employment-rights-act-1996', description: 'Wrongful deduction from wages' },
  { id: 'breach-of-contract', name: 'Breach of Contract', deadlineMonths: 6, source: 'common-law', description: 'Breach of employment contract terms' },
  { id: 'redundancy', name: 'Redundancy', deadlineMonths: 6, source: 'employment-rights-act-1996', description: 'Redundancy pay, consultation, or selection disputes' }
];

function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
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

function addMonths(value, months) {
  const date = parseLocalDate(value);
  if (!date) return null;
  date.setUTCMonth(date.getUTCMonth() + months);
  return toLocalDateString(date);
}

export function getClaimTypes() {
  return [...CLAIM_TYPES];
}

export function getACASDeadline(dismissalDate) {
  const date = parseLocalDate(dismissalDate);
  if (!date) return null;
  date.setUTCMonth(date.getUTCMonth() + 3);
  date.setUTCDate(date.getUTCDate() - 1);
  return toLocalDateString(date);
}

export function getET1Deadline(acasCertDate) {
  const date = parseLocalDate(acasCertDate);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + 42);
  return toLocalDateString(date);
}

export function getRemedyCalculator(data) {
  const age = Number(data?.age) || 0;
  const yearsOfService = Math.min(Number(data?.yearsOfService) || 0, 20);
  const weeklyPay = Number(data?.weeklyPay) || 0;
  const compensatory = Number(data?.compensatory) || 0;
  const basicAward = age * yearsOfService * weeklyPay;
  const compensatoryAward = compensatory;
  return {
    basicAward,
    compensatoryAward,
    total: basicAward + compensatoryAward
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
