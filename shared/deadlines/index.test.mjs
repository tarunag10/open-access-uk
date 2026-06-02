import test from 'node:test';
import assert from 'node:assert/strict';
import { addWorkingDays, calculateDeadline, parseLocalDate } from './index.mjs';

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
