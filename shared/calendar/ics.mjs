import { parseLocalDate, toLocalDateString } from '../deadlines/index.mjs';

function compactDate(dateString) {
  return dateString.replace(/-/g, '');
}

function nextDay(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return toLocalDateString(date);
}

function escapeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// RFC 5545 line folding at 75 octets.
export function foldIcsLine(line) {
  if (line.length <= 75) return line;
  const segments = [];
  let remaining = line;
  segments.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    segments.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return segments.join('\r\n');
}

export function createIcsEvent({ title, date, description = '', uid } = {}) {
  const start = parseLocalDate(date);
  if (!start) return '';
  const end = nextDay(date);
  const stamp = `${compactDate(date)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Local//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid || `${compactDate(date)}-${escapeText(title)}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${compactDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
