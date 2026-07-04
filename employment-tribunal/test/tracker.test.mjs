import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getClaimTypes,
  getACASDeadline,
  getET1Deadline,
  getRemedyCalculator,
  generateET1Text,
  generateACASText,
  serializeEmployment,
  parseEmployment,
  escapeHtml,
  renderClaimCard,
  renderTimeline
} from '../src/tracker.js';

test('getClaimTypes returns five claim types', () => {
  const types = getClaimTypes();
  assert.equal(types.length, 5);
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('unfair-dismissal'));
  assert.ok(ids.includes('discrimination'));
  assert.ok(ids.includes('wages'));
  assert.ok(ids.includes('breach-of-contract'));
  assert.ok(ids.includes('redundancy'));
});

test('getACASDeadline returns 3 months minus 1 day from dismissal', () => {
  const deadline = getACASDeadline('2026-01-15');
  assert.ok(deadline);
  assert.equal(typeof deadline, 'object');
  assert.equal(deadline.targetDate, '2026-04-14');
  assert.equal(deadline.months, 3);
});

test('getACASDeadline returns null for invalid date', () => {
  assert.equal(getACASDeadline(''), null);
  assert.equal(getACASDeadline(null), null);
  assert.equal(getACASDeadline('invalid'), null);
});

test('getET1Deadline returns 42 days from ACAS cert date', () => {
  const deadline = getET1Deadline('2026-06-01');
  assert.equal(deadline, '2026-07-13');
});

test('getET1Deadline returns null for invalid date', () => {
  assert.equal(getET1Deadline(''), null);
  assert.equal(getET1Deadline(null), null);
});

test('getRemedyCalculator calculates basic and compensatory awards', () => {
  const result = getRemedyCalculator({
    age: 40,
    yearsOfService: 5,
    weeklyPay: 500,
    compensatory: 10000
  });
  assert.equal(result.basicAward, 100000);
  assert.equal(result.compensatoryAward, 10000);
  assert.equal(result.total, 110000);
});

test('getRemedyCalculator caps years of service at 20', () => {
  const result = getRemedyCalculator({
    age: 30,
    yearsOfService: 25,
    weeklyPay: 400,
    compensatory: 0
  });
  assert.equal(result.basicAward, 240000);
});

test('getRemedyCalculator handles missing/zero values', () => {
  const result = getRemedyCalculator({});
  assert.equal(result.basicAward, 0);
  assert.equal(result.compensatoryAward, 0);
  assert.equal(result.total, 0);
});

test('generateET1Text includes key fields', () => {
  const text = generateET1Text({
    claimantName: 'Jane Smith',
    employerName: 'Acme Corp',
    employerAddress: '123 London Road',
    claimType: 'unfair-dismissal',
    employmentStartDate: '2020-01-01',
    employmentEndDate: '2026-05-30',
    dismissalDate: '2026-05-30',
    weeklyPay: 500,
    grounds: 'I was unfairly dismissed without valid reason.'
  });
  assert.match(text, /ET1 Claim Form/);
  assert.match(text, /Jane Smith/);
  assert.match(text, /Acme Corp/);
  assert.match(text, /123 London Road/);
  assert.match(text, /Unfair Dismissal/);
  assert.match(text, /2020-01-01/);
  assert.match(text, /2026-05-30/);
  assert.match(text, /500/);
  assert.match(text, /unfairly dismissed/);
});

test('generateACASText includes key fields', () => {
  const text = generateACASText({
    claimantName: 'Jane Smith',
    employerName: 'Acme Corp',
    claimType: 'discrimination',
    grounds: 'Direct discrimination on grounds of age.'
  });
  assert.match(text, /ACAS Early Conciliation Notification/);
  assert.match(text, /Jane Smith/);
  assert.match(text, /Acme Corp/);
  assert.match(text, /Discrimination/);
  assert.match(text, /Direct discrimination/);
});

test('serializeEmployment and parseEmployment round-trip', () => {
  const data = [
    { id: '1', claimantName: 'A' },
    { id: '2', claimantName: 'B' }
  ];
  const serialized = serializeEmployment(data);
  const parsed = parseEmployment(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].claimantName, 'A');
});

test('parseEmployment handles invalid input', () => {
  assert.equal(parseEmployment(''), null);
  assert.equal(parseEmployment(null), null);
  assert.equal(parseEmployment(undefined), null);
  assert.equal(parseEmployment('not json'), null);
});

test('escapeHtml escapes special characters', () => {
  assert.equal(
    escapeHtml('<script>alert("xss")</script>'),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
  );
  assert.equal(escapeHtml("it's a test"), 'it&#39;s a test');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
});

test('renderClaimCard returns HTML with key elements', () => {
  const claim = {
    id: 'test-1',
    claimantName: 'Jane Smith',
    employerName: 'Acme Corp',
    claimType: 'unfair-dismissal',
    dismissalDate: '2026-05-30'
  };
  const html = renderClaimCard(claim);
  assert.match(html, /Acme Corp/);
  assert.match(html, /Jane Smith/);
  assert.match(html, /Unfair Dismissal/);
  assert.match(html, /2026-05-30/);
  assert.match(html, /data-action="view"/);
  assert.match(html, /data-action="delete"/);
});

test('renderTimeline returns ordered list HTML', () => {
  const claim = {
    claimType: 'unfair-dismissal',
    employmentStartDate: '2020-01-01',
    dismissalDate: '2026-05-30'
  };
  const html = renderTimeline(claim);
  assert.match(html, /<ol/);
  assert.match(html, /Employment Start/);
  assert.match(html, /2020-01-01/);
  assert.match(html, /Dismissal Date/);
  assert.match(html, /2026-05-30/);
  assert.match(html, /ACAS Early Conciliation/);
  assert.match(html, /ET1 Submitted/);
});
