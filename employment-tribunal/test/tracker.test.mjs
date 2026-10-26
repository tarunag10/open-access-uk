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
  formatDateForDisplay,
  getCompletedServiceYears,
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

test('claim cards render the calculated ACAS deadline date, not the deadline object', () => {
  const html = renderClaimCard({
    id: 'deadline-1', claimType: 'unfair-dismissal', dismissalDate: '2026-10-01'
  });
  assert.match(html, /ACAS deadline: 31 March 2027/);
  assert.doesNotMatch(html, /\[object Object\]/);
});

test('October 2026 transition uses six months less one day from the event date', () => {
  assert.equal(getACASDeadline('2026-09-30').targetDate, '2026-12-29');
  assert.equal(getACASDeadline('2026-10-01').targetDate, '2027-03-31');
});

test('pre-transition claim types already carrying six months retain that limit', () => {
  assert.equal(getACASDeadline('2026-09-30', 0, 'breach-of-contract').targetDate, '2027-03-29');
});

test('completed service counts full anniversaries only', () => {
  assert.equal(getCompletedServiceYears('2020-01-15', '2026-01-14'), 5);
  assert.equal(getCompletedServiceYears('2020-01-15', '2026-01-15'), 6);
  assert.equal(getCompletedServiceYears('2020-02-29', '2021-02-28'), 1);
});

test('formatted dates are stable and human readable', () => {
  assert.equal(formatDateForDisplay('2027-03-31'), '31 March 2027');
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

test('getRemedyCalculator applies the 22 to 40 age band and weekly pay', () => {
  const result = getRemedyCalculator({
    ageAtDismissal: 40,
    yearsOfService: 5,
    weeklyPay: 500,
    dismissalDate: '2026-10-01'
  });
  assert.equal(result.basicAward, 2500);
});

test('getRemedyCalculator uses age bands and statutory weekly-pay cap', () => {
  const result = getRemedyCalculator({
    ageAtDismissal: 42,
    yearsOfService: 3,
    weeklyPay: 900,
    dismissalDate: '2026-10-01'
  });
  assert.equal(result.basicAward, 3004);
});

test('getRemedyCalculator caps service at 20 years and does not invent compensatory totals', () => {
  const result = getRemedyCalculator({
    ageAtDismissal: 60, yearsOfService: 25, weeklyPay: 900, dismissalDate: '2026-10-01'
  });
  assert.equal(result.basicAward, 22530);
  assert.equal(result.compensatoryAward, null);
  assert.equal(result.total, null);
});

test('getRemedyCalculator uses the pre-April 2026 weekly pay limit', () => {
  const result = getRemedyCalculator({
    ageAtDismissal: 41, yearsOfService: 1, weeklyPay: 900, dismissalDate: '2026-04-05'
  });
  assert.equal(result.basicAward, 1078.5);
});

test('getRemedyCalculator withholds an estimate when required inputs are missing', () => {
  assert.equal(getRemedyCalculator({}).basicAward, null);
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
