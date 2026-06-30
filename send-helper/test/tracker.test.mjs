import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPEAL_STATUS,
  generateAppealId,
  createAppeal,
  parseAppeal,
  serializeAppeal,
  parseAppealList,
  serializeAppealList,
  getAppealTypeLabel,
  getStatusMeta,
  computeDeadline,
  daysUntilDeadline,
  buildSummary,
  buildTypeBreakdown,
  generateLetterPreview,
  buildEvidenceChecklist,
  buildExportCsv,
  buildExportJson,
} from '../src/tracker.js';

test('generateAppealId produces send- prefix', () => {
  const id = generateAppealId();
  assert.ok(id.startsWith('send-'));
});

test('createAppeal produces valid appeal with defaults', () => {
  const a = createAppeal({ childName: 'Alex' });
  assert.equal(a.childName, 'Alex');
  assert.equal(a.appealType, 'exclusion-review');
  assert.equal(a.status, 'draft');
  assert.ok(a.id.startsWith('send-'));
  assert.ok(a.createdAt);
});

test('serializeAppeal and parseAppeal round-trip', () => {
  const original = createAppeal({ childName: 'Sam', schoolName: 'Riverside' });
  const serialized = serializeAppeal(original);
  const parsed = parseAppeal(serialized);
  assert.equal(parsed.childName, 'Sam');
  assert.equal(parsed.schoolName, 'Riverside');
});

test('parseAppeal returns null for invalid JSON', () => {
  assert.equal(parseAppeal('not json'), null);
  assert.equal(parseAppeal(''), null);
});

test('parseAppealList handles empty and invalid input', () => {
  assert.deepEqual(parseAppealList(''), []);
  assert.deepEqual(parseAppealList('not json'), []);
  assert.deepEqual(parseAppealList('"a string"'), []);
});

test('parseAppealList parses valid list', () => {
  const list = [createAppeal({ childName: 'A' }), createAppeal({ childName: 'B' })];
  const serialized = serializeAppealList(list);
  const parsed = parseAppealList(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].childName, 'A');
});

test('getAppealTypeLabel returns name for known type', () => {
  assert.equal(getAppealTypeLabel('exclusion-review'), 'School Exclusion Review');
  assert.equal(getAppealTypeLabel('send-tribunal'), 'SEND Tribunal');
});

test('getAppealTypeLabel returns id for unknown type', () => {
  assert.equal(getAppealTypeLabel('unknown'), 'unknown');
});

test('getStatusMeta returns known and fallback status', () => {
  assert.equal(getStatusMeta('submitted').value, 'submitted');
  assert.equal(getStatusMeta('unknown').value, 'draft');
});

test('APPEAL_STATUS includes all expected statuses', () => {
  const values = APPEAL_STATUS.map((s) => s.value);
  for (const expected of ['draft', 'submitted', 'acknowledged', 'in-progress', 'mediation', 'hearing', 'decided', 'withdrawn', 'closed']) {
    assert.ok(values.includes(expected), `missing status ${expected}`);
  }
});

test('computeDeadline returns null when no decision date', () => {
  const a = createAppeal({});
  assert.equal(computeDeadline(a), null);
});

test('computeDeadline returns school days for exclusion review', () => {
  const a = createAppeal({ appealType: 'exclusion-review', decisionDate: '2026-06-01', exclusionType: 'fixed-term' });
  const dl = computeDeadline(a);
  assert.ok(dl);
  assert.ok(dl.targetDate);
  assert.match(dl.note, /15/);
});

test('computeDeadline returns 2 months for SEND tribunal', () => {
  const a = createAppeal({ appealType: 'send-tribunal', decisionDate: '2026-06-01' });
  const dl = computeDeadline(a);
  assert.ok(dl);
  assert.ok(dl.targetDate);
  assert.match(dl.note, /2 months/);
});

test('computeDeadline returns no deadline for EHCP dispute', () => {
  const a = createAppeal({ appealType: 'ehcp-dispute', decisionDate: '2026-06-01' });
  const dl = computeDeadline(a);
  assert.ok(dl);
  assert.equal(dl.targetDate, null);
  assert.match(dl.note, /No statutory deadline/);
});

test('daysUntilDeadline returns null when no decision date', () => {
  const a = createAppeal({});
  assert.equal(daysUntilDeadline(a), null);
});

