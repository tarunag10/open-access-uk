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

function isWorkingDay(date) {
  const day = date.getUTCDay ? date.getUTCDay() : date.getDay();
  return day !== 0 && day !== 6;
}

export function addWorkingDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  let remaining = Number(days);
  const result = new Date(date.getTime());
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  return toLocalDateString(result);
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

  const result = new Date(date.getTime());
  if (rule.days) result.setUTCDate(result.getUTCDate() + Number(rule.days));
  if (rule.weeks) result.setUTCDate(result.getUTCDate() + Number(rule.weeks) * 7);
  if (rule.months) result.setUTCMonth(result.getUTCMonth() + Number(rule.months));

  return {
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation
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
