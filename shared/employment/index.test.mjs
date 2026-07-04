import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getClaimTypes,
  getACASDeadline,
  getET1Deadline,
  getRemedyCalculator,
  generateET1Text,
  generateACASText,
  getChronologyTemplate,
  serializeEmployment,
  parseEmployment
} from './index.mjs';

test('getClaimTypes returns array of 5 claim types', () => {
  const types = getClaimTypes();
  assert.ok(Array.isArray(types));
  assert.equal(types.length, 5);
});

test('getClaimTypes each type has id, name, deadlineMonths, source, description', () => {
  const types = getClaimTypes();
  for (const t of types) {
    assert.ok(t.id, `${t.id} missing id`);
    assert.ok(t.name, `${t.id} missing name`);
    assert.ok(typeof t.deadlineMonths === 'number', `${t.id} missing deadlineMonths`);
    assert.ok(t.source, `${t.id} missing source`);
    assert.ok(t.description, `${t.id} missing description`);
  }
});

test('getClaimTypes returns expected ids', () => {
  const types = getClaimTypes();
  const ids = types.map((t) => t.id);
  assert.deepEqual(ids, [
    'unfair-dismissal',
    'discrimination',
    'wages',
    'breach-of-contract',
    'redundancy'
  ]);
});

test('getClaimTypes returns copy of array', () => {
  const a = getClaimTypes();
  const b = getClaimTypes();
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
});

test('getACASDeadline returns 3 months minus 1 day from dismissal', () => {
  const deadline = getACASDeadline('2026-01-15');
  assert.equal(typeof deadline, 'object');
  assert.equal(deadline.targetDate, '2026-04-14');
  assert.equal(deadline.months, 3);
});

test('getACASDeadline handles year boundary', () => {
  const deadline = getACASDeadline('2025-12-15');
  assert.equal(deadline.targetDate, '2026-03-14');
});

test('getACASDeadline handles short months', () => {
  const deadline = getACASDeadline('2026-02-28');
  assert.equal(deadline.targetDate, '2026-05-27');
});

test('getACASDeadline returns null for invalid date', () => {
  assert.equal(getACASDeadline('bad-date'), null);
});

test('getET1Deadline returns 42 days from ACAS certificate', () => {
  const deadline = getET1Deadline('2026-06-01');
  assert.equal(deadline, '2026-07-13');
});

test('getET1Deadline handles month boundary', () => {
  const deadline = getET1Deadline('2026-05-20');
  assert.equal(deadline, '2026-07-01');
});

test('getET1Deadline returns null for invalid date', () => {
  assert.equal(getET1Deadline('not-a-date'), null);
});

test('getRemedyCalculator calculates basic award', () => {
  const result = getRemedyCalculator({
    age: 40,
    yearsOfService: 10,
    weeklyPay: 500,
    compensatory: 10000
  });
  assert.equal(typeof result, 'object');
  assert.equal(result.basicAward, 10 * 40 * 500);
  assert.equal(result.compensatoryAward, 10000);
  assert.equal(result.total, result.basicAward + result.compensatoryAward);
});

test('getRemedyCalculator caps basic award years at 20', () => {
  const result = getRemedyCalculator({
    age: 50,
    yearsOfService: 25,
    weeklyPay: 400,
    compensatory: 0
  });
  assert.equal(result.basicAward, 50 * 20 * 400);
});

test('getRemedyCalculator handles zero compensatory', () => {
  const result = getRemedyCalculator({
    age: 35,
    yearsOfService: 5,
    weeklyPay: 600,
    compensatory: 0
  });
  assert.equal(result.compensatoryAward, 0);
  assert.equal(result.total, result.basicAward);
});

test('getRemedyCalculator defaults missing fields', () => {
  const result = getRemedyCalculator({});
  assert.equal(result.basicAward, 0);
  assert.equal(result.compensatoryAward, 0);
  assert.equal(result.total, 0);
});

