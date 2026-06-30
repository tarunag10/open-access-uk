import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFeeCategories,
  getFeeSchedules,
  calculateFee,
  getHelpWithFeesEligibility,
  getExemptions,
  generateFeeEstimate,
  getFeeRemissionForm,
  serializeFeesCalculator,
  parseFeesCalculator
} from './index.mjs';

test('getFeeCategories returns all categories', () => {
  const cats = getFeeCategories();
  assert.ok(Array.isArray(cats));
  assert.deepEqual(cats, [
    'county-court',
    'employment-tribunal',
    'family-court',
    'immigration-tribunal',
    'property-tribunal'
  ]);
});

test('getFeeSchedules returns fees for known category', () => {
  const fees = getFeeSchedules('county-court');
  assert.ok(Array.isArray(fees));
  assert.ok(fees.length > 0);
  assert.ok(typeof fees[0].fee === 'number');
  assert.ok(typeof fees[0].claimRange === 'string');
});

test('getFeeSchedules returns empty array for unknown category', () => {
  assert.deepEqual(getFeeSchedules('nonexistent'), []);
});

test('calculateFee returns correct fee for claim amount', () => {
  assert.equal(calculateFee('county-court', 200), 35);
  assert.equal(calculateFee('county-court', 500), 80);
  assert.equal(calculateFee('county-court', 3000), 115);
  assert.equal(calculateFee('county-court', 7500), 205);
  assert.equal(calculateFee('county-court', 25000), 455);
  assert.equal(calculateFee('county-court', 75000), 10000);
});

test('calculateFee returns 0 for employment tribunal (no fee)', () => {
  assert.equal(calculateFee('employment-tribunal', 5000), 0);
});

test('calculateFee returns null for unknown category', () => {
  assert.equal(calculateFee('unknown', 100), null);
});

test('calculateFee returns null for negative amount', () => {
  assert.equal(calculateFee('county-court', -50), null);
});

test('getHelpWithFeesEligibility returns eligible for low income', () => {
  const result = getHelpWithFeesEligibility(1000, 500, false);
  assert.equal(result.eligible, true);
  assert.ok(typeof result.reason === 'string');
});

test('getHelpWithFeesEligibility returns ineligible for high income', () => {
  const result = getHelpWithFeesEligibility(50000, 10000, false);
  assert.equal(result.eligible, false);
});

test('getHelpWithFeesEligibility returns eligible if receiving benefits', () => {
  const result = getHelpWithFeesEligibility(30000, 10000, true);
  assert.equal(result.eligible, true);
});

test('getExemptions returns exemption categories', () => {
  const exemptions = getExemptions();
  assert.ok(Array.isArray(exemptions));
  assert.ok(exemptions.includes('domestic-violence'));
  assert.ok(exemptions.includes('asylum'));
  assert.ok(exemptions.includes('benefits'));
  assert.ok(exemptions.includes('low-income'));
});

test('generateFeeEstimate returns detailed breakdown', () => {
  const estimate = generateFeeEstimate('county-court', 5000, { hearing: true });
  assert.ok(typeof estimate === 'object');
  assert.ok(typeof estimate.category === 'string');
  assert.ok(typeof estimate.claimAmount === 'number');
  assert.ok(typeof estimate.totalFee === 'number');
  assert.ok(Array.isArray(estimate.items));
  assert.ok(estimate.items.length > 0);
  assert.ok(typeof estimate.items[0].description === 'string');
  assert.ok(typeof estimate.items[0].amount === 'number');
});

test('getFeeRemissionForm returns EX160', () => {
  const form = getFeeRemissionForm();
  assert.equal(form.reference, 'EX160');
  assert.ok(typeof form.name === 'string');
});

test('serializeFeesCalculator and parseFeesCalculator roundtrip', () => {
  const data = { category: 'county-court', amount: 5000 };
  const serialized = serializeFeesCalculator(data);
  assert.equal(typeof serialized, 'string');
  const parsed = parseFeesCalculator(serialized);
  assert.deepEqual(parsed, data);
});

test('parseFeesCalculator returns null for invalid input', () => {
  assert.equal(parseFeesCalculator('not-json'), null);
});
