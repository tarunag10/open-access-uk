import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORGANISATION_TYPES,
  calculateDaysRemaining,
  filterByStage,
  renderTimeline,
  renderComplaintCard,
  createComplaintRecord,
  getComplaintStages,
  getNextStage,
  getDeadlineForStage,
  generateComplaintSummary,
  serializeComplaints,
  parseComplaints
} from '../src/tracker.js';

test('ORGANISATION_TYPES includes all expected types', () => {
  const values = ORGANISATION_TYPES.map((t) => t.value);
  for (const expected of ['gp', 'hospital', 'trust', 'ccg']) {
    assert.ok(values.includes(expected), `missing organisation type ${expected}`);
  }
});

test('getComplaintStages returns three stages', () => {
  const stages = getComplaintStages();
  assert.equal(stages.length, 3);
  assert.equal(stages[0].id, 'pals');
  assert.equal(stages[1].id, 'formal');
  assert.equal(stages[2].id, 'phso');
});

test('getNextStage returns next stage id', () => {
  assert.equal(getNextStage('pals'), 'formal');
  assert.equal(getNextStage('formal'), 'phso');
  assert.equal(getNextStage('phso'), null);
});

test('getNextStage returns null for unknown stage', () => {
  assert.equal(getNextStage('unknown'), null);
});

test('getDeadlineForStage returns null when no sent date', () => {
  assert.equal(getDeadlineForStage('pals', ''), null);
  assert.equal(getDeadlineForStage('pals', null), null);
});

test('getDeadlineForStage returns deadline info for PALS', () => {
  const result = getDeadlineForStage('pals', '2026-06-01');
  assert.ok(result);
  assert.equal(result.stageId, 'pals');
  assert.equal(result.sentDate, '2026-06-01');
  assert.ok(result.acknowledgementDate);
  assert.ok(result.responseDate);
  assert.equal(result.acknowledgementDays, 3);
  assert.equal(result.responseWorkingDays, 25);
});

test('getDeadlineForStage returns deadline info for PHSO', () => {
  const result = getDeadlineForStage('phso', '2026-06-01');
  assert.ok(result);
  assert.equal(result.stageId, 'phso');
  assert.ok(result.deadlineDate);
  assert.equal(result.deadlineMonths, 12);
});

test('getDeadlineForStage returns null for unknown stage', () => {
  assert.equal(getDeadlineForStage('unknown', '2026-06-01'), null);
});

test('createComplaintRecord produces valid complaint with defaults', () => {
  const c = createComplaintRecord({ patientName: 'Test Hospital' });
  assert.equal(c.patientName, 'Test Hospital');
  assert.equal(c.stage, 'pals');
  assert.equal(c.status, 'open');
  assert.ok(c.id.startsWith('cmp-'));
  assert.ok(c.createdAt);
});

test('createComplaintRecord throws on missing patientName', () => {
  assert.throws(() => createComplaintRecord({}), /patientName is required/);
});

test('createComplaintRecord throws on invalid stage', () => {
  assert.throws(() => createComplaintRecord({ patientName: 'Test', stage: 'invalid' }), /Invalid stage/);
});

test('serializeComplaints and parseComplaints round-trip', () => {
  const list = [
    createComplaintRecord({ patientName: 'A' }),
    createComplaintRecord({ patientName: 'B' })
  ];
  const serialized = serializeComplaints(list);
  const parsed = parseComplaints(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].patientName, 'A');
  assert.equal(parsed[1].patientName, 'B');
});

test('parseComplaints handles empty and invalid input', () => {
  assert.deepEqual(parseComplaints(''), []);
  assert.deepEqual(parseComplaints(null), []);
  assert.deepEqual(parseComplaints(undefined), []);
  assert.deepEqual(parseComplaints('not json'), []);
  assert.deepEqual(parseComplaints('"a string"'), []);
});

test('generateComplaintSummary includes key fields', () => {
  const c = createComplaintRecord({
    patientName: 'Test Trust',
    trustName: 'Test Trust',
    reference: 'REF-001',
    sentDate: '2026-06-01',
    notes: 'Some notes'
  });
  const summary = generateComplaintSummary(c);
  assert.match(summary, /Test Trust/);
  assert.match(summary, /REF-001/);
  assert.match(summary, /2026-06-01/);
  assert.match(summary, /Some notes/);
  assert.match(summary, /PALS/);
});

test('calculateDaysRemaining returns null when no sent date', () => {
  assert.equal(calculateDaysRemaining('', 'pals'), null);
  assert.equal(calculateDaysRemaining(null, 'pals'), null);
});

test('calculateDaysRemaining returns positive number for recent date', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-06-10', 'pals', today);
  assert.ok(days !== null);
  assert.ok(days > 0, `expected positive days, got ${days}`);
});

test('calculateDaysRemaining returns negative for overdue complaint', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-01-01', 'pals', today);
  assert.ok(days < 0, `expected negative days, got ${days}`);
});

test('filterByStage filters complaints by stage', () => {
  const complaints = [
    createComplaintRecord({ patientName: 'A', stage: 'pals' }),
    createComplaintRecord({ patientName: 'B', stage: 'formal' }),
    createComplaintRecord({ patientName: 'C', stage: 'pals' })
  ];
  const palsOnly = filterByStage(complaints, 'pals');
  assert.equal(palsOnly.length, 2);
  assert.ok(palsOnly.every((c) => c.stage === 'pals'));
});

test('filterByStage returns all when no stage specified', () => {
  const complaints = [
    createComplaintRecord({ patientName: 'A', stage: 'pals' }),
    createComplaintRecord({ patientName: 'B', stage: 'formal' })
  ];
  assert.equal(filterByStage(complaints, null).length, 2);
  assert.equal(filterByStage(complaints, '').length, 2);
});

test('renderComplaintCard returns HTML string with key elements', () => {
  const c = createComplaintRecord({
    patientName: 'Test Hospital',
    trustName: 'Test Hospital',
    stage: 'pals',
    sentDate: '2026-06-01',
    description: 'Test complaint description'
  });
  const html = renderComplaintCard(c);
  assert.match(html, /Test Hospital/);
  assert.match(html, /Test complaint description/);
  assert.match(html, /2026-06-01/);
  assert.match(html, /data-action="view"/);
  assert.match(html, /data-action="delete"/);
});

test('renderTimeline returns ordered list HTML', () => {
  const c = createComplaintRecord({
    patientName: 'Test',
    stage: 'formal'
  });
  const html = renderTimeline(c);
  assert.match(html, /<ol/);
  assert.match(html, /PALS/);
  assert.match(html, /Formal Complaint/);
  assert.match(html, /PHSO/);
});
