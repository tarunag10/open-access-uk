import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORGANISATION_TYPES,
  getFormats,
  getFormatDetails,
  generateRequestText,
  getFormatRequirements,
  getOrganisationRoutes,
  getEqualityActRights,
  getMonitoringInfo,
  serializeAccessibleFormats,
  parseAccessibleFormats
} from '../src/tracker.js';

test('ORGANISATION_TYPES includes all expected types', () => {
  const values = ORGANISATION_TYPES.map((t) => t.value);
  for (const expected of ['council', 'nhs', 'government', 'school', 'university', 'other']) {
    assert.ok(values.includes(expected), `missing organisation type ${expected}`);
  }
});

test('getFormats returns all format options', () => {
  const formats = getFormats();
  assert.ok(formats.length >= 8);
  const ids = formats.map((f) => f.id);
  for (const expected of [
    'braille',
    'large-print',
    'audio',
    'easy-read',
    'email',
    'telephone',
    'bsl',
    'welsh'
  ]) {
    assert.ok(ids.includes(expected), `missing format ${expected}`);
  }
});

test('getFormatDetails returns correct format', () => {
  const braille = getFormatDetails('braille');
  assert.ok(braille);
  assert.equal(braille.name, 'Braille');
  assert.equal(braille.supplier, 'RNIB');
  assert.ok(braille.minLeadTime);
});

test('getFormatDetails returns null for unknown format', () => {
  assert.equal(getFormatDetails('unknown'), null);
});

test('generateRequestText includes key fields', () => {
  const text = generateRequestText({
    requestorName: 'Jane Smith',
    requestorAddress: '123 High Street, London',
    organisationName: 'Manchester City Council',
    format: 'Braille',
    documents: 'Council tax bill',
    deadline: '2026-07-31',
    reason: 'I am blind'
  });
  assert.match(text, /Jane Smith/);
  assert.match(text, /Manchester City Council/);
  assert.match(text, /Braille/);
  assert.match(text, /Council tax bill/);
  assert.match(text, /2026-07-31/);
  assert.match(text, /I am blind/);
  assert.match(text, /Equality Act 2010/);
});

test('generateRequestText handles array documents', () => {
  const text = generateRequestText({
    requestorName: 'Test',
    requestorAddress: 'Address',
    organisationName: 'Org',
    format: 'Audio',
    documents: ['Doc 1', 'Doc 2'],
    deadline: '2026-08-01'
  });
  assert.match(text, /Doc 1, Doc 2/);
});

test('getFormatRequirements returns requirements for braille', () => {
  const reqs = getFormatRequirements('braille');
  assert.ok(reqs.length > 0);
  assert.ok(reqs.some((r) => r.includes('Braille')));
});

test('getFormatRequirements returns empty for unknown format', () => {
  assert.deepEqual(getFormatRequirements('unknown'), []);
});

test('getOrganisationRoutes returns RNIB for braille', () => {
  const route = getOrganisationRoutes('braille');
  assert.ok(route);
  assert.equal(route.name, 'RNIB (Royal National Institute of Blind People)');
  assert.equal(route.website, 'https://www.rnib.org.uk');
});

test('getOrganisationRoutes returns Mencap for easy-read', () => {
  const route = getOrganisationRoutes('easy-read');
  assert.ok(route);
  assert.equal(route.name, 'Mencap');
});

test('getOrganisationRoutes returns RNID for BSL', () => {
  const route = getOrganisationRoutes('bsl');
  assert.ok(route);
  assert.equal(route.name, 'RNID (Royal National Institute for Deaf People)');
});

test('getOrganisationRoutes returns null for unknown format', () => {
  assert.equal(getOrganisationRoutes('unknown'), null);
});

test('getEqualityActRights returns rights structure', () => {
  const rights = getEqualityActRights();
  assert.ok(rights.title);
  assert.ok(rights.description);
  assert.ok(Array.isArray(rights.rights));
  assert.ok(rights.rights.length > 0);
  assert.ok(rights.rights.some((r) => r.includes('accessible format')));
});

test('getMonitoringInfo returns EHRC info', () => {
  const info = getMonitoringInfo();
  assert.equal(info.name, 'Equality and Human Rights Commission');
  assert.ok(info.website);
  assert.ok(info.complaintProcess);
});

test('serializeAccessibleFormats and parseAccessibleFormats round-trip', () => {
  const list = [
    { id: 'req-1', organisationName: 'A' },
    { id: 'req-2', organisationName: 'B' }
  ];
  const serialized = serializeAccessibleFormats(list);
  const parsed = parseAccessibleFormats(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].organisationName, 'A');
  assert.equal(parsed[1].organisationName, 'B');
});

test('parseAccessibleFormats handles empty and invalid input', () => {
  assert.deepEqual(parseAccessibleFormats(''), []);
  assert.deepEqual(parseAccessibleFormats(null), []);
  assert.deepEqual(parseAccessibleFormats(undefined), []);
  assert.deepEqual(parseAccessibleFormats('not json'), []);
  assert.deepEqual(parseAccessibleFormats('"a string"'), []);
});
