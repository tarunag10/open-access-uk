import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRegulators,
  getRegulatorDetails,
  generateComplaintText,
  getComplaintDeadlines,
  getFitnessToPractiseProcess,
  getComplaintCategories,
  serializeProfessionalComplaints,
  parseProfessionalComplaints
} from '../src/tracker.js';

test('getRegulators returns all 8 regulators', () => {
  const regulators = getRegulators();
  assert.equal(regulators.length, 8);
});

test('getRegulators includes GMC', () => {
  const regulators = getRegulators();
  const gmc = regulators.find(r => r.id === 'GMC');
  assert.ok(gmc);
  assert.equal(gmc.profession, 'Doctors');
});

test('getRegulators returns a copy', () => {
  const a = getRegulators();
  const b = getRegulators();
  assert.notEqual(a, b);
});

test('getRegulatorDetails returns full details for GMC', () => {
  const details = getRegulatorDetails('GMC');
  assert.equal(details.id, 'GMC');
  assert.equal(details.name, 'General Medical Council');
  assert.equal(details.profession, 'Doctors');
  assert.equal(details.fitnessToPractise, true);
});

test('getRegulatorDetails returns null for unknown', () => {
  assert.equal(getRegulatorDetails('UNKNOWN'), null);
});

test('generateComplaintText generates a letter with all fields', () => {
  const data = {
    complainantName: 'Jane Smith',
    professionalName: 'Dr John Doe',
    professionalAddress: '123 Medical St, London',
    regulator: 'GMC',
    complaintType: 'Clinical Negligence',
    descriptionOfConcern: 'Misdiagnosis',
    desiredOutcome: 'Investigation and apology'
  };
  const text = generateComplaintText(data);
  assert.ok(text.includes('Jane Smith'));
  assert.ok(text.includes('Dr John Doe'));
  assert.ok(text.includes('General Medical Council'));
  assert.ok(text.includes('Clinical Negligence'));
  assert.ok(text.includes('Misdiagnosis'));
  assert.ok(text.includes('Investigation and apology'));
});

test('generateComplaintText throws when required fields are missing', () => {
  assert.throws(() => generateComplaintText({}), /complainantName is required/);
  assert.throws(() => generateComplaintText({ complainantName: 'X' }), /professionalName is required/);
});

test('generateComplaintText uses "Not specified" for unknown regulator', () => {
  const text = generateComplaintText({ complainantName: 'Test', professionalName: 'Test', regulator: 'UNKNOWN' });
  assert.ok(text.includes('Not specified'));
});

test('getComplaintDeadlines returns deadline info for GMC', () => {
  const deadlines = getComplaintDeadlines('GMC');
  assert.ok(deadlines);
  assert.equal(deadlines.regulatorId, 'GMC');
  assert.ok(deadlines.note);
});

test('getComplaintDeadlines returns null for unknown regulator', () => {
  assert.equal(getComplaintDeadlines('UNKNOWN'), null);
});

test('getFitnessToPractiseProcess returns steps for GMC', () => {
  const process = getFitnessToPractiseProcess('GMC');
  assert.ok(Array.isArray(process));
  assert.ok(process.length > 0);
  assert.ok(process.every(s => s.name && s.description));
});

test('getFitnessToPractiseProcess returns empty array for LeO', () => {
  const process = getFitnessToPractiseProcess('LeO');
  assert.ok(Array.isArray(process));
  assert.equal(process.length, 0);
});

test('getFitnessToPractiseProcess returns empty array for unknown', () => {
  const process = getFitnessToPractiseProcess('UNKNOWN');
  assert.equal(process.length, 0);
});

test('getComplaintCategories returns categories for GMC', () => {
  const categories = getComplaintCategories('GMC');
  assert.ok(Array.isArray(categories));
  assert.ok(categories.includes('conduct'));
  assert.ok(categories.includes('performance'));
  assert.ok(categories.includes('health'));
  assert.ok(categories.includes('dishonesty'));
});

test('getComplaintCategories returns categories for LeO', () => {
  const categories = getComplaintCategories('LeO');
  assert.ok(categories.includes('service'));
  assert.ok(categories.includes('delay'));
});

test('getComplaintCategories returns empty array for unknown', () => {
  assert.equal(getComplaintCategories('UNKNOWN').length, 0);
});

test('serializeProfessionalComplaints / parseProfessionalComplaints round-trip', () => {
  const complaints = [
    { id: 'pc-1', regulator: 'GMC', status: 'open' },
    { id: 'pc-2', regulator: 'SRA', status: 'closed' }
  ];
  const serialized = serializeProfessionalComplaints(complaints);
  const parsed = parseProfessionalComplaints(serialized);
  assert.deepEqual(parsed, complaints);
});

test('parseProfessionalComplaints returns empty array for invalid input', () => {
  assert.deepEqual(parseProfessionalComplaints(null), []);
  assert.deepEqual(parseProfessionalComplaints(123), []);
  assert.deepEqual(parseProfessionalComplaints('not-json'), []);
  assert.deepEqual(parseProfessionalComplaints('{"a":1}'), []);
});
