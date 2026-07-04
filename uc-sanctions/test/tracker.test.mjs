import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSanctionTypes,
  getSanctionDeductionRates,
  getMandatoryReconsiderationDeadline,
  getTribunalDeadline,
  generateMRText,
  getGoodReasonsLibrary,
  getHardshipPaymentEligibility,
  generateHardshipPaymentRequest,
  serializeUCSanctions,
  parseUCSanctions,
  createChallengeRecord,
  renderChallengeCard,
  renderChallenges
} from '../src/tracker.js';

test('getSanctionTypes returns higher-level, medium-level, standard, lower-level', () => {
  const types = getSanctionTypes();
  assert.equal(types.length, 4);
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('higher-level'));
  assert.ok(ids.includes('standard'));
  assert.ok(ids.includes('lower-level'));
});

test('getSanctionDeductionRates higher-level: 100% standard allowance (max 26 weeks)', () => {
  const rate = getSanctionDeductionRates('higher-level');
  assert.equal(rate.deductionRate, 1.0);
  assert.equal(rate.maxWeeks, 26);
  assert.equal(rate.name, 'Higher-Level Sanction');
});

test('getSanctionDeductionRates standard: 20% (up to 4 weeks)', () => {
  const rate = getSanctionDeductionRates('standard');
  assert.equal(rate.deductionRate, 0.2);
  assert.equal(rate.maxWeeks, 4);
  assert.equal(rate.name, 'Standard Sanction');
});

test('getSanctionDeductionRates lower-level: none (reduced by amount)', () => {
  const rate = getSanctionDeductionRates('lower-level');
  assert.equal(rate.deductionRate, 0);
  assert.equal(rate.deductionAmount, 'equivalent-to-missed-appointment');
  assert.equal(rate.name, 'Lower-Level Sanction');
});

test('getSanctionDeductionRates unknown returns null', () => {
  assert.equal(getSanctionDeductionRates('unknown'), null);
});

test('getMandatoryReconsiderationDeadline returns 1 month from decision', () => {
  const dl = getMandatoryReconsiderationDeadline();
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('welfare-reform-act'));
});

test('getTribunalDeadline returns 1 month from MR decision', () => {
  const dl = getTribunalDeadline();
  assert.equal(dl.months, 1);
  assert.ok(dl.source.includes('welfare-reform-act'));
});

test('generateMRText includes all required fields', () => {
  const data = {
    claimantName: 'Jane Doe',
    sanctionType: 'standard',
    decisionDate: '2026-03-10',
    reasonForSanction: 'Failed to attend job centre appointment',
    groundsForChallenge: 'The appointment was rescheduled without my knowledge',
    goodReasons: 'I was in hospital on the day of the appointment'
  };
  const text = generateMRText(data);
  assert.ok(text.includes('Mandatory Reconsideration'));
  assert.ok(text.includes('Jane Doe'));
  assert.ok(text.includes('Standard Sanction'));
  assert.ok(text.includes('10 March 2026'));
  assert.ok(text.includes('Failed to attend job centre appointment'));
  assert.ok(text.includes('The appointment was rescheduled'));
  assert.ok(text.includes('hospital'));
});

test('generateMRText without optional fields still produces valid text', () => {
  const data = {
    claimantName: 'John Smith',
    sanctionType: 'higher-level',
    decisionDate: '2026-01-15',
    reasonForSanction: 'Not taking steps to seek work',
    groundsForChallenge: 'I was actively seeking work',
    goodReasons: ''
  };
  const text = generateMRText(data);
  assert.ok(text.includes('John Smith'));
  assert.ok(text.includes('Higher-Level Sanction'));
  assert.ok(text.includes('15 January 2026'));
});

test('getGoodReasonsLibrary returns array of common good reasons', () => {
  const reasons = getGoodReasonsLibrary();
  assert.ok(Array.isArray(reasons));
  assert.ok(reasons.length >= 5);
  const ids = reasons.map((r) => r.id);
  assert.ok(ids.includes('hospital-appointment'));
  assert.ok(ids.includes('caring-responsibility'));
  assert.ok(ids.includes('interview-running-late'));
  assert.ok(ids.includes('transport-failure'));
  assert.ok(ids.includes('mental-health-episode'));
});

test('getHardshipPaymentEligibility checks UC claimant, sanction in force, cannot meet basic needs', () => {
  const eligible = getHardshipPaymentEligibility({
    isUCClaimant: true,
    sanctionInForce: true,
    cannotMeetBasicNeeds: true
  });
  assert.equal(eligible.eligible, true);
});

