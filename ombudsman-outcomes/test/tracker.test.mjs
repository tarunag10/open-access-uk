import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOmbudsmen,
  getOmbudsmanDetails,
  getOutcomeStatistics,
  getTypicalOutcomes,
  getCompensationRanges,
  getDecisionTimescales,
  serializeOmbudsmanOutcomes,
  parseOmbudsmanOutcomes,
  getAvailableIssueTypes,
  formatCurrency,
  formatNumber,
  renderOmbudsmanSummary,
  renderOutcomeResults,
  escapeHtml
} from '../src/tracker.js';

test('getOmbudsmen returns list of all ombudsman IDs', () => {
  const ids = getOmbudsmen();
  assert.ok(Array.isArray(ids));
  assert.ok(ids.length >= 11);
  for (const id of ['PHSO', 'housing', 'financial', 'rail', 'legal', 'local-government', 'water', 'energy', 'telecoms', 'police', 'immigration']) {
    assert.ok(ids.includes(id), `missing ombudsman: ${id}`);
  }
});

test('getOmbudsmen returns only strings', () => {
  const ids = getOmbudsmen();
  for (const id of ids) {
    assert.equal(typeof id, 'string');
  }
});

test('getOmbudsmanDetails returns full details for PHSO', () => {
  const details = getOmbudsmanDetails('PHSO');
  assert.ok(details);
  assert.equal(details.id, 'PHSO');
  assert.equal(details.name, 'Parliamentary and Health Service Ombudsman');
  assert.ok(Array.isArray(details.sectors));
  assert.ok(details.sectors.includes('NHS'));
  assert.equal(details.source, 'phso-annual-report');
  assert.equal(details.website, 'https://www.ombudsman.org.uk');
});

test('getOmbudsmanDetails returns null for unknown ID', () => {
  assert.equal(getOmbudsmanDetails('unknown-ombudsman'), null);
});

test('getOmbudsmanDetails returns null for empty string', () => {
  assert.equal(getOmbudsmanDetails(''), null);
});

test('getOutcomeStatistics returns valid statistics for financial ombudsman', () => {
  const stats = getOutcomeStatistics('financial');
  assert.ok(stats);
  assert.equal(stats.ombudsmanId, 'financial');
  assert.ok(typeof stats.totalCases === 'number');
  assert.ok(typeof stats.upheldRate === 'number');
  assert.ok(typeof stats.notUpheldRate === 'number');
  assert.ok(typeof stats.partiallyUpheldRate === 'number');
  assert.ok(stats.upheldRate >= 0 && stats.upheldRate <= 100);
  assert.ok(Array.isArray(stats.yearlyTrend));
  assert.ok(stats.yearlyTrend.length > 0);
});

test('getOutcomeStatistics returns null for unknown ombudsman', () => {
  assert.equal(getOutcomeStatistics('unknown-id'), null);
});

test('getTypicalOutcomes returns outcomes for financial ombudsman', () => {
  const outcomes = getTypicalOutcomes('financial', 'complaint-handling');
  assert.ok(outcomes);
  assert.equal(outcomes.ombudsmanId, 'financial');
  assert.equal(outcomes.issueType, 'complaint-handling');
  assert.ok(Array.isArray(outcomes.outcomes));
  assert.ok(outcomes.outcomes.length > 0);
  for (const outcome of outcomes.outcomes) {
    assert.ok(outcome.description);
    assert.ok(outcome.frequency);
    assert.ok(outcome.frequency >= 0 && outcome.frequency <= 100);
  }
});

test('getTypicalOutcomes returns null for unknown ombudsman', () => {
  assert.equal(getTypicalOutcomes('unknown-id', 'some-type'), null);
});

test('getCompensationRanges returns ranges for PHSO', () => {
  const ranges = getCompensationRanges('PHSO');
  assert.ok(ranges);
  assert.equal(ranges.ombudsmanId, 'PHSO');
  assert.ok(Array.isArray(ranges.ranges));
  assert.ok(ranges.ranges.length > 0);
  for (const range of ranges.ranges) {
    assert.ok(range.category);
    assert.ok(typeof range.min === 'number');
    assert.ok(typeof range.max === 'number');
    assert.ok(range.min <= range.max);
    assert.ok(typeof range.typical === 'number');
    assert.ok(range.typical >= range.min && range.typical <= range.max);
  }
  assert.ok(typeof ranges.averageCompensation === 'number');
});

test('getCompensationRanges returns null for unknown ombudsman', () => {
  assert.equal(getCompensationRanges('unknown-id'), null);
});

test('getDecisionTimescales returns timescales for PHSO', () => {
  const timescales = getDecisionTimescales('PHSO');
  assert.ok(timescales);
  assert.equal(timescales.ombudsmanId, 'PHSO');
  assert.ok(typeof timescales.averageDays === 'number');
  assert.ok(typeof timescales.medianDays === 'number');
  assert.ok(typeof timescales.percentile90Days === 'number');
  assert.ok(timescales.averageDays > 0);
  assert.ok(timescales.medianDays <= timescales.percentile90Days);
  assert.ok(Array.isArray(timescales.bySector));
});