test('daysUntilDeadline returns positive number for future date', () => {
  const today = new Date('2026-06-15');
  const a = createAppeal({ appealType: 'send-tribunal', decisionDate: '2026-06-01' });
  const days = daysUntilDeadline(a, today);
  assert.ok(days !== null);
  assert.ok(days > 0, `expected positive days, got ${days}`);
});

test('daysUntilDeadline returns negative for past date', () => {
  const today = new Date('2026-09-01');
  const a = createAppeal({ appealType: 'send-tribunal', decisionDate: '2026-06-01' });
  const days = daysUntilDeadline(a, today);
  assert.ok(days < 0, `expected negative days, got ${days}`);
});

test('buildSummary counts appeals', () => {
  const appeals = [
    createAppeal({ status: 'decided' }),
    createAppeal({ status: 'draft' }),
    createAppeal({ status: 'closed' }),
  ];
  const summary = buildSummary(appeals);
  assert.equal(summary.total, 3);
  assert.equal(summary.active, 1);
  assert.equal(summary.decided, 2);
});

test('buildTypeBreakdown counts each type', () => {
  const appeals = [
    createAppeal({ appealType: 'exclusion-review' }),
    createAppeal({ appealType: 'exclusion-review' }),
    createAppeal({ appealType: 'send-tribunal' }),
  ];
  const breakdown = buildTypeBreakdown(appeals);
  assert.equal(breakdown['exclusion-review'], 2);
  assert.equal(breakdown['send-tribunal'], 1);
  assert.equal(breakdown['ehcp-dispute'], 0);
});

test('generateLetterPreview returns exclusion review text', () => {
  const a = createAppeal({
    appealType: 'exclusion-review',
    childName: 'Alex',
    schoolName: 'Riverside',
    exclusionType: 'fixed-term',
    decisionDate: '2026-06-01',
    grounds: 'Disruptive behaviour',
  });
  const letter = generateLetterPreview(a);
  assert.match(letter, /School Exclusion Review Request/);
  assert.match(letter, /Alex/);
  assert.match(letter, /Riverside/);
  assert.match(letter, /Disruptive behaviour/);
});

test('generateLetterPreview returns SEND tribunal text', () => {
  const a = createAppeal({
    appealType: 'send-tribunal',
    childName: 'Sam',
    laName: 'Manchester',
    decisionDate: '2026-06-01',
    grounds: 'Refusal to assess',
  });
  const letter = generateLetterPreview(a);
  assert.match(letter, /First-tier Tribunal/);
  assert.match(letter, /Sam/);
  assert.match(letter, /Manchester/);
  assert.match(letter, /Refusal to assess/);
});

test('generateLetterPreview returns generic text for EHCP dispute', () => {
  const a = createAppeal({
    appealType: 'ehcp-dispute',
    childName: 'Jordan',
    laName: 'Leeds',
    grounds: 'Provision not met',
  });
  const letter = generateLetterPreview(a);
  assert.match(letter, /EHCP Dispute/);
  assert.match(letter, /Jordan/);
  assert.match(letter, /Leeds/);
});

test('buildEvidenceChecklist returns items for each type', () => {
  for (const type of ['exclusion-review', 'send-tribunal', 'ehcp-dispute']) {
    const a = createAppeal({ appealType: type });
    const checklist = buildEvidenceChecklist(a);
    assert.ok(checklist.length >= 4, `expected at least 4 items for ${type}`);
  }
});

test('buildExportCsv produces valid CSV with headers', () => {
  const appeals = [
    createAppeal({ childName: 'A', appealType: 'exclusion-review', decisionDate: '2026-06-01' }),
    createAppeal({ childName: 'B', appealType: 'send-tribunal', decisionDate: '2026-06-02' }),
  ];
  const csv = buildExportCsv(appeals);
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /id,appealType,childName/);
  assert.match(lines[1], /A/);
  assert.match(lines[2], /B/);
});

test('buildExportCsv escapes commas in fields', () => {
  const appeals = [createAppeal({ childName: 'Smith, Jr.' })];
  const csv = buildExportCsv(appeals);
  assert.match(csv, /"Smith, Jr."/);
});

test('buildExportJson produces valid JSON array', () => {
  const appeals = [createAppeal({ childName: 'A' }), createAppeal({ childName: 'B' })];
  const json = buildExportJson(appeals);
  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 2);
});
