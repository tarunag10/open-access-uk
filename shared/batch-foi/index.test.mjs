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
  parseBatchFOI
} from './index.mjs';

test('getAuthorityTypes returns all authority types', () => {
  const types = getAuthorityTypes();
  assert.ok(Array.isArray(types));
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('council'));
  assert.ok(ids.includes('nhs-trust'));
  assert.ok(ids.includes('police'));
  assert.ok(ids.includes('university'));
  assert.ok(ids.includes('government-department'));
  assert.ok(ids.includes('police-fire-authority'));
});

test('getAuthorityTypes each type has required fields', () => {
  const types = getAuthorityTypes();
  for (const type of types) {
    assert.ok(type.id, `${type.id} missing id`);
    assert.ok(type.name, `${type.id} missing name`);
    assert.ok(type.deadlineWorkingDays, `${type.id} missing deadlineWorkingDays`);
    assert.ok(type.source, `${type.id} missing source`);
  }
});

test('getDefaultAuthorities returns councils', () => {
  const councils = getDefaultAuthorities('council');
  assert.ok(Array.isArray(councils));
  assert.equal(councils.length, 3);
  const names = councils.map((a) => a.name);
  assert.ok(names.includes('Westminster City Council'));
  assert.ok(names.includes('Birmingham City Council'));
  assert.ok(names.includes('Leeds City Council'));
});

test('getDefaultAuthorities returns NHS trusts', () => {
  const nhs = getDefaultAuthorities('nhs-trust');
  assert.ok(Array.isArray(nhs));
  assert.equal(nhs.length, 2);
  const names = nhs.map((a) => a.name);
  assert.ok(names.includes('NHS England'));
  assert.ok(names.includes('NHS Wales'));
});

test('getDefaultAuthorities returns empty array for unknown type', () => {
  assert.deepEqual(getDefaultAuthorities('unknown'), []);
});

test('createBatchRequest returns valid batch object', () => {
  const batch = createBatchRequest({
    subject: 'FOI Request',
    description: 'Test description',
    authorities: [{ name: 'Westminster City Council', type: 'council' }],
    sentDate: '2026-06-01'
  });
  assert.ok(batch.id);
  assert.equal(batch.subject, 'FOI Request');
  assert.equal(batch.description, 'Test description');
  assert.equal(batch.authorities.length, 1);
  assert.equal(batch.sentDate, '2026-06-01');
  assert.equal(batch.deadlineDays, 20);
  assert.equal(batch.status, 'pending');
});

test('createBatchRequest throws on missing subject', () => {
  assert.throws(
    () =>
      createBatchRequest({
        description: 'Test',
        authorities: [{ name: 'A', type: 'council' }],
        sentDate: '2026-06-01'
      }),
    /subject/i
  );
});

test('createBatchRequest throws on missing authorities', () => {
  assert.throws(
    () =>
      createBatchRequest({
        subject: 'FOI Request',
        description: 'Test',
        sentDate: '2026-06-01'
      }),
    /authorities/i
  );
});

test('createBatchRequest throws on empty authorities array', () => {
  assert.throws(
    () =>
      createBatchRequest({
        subject: 'FOI Request',
        description: 'Test',
        authorities: [],
        sentDate: '2026-06-01'
      }),
    /authorities/i
  );
});

test('createBatchRequest throws on missing sentDate', () => {
  assert.throws(
    () =>
      createBatchRequest({
        subject: 'FOI Request',
        description: 'Test',
        authorities: [{ name: 'A', type: 'council' }]
      }),
    /sentDate/i
  );
});

test('calculateBatchDeadlines returns per-authority deadlines', () => {
  const deadlines = calculateBatchDeadlines('2026-06-01');
  assert.ok(Array.isArray(deadlines));
  assert.equal(deadlines.length, 1);
  assert.equal(deadlines[0].authority, 'Westminster City Council');
  assert.equal(deadlines[0].deadline, '2026-06-29');
  assert.equal(deadlines[0].workingDays, 20);
});

