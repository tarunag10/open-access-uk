import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthorityTypes,
  getDefaultAuthorities,
  createBatchRequest,
  calculateBatchDeadlines,
  generateBatchCoverLetter,
  aggregateBatchResponses,
  exportBatchCSV,
  serializeBatchFOI,
  parseBatchFOI,
  calculateDaysRemaining,
  escapeHtml,
  renderBatchCard,
  renderBatches,
  formatDateForDisplay
} from '../src/tracker.js';

test('getAuthorityTypes returns all expected types', () => {
  const types = getAuthorityTypes();
  const ids = types.map((t) => t.id);
  for (const expected of ['council', 'nhs-trust', 'police', 'university', 'government-department', 'police-fire-authority']) {
    assert.ok(ids.includes(expected), `missing authority type ${expected}`);
  }
});

test('getAuthorityTypes returns 20 working day deadline for all types', () => {
  const types = getAuthorityTypes();
  for (const type of types) {
    assert.equal(type.deadlineWorkingDays, 20);
  }
});

test('getDefaultAuthorities returns council authorities', () => {
  const councils = getDefaultAuthorities('council');
  assert.ok(councils.length > 0);
  assert.equal(councils[0].type, 'council');
});

test('getDefaultAuthorities returns empty array for unknown type', () => {
  assert.deepEqual(getDefaultAuthorities('unknown'), []);
});

test('createBatchRequest produces valid batch with required fields', () => {
  const batch = createBatchRequest({
    subject: 'Test request',
    authorities: [{ name: 'Test Council', type: 'council' }],
    sentDate: '2026-06-01'
  });
  assert.equal(batch.subject, 'Test request');
  assert.equal(batch.status, 'pending');
  assert.equal(batch.authorities.length, 1);
  assert.equal(batch.authorities[0].name, 'Test Council');
  assert.equal(batch.sentDate, '2026-06-01');
  assert.equal(batch.deadlineDays, 20);
  assert.ok(batch.id.startsWith('bfoi-'));
  assert.ok(batch.createdAt);
});

test('createBatchRequest throws on missing subject', () => {
  assert.throws(
    () => createBatchRequest({ authorities: [{ name: 'A', type: 'council' }], sentDate: '2026-06-01' }),
    /subject is required/
  );
});

test('createBatchRequest throws on missing authorities', () => {
  assert.throws(
    () => createBatchRequest({ subject: 'Test', sentDate: '2026-06-01' }),
    /authorities array is required/
  );
});

test('createBatchRequest throws on empty authorities array', () => {
  assert.throws(
    () => createBatchRequest({ subject: 'Test', authorities: [], sentDate: '2026-06-01' }),
    /authorities array is required/
  );
});

test('createBatchRequest throws on missing sentDate', () => {
  assert.throws(
    () => createBatchRequest({ subject: 'Test', authorities: [{ name: 'A', type: 'council' }] }),
    /sentDate is required/
  );
});

test('createBatchRequest accepts optional description and notes', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'A description',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01',
    notes: 'Some notes'
  });
  assert.equal(batch.description, 'A description');
  assert.equal(batch.notes, 'Some notes');
});

test('calculateBatchDeadlines returns deadline for valid date', () => {
  const deadlines = calculateBatchDeadlines('2026-06-01');
  assert.ok(deadlines.length > 0);
  assert.ok(deadlines[0].deadline);
  assert.equal(deadlines[0].workingDays, 20);
});

test('calculateBatchDeadlines returns empty for invalid date', () => {
  assert.deepEqual(calculateBatchDeadlines(''), []);
  assert.deepEqual(calculateBatchDeadlines('not-a-date'), []);
  assert.deepEqual(calculateBatchDeadlines(null), []);
});

test('generateBatchCoverLetter includes subject and date', () => {
  const letter = generateBatchCoverLetter({
    subject: 'Park maintenance data',
    description: 'Please provide spending data.',
    sentDate: '2026-06-01'
  });
  assert.match(letter, /Park maintenance data/);
  assert.match(letter, /Please provide spending data/);
  assert.match(letter, /2026-06-01/);
  assert.match(letter, /Freedom of Information Act 2000/);
  assert.match(letter, /20 working days/);
});