test('getDecisionTimescales returns null for unknown ombudsman', () => {
  assert.equal(getDecisionTimescales('unknown-id'), null);
});

test('serializeOmbudsmanOutcomes produces JSON string', () => {
  const data = { test: 'value', count: 42 };
  const serialized = serializeOmbudsmanOutcomes(data);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.test, 'value');
  assert.equal(parsed.count, 42);
});

test('parseOmbudsmanOutcomes parses valid JSON', () => {
  const data = { upheld: 60, compensation: [100, 500] };
  const json = JSON.stringify(data);
  const result = parseOmbudsmanOutcomes(json);
  assert.deepEqual(result, data);
});

test('parseOmbudsmanOutcomes returns null for invalid JSON', () => {
  assert.equal(parseOmbudsmanOutcomes('not-json'), null);
});

test('parseOmbudsmanOutcomes returns null for empty string', () => {
  assert.equal(parseOmbudsmanOutcomes(''), null);
});

test('parseOmbudsmanOutcomes returns null for non-string input', () => {
  assert.equal(parseOmbudsmanOutcomes(null), null);
  assert.equal(parseOmbudsmanOutcomes(undefined), null);
  assert.equal(parseOmbudsmanOutcomes(123), null);
});

test('serialize and parse roundtrip', () => {
  const data = { id: 'PHSO', stats: { upheld: 60 } };
  const roundtripped = parseOmbudsmanOutcomes(serializeOmbudsmanOutcomes(data));
  assert.deepEqual(roundtripped, data);
});

test('all ombudsmen have complete details', () => {
  const ids = getOmbudsmen();
  for (const id of ids) {
    const details = getOmbudsmanDetails(id);
    assert.ok(details, `missing details for ${id}`);
    assert.ok(details.name, `${id} missing name`);
    assert.ok(Array.isArray(details.sectors), `${id} missing sectors`);
    assert.ok(details.sectors.length > 0, `${id} has empty sectors`);
    assert.ok(details.source, `${id} missing source`);
    assert.ok(details.website, `${id} missing website`);
  }
});

test('all ombudsmen have outcome statistics', () => {
  const ids = getOmbudsmen();
  for (const id of ids) {
    const stats = getOutcomeStatistics(id);
    assert.ok(stats, `missing stats for ${id}`);
    assert.equal(stats.ombudsmanId, id);
  }
});

test('all ombudsmen have compensation ranges', () => {
  const ids = getOmbudsmen();
  for (const id of ids) {
    const ranges = getCompensationRanges(id);
    assert.ok(ranges, `missing ranges for ${id}`);
    assert.equal(ranges.ombudsmanId, id);
  }
});

test('all ombudsmen have decision timescales', () => {
  const ids = getOmbudsmen();
  for (const id of ids) {
    const timescales = getDecisionTimescales(id);
    assert.ok(timescales, `missing timescales for ${id}`);
    assert.equal(timescales.ombudsmanId, id);
  }
});

test('getAvailableIssueTypes returns types for PHSO', () => {
  const types = getAvailableIssueTypes('PHSO');
  assert.ok(Array.isArray(types));
  assert.ok(types.length > 0);
  const values = types.map((t) => t.value);
  assert.ok(values.includes('complaint-handling'));
});

test('getAvailableIssueTypes returns empty array for unknown ombudsman', () => {
  const types = getAvailableIssueTypes('unknown');
  assert.deepEqual(types, []);
});

test('formatCurrency formats GBP correctly', () => {
  const result = formatCurrency(1500);
  assert.ok(result.includes('1,500') || result.includes('1500'));
  assert.ok(typeof result === 'string');
});

test('formatNumber formats with commas', () => {
  const result = formatNumber(420000);
  assert.ok(result.includes('420,000') || result.includes('420000'));
});

test('renderOmbudsmanSummary returns summary string for PHSO', () => {
  const summary = renderOmbudsmanSummary('PHSO');
  assert.ok(typeof summary === 'string');
  assert.ok(summary.length > 0);
  assert.ok(summary.includes('Parliamentary and Health Service Ombudsman'));
  assert.ok(summary.includes('NHS'));
});

test('renderOmbudsmanSummary returns empty string for unknown ombudsman', () => {
  const summary = renderOmbudsmanSummary('unknown');
  assert.equal(summary, '');
});

test('renderOutcomeResults returns HTML string for PHSO complaint-handling', () => {
  const html = renderOutcomeResults('PHSO', 'complaint-handling');
  assert.ok(typeof html === 'string');
  assert.ok(html.length > 0);
  assert.ok(html.includes('Overall statistics'));
  assert.ok(html.includes('Typical outcomes'));
  assert.ok(html.includes('Compensation ranges'));
  assert.ok(html.includes('Decision timescales'));
});

test('renderOutcomeResults returns empty string for unknown ombudsman', () => {
  const html = renderOutcomeResults('unknown', 'complaint-handling');
  assert.equal(html, '');
});

test('escapeHtml escapes special characters', () => {
  const result = escapeHtml('<script>alert("xss")</script>');
  assert.ok(!result.includes('<script>'));
  assert.ok(result.includes('&lt;'));
});
