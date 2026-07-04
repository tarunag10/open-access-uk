import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getTypicalOutcomes,
  getCompensationRanges,
  getDecisionTimescales,
  getUnsourcedStatsNotice,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes,
  formatCurrency,
  formatNumber,
  renderOmbudsmanSummary,
  renderOutcomeResults,
  escapeHtml
} from '../src/tracker.js';

test('getOmbudsmen returns list of all 11 ombudsmen', () => {
  const list = getOmbudsmen();
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 11);
  const ids = list.map((o) => o.id);
  assert.ok(ids.includes('PHSO'));
  assert.ok(ids.includes('housing'));
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

test('getOutcomeStatistics returns null (stats hidden behind flag)', () => {
  assert.equal(getOutcomeStatistics('financial'), null);
});

test('getUnsourcedStatsNotice returns a notice string', () => {
  const n = getUnsourcedStatsNotice();
  assert.ok(typeof n === 'string');
  assert.ok(n.length > 10);
});

test('getTypicalOutcomes returns empty array', () => {
  assert.deepEqual(getTypicalOutcomes('financial', 'complaint-handling'), []);
});

test('getCompensationRanges returns ranges for PHSO', () => {
  const r = getCompensationRanges('PHSO');
  assert.ok(r);
  assert.ok(r.typical);
  assert.ok(r.max);
});

test('getCompensationRanges returns default for unknown', () => {
  const r = getCompensationRanges('unknown');
  assert.equal(r.typical, 'Varies');
});

test('getDecisionTimescales returns timescales for PHSO', () => {
  const t = getDecisionTimescales('PHSO');
  assert.ok(t.initialResponse);
  assert.ok(t.fullInvestigation);
});

test('getDecisionTimescales returns default for unknown', () => {
  const t = getDecisionTimescales('unknown');
  assert.equal(t.initialResponse, 'Varies');
});

test('serializeOmbudsmanOutcomes and parseOmbudsmanOutcomes roundtrip', () => {
  const data = { test: 'value' };
  const result = parseOmbudsmanOutcomes(serializeOmbudsmanOutcomes(data));
  assert.deepEqual(result, data);
});

test('parseOmbudsmanOutcomes returns [] for invalid', () => {
  assert.deepEqual(parseOmbudsmanOutcomes('not-json'), []);
});

test('formatCurrency formats GBP', () => {
  const r = formatCurrency(1500);
  assert.ok(typeof r === 'string');
});

test('formatNumber formats numbers', () => {
  const r = formatNumber(420000);
  assert.ok(typeof r === 'string');
});

test('renderOmbudsmanSummary returns string for PHSO', () => {
  const s = renderOmbudsmanSummary('PHSO');
  assert.ok(typeof s === 'string');
  assert.ok(s.length > 0);
  assert.ok(s.includes('Parliamentary'));
});

test('renderOmbudsmanSummary returns empty for unknown', () => {
  assert.equal(renderOmbudsmanSummary('unknown'), '');
});

test('renderOutcomeResults returns HTML string', () => {
  const html = renderOutcomeResults('PHSO', 'complaint-handling');
  assert.ok(typeof html === 'string');
  assert.ok(html.length > 0);
  assert.ok(html.includes('PHSO') || html.includes('Parliamentary'));
});

test('renderOutcomeResults returns empty for unknown', () => {
  assert.equal(renderOutcomeResults('unknown', 'complaint-handling'), '');
});

test('escapeHtml escapes special characters', () => {
  const r = escapeHtml('<script>alert("xss")</script>');
  assert.ok(!r.includes('<script>'));
  assert.ok(r.includes('&lt;'));
});
