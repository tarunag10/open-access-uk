import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORITY_TYPES,
  STATUS_OPTIONS,
  createRequest,
  parseRequest,
  serializeRequest,
  parseRequestList,
  serializeRequestList,
  getStatusMeta,
  getAuthorityTypeMeta,
  daysUntilDeadline,
  needsEscalation,
  buildSummary,
  buildStatusBreakdown,
  buildEscalationLetter,
  buildIcoComplaintLetter,
  buildReminderEvent,
  buildDeadlineEvent,
  buildExportCsv,
  buildExportJson,
  buildHandoffPack,
  buildLocalActionPack,
  buildActionChecklist
} from '../src/tracker.js';

test('createRequest produces a valid request with defaults', () => {
  const r = createRequest({ authority: 'Test Council' });
  assert.equal(r.authority, 'Test Council');
  assert.equal(r.status, 'draft');
  assert.equal(r.authorityType, 'central');
  assert.ok(r.id.startsWith('foi-'));
  assert.ok(r.createdAt);
});

test('serializeRequest and parseRequest round-trip', () => {
  const original = createRequest({ authority: 'Test', subject: 'Subj' });
  const serialized = serializeRequest(original);
  const parsed = parseRequest(serialized);
  assert.deepEqual(parsed.authority, 'Test');
  assert.equal(parsed.subject, 'Subj');
});

test('parseRequest returns null for invalid JSON', () => {
  assert.equal(parseRequest('not json'), null);
  assert.equal(parseRequest(''), null);
});

test('parseRequestList handles empty and invalid input', () => {
  assert.deepEqual(parseRequestList(''), []);
  assert.deepEqual(parseRequestList('not json'), []);
  assert.deepEqual(parseRequestList('"a string"'), []);
});

test('parseRequestList parses valid list', () => {
  const list = [createRequest({ authority: 'A' }), createRequest({ authority: 'B' })];
  const serialized = serializeRequestList(list);
  const parsed = parseRequestList(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].authority, 'A');
});

test('getStatusMeta returns known and fallback status', () => {
  assert.equal(getStatusMeta('sent').value, 'sent');
  assert.equal(getStatusMeta('unknown').value, 'draft');
});

test('getAuthorityTypeMeta returns known and fallback type', () => {
  assert.equal(getAuthorityTypeMeta('central').value, 'central');
  assert.equal(getAuthorityTypeMeta('unknown').value, 'central');
});

test('STATUS_OPTIONS includes all expected statuses', () => {
  const values = STATUS_OPTIONS.map((s) => s.value);
  for (const expected of [
    'draft',
    'sent',
    'acknowledged',
    'partial',
    'responded',
    'refused',
    'overdue',
    'escalated',
    'closed'
  ]) {
    assert.ok(values.includes(expected), `missing status ${expected}`);
  }
});

test('AUTHORITY_TYPES includes all expected types', () => {
  const values = AUTHORITY_TYPES.map((t) => t.value);
  for (const expected of ['central', 'local', 'nhs', 'police', 'education', 'housing', 'other']) {
    assert.ok(values.includes(expected), `missing authority type ${expected}`);
  }
});

test('daysUntilDeadline returns null when no sent date', () => {
  const r = createRequest({});
  assert.equal(daysUntilDeadline(r), null);
});

test('daysUntilDeadline returns positive number for recent sent date', () => {
  const today = new Date('2026-06-15'); // Monday
  const sent = '2026-06-01';
  const r = createRequest({ sentDate: sent });
  const days = daysUntilDeadline(r, today);
  assert.ok(days !== null);
  assert.ok(days > 0, `expected positive days, got ${days}`);
});

test('daysUntilDeadline returns negative for overdue request', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01' });
  const days = daysUntilDeadline(r, today);
  assert.ok(days < 0, `expected negative days, got ${days}`);
});

test('needsEscalation returns true for overdue request', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01', status: 'sent' });
  assert.equal(needsEscalation(r, today), true);
});

test('needsEscalation returns false for responded request', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01', status: 'responded' });
  assert.equal(needsEscalation(r, today), false);
});

test('needsEscalation returns false for escalated request', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01', status: 'escalated' });
  assert.equal(needsEscalation(r, today), false);
});

test('needsEscalation returns false for closed request', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01', status: 'closed' });
  assert.equal(needsEscalation(r, today), false);
});

test('buildSummary counts requests by status', () => {
  const today = new Date('2026-06-15');
  const requests = [
    createRequest({ sentDate: '2026-01-01', status: 'responded' }),
    createRequest({ sentDate: '2026-01-01', status: 'sent' }),
    createRequest({ sentDate: '2026-01-01', status: 'escalated' }),
    createRequest({ sentDate: '2026-06-10', status: 'sent' })
  ];
  const summary = buildSummary(requests, today);
  assert.equal(summary.total, 4);
  assert.equal(summary.responded, 1);
  assert.equal(summary.active, 3);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.escalated, 1);
});

test('buildStatusBreakdown counts each status', () => {
  const requests = [
    createRequest({ status: 'sent' }),
    createRequest({ status: 'sent' }),
    createRequest({ status: 'responded' })
  ];
  const breakdown = buildStatusBreakdown(requests);
  assert.equal(breakdown.sent, 2);
  assert.equal(breakdown.responded, 1);
  assert.equal(breakdown.draft, 0);
  assert.equal(breakdown.closed, 0);
});