test('getHardshipPaymentEligibility rejects non-UC claimant', () => {
  const result = getHardshipPaymentEligibility({
    isUCClaimant: false,
    sanctionInForce: true,
    cannotMeetBasicNeeds: true
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reason.includes('Universal Credit'));
});

test('getHardshipPaymentEligibility rejects no sanction in force', () => {
  const result = getHardshipPaymentEligibility({
    isUCClaimant: true,
    sanctionInForce: false,
    cannotMeetBasicNeeds: true
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reason.includes('sanction'));
});

test('getHardshipPaymentEligibility rejects can meet basic needs', () => {
  const result = getHardshipPaymentEligibility({
    isUCClaimant: true,
    sanctionInForce: true,
    cannotMeetBasicNeeds: false
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reason.includes('basic needs'));
});

test('generateHardshipPaymentRequest produces request text', () => {
  const data = {
    claimantName: 'Jane Doe',
    sanctionType: 'standard',
    decisionDate: '2026-04-01',
    reasonForHardship: 'Cannot afford food or rent due to sanction deduction'
  };
  const text = generateHardshipPaymentRequest(data);
  assert.ok(text.includes('Hardship Payment'));
  assert.ok(text.includes('Jane Doe'));
  assert.ok(text.includes('Standard Sanction'));
  assert.ok(text.includes('1 April 2026'));
  assert.ok(text.includes('Cannot afford food'));
});

test('serializeUCSanctions and parseUCSanctions round-trip', () => {
  const data = {
    'My Sanction Case': [{ type: 'standard', decisionDate: '2026-01-15', status: 'mr_submitted' }]
  };
  const serialized = serializeUCSanctions(data);
  const parsed = parseUCSanctions(serialized);
  assert.deepEqual(parsed, data);
});

test('parseUCSanctions returns empty object for garbage', () => {
  assert.deepEqual(parseUCSanctions('not json'), {});
  assert.deepEqual(parseUCSanctions(null), {});
  assert.deepEqual(parseUCSanctions(undefined), {});
});

test('parseUCSanctions rejects non-object values', () => {
  assert.deepEqual(parseUCSanctions('"string"'), {});
  assert.deepEqual(parseUCSanctions('[1,2,3]'), {});
});

test('parseUCSanctions filters non-array values within state', () => {
  const input = { a: 'notarray', b: ['valid'] };
  const parsed = parseUCSanctions(JSON.stringify(input));
  assert.deepEqual(parsed, { b: ['valid'] });
});

test('createChallengeRecord produces valid record with defaults', () => {
  const c = createChallengeRecord({ claimantName: 'Test Claimant' });
  assert.equal(c.claimantName, 'Test Claimant');
  assert.equal(c.sanctionType, 'standard');
  assert.equal(c.status, 'draft');
  assert.ok(c.id.startsWith('uc-'));
  assert.ok(c.createdAt);
});

test('createChallengeRecord throws on missing claimantName', () => {
  assert.throws(() => createChallengeRecord({}), /claimantName is required/);
});

test('createChallengeRecord throws on invalid sanction type', () => {
  assert.throws(
    () => createChallengeRecord({ claimantName: 'Test', sanctionType: 'invalid' }),
    /Invalid sanction type/
  );
});

test('renderChallengeCard returns HTML string with key elements', () => {
  const c = createChallengeRecord({
    claimantName: 'Test Claimant',
    sanctionType: 'higher-level',
    decisionDate: '2026-06-01',
    reasonForSanction: 'Failed to attend interview'
  });
  const html = renderChallengeCard(c);
  assert.match(html, /Test Claimant/);
  assert.match(html, /Failed to attend interview/);
  assert.match(html, /2026-06-01/);
  assert.match(html, /Higher-Level Sanction/);
  assert.match(html, /data-action="view"/);
  assert.match(html, /data-action="delete"/);
});

test('renderChallenges is a no-op without document (Node environment)', () => {
  const container = { replaceChildren: () => {} };
  renderChallenges([], container);
  assert.ok(true, 'did not throw');
});

test('renderChallenges is a no-op for non-empty list without document', () => {
  const challenges = [
    createChallengeRecord({ claimantName: 'First', createdAt: '2026-01-01T00:00:00.000Z' }),
    createChallengeRecord({ claimantName: 'Second', createdAt: '2026-06-01T00:00:00.000Z' })
  ];
  const container = { replaceChildren: () => {} };
  renderChallenges(challenges, container);
  assert.ok(true, 'did not throw');
});
