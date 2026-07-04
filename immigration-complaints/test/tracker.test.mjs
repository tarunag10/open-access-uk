import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLAINT_TYPES,
  typeById,
  calculateDaysRemaining,
  filterByType,
  renderComplaintCard,
  getComplaintTypes,
  getComplaintDeadlines,
  generateComplaintText,
  getEscalationRoute,
  getRequiredDocuments,
  generateICIBIText,
  getHomeOfficeContactInfo,
  serializeImmigration,
  parseImmigration
} from '../src/tracker.js';

test('COMPLAINT_TYPES includes all expected types', () => {
  const ids = COMPLAINT_TYPES.map((t) => t.id);
  for (const expected of [
    'visa-delay',
    'brp-issue',
    'sponsorship-complaint',
    'right-to-rent',
    'asylum-support',
    'immigration-detention'
  ]) {
    assert.ok(ids.includes(expected), `missing complaint type ${expected}`);
  }
});

test('typeById returns correct type', () => {
  const type = typeById('visa-delay');
  assert.ok(type);
  assert.equal(type.name, 'Visa Processing Delay');
});

test('typeById returns null for unknown id', () => {
  assert.equal(typeById('unknown'), null);
});

test('getComplaintTypes returns all types', () => {
  const types = getComplaintTypes();
  assert.equal(types.length, 6);
});

test('getComplaintDeadlines returns deadline for visa-delay', () => {
  const result = getComplaintDeadlines('visa-delay', '2026-06-01');
  assert.ok(result);
  assert.equal(result.type, 'visa-delay');
  assert.equal(result.deadlineWorkingDays, 20);
  assert.ok(result.deadlineDate);
  assert.equal(result.startDate, '2026-06-01');
});

test('getComplaintDeadlines returns null when no start date', () => {
  assert.equal(getComplaintDeadlines('visa-delay', ''), null);
  assert.equal(getComplaintDeadlines('visa-delay', null), null);
});

test('getComplaintDeadlines returns null for unknown type', () => {
  assert.equal(getComplaintDeadlines('unknown', '2026-06-01'), null);
});

test('generateComplaintText produces valid letter', () => {
  const text = generateComplaintText({
    complainantName: 'Jane Smith',
    type: 'visa-delay',
    complainantAddress: '10 Downing Street, London',
    applicationReference: 'GWF123456789',
    dateSubmitted: '2026-01-15',
    descriptionOfIssue: 'Visa delayed by 3 months',
    desiredOutcome: 'Expedited processing'
  });
  assert.match(text, /Jane Smith/);
  assert.match(text, /Visa Processing Delay/);
  assert.match(text, /GWF123456789/);
  assert.match(text, /2026-01-15/);
  assert.match(text, /Visa delayed by 3 months/);
  assert.match(text, /Expedited processing/);
  assert.match(text, /COMPLAINT TO THE HOME OFFICE/);
});

test('generateComplaintText throws on missing complainantName', () => {
  assert.throws(() => generateComplaintText({ type: 'visa-delay' }), /complainantName is required/);
});

test('generateComplaintText throws on missing type', () => {
  assert.throws(() => generateComplaintText({ complainantName: 'Test' }), /type is required/);
});

test('getEscalationRoute returns three steps', () => {
  const route = getEscalationRoute('visa-delay');
  assert.ok(route);
  assert.equal(route.length, 3);
  assert.equal(route[0], 'Home Office');
  assert.equal(route[1], 'ICIBI');
  assert.equal(route[2], 'Parliamentary Ombudsman');
});

test('getEscalationRoute returns null for unknown type', () => {
  assert.equal(getEscalationRoute('unknown'), null);
});

test('getRequiredDocuments returns documents for visa-delay', () => {
  const docs = getRequiredDocuments('visa-delay');
  assert.ok(docs);
  assert.ok(docs.length > 0);
  assert.ok(docs.some((d) => d.includes('visa application')));
});