test('buildEscalationLetter includes key elements', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({
    authority: 'Test Council',
    subject: 'Test subject',
    sentDate: '2026-05-01',
    requestText: 'Please provide...',
    reference: 'REF-001'
  });
  const letter = buildEscalationLetter(r, {
    today: '2026-06-15',
    name: 'A. Citizen',
    contact: 'a@example.com'
  });
  assert.match(letter, /Test Council/);
  assert.match(letter, /Test subject/);
  assert.match(letter, /internal review/);
  assert.match(letter, /A\. Citizen/);
  assert.match(letter, /a@example\.com/);
  assert.match(letter, /2026-05-01/);
});

test('buildIcoComplaintLetter includes key elements', () => {
  const r = createRequest({
    authority: 'Test Council',
    subject: 'Test subject',
    sentDate: '2026-05-01',
    responseNotes: 'No response received'
  });
  const letter = buildIcoComplaintLetter(r, { name: 'A. Citizen', contact: 'a@example.com' });
  assert.match(letter, /Information Commissioner's Office/);
  assert.match(letter, /Test Council/);
  assert.match(letter, /No response received/);
  assert.match(letter, /A\. Citizen/);
});

test('buildReminderEvent returns null when no sent date', () => {
  const r = createRequest({});
  assert.equal(buildReminderEvent(r), null);
});

test('buildReminderEvent returns event with 14 working day date', () => {
  const r = createRequest({
    sentDate: '2026-06-01',
    id: 'test-1',
    authority: 'Test',
    subject: 'Subj'
  });
  const event = buildReminderEvent(r);
  assert.ok(event);
  assert.equal(event.uid, 'foi-reminder-test-1-halfway');
  assert.match(event.title, /Test/);
  assert.match(event.description, /Subj/);
  assert.ok(event.date);
});

test('buildDeadlineEvent returns event with 20 working day date', () => {
  const r = createRequest({
    sentDate: '2026-06-01',
    id: 'test-2',
    authority: 'Test',
    subject: 'Subj'
  });
  const event = buildDeadlineEvent(r);
  assert.ok(event);
  assert.equal(event.uid, 'foi-deadline-test-2');
  assert.match(event.title, /Test/);
  assert.ok(event.date);
});

test('buildExportCsv produces valid CSV with headers', () => {
  const requests = [
    createRequest({
      authority: 'Council A',
      subject: 'Subj 1',
      sentDate: '2026-06-01',
      status: 'sent'
    }),
    createRequest({
      authority: 'Council B',
      subject: 'Subj 2',
      sentDate: '2026-06-02',
      status: 'responded'
    })
  ];
  const csv = buildExportCsv(requests);
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /id,authority,authorityType/);
  assert.match(lines[1], /Council A/);
  assert.match(lines[2], /Council B/);
});

test('buildExportCsv escapes commas in fields', () => {
  const requests = [createRequest({ authority: 'Council, with comma', subject: 'Subj' })];
  const csv = buildExportCsv(requests);
  assert.match(csv, /"Council, with comma"/);
});

test('buildExportJson produces valid JSON array', () => {
  const requests = [createRequest({ authority: 'A' }), createRequest({ authority: 'B' })];
  const json = buildExportJson(requests);
  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 2);
});

test('buildHandoffPack includes key sections', () => {
  const r = createRequest({
    authority: 'Test Council',
    subject: 'Test subject',
    sentDate: '2026-05-01',
    requestText: 'Please provide data',
    responseNotes: 'Partial response',
    escalationNotes: 'Wrote to authority'
  });
  const pack = buildHandoffPack(r, { name: 'A. Citizen', contact: 'a@example.com' });
  assert.match(pack, /FOI request pack/);
  assert.match(pack, /Test Council/);
  assert.match(pack, /Test subject/);
  assert.match(pack, /Please provide data/);
  assert.match(pack, /Partial response/);
  assert.match(pack, /Wrote to authority/);
  assert.match(pack, /A\. Citizen/);
});

test('buildLocalActionPack includes checklist and safety', () => {
  const r = createRequest({ authority: 'Test', sentDate: '2026-01-01', status: 'sent' });
  const pack = buildLocalActionPack(r);
  assert.match(pack, /Local action pack/);
  assert.match(pack, /Evidence to keep/);
  assert.match(pack, /Safety checks/);
  assert.match(pack, /Action checklist/);
});

test('buildActionChecklist includes base items', () => {
  const r = createRequest({});
  const checklist = buildActionChecklist(r);
  assert.ok(checklist.length >= 5);
  assert.ok(checklist.some((item) => item.includes('Save a copy')));
});

test('buildActionChecklist adds refusal guidance for refused status', () => {
  const r = createRequest({ status: 'refused' });
  const checklist = buildActionChecklist(r);
  assert.ok(checklist.some((item) => item.toLowerCase().includes('exemption')));
});

test('buildActionChecklist adds partial guidance for partial status', () => {
  const r = createRequest({ status: 'partial' });
  const checklist = buildActionChecklist(r);
  assert.ok(checklist.some((item) => item.toLowerCase().includes('clarify')));
});

test('buildActionChecklist highlights overdue requests', () => {
  const today = new Date('2026-06-15');
  const r = createRequest({ sentDate: '2026-01-01', status: 'sent' });
  const checklist = buildActionChecklist(r, today);
  assert.equal(checklist[0].toLowerCase().includes('overdue'), true);
});
