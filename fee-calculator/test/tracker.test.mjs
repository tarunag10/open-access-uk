import test from 'node:test';
import assert from 'node:assert/strict';
import { OPTIONS, calculateSelection } from '../src/tracker.js';

test('application choices cover each supported court and tribunal', () => {
  assert.deepEqual(
    Object.keys(OPTIONS).sort(),
    [
      'county-court',
      'employment-tribunal',
      'family-court',
      'immigration-tribunal',
      'property-tribunal'
    ].sort()
  );
  for (const choices of Object.values(OPTIONS)) assert.ok(choices.length);
});
test('rejects missing and unsupported selections', () => {
  assert.equal(calculateSelection('county-court', '', 5000), null);
  assert.equal(calculateSelection('family-court', 'money', 5000), null);
  assert.equal(calculateSelection('county-court', 'money', ''), null);
});
test('fee-free applications and property hearing fees remain distinct', () => {
  assert.equal(calculateSelection('family-court', 'occupation').total, 0);
  assert.equal(calculateSelection('property-tribunal', 'service-charge', '', false).total, 114);
  assert.equal(calculateSelection('property-tribunal', 'service-charge', '', true).total, 341);
});
