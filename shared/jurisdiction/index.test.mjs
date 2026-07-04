import test from 'node:test';
import assert from 'node:assert/strict';
import { getToolJurisdiction, nationToJurisdiction, getNations } from './index.mjs';

test('getToolJurisdiction returns England for eviction tool', () => {
  const j = getToolJurisdiction('eviction-notice-validator');
  assert.equal(j.jurisdiction, 'england');
  assert.ok(j.label.includes('England'));
  assert.ok(j.note);
});

test('getToolJurisdiction returns UK-wide as default', () => {
  const j = getToolJurisdiction('unknown-tool');
  assert.equal(j.jurisdiction, 'uk');
  assert.equal(j.label, 'UK-wide');
});

test('getToolJurisdiction returns correct jurisdiction for employment tribunal', () => {
  const j = getToolJurisdiction('employment-tribunal');
  assert.equal(j.jurisdiction, 'england-wales-scotland');
  assert.equal(j.label, 'Great Britain');
});

test('getToolJurisdiction returns England for NHS complaints', () => {
  const j = getToolJurisdiction('nhs-complaints-tracker');
  assert.equal(j.jurisdiction, 'england');
  assert.ok(j.note.includes('SPSO'));
});

test('nationToJurisdiction maps correctly', () => {
  assert.equal(nationToJurisdiction('england'), 'england');
  assert.equal(nationToJurisdiction('Scotland'), 'scotland');
  assert.equal(nationToJurisdiction('unknown'), 'uk');
});

test('getNations returns 4 nations', () => {
  const nations = getNations();
  assert.equal(nations.length, 4);
  assert.ok(nations.find((n) => n.id === 'wales'));
});
