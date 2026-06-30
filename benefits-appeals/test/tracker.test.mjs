import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPEAL_STATUSES,
  createAppeal,
  parseAppealsList,
  serializeAppealsList,
  getStatusMeta,
  getBenefitName,
  renderTimeline,
  generateLetterPreview,
  getDescriptorGuidance,
  getAppealTypes,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline
} from '../src/tracker.js';

test('createAppeal produces a valid appeal with defaults', () => {
  const a = createAppeal({});
  assert.ok(a.id.startsWith('appeal-'));
  assert.equal(a.benefitType, 'pip');
  assert.equal(a.status, 'mr_draft');
  assert.equal(a.grounds, '');
  assert.ok(a.createdAt);
});

test('createAppeal preserves provided fields', () => {
  const a = createAppeal({
    benefitType: 'uc',
    decisionDate: '2026-05-01',
    nationalInsurance: 'AB 12 34 56 C',
    grounds: 'Test grounds',
    status: 'mr_sent'
  });
  assert.equal(a.benefitType, 'uc');
  assert.equal(a.decisionDate, '2026-05-01');
  assert.equal(a.nationalInsurance, 'AB 12 34 56 C');
  assert.equal(a.grounds, 'Test grounds');
  assert.equal(a.status, 'mr_sent');
});

test('serializeAppealsList and parseAppealsList round-trip', () => {
  const original = [createAppeal({ benefitType: 'esa', decisionDate: '2026-04-01' })];
  const serialized = serializeAppealsList(original);
  const parsed = parseAppealsList(serialized);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].benefitType, 'esa');
  assert.equal(parsed[0].decisionDate, '2026-04-01');
});

test('parseAppealsList handles empty and invalid input', () => {
  assert.deepEqual(parseAppealsList(''), []);
  assert.deepEqual(parseAppealsList('not json'), []);
  assert.deepEqual(parseAppealsList('"a string"'), []);
});

test('getStatusMeta returns known and fallback status', () => {
  assert.equal(getStatusMeta('mr_draft').value, 'mr_draft');
  assert.equal(getStatusMeta('unknown').value, 'mr_draft');
});

test('getBenefitName returns correct names', () => {
  assert.match(getBenefitName('pip'), /PIP/);
  assert.match(getBenefitName('uc'), /Universal Credit/);
  assert.match(getBenefitName('esa'), /ESA/);
  assert.equal(getBenefitName('unknown'), 'unknown');
});

test('APPEAL_STATUSES includes all expected statuses', () => {
  const values = APPEAL_STATUSES.map((s) => s.value);
  for (const expected of [
    'mr_draft', 'mr_sent', 'mr_refused', 'mr_allowed',
    'tribunal_draft', 'tribunal_submitted', 'tribunal_hearing',
    'tribunal_allowed', 'tribunal_refused', 'closed'
  ]) {
    assert.ok(values.includes(expected), `missing status ${expected}`);
  }
});

test('getAppealTypes returns all benefit types', () => {
  const types = getAppealTypes();
  assert.equal(types.length, 3);
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('pip'));
  assert.ok(ids.includes('uc'));
  assert.ok(ids.includes('esa'));
});

test('getMandatoryReconsiderationDeadline returns 1 month for PIP', () => {
  const deadline = getMandatoryReconsiderationDeadline('pip');
  assert.ok(deadline);
  assert.equal(deadline.months, 1);
});

test('getMandatoryReconsiderationDeadline returns 1 month for UC', () => {
  const deadline = getMandatoryReconsiderationDeadline('uc');
  assert.ok(deadline);
  assert.equal(deadline.months, 1);
});

test('getMandatoryReconsiderationDeadline returns null for unknown', () => {
  assert.equal(getMandatoryReconsiderationDeadline('unknown'), null);
});

test('getTribunalDeadline returns 1 month for PIP', () => {
  const deadline = getTribunalDeadline('pip');
  assert.ok(deadline);
  assert.equal(deadline.months, 1);
});

test('getTribunalDeadline returns null for unknown', () => {
  assert.equal(getTribunalDeadline('unknown'), null);
});

test('getDescriptorGuidance returns PIP descriptors', () => {
  const descriptors = getDescriptorGuidance('pip');
  assert.ok(descriptors.length > 0);
  const categories = descriptors.map((d) => d.category);
  assert.ok(categories.includes('daily_living'));
  assert.ok(categories.includes('mobility'));
});

test('getDescriptorGuidance returns ESA descriptors', () => {
  const descriptors = getDescriptorGuidance('esa');
  assert.ok(descriptors.length > 0);
  const categories = descriptors.map((d) => d.category);
  assert.ok(categories.includes('coping_with_physical_demands'));
});

test('getDescriptorGuidance returns empty for unknown', () => {
  assert.deepEqual(getDescriptorGuidance('unknown'), []);
});

test('generateLetterPreview returns MR text for mr_draft status', () => {
  const appeal = createAppeal({
    benefitType: 'pip',
    decisionDate: '2026-05-01',
    nationalInsurance: 'AB 12 34 56 C',
    grounds: 'I disagree with the decision.',
    status: 'mr_draft'
  });
  const text = generateLetterPreview(appeal);
  assert.match(text, /Mandatory Reconsideration/);
  assert.match(text, /PIP/);
  assert.match(text, /AB 12 34 56 C/);
  assert.match(text, /I disagree with the decision/);
});

test('generateLetterPreview returns SSCS1 text for mr_refused status', () => {
  const appeal = createAppeal({
    benefitType: 'esa',
    decisionDate: '2026-04-01',
    mrDecisionDate: '2026-05-15',
    nationalInsurance: 'CD 98 76 54 B',
    grounds: 'The decision was wrong.',
    status: 'mr_refused'
  });
  const text = generateLetterPreview(appeal);
  assert.match(text, /SSCS1/);
  assert.match(text, /ESA/);
  assert.match(text, /CD 98 76 54 B/);
  assert.match(text, /The decision was wrong/);
});

test('generateLetterPreview formats dates in long format', () => {
  const appeal = createAppeal({
    benefitType: 'pip',
    decisionDate: '2026-05-01',
    nationalInsurance: 'AB 12 34 56 C',
    grounds: 'Test',
    status: 'mr_draft'
  });
  const text = generateLetterPreview(appeal);
  assert.match(text, /1 May 2026/);
});

test('generateLetterPreview handles missing dates gracefully', () => {
  const appeal = createAppeal({
    benefitType: 'pip',
    grounds: 'Test',
    status: 'mr_draft'
  });
  const text = generateLetterPreview(appeal);
  assert.match(text, /Mandatory Reconsideration/);
  assert.match(text, /Date of decision: /);
});
