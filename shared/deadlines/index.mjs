export function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function toLocalDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function addWorkingDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  let remaining = Number(days);
  const result = new Date(date);
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
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

  const result = new Date(date);
  if (rule.days) result.setDate(result.getDate() + Number(rule.days));
  if (rule.weeks) result.setDate(result.getDate() + Number(rule.weeks) * 7);
  if (rule.months) result.setMonth(result.getMonth() + Number(rule.months));

  return {
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation
  };
}