test('getRequiredDocuments returns null for unknown type', () => {
  assert.equal(getRequiredDocuments('unknown'), null);
});

test('generateICIBIText produces valid escalation letter', () => {
  const text = generateICIBIText({
    complainantName: 'Jane Smith',
    originalComplaintDate: '2026-01-15',
    homeOfficeReference: 'HO-REF-001',
    complaintType: 'Visa Processing Delay',
    summary: 'Visa still not processed after 3 months'
  });
  assert.match(text, /Jane Smith/);
  assert.match(text, /ICIBI COMPLAINT ESCALATION/);
  assert.match(text, /HO-REF-001/);
  assert.match(text, /Visa still not processed/);
});

test('generateICIBIText throws on missing complainantName', () => {
  assert.throws(() => generateICIBIText({}), /complainantName is required/);
});

test('getHomeOfficeContactInfo returns contacts for visa-delay', () => {
  const info = getHomeOfficeContactInfo('visa-delay');
  assert.ok(info);
  assert.ok(info.email);
  assert.ok(info.phone);
  assert.ok(info.post);
});

test('getHomeOfficeContactInfo returns null for unknown type', () => {
  assert.equal(getHomeOfficeContactInfo('unknown'), null);
});

test('serializeImmigration and parseImmigration round-trip', () => {
  const list = [
    { id: '1', complainantName: 'A' },
    { id: '2', complainantName: 'B' }
  ];
  const serialized = serializeImmigration(list);
  const parsed = parseImmigration(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].complainantName, 'A');
  assert.equal(parsed[1].complainantName, 'B');
});

test('parseImmigration handles empty and invalid input', () => {
  assert.deepEqual(parseImmigration(''), []);
  assert.deepEqual(parseImmigration(null), []);
  assert.deepEqual(parseImmigration(undefined), []);
  assert.deepEqual(parseImmigration('not json'), []);
  assert.deepEqual(parseImmigration('"a string"'), []);
});

test('calculateDaysRemaining returns null when no date', () => {
  assert.equal(calculateDaysRemaining('', 'visa-delay'), null);
  assert.equal(calculateDaysRemaining(null, 'visa-delay'), null);
});

test('calculateDaysRemaining returns positive for recent date', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-06-10', 'visa-delay', today);
  assert.ok(days !== null);
  assert.ok(days > 0, `expected positive days, got ${days}`);
});

test('calculateDaysRemaining returns negative for overdue', () => {
  const today = new Date('2026-06-15');
  const days = calculateDaysRemaining('2026-01-01', 'visa-delay', today);
  assert.ok(days < 0, `expected negative days, got ${days}`);
});

test('filterByType filters complaints', () => {
  const complaints = [
    { id: '1', complaintType: 'visa-delay' },
    { id: '2', complaintType: 'brp-issue' },
    { id: '3', complaintType: 'visa-delay' }
  ];
  const filtered = filterByType(complaints, 'visa-delay');
  assert.equal(filtered.length, 2);
  assert.ok(filtered.every((c) => c.complaintType === 'visa-delay'));
});

test('filterByType returns all when no type specified', () => {
  const complaints = [
    { id: '1', complaintType: 'visa-delay' },
    { id: '2', complaintType: 'brp-issue' }
  ];
  assert.equal(filterByType(complaints, null).length, 2);
  assert.equal(filterByType(complaints, '').length, 2);
});

test('renderComplaintCard returns HTML with key elements', () => {
  const c = {
    id: 'cmp-test',
    complainantName: 'Jane Smith',
    complaintType: 'visa-delay',
    dateSubmitted: '2026-06-01',
    description: 'Visa processing delay'
  };
  const html = renderComplaintCard(c);
  assert.match(html, /Jane Smith/);
  assert.match(html, /Visa Processing Delay/);
  assert.match(html, /2026-06-01/);
  assert.match(html, /data-action="view"/);
  assert.match(html, /data-action="delete"/);
});
