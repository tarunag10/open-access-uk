import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_LABELS,
  formatCurrency,
  escapeHtml,
  renderFeeResult,
  renderCalcCard,
  renderCalcList,
  getFeeCategories,
  getFeeSchedules,
  calculateFee,
  getHelpWithFeesEligibility,
  getExemptions,
  generateFeeEstimate,
  getFeeRemissionForm,
  serializeFeesCalculator,
  parseFeesCalculator
} from '../src/tracker.js';

test('CATEGORY_LABELS maps all categories', () => {
  assert.equal(CATEGORY_LABELS['county-court'], 'County Court');
  assert.equal(CATEGORY_LABELS['employment-tribunal'], 'Employment Tribunal');
  assert.equal(CATEGORY_LABELS['family-court'], 'Family Court');
  assert.equal(CATEGORY_LABELS['immigration-tribunal'], 'Immigration Tribunal');
  assert.equal(CATEGORY_LABELS['property-tribunal'], 'Property Tribunal');
});

test('formatCurrency formats as GBP', () => {
  assert.equal(formatCurrency(500), '£500.00');
  assert.equal(formatCurrency(1234.5), '£1,234.50');
  assert.equal(formatCurrency(0), '£0.00');
});

test('escapeHtml escapes special characters', () => {
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
  assert.equal(escapeHtml('x"y'), 'x&quot;y');
});

test('getFeeCategories returns all categories', () => {
  const cats = getFeeCategories();
  assert.ok(Array.isArray(cats));
  assert.equal(cats.length, 5);
  assert.ok(cats.includes('county-court'));
  assert.ok(cats.includes('employment-tribunal'));
});

test('getFeeSchedules returns fees for known category', () => {
  const fees = getFeeSchedules('county-court');
  assert.ok(Array.isArray(fees));
  assert.ok(fees.length > 0);
});

test('getFeeSchedules returns empty array for unknown category', () => {
  assert.deepEqual(getFeeSchedules('nonexistent'), []);
});

test('calculateFee returns correct fee for county court', () => {
  assert.equal(calculateFee('county-court', 200), 35);
  assert.equal(calculateFee('county-court', 500), 80);
  assert.equal(calculateFee('county-court', 3000), 115);
  assert.equal(calculateFee('county-court', 7500), 205);
  assert.equal(calculateFee('county-court', 25000), 455);
  assert.equal(calculateFee('county-court', 75000), 10000);
});

test('calculateFee returns 0 for employment tribunal', () => {
  assert.equal(calculateFee('employment-tribunal', 5000), 0);
});

test('calculateFee returns 0 for property tribunal', () => {
  assert.equal(calculateFee('property-tribunal', 50000), 0);
});

test('calculateFee returns 335 for family court', () => {
  assert.equal(calculateFee('family-court', 500), 335);
  assert.equal(calculateFee('family-court', 25000), 335);
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
  const estimate = generateFeeEstimate('county-court', 5000);
  assert.equal(typeof estimate.category, 'string');
  assert.equal(typeof estimate.claimAmount, 'number');
  assert.equal(typeof estimate.totalFee, 'number');
  assert.ok(Array.isArray(estimate.items));
  assert.ok(estimate.items.length > 0);
  assert.equal(estimate.items[0].amount, 115);
});

test('generateFeeEstimate with hearing extra', () => {
  const estimate = generateFeeEstimate('county-court', 5000, { hearing: true });
  assert.equal(estimate.items.length, 2);
  assert.equal(estimate.totalFee, 165);
});

test('getFeeRemissionForm returns EX160', () => {
  const form = getFeeRemissionForm();
  assert.equal(form.reference, 'EX160');
  assert.equal(typeof form.name, 'string');
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

test('renderFeeResult returns HTML with fee total', () => {
  const estimate = generateFeeEstimate('county-court', 2000);
  const html = renderFeeResult(estimate, null);
  assert.match(html, /£115\.00/);
  assert.match(html, /fee-total/);
  assert.match(html, /County Court/);
});

test('renderFeeResult shows Help with Fees when eligible', () => {
  const estimate = generateFeeEstimate('county-court', 2000);
  const eligibility = { eligible: true, reason: 'Low income' };
  const html = renderFeeResult(estimate, eligibility);
  assert.match(html, /Likely eligible/);
  assert.match(html, /EX160/);
});

test('renderFeeResult shows ineligible when not eligible', () => {
  const estimate = generateFeeEstimate('county-court', 2000);
  const eligibility = { eligible: false, reason: 'Too high' };
  const html = renderFeeResult(estimate, eligibility);
  assert.match(html, /Not eligible/);
});

test('renderCalcCard returns HTML with key elements', () => {
  const calc = {
    id: 'fee-001',
    category: 'county-court',
    claimAmount: 5000,
    totalFee: 115,
    createdAt: '2026-06-30'
  };
  const html = renderCalcCard(calc);
  assert.match(html, /County Court/);
  assert.match(html, /£115\.00/);
  assert.match(html, /£5,000\.00/);
  assert.match(html, /data-action="recalc"/);
  assert.match(html, /data-action="delete"/);
});
