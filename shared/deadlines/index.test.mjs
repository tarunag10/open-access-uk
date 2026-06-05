import test from 'node:test';
import assert from 'node:assert/strict';
import { addWorkingDays, calculateDeadline, parseLocalDate, formatDateForDisplay, buildICS } from './index.mjs';

test('parses local dates and adds working days', () => {
  assert.equal(parseLocalDate('2026-06-02').getFullYear(), 2026);
  assert.equal(addWorkingDays('2026-06-05', 1), '2026-06-08');
  assert.equal(addWorkingDays('bad-date', 1), null);
});

test('calculates working-day, week, and month deadlines', () => {
  assert.deepEqual(
    calculateDeadline('2026-06-02', {
      id: 'foi-response',
      days: '20',
      day_type: 'working',
      explanation: '20 working days'
    }),
    {
      ruleId: 'foi-response',
      targetDate: '2026-06-30',
      explanation: '20 working days'
    }
  );

  assert.equal(
    calculateDeadline('2026-06-02', {
      id: 'sar-response',
      months: '1',
      day_type: 'calendar',
      explanation: 'one month'
    }).targetDate,
    '2026-07-02'
  );

  assert.equal(
    calculateDeadline('2026-06-02', {
      id: 'finance',
      weeks: '8',
      day_type: 'calendar',
      explanation: '8 weeks'
    }).targetDate,
    '2026-07-28'
  );
});

test('parseLocalDate is UTC-safe and roundtrips (Phase 1 reconcile)', () => {
  const d = parseLocalDate('2026-06-05');
  assert.ok(d);
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 5);
  assert.equal(d.getUTCDate(), 5);
});

test('addWorkingDays skips weekends and matches letter behavior (Phase 1)', () => {
  const target = addWorkingDays('2026-06-05', 5); // Fri +5wd
  assert.ok(target);
  // Should land on a weekday
  const dt = parseLocalDate(target);
  const day = dt.getUTCDay();
  assert.notEqual(day, 0);
  assert.notEqual(day, 6);
});

test('calculateDeadline supports rules from data + custom (Phase 1)', () => {
  const rule = { id: 'test-foi', days: 20, day_type: 'working' };
  const res = calculateDeadline('2026-06-01', rule);
  assert.equal(res.ruleId, 'test-foi');
  assert.ok(res.targetDate);
});

test('formatDateForDisplay and buildICS exist and produce output (Phase 1)', async () => {
  // Will import more after impl; basic existence via re-export or add
  const { formatDateForDisplay, buildICS } = await import('./index.mjs');
  assert.ok(typeof formatDateForDisplay === 'function');
  const ics = buildICS('Follow up letter', '2026-06-20', 'FOI follow-up');
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260620/);
});