test('calculateBatchDeadlines handles multiple authorities', () => {
  const deadlines = calculateBatchDeadlines('2026-06-01');
  assert.ok(deadlines.length > 0);
});

test('calculateBatchDeadlines returns null deadline for bad date', () => {
  const deadlines = calculateBatchDeadlines('bad-date');
  assert.ok(Array.isArray(deadlines));
  assert.equal(deadlines.length, 0);
});

test('generateBatchCoverLetter returns cover letter string', () => {
  const letter = generateBatchCoverLetter({
    subject: 'FOI Request',
    description: 'Test description',
    sentDate: '2026-06-01'
  });
  assert.equal(typeof letter, 'string');
  assert.ok(letter.includes('FOI Request'));
  assert.ok(letter.includes('Test description'));
  assert.ok(letter.includes('2026-06-01'));
});

test('generateBatchCoverLetter includes deadline reference', () => {
  const letter = generateBatchCoverLetter({
    subject: 'Test',
    description: 'Desc',
    sentDate: '2026-06-01'
  });
  assert.ok(letter.includes('20 working days'));
});

test('aggregateBatchResponses returns response statuses', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [
      { name: 'A', type: 'council' },
      { name: 'B', type: 'council' }
    ],
    sentDate: '2026-12-01'
  });
  const result = aggregateBatchResponses(batch);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 2);
  assert.equal(result[0].status, 'pending');
  assert.equal(result[1].status, 'pending');
});

test('aggregateBatchResponses marks overdue past deadline', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-01-01'
  });
  const result = aggregateBatchResponses(batch);
  assert.equal(result[0].status, 'overdue');
});

test('aggregateBatchResponses marks received when responseDate set', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  batch.authorities[0].responseDate = '2026-06-15';
  const result = aggregateBatchResponses(batch);
  assert.equal(result[0].status, 'received');
});

test('exportBatchCSV returns CSV string', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [
      { name: 'A', type: 'council' },
      { name: 'B', type: 'council' }
    ],
    sentDate: '2026-06-01'
  });
  const csv = exportBatchCSV(batch);
  assert.equal(typeof csv, 'string');
  assert.ok(csv.includes('authority'));
  assert.ok(csv.includes('type'));
  assert.ok(csv.includes('sentDate'));
  assert.ok(csv.includes('deadline'));
  assert.ok(csv.includes('status'));
  assert.ok(csv.includes('responseDate'));
});

test('exportBatchCSV contains authority data rows', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  const csv = exportBatchCSV(batch);
  const lines = csv.trim().split('\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[1].includes('A'));
  assert.ok(lines[1].includes('council'));
});

test('serializeBatchFOI produces JSON string', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  const json = serializeBatchFOI(batch);
  assert.equal(typeof json, 'string');
  const parsed = JSON.parse(json);
  assert.equal(parsed.subject, 'Test');
});

test('parseBatchFOI parses valid JSON', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [{ name: 'A', type: 'council' }],
    sentDate: '2026-06-01'
  });
  const json = JSON.stringify(batch);
  const result = parseBatchFOI(json);
  assert.ok(result);
  assert.equal(result.subject, 'Test');
});

test('parseBatchFOI returns null for invalid JSON', () => {
  assert.equal(parseBatchFOI('not-json'), null);
});

test('parseBatchFOI returns null for empty string', () => {
  assert.equal(parseBatchFOI(''), null);
});

test('serializeBatchFOI and parseBatchFOI roundtrip', () => {
  const batch = createBatchRequest({
    subject: 'Test',
    description: 'Desc',
    authorities: [
      { name: 'A', type: 'council' },
      { name: 'B', type: 'council' }
    ],
    sentDate: '2026-06-01'
  });
  const roundtripped = parseBatchFOI(serializeBatchFOI(batch));
  assert.equal(roundtripped.subject, 'Test');
  assert.equal(roundtripped.authorities.length, 2);
  assert.equal(roundtripped.authorities[0].name, 'A');
  assert.equal(roundtripped.authorities[1].name, 'B');
});