test('generateBatchCoverLetter handles empty data', () => {
  const letter = generateBatchCoverLetter({});
  assert.match(letter, /Freedom of Information Act 2000/);
});

test('aggregateBatchResponses returns correct statuses', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    authorities: [
      { name: 'Council A', type: 'council', responseDate: '2026-06-10' },
      { name: 'Council B', type: 'council' }
    ],
    sentDate: '2026-06-01'
  });
  const results = aggregateBatchResponses(batch);
  assert.equal(results.length, 2);
  assert.equal(results[0].status, 'received');
  assert.equal(results[0].responseDate, '2026-06-10');
  assert.ok(['pending', 'overdue'].includes(results[1].status));
});

test('aggregateBatchResponses returns empty for null input', () => {
  assert.deepEqual(aggregateBatchResponses(null), []);
  assert.deepEqual(aggregateBatchResponses({}), []);
});

test('exportBatchCSV returns CSV with header and rows', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    authorities: [
      { name: 'Council A', type: 'council' },
      { name: 'Council B', type: 'council', responseDate: '2026-06-10' }
    ],
    sentDate: '2026-06-01'
  });
  const csv = exportBatchCSV(batch);
  const lines = csv.split('\n');
  assert.equal(lines[0], 'authority,type,sentDate,deadline,status,responseDate');
  assert.equal(lines.length, 3);
  assert.match(lines[1], /Council A/);
  assert.match(lines[2], /received/);
});

test('exportBatchCSV returns empty string for null input', () => {
  assert.equal(exportBatchCSV(null), '');
});

test('serializeBatchFOI and parseBatchFOI round-trip', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  const serialized = serializeBatchFOI(batch);
  const parsed = parseBatchFOI(serialized);
  assert.equal(parsed.subject, 'Test');
  assert.equal(parsed.authorities.length, 1);
});

test('parseBatchFOI returns null for invalid input', () => {
  assert.equal(parseBatchFOI(''), null);
  assert.equal(parseBatchFOI(null), null);
  assert.equal(parseBatchFOI(undefined), null);
  assert.equal(parseBatchFOI('not json'), null);
  assert.equal(parseBatchFOI('"a string"'), null);
  assert.equal(parseBatchFOI('{"noSubject": true}'), null);
});

test('calculateDaysRemaining returns null when no sent date', () => {
  assert.equal(calculateDaysRemaining(''), null);
  assert.equal(calculateDaysRemaining(null), null);
});

test('calculateDaysRemaining returns positive number for recent date', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-06-10', today);
  assert.ok(days !== null);
  assert.ok(days > 0, `expected positive days, got ${days}`);
});

test('calculateDaysRemaining returns negative for overdue date', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-01-01', today);
  assert.ok(days < 0, `expected negative days, got ${days}`);
});

test('escapeHtml escapes special characters', () => {
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
  assert.equal(escapeHtml('"quoted"'), '&quot;quoted&quot;');
});

test('renderBatchCard returns HTML string with key elements', () => {
  const batch = createBatchRequest({
    subject: 'Test batch',
    description: 'Test description',
    authorities: [{ name: 'Council A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  const html = renderBatchCard(batch);
  assert.match(html, /Test batch/);
  assert.match(html, /Test description/);
  assert.match(html, /2026-06-01/);
  assert.match(html, /data-action="view"/);
  assert.match(html, /data-action="delete"/);
  assert.match(html, /1 authority/);
});

test('renderBatchCard uses plural for multiple authorities', () => {
  const batch = createBatchRequest({
    subject: 'Test batch',
    authorities: [
      { name: 'A', type: 'council' },
      { name: 'B', type: 'council' }
    ],
    sentDate: '2026-06-01'
  });
  const html = renderBatchCard(batch);
  assert.match(html, /2 authorities/);
});

test('formatDateForDisplay returns formatted date', () => {
  const result = formatDateForDisplay('2026-06-01');
  assert.match(result, /1/);
  assert.match(result, /June/);
  assert.match(result, /2026/);
});

test('formatDateForDisplay returns fallback for empty input', () => {
  assert.equal(formatDateForDisplay(''), 'No date set');
  assert.equal(formatDateForDisplay(null), 'No date set');
});
