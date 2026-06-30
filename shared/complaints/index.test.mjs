import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createComplaintRecord,
  getComplaintStages,
  getNextStage,
  getDeadlineForStage,
  generateComplaintSummary,
  serializeComplaints,
  parseComplaints
} from './index.mjs';

test('createComplaintRecord returns valid object with defaults', () => {
  const record = createComplaintRecord({ patientName: 'Jane Doe' });
  assert.equal(record.patientName, 'Jane Doe');
  assert.equal(record.stage, 'pals');
  assert.equal(record.status, 'open');
  assert.ok(record.id);
  assert.ok(record.createdAt);
  assert.equal(typeof record.id, 'string');
  assert.ok(record.id.length > 0);
});

test('createComplaintRecord merges provided data over defaults', () => {
  const record = createComplaintRecord({
    patientName: 'John Smith',
    stage: 'formal',
    sentDate: '2026-06-01',
    trustName: 'NHS Trust'
  });
  assert.equal(record.patientName, 'John Smith');
  assert.equal(record.stage, 'formal');
  assert.equal(record.sentDate, '2026-06-01');
  assert.equal(record.trustName, 'NHS Trust');
  assert.equal(record.status, 'open');
});

test('createComplaintRecord throws on missing patientName', () => {
  assert.throws(() => createComplaintRecord({}), /patientName/i);
});

test('createComplaintRecord throws on invalid stage', () => {
  assert.throws(
    () => createComplaintRecord({ patientName: 'X', stage: 'invalid-stage' }),
    /stage/i
  );
});

test('getComplaintStages returns NHS stages array', () => {
  const stages = getComplaintStages();
  assert.ok(Array.isArray(stages));
  assert.equal(stages.length, 3);
  assert.equal(stages[0].id, 'pals');
  assert.equal(stages[1].id, 'formal');
  assert.equal(stages[2].id, 'phso');
});

test('getComplaintStages each stage has required fields', () => {
  const stages = getComplaintStages();
  for (const stage of stages) {
    assert.ok(stage.name, `${stage.id} missing name`);
    assert.ok(stage.description, `${stage.id} missing description`);
    assert.ok(stage.source, `${stage.id} missing source`);
  }
});

test('getNextStage returns next stage after pals', () => {
  assert.equal(getNextStage('pals'), 'formal');
});

test('getNextStage returns next stage after formal', () => {
  assert.equal(getNextStage('formal'), 'phso');
});

test('getNextStage returns null after phso (final stage)', () => {
  assert.equal(getNextStage('phso'), null);
});

test('getNextStage returns null for unknown stage', () => {
  assert.equal(getNextStage('unknown'), null);
});

test('getDeadlineForStage PALS returns 3 working day acknowledgement', () => {
  const deadline = getDeadlineForStage('pals', '2026-06-01');
  assert.equal(deadline.stageId, 'pals');
  assert.equal(deadline.sentDate, '2026-06-01');
  assert.ok(deadline.acknowledgementDate);
  assert.equal(deadline.acknowledgementDate, '2026-06-04');
  assert.equal(deadline.acknowledgementDays, 3);
});

test('getDeadlineForStage formal returns 25 working day response', () => {
  const deadline = getDeadlineForStage('formal', '2026-06-01');
  assert.equal(deadline.stageId, 'formal');
  assert.equal(deadline.sentDate, '2026-06-01');
  assert.ok(deadline.responseDate);
  assert.equal(deadline.responseWorkingDays, 25);
  const dayOfWeek = new Date(deadline.responseDate).getUTCDay();
  assert.notEqual(dayOfWeek, 0, 'response date should not be Sunday');
  assert.notEqual(dayOfWeek, 6, 'response date should not be Saturday');
});

test('getDeadlineForStage phso returns 12 month deadline', () => {
  const deadline = getDeadlineForStage('phso', '2026-01-15');
  assert.equal(deadline.stageId, 'phso');
  assert.equal(deadline.deadlineDate, '2027-01-15');
  assert.equal(deadline.deadlineMonths, 12);
});

test('getDeadlineForStage returns null for unknown stage', () => {
  assert.equal(getDeadlineForStage('unknown', '2026-06-01'), null);
});

test('getDeadlineForStage returns null for bad date', () => {
  assert.equal(getDeadlineForStage('pals', 'bad-date'), null);
});

test('generateComplaintSummary returns plain text summary', () => {
  const complaint = createComplaintRecord({
    patientName: 'Jane Doe',
    stage: 'pals',
    sentDate: '2026-06-01',
    trustName: 'City Hospital NHS Trust',
    reference: 'REF-123'
  });
  const summary = generateComplaintSummary(complaint);
  assert.equal(typeof summary, 'string');
  assert.ok(summary.includes('Jane Doe'));
  assert.ok(summary.includes('PALS'));
  assert.ok(summary.includes('City Hospital NHS Trust'));
  assert.ok(summary.includes('REF-123'));
  assert.ok(summary.includes('2026-06-01'));
});

test('generateComplaintSummary handles missing optional fields', () => {
  const complaint = createComplaintRecord({
    patientName: 'Bob'
  });
  const summary = generateComplaintSummary(complaint);
  assert.ok(summary.includes('Bob'));
  assert.ok(summary.includes('PALS'));
});

test('serializeComplaints produces JSON string', () => {
  const complaint = createComplaintRecord({ patientName: 'Test' });
  const serialized = serializeComplaints([complaint]);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].patientName, 'Test');
});

test('parseComplaints parses valid JSON', () => {
  const complaint = createComplaintRecord({ patientName: 'Test' });
  const json = JSON.stringify([complaint]);
  const result = parseComplaints(json);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 1);
  assert.equal(result[0].patientName, 'Test');
});

test('parseComplaints returns empty array for invalid JSON', () => {
  assert.deepEqual(parseComplaints('not-json'), []);
});

test('parseComplaints returns empty array for non-array JSON', () => {
  assert.deepEqual(parseComplaints('{"foo":"bar"}'), []);
});

test('parseComplaints returns empty array for empty string', () => {
  assert.deepEqual(parseComplaints(''), []);
});

test('serializeComplaints and parseComplaints roundtrip', () => {
  const c1 = createComplaintRecord({ patientName: 'Alice', stage: 'formal' });
  const c2 = createComplaintRecord({ patientName: 'Bob', stage: 'phso' });
  const roundtripped = parseComplaints(serializeComplaints([c1, c2]));
  assert.equal(roundtripped.length, 2);
  assert.equal(roundtripped[0].patientName, 'Alice');
  assert.equal(roundtripped[1].patientName, 'Bob');
});