test('generateET1Text generates ET1 claim text with all fields', () => {
  const text = generateET1Text({
    claimantName: 'Jane Smith',
    employerName: 'Acme Corp',
    employerAddress: '123 High Street, London, E1 6AN',
    claimType: 'unfair-dismissal',
    employmentStartDate: '2020-03-01',
    employmentEndDate: '2026-04-30',
    dismissalDate: '2026-04-30',
    weeklyPay: 600,
    grounds: 'I was dismissed without a fair reason.'
  });
  assert.equal(typeof text, 'string');
  assert.ok(text.includes('Jane Smith'));
  assert.ok(text.includes('Acme Corp'));
  assert.ok(text.includes('123 High Street, London, E1 6AN'));
  assert.ok(text.includes('Unfair Dismissal'));
  assert.ok(text.includes('2020-03-01'));
  assert.ok(text.includes('2026-04-30'));
  assert.ok(text.includes('600'));
  assert.ok(text.includes('I was dismissed without a fair reason.'));
});

test('generateET1Text includes claim type name not id', () => {
  const text = generateET1Text({
    claimantName: 'A',
    employerName: 'B',
    claimType: 'discrimination',
    weeklyPay: 500,
    grounds: 'test'
  });
  assert.ok(text.includes('Discrimination'));
  assert.ok(!text.includes('discrimination'));
});

test('generateACASText generates ACAS early conciliation text', () => {
  const text = generateACASText({
    claimantName: 'Jane Smith',
    employerName: 'Acme Corp',
    employerAddress: '123 High Street, London, E1 6AN',
    claimType: 'wages',
    employmentStartDate: '2020-03-01',
    employmentEndDate: '2026-04-30',
    weeklyPay: 600,
    grounds: 'Unpaid wages for final month.'
  });
  assert.equal(typeof text, 'string');
  assert.ok(text.includes('Jane Smith'));
  assert.ok(text.includes('Acme Corp'));
  assert.ok(text.includes('123 High Street, London, E1 6AN'));
  assert.ok(text.includes('Unpaid Wages'));
  assert.ok(text.includes('2020-03-01'));
  assert.ok(text.includes('2026-04-30'));
  assert.ok(text.includes('Unpaid wages for final month.'));
});

test('getChronologyTemplate returns array of timeline items', () => {
  const template = getChronologyTemplate();
  assert.ok(Array.isArray(template));
  assert.ok(template.length > 0);
});

test('getChronologyTemplate each item has label and dateField', () => {
  const template = getChronologyTemplate();
  for (const item of template) {
    assert.ok(item.label, `missing label`);
    assert.ok(item.dateField, `missing dateField`);
  }
});

test('serializeEmployment produces JSON string', () => {
  const data = { claimantName: 'Test', weeklyPay: 500 };
  const serialized = serializeEmployment(data);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.claimantName, 'Test');
  assert.equal(parsed.weeklyPay, 500);
});

test('serializeEmployment handles array', () => {
  const arr = [{ a: 1 }, { b: 2 }];
  const serialized = serializeEmployment(arr);
  const parsed = JSON.parse(serialized);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 2);
});

test('parseEmployment parses valid JSON', () => {
  const json = JSON.stringify({ claimantName: 'Test' });
  const result = parseEmployment(json);
  assert.equal(result.claimantName, 'Test');
});

test('parseEmployment returns null for invalid JSON', () => {
  assert.equal(parseEmployment('not-json'), null);
});

test('parseEmployment returns null for empty string', () => {
  assert.equal(parseEmployment(''), null);
});

test('parseEmployment returns null for non-string input', () => {
  assert.equal(parseEmployment(null), null);
  assert.equal(parseEmployment(undefined), null);
  assert.equal(parseEmployment(123), null);
});

test('serializeEmployment and parseEmployment roundtrip', () => {
  const data = { claimantName: 'Alice', weeklyPay: 800 };
  const roundtripped = parseEmployment(serializeEmployment(data));
  assert.deepEqual(roundtripped, data);
});
