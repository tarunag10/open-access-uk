import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAppealTypes,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline,
  generateMRText,
  generateSSCS1Text,
  getDescriptorGuidance,
  serializeAppeals,
  parseAppeals
} from './index.mjs';

test('getAppealTypes returns UC, PIP, ESA', () => {
  const types = getAppealTypes();
  assert.equal(types.length, 3);
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('uc'));
  assert.ok(ids.includes('pip'));
  assert.ok(ids.includes('esa'));
});

test('getMandatoryReconsiderationDeadline for UC returns 1 month', () => {
  const dl = getMandatoryReconsiderationDeadline('uc');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getMandatoryReconsiderationDeadline for PIP returns 1 month', () => {
  const dl = getMandatoryReconsiderationDeadline('pip');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getMandatoryReconsiderationDeadline for ESA returns 1 month', () => {
  const dl = getMandatoryReconsiderationDeadline('esa');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getMandatoryReconsiderationDeadline for unknown benefit returns null', () => {
  const dl = getMandatoryReconsiderationDeadline('unknown');
  assert.equal(dl, null);
});

test('getTribunalDeadline for UC returns 1 month', () => {
  const dl = getTribunalDeadline('uc');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getTribunalDeadline for PIP returns 1 month', () => {
  const dl = getTribunalDeadline('pip');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getTribunalDeadline for ESA returns 1 month', () => {
  const dl = getTribunalDeadline('esa');
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('govuk'));
});

test('getTribunalDeadline for unknown benefit returns null', () => {
  const dl = getTribunalDeadline('unknown');
  assert.equal(dl, null);
});

test('generateMRText includes all required fields', () => {
  const data = {
    benefitType: 'pip',
    decisionDate: '2026-01-15',
    nationalInsurance: 'AB123456C',
    grounds: 'I disagree with the decision because the descriptor scores are wrong.'
  };
  const text = generateMRText(data);
  assert.ok(text.includes('Mandatory Reconsideration'));
  assert.ok(text.includes('PIP'));
  assert.ok(text.includes('15 January 2026'));
  assert.ok(text.includes('AB123456C'));
  assert.ok(text.includes('disagree with the decision'));
});

test('generateMRText for UC includes correct benefit name', () => {
  const data = {
    benefitType: 'uc',
    decisionDate: '2026-03-10',
    nationalInsurance: 'XY987654D',
    grounds: 'Income calculated incorrectly.'
  };
  const text = generateMRText(data);
  assert.ok(text.includes('Universal Credit'));
  assert.ok(text.includes('10 March 2026'));
  assert.ok(text.includes('XY987654D'));
  assert.ok(text.includes('Income calculated incorrectly'));
});

test('generateSSCS1Text includes tribunal appeal content', () => {
  const data = {
    benefitType: 'esa',
    decisionDate: '2026-02-20',
    mrDecisionDate: '2026-03-15',
    nationalInsurance: 'CD112233E',
    grounds: 'The work capability assessment was not conducted properly.'
  };
  const text = generateSSCS1Text(data);
  assert.ok(text.includes('SSCS1'));
  assert.ok(text.includes('Employment and Support Allowance'));
  assert.ok(text.includes('20 February 2026'));
  assert.ok(text.includes('15 March 2026'));
  assert.ok(text.includes('CD112233E'));
  assert.ok(text.includes('work capability assessment'));
});

test('getDescriptorGuidance for PIP returns descriptor categories', () => {
  const guidance = getDescriptorGuidance('pip');
  assert.ok(Array.isArray(guidance));
  assert.ok(guidance.length > 0);
  const categories = guidance.map((g) => g.category);
  assert.ok(categories.includes('daily_living'));
  assert.ok(categories.includes('mobility'));
});

test('getDescriptorGuidance for ESA returns descriptor categories', () => {
  const guidance = getDescriptorGuidance('esa');
  assert.ok(Array.isArray(guidance));
  assert.ok(guidance.length > 0);
  const categories = guidance.map((g) => g.category);
  assert.ok(categories.includes('coping_with_physical_demands'));
  assert.ok(categories.includes('coping_with_social_demands'));
});

test('getDescriptorGuidance for UC returns empty array', () => {
  const guidance = getDescriptorGuidance('uc');
  assert.deepEqual(guidance, []);
});

test('getDescriptorGuidance for unknown benefit returns empty array', () => {
  const guidance = getDescriptorGuidance('unknown');
  assert.deepEqual(guidance, []);
});

test('serializeAppeals and parseAppeals round-trip', () => {
  const appeals = {
    'My UC case': [
      { type: 'uc', decisionDate: '2026-01-15', status: 'mr_submitted' },
      { type: 'pip', decisionDate: '2026-02-20', status: 'tribunal_pending' }
    ]
  };
  const serialized = serializeAppeals(appeals);
  const parsed = parseAppeals(serialized);
  assert.deepEqual(parsed, appeals);
});

test('parseAppeals returns empty object for garbage', () => {
  assert.deepEqual(parseAppeals('not json'), {});
  assert.deepEqual(parseAppeals(null), {});
  assert.deepEqual(parseAppeals(undefined), {});
});

test('parseAppeals rejects non-object values', () => {
  assert.deepEqual(parseAppeals('"string"'), {});
  assert.deepEqual(parseAppeals('[1,2,3]'), {});
});

test('parseAppeals filters non-array values within state', () => {
  const input = { a: 'notarray', b: ['valid'] };
  const parsed = parseAppeals(JSON.stringify(input));
  assert.deepEqual(parsed, { b: ['valid'] });
});
