import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFormats,
  getFormatDetails,
  generateRequestText,
  getFormatRequirements,
  getOrganisationRoutes,
  getEqualityActRights,
  getMonitoringInfo,
  serializeAccessibleFormats,
  parseAccessibleFormats
} from './index.mjs';

test('getFormats returns all 8 format ids', () => {
  const formats = getFormats();
  assert.ok(Array.isArray(formats));
  assert.equal(formats.length, 8);
  const ids = formats.map((f) => f.id);
  assert.ok(ids.includes('braille'));
  assert.ok(ids.includes('large-print'));
  assert.ok(ids.includes('audio'));
  assert.ok(ids.includes('easy-read'));
  assert.ok(ids.includes('email'));
  assert.ok(ids.includes('telephone'));
  assert.ok(ids.includes('bsl'));
  assert.ok(ids.includes('welsh'));
});

test('getFormats each format has name and description', () => {
  const formats = getFormats();
  for (const f of formats) {
    assert.ok(f.name, `${f.id} missing name`);
    assert.ok(f.description, `${f.id} missing description`);
  }
});

test('getFormatDetails returns braille details', () => {
  const d = getFormatDetails('braille');
  assert.ok(d);
  assert.equal(d.id, 'braille');
  assert.ok(d.description.includes('Grade 2'));
  assert.equal(d.supplier, 'RNIB');
  assert.equal(d.minLeadTime, '2 weeks');
});

test('getFormatDetails returns large-print details', () => {
  const d = getFormatDetails('large-print');
  assert.ok(d);
  assert.ok(d.description.includes('16pt'));
  assert.equal(d.supplier, 'RNIB');
});

test('getFormatDetails returns audio details', () => {
  const d = getFormatDetails('audio');
  assert.ok(d);
  assert.ok(d.description.includes('MP3'));
  assert.equal(d.supplier, 'RNIB');
});

test('getFormatDetails returns easy-read details', () => {
  const d = getFormatDetails('easy-read');
  assert.ok(d);
  assert.ok(d.description.includes('Mencap'));
  assert.equal(d.supplier, 'Mencap');
});

test('getFormatDetails returns null for unknown format', () => {
  assert.equal(getFormatDetails('unknown'), null);
});

test('generateRequestText creates letter with required fields', () => {
  const text = generateRequestText({
    requestorName: 'Jane Smith',
    requestorAddress: '10 Downing Street, London',
    organisationName: 'City Hospital NHS Trust',
    format: 'braille',
    documents: ['Patient Leaflet', 'Consent Form'],
    deadline: '2026-08-01',
    reason: 'Visual impairment'
  });
  assert.equal(typeof text, 'string');
  assert.ok(text.includes('Jane Smith'));
  assert.ok(text.includes('10 Downing Street, London'));
  assert.ok(text.includes('City Hospital NHS Trust'));
  assert.ok(text.includes('braille') || text.includes('Braille'));
  assert.ok(text.includes('Patient Leaflet'));
  assert.ok(text.includes('Consent Form'));
  assert.ok(text.includes('2026-08-01'));
  assert.ok(text.includes('Visual impairment'));
});

test('generateRequestText includes Equality Act reference', () => {
  const text = generateRequestText({
    requestorName: 'Bob',
    requestorAddress: '1 Street',
    organisationName: 'Trust',
    format: 'large-print',
    documents: ['Doc'],
    deadline: '2026-09-01',
    reason: 'Low vision'
  });
  assert.ok(text.includes('Equality Act'));
});

test('getFormatRequirements returns requirements for braille', () => {
  const reqs = getFormatRequirements('braille');
  assert.ok(Array.isArray(reqs));
  assert.ok(reqs.length > 0);
  const text = reqs.join(' ').toLowerCase();
  assert.ok(text.includes('grade 2') || text.includes('braille'));
});

test('getFormatRequirements returns requirements for easy-read', () => {
  const reqs = getFormatRequirements('easy-read');
  assert.ok(Array.isArray(reqs));
  assert.ok(reqs.length > 0);
  const text = reqs.join(' ').toLowerCase();
  assert.ok(text.includes('mencap') || text.includes('easy read') || text.includes('simplified'));
});

test('getFormatRequirements returns empty array for unknown format', () => {
  assert.deepEqual(getFormatRequirements('unknown'), []);
});

test('getOrganisationRoutes returns RNIB for braille', () => {
  const route = getOrganisationRoutes('braille');
  assert.ok(route);
  assert.ok(route.name.includes('RNIB'));
});

test('getOrganisationRoutes returns Mencap for easy-read', () => {
  const route = getOrganisationRoutes('easy-read');
  assert.ok(route);
  assert.ok(route.name.includes('Mencap'));
});

test('getOrganisationRoutes returns RNID for BSL', () => {
  const route = getOrganisationRoutes('bsl');
  assert.ok(route);
  assert.ok(route.name.includes('RNID'));
});

test('getOrganisationRoutes returns null for unknown format', () => {
  assert.equal(getOrganisationRoutes('unknown'), null);
});

test('getEqualityActRights returns rights information', () => {
  const rights = getEqualityActRights();
  assert.ok(rights);
  assert.ok(rights.title);
  assert.ok(rights.description);
  assert.ok(Array.isArray(rights.rights));
  assert.ok(rights.rights.length > 0);
  const text = JSON.stringify(rights).toLowerCase();
  assert.ok(text.includes('equality act') || text.includes('2010'));
});

test('getEqualityActRights mentions reasonable adjustments', () => {
  const rights = getEqualityActRights();
  const text = JSON.stringify(rights).toLowerCase();
  assert.ok(text.includes('reasonable adjustment'));
});

test('getMonitoringInfo returns commission details', () => {
  const info = getMonitoringInfo();
  assert.ok(info);
  assert.ok(info.name);
  assert.ok(info.description);
  const text = JSON.stringify(info).toLowerCase();
  assert.ok(text.includes('equality') || text.includes('human rights'));
});

test('serializeAccessibleFormats produces JSON string', () => {
  const data = [{ id: 'test', name: 'Test' }];
  const serialized = serializeAccessibleFormats(data);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 1);
});

test('parseAccessibleFormats parses valid JSON', () => {
  const data = [{ id: 'braille' }];
  const json = JSON.stringify(data);
  const result = parseAccessibleFormats(json);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'braille');
});

test('parseAccessibleFormats returns empty array for invalid JSON', () => {
  assert.deepEqual(parseAccessibleFormats('not-json'), []);
});

test('parseAccessibleFormats returns empty array for non-array JSON', () => {
  assert.deepEqual(parseAccessibleFormats('{"foo":"bar"}'), []);
});

test('parseAccessibleFormats returns empty array for empty string', () => {
  assert.deepEqual(parseAccessibleFormats(''), []);
});

test('serialize and parse roundtrip', () => {
  const data = [{ id: 'braille' }, { id: 'audio' }];
  const roundtripped = parseAccessibleFormats(serializeAccessibleFormats(data));
  assert.equal(roundtripped.length, 2);
  assert.equal(roundtripped[0].id, 'braille');
  assert.equal(roundtripped[1].id, 'audio');
});
