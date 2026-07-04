/**
 * Deadline calculation engine for UK public-law, complaint, and tribunal time limits.
 */

// England-and-Wales bank holidays (static table — update after each GOV.UK publication)
// Source: https://www.gov.uk/bank-holidays
export const BANK_HOLIDAYS_EW = new Set([
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

function isWorkingDay(date, bankHolidays = BANK_HOLIDAYS_EW) {
  const day = date.getUTCDay ? date.getUTCDay() : date.getDay();
  if (day === 0 || day === 6) return false;
  const dateStr = toLocalDateString(date);
  if (bankHolidays.has(dateStr)) return false;
  return true;
}

export function addWorkingDays(value, days, bankHolidays = BANK_HOLIDAYS_EW) {
  if (typeof value === 'string') {
    const parsed = parseLocalDate(value);
    if (!parsed) return null;
    value = parsed;
  }
  let date = value instanceof Date ? new Date(value.getTime()) : null;
  if (!date) return null;

  let remaining = Number(days);
  // If moving backwards, subtract days
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

/**
 * Adds months using the corresponding-date rule:
 *   - 31 Jan + 1 month = 28 Feb (or 29 in leap years)
 *   - 31 March + 1 month = 30 April
 * If the target month doesn't have enough days, clamp to last day of month.
 */
export function addMonthsCorresponding(date, months) {
  const result = new Date(date.getTime());
  const targetMonth = result.getUTCMonth() + Number(months);
  result.setUTCMonth(targetMonth);
  // If the day overflowed (e.g. 31 Jan -> 3 March), clamp to last day of target month
  if (result.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setUTCDate(0); // roll back to last day of previous month
  }
  return result;
}

export function calculateDeadline(startDate, rule) {
  const date = parseLocalDate(startDate);
  if (!date || !rule) return null;

  if (rule.days && rule.day_type === 'working') {
    return {
      ruleId: rule.id,
      targetDate: addWorkingDays(startDate, Number(rule.days)),
      explanation: rule.explanation
    };
  }

  let result = new Date(date.getTime());
  if (rule.days) result.setUTCDate(result.getUTCDate() + Number(rule.days));
  if (rule.weeks) result.setUTCDate(result.getUTCDate() + Number(rule.weeks) * 7);
  if (rule.months) result = addMonthsCorresponding(result, rule.months);

  return {
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation
  };
}

/**
 * Calculate ET claim deadline: "3 months less one day" from effective date of termination.
 * Optionally apply early-conciliation clock-stop (EC days pause the clock).
 */
export function calculateETDeadline(effectiveDateOfTermination, earlyConciliationDays = 0) {
  const date = parseLocalDate(effectiveDateOfTermination);
  if (!date) return null;

  // 3 months from EDT using corresponding-date rule
  const deadline = addMonthsCorresponding(date, 3);
  // Subtract one day
  deadline.setUTCDate(deadline.getUTCDate() - 1);

  // If early conciliation was used, add the paused days
  if (earlyConciliationDays > 0) {
    deadline.setUTCDate(deadline.getUTCDate() + Number(earlyConciliationDays));
  }

  return toLocalDateString(deadline);
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
  const safeDesc = (description || 'Open Access UK deadline') + ' (Generated locally in the browser. Nothing was sent to a server. This is an informational aid, not legal advice.)';
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
