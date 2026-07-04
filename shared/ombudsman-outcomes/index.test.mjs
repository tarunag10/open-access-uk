import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getUnsourcedStatsNotice,
  getTypicalOutcomes,
  getCompensationRanges,
  getDecisionTimescales,
  findOmbudsmanForIssue,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes
} from './index.mjs';

test('getOmbudsmen returns all 11 ombudsmen', () => {
  const list = getOmbudsmen();
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 11);
  const ids = list.map((o) => o.id);
  assert.ok(ids.includes('PHSO'));
  assert.ok(ids.includes('housing'));
});

test('getOmbudsmen each entry has required fields', () => {
  const list = getOmbudsmen();
  for (const o of list) {
    assert.ok(o.id);
    assert.ok(o.name);
    assert.ok(Array.isArray(o.sectors));
    assert.ok(o.source);
    assert.ok(o.website);
  }
});

test('getOmbudsmanDetails returns full details for PHSO', () => {
  const d = getOmbudsmanDetails('PHSO');
  assert.ok(d);
  assert.equal(d.name, 'Parliamentary and Health Service Ombudsman');
  assert.ok(d.sectors.includes('NHS'));
});

test('getOmbudsmanDetails returns null for unknown', () => {
  assert.equal(getOmbudsmanDetails('unknown'), null);
});

test('getOutcomeStatistics returns null when SHOW_UNSOURCED_STATS is false', () => {
  const stats = getOutcomeStatistics('PHSO');
  assert.equal(stats, null);
});

test('getUnsourcedStatsNotice returns a notice string', () => {
  const notice = getUnsourcedStatsNotice();
  assert.ok(typeof notice === 'string');
  assert.ok(notice.length > 20);
  assert.ok(notice.includes('re-sourced'));
});

test('getTypicalOutcomes returns empty array', () => {
  assert.deepEqual(getTypicalOutcomes('financial', 'complaint-handling'), []);
});

test('getCompensationRanges returns ranges for PHSO', () => {
  const r = getCompensationRanges('PHSO');
  assert.ok(r);
  assert.equal(r.typical, '£500–£5,000');
  assert.ok(r.max);
  assert.ok(r.note);
});

test('getCompensationRanges returns default for unknown', () => {
  const r = getCompensationRanges('unknown');
  assert.equal(r.typical, 'Varies');
});

test('getDecisionTimescales returns timescales for housing', () => {
  const t = getDecisionTimescales('housing');
  assert.ok(t.initialResponse);
  assert.ok(t.fullInvestigation);
});

test('getDecisionTimescales returns default for unknown', () => {
  const t = getDecisionTimescales('unknown');
  assert.equal(t.initialResponse, 'Varies');
});

test('findOmbudsmanForIssue routes NHS to PHSO', () => {
  assert.equal(findOmbudsmanForIssue('nhs complaint'), 'PHSO');
});

test('findOmbudsmanForIssue routes housing to housing', () => {
  assert.equal(findOmbudsmanForIssue('housing repair'), 'housing');
});

test('findOmbudsmanForIssue routes banking to financial', () => {
  assert.equal(findOmbudsmanForIssue('bank account'), 'financial');
});

test('findOmbudsmanForIssue returns null for unknown', () => {
  assert.equal(findOmbudsmanForIssue('unrelated issue'), null);
});

test('serializeOmbudsmanOutcomes and parseOmbudsmanOutcomes roundtrip', () => {
  const data = { id: 'PHSO', records: [] };
  const roundtripped = parseOmbudsmanOutcomes(serializeOmbudsmanOutcomes(data));
  assert.deepEqual(roundtripped, data);
});

test('parseOmbudsmanOutcomes returns empty array for invalid', () => {
  assert.deepEqual(parseOmbudsmanOutcomes('not-json'), []);
});
