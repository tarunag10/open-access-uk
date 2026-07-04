/**
 * Deadline calculation engine for UK public-law, complaint, and tribunal time limits.
 *
 * Bank holidays sourced from data/generated/bank-holidays.json (ingested from GOV.UK).
 * Law-change scheduling: rules carry valid_from/valid_until for automatic transitions.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

export function parseLocalDate(value) {
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

export function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear ? date.getUTCFullYear() : date.getFullYear();
  const m = date.getUTCMonth ? date.getUTCMonth() : date.getMonth();
  const d = date.getUTCDate ? date.getUTCDate() : date.getDate();
  return [
    y,
    String(m + 1).padStart(2, '0'),
    String(d).padStart(2, '0')
  ].join('-');
}

// ---------------------------------------------------------------------------
// Bank holidays — loaded from generated data, with static fallback
// ---------------------------------------------------------------------------

export function loadBankHolidays() {
  const filePath = join(root, 'data', 'generated', 'bank-holidays.json');
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      const result = {};
      for (const record of data.records) {
        result[record.jurisdiction] = new Set(record.dates);
      }
      return result;
    } catch {
      // fall through to fallback
    }
  }
  const staticEW = new Set([
    '2024-01-01', '2024-03-29', '2024-04-01', '2024-05-06', '2024-05-27',
    '2024-08-26', '2024-12-25', '2024-12-26',
    '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-05', '2025-05-26',
    '2025-08-25', '2025-12-25', '2025-12-26',
    '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25',
    '2026-08-31', '2026-12-25', '2026-12-28',
    '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31',
    '2027-08-30', '2027-12-27', '2027-12-28',
    '2028-01-03', '2028-04-14', '2028-04-17', '2028-05-01', '2028-05-29',
    '2028-08-28', '2028-12-25', '2028-12-26'
  ]);
  return {
    'england-and-wales': staticEW,
    scotland: staticEW,
    'northern-ireland': staticEW
  };
}

// ---------------------------------------------------------------------------
// Law-change scheduled rules
// ---------------------------------------------------------------------------

export const LAW_CHANGE_RULES = [
  {
    id: 'et-claim-limit-3m',
    name: 'Employment Tribunal claim limit (current: 3 months less one day)',
    months: 3,
    day_type: 'calendar',
    valid_until: '2026-09-30',
    conservative_note: 'Deadline is "3 months less one day" from the effective date of termination. ACAS Early Conciliation pauses the clock (up to 12 weeks since 1 Dec 2025). From October 2026, the limit extends to 6 months for most claims.',
    explanation: 'Employment Rights Act 1996 s.111: claim must be presented before the end of 3 months beginning with EDT, less one day.'
  },
  {
    id: 'et-claim-limit-6m',
    name: 'Employment Tribunal claim limit (from October 2026: 6 months)',
    months: 6,
    day_type: 'calendar',
    valid_from: '2026-10-01',
    conservative_note: 'New 6-month limit under ERA 2025. Wrongful dismissal claims retain the 3-month limit. This rule is provisional pending the commencement SI.',
    explanation: 'Employment Rights Act 2025 extends the unfair dismissal time limit from 3 months to 6 months for most claim types.',
    provisional: true
  }
];

// ---------------------------------------------------------------------------
// Working day helpers
// ---------------------------------------------------------------------------

function isWorkingDay(date, bankHolidays) {
  const day = date.getUTCDay ? date.getUTCDay() : date.getDay();
  if (day === 0 || day === 6) return false;
  const dateStr = toLocalDateString(date);
  if (bankHolidays && bankHolidays.has(dateStr)) return false;
  return true;
}

export function addWorkingDays(value, days, bankHolidays) {
  if (typeof value === 'string') {
    const parsed = parseLocalDate(value);
    if (!parsed) return null;
    value = parsed;
  }
  let date = value instanceof Date ? new Date(value.getTime()) : null;
  if (!date) return null;

  if (!bankHolidays) {
    const all = loadBankHolidays();
    bankHolidays = all['england-and-wales'] || new Set();
  }

  let remaining = Number(days);
  if (remaining < 0) {
    while (remaining < 0) {
      date.setUTCDate(date.getUTCDate() - 1);
      if (isWorkingDay(date, bankHolidays)) remaining += 1;
    }
    return toLocalDateString(date);
  }

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isWorkingDay(date, bankHolidays)) remaining -= 1;
  }
  return toLocalDateString(date);
}

export function addMonthsCorresponding(date, months) {
  const result = new Date(date.getTime());
  const targetMonth = result.getUTCMonth() + Number(months);
  result.setUTCMonth(targetMonth);
  if (result.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setUTCDate(0);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main deadline calculator
// ---------------------------------------------------------------------------

export function calculateDeadline(startDate, rule, jurisdiction) {
  const date = parseLocalDate(startDate);
  if (!date || !rule) return null;

  const today = toLocalDateString(new Date());

  if (rule.valid_until && today > rule.valid_until) {
    return {
      ruleId: rule.id,
      targetDate: null,
      explanation: rule.explanation,
      conservative_note: rule.conservative_note || 'This time limit may have changed. Check current legislation.',
      expired: true
    };
  }

  if (rule.valid_from && today < rule.valid_from) {
    return {
      ruleId: rule.id,
      targetDate: null,
      explanation: `This new time limit takes effect from ${rule.valid_from}. Until then, the previous limit applies.`,
      conservative_note: rule.conservative_note,
      not_yet_effective: true,
      effective_from: rule.valid_from
    };
  }

  let bankHolidays;
  if (rule.day_type === 'working') {
    const all = loadBankHolidays();
    const jKey = jurisdiction === 'scotland' ? 'scotland'
      : jurisdiction === 'northern-ireland' ? 'northern-ireland'
      : 'england-and-wales';
    bankHolidays = all[jKey] || all['england-and-wales'];
  }

  if (rule.days && rule.day_type === 'working') {
    return removeUndefined({
      ruleId: rule.id,
      targetDate: addWorkingDays(startDate, Number(rule.days), bankHolidays),
      explanation: rule.explanation,
      conservative_note: rule.conservative_note
    });
  }

  let result = new Date(date.getTime());
  if (rule.days) result.setUTCDate(result.getUTCDate() + Number(rule.days));
  if (rule.weeks) result.setUTCDate(result.getUTCDate() + Number(rule.weeks) * 7);
  if (rule.months) result = addMonthsCorresponding(result, rule.months);

  return removeUndefined({
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation,
    conservative_note: rule.conservative_note
  });
}

function removeUndefined(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export function calculateETDeadline(effectiveDateOfTermination, earlyConciliationDays = 0) {
  const todayStr = toLocalDateString(new Date());
  const sixMonthRule = LAW_CHANGE_RULES.find(r => r.id === 'et-claim-limit-6m');
  const useSixMonth = sixMonthRule && todayStr >= sixMonthRule.valid_from;

  const date = parseLocalDate(effectiveDateOfTermination);
  if (!date) return null;

  const months = useSixMonth ? 6 : 3;
  const deadline = addMonthsCorresponding(date, months);
  deadline.setUTCDate(deadline.getUTCDate() - 1);

  if (earlyConciliationDays > 0) {
    deadline.setUTCDate(deadline.getUTCDate() + Number(earlyConciliationDays));
  }

  return {
    targetDate: toLocalDateString(deadline),
    months,
    earlyConciliationDays,
    note: useSixMonth
      ? '6-month limit under ERA 2025 (from October 2026). Check if a 3-month limit applies to your claim type.'
      : '3 months less one day from effective date of termination. ACAS Early Conciliation pauses the clock.'
  };
}

export function formatDateForDisplay(value) {
  const date = value instanceof Date ? value : parseLocalDate(value);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function slug(value, fallback = 'deadline') {
  const text = String(value || fallback)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return text || fallback;
}

export function buildICS(title, dateStr, description = '') {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const dt = `${y}${m}${day}`;
  const safeTitle = title || 'Follow-up';
  const safeDesc = (description || 'Open Access UK deadline') + ' (Generated locally. Nothing was sent to a server.)';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Deadline//EN',
    'BEGIN:VEVENT',
    `UID:${dt}-${slug(safeTitle)}@open-access-uk`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDesc.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
