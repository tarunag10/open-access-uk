import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIcsEvent, foldIcsLine } from './ics.mjs';

test('createIcsEvent produces a valid all-day VEVENT', () => {
  const ics = createIcsEvent({
    title: 'FOI response due',
    date: '2026-07-01',
    description: 'Response expected from access@example.org',
    uid: 'fixed-uid-1'
  });
  assert.match(ics, /^BEGIN:VCALENDAR/);
  assert.match(ics, /VERSION:2\.0/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:FOI response due/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260701/);
  assert.match(ics, /DTEND;VALUE=DATE:20260702/); // all-day end is +1 day
  assert.match(ics, /UID:fixed-uid-1/);
  assert.match(ics, /END:VEVENT/);
  assert.match(ics, /END:VCALENDAR/);
  assert.ok(ics.endsWith('\r\n'), 'ICS lines must be CRLF-terminated');
});

test('createIcsEvent escapes commas, semicolons, and newlines', () => {
  const ics = createIcsEvent({
    title: 'Deadline; urgent, act',
    date: '2026-07-01',
    description: 'Line one\nLine two',
    uid: 'u2'
  });
  assert.match(ics, /SUMMARY:Deadline\\; urgent\\, act/);
  assert.match(ics, /DESCRIPTION:Line one\\nLine two/);
});

test('createIcsEvent returns empty string for an invalid date', () => {
  assert.equal(createIcsEvent({ title: 'x', date: 'not-a-date', uid: 'u3' }), '');
});

test('foldIcsLine wraps lines longer than 75 octets with CRLF + space', () => {
  const long = 'SUMMARY:' + 'a'.repeat(120);
  const folded = foldIcsLine(long);
  assert.ok(folded.split('\r\n').every((seg) => seg.length <= 75));
  assert.match(folded, /\r\n /);
});
