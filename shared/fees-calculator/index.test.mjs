import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFee, getHelpWithFeesEligibility } from './index.mjs';

test('money claim fee bands and percentage', () => {
  for (const [amount, fee] of [
    [300, 35],
    [300.01, 50],
    [500, 50],
    [500.01, 70],
    [1000, 70],
    [1000.01, 80],
    [1500, 80],
    [1500.01, 115],
    [3000, 115],
    [3000.01, 205],
    [5000, 205],
    [5000.01, 455],
    [10000, 455],
    [10000.01, 500],
    [25000, 1250],
    [75000, 3750],
    [200000, 10000],
    [200000.01, 10000]
  ])
    assert.equal(calculateFee('county-court', amount), fee);
});
test('missing and invalid amounts do not produce a fee', () => {
  for (const amount of ['', null, undefined, -1, Infinity, 'abc'])
    assert.equal(calculateFee('county-court', amount), null);
});
test('other proceedings require an identified application', () => {
  assert.equal(calculateFee('family-court', 5000), null);
  assert.equal(calculateFee('immigration-tribunal', 5000), null);
  assert.equal(calculateFee('property-tribunal', 5000), null);
});
test('Help with Fees cannot be decided from incomplete circumstances', () => {
  assert.equal(getHelpWithFeesEligibility('', '', true).eligible, null);
});

test('selected application and hearing fees are specific to proceedings', async () => {
  const { calculateSelection } = await import('./index.mjs');
  assert.equal(calculateSelection('county-court', 'possession').total, 415);
  assert.equal(calculateSelection('county-court', 'n244-notice').total, 321);
  assert.equal(calculateSelection('county-court', 'n244-consent').total, 126);
  assert.equal(calculateSelection('county-court', 'small-hearing', 300.01).total, 59);
  assert.equal(calculateSelection('county-court', 'warrant-control').total, 96);
  assert.equal(calculateSelection('family-court', 'divorce').total, 628);
  assert.equal(calculateSelection('family-court', 'non-molestation').total, 0);
  assert.equal(calculateSelection('immigration-tribunal', 'paper').total, 82);
  assert.equal(calculateSelection('immigration-tribunal', 'hearing').total, 144);
  assert.equal(calculateSelection('property-tribunal', 'service-charge', '', true).total, 341);
  assert.equal(calculateSelection('property-tribunal', 'pitch', '', true).total, 23);
  assert.equal(calculateSelection('county-court', 'money', ''), null);
});
test('percentage fee rounds down to the penny', () => {
  assert.equal(calculateFee('county-court', 10000.19), 500.0);
  assert.equal(calculateFee('county-court', 10000.39), 500.01);
});
