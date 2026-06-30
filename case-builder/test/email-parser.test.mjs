import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseEmailToCase,
  renderParsedData,
  addToCaseFromEmail,
  getParseConfidence,
  generateCaseSummaryFromEmail,
  serializeEmailDraft,
  parseEmailDraft
} from '../src/email-parser.js';
import { createCase } from '../src/builder.js';

const SAMPLE_EMAIL = `From: housing@council.example.gov.uk
To: citizen@example.com
Subject: RE: Repair request — REF/2026/12345
Date: 15 June 2026

Dear Mr Smith,

Thank you for your repair request regarding the damp issue at 45 Test Road.

Your reference: REF/2026/12345
Case number: CASE-2026-67890

We will investigate this matter within 20 working days.
Please note the deadline by 10/07/2026.

Next steps: You should provide photographic evidence of the damp patches.
Please also arrange for aGP letter documenting any health impacts.

Kind regards,
Jane Doe
Housing Department
Tel: 020 7946 0000
Email: housing@council.example.gov.uk`;

test('parseEmailToCase returns a valid case object', () => {
  const result = parseEmailToCase(SAMPLE_EMAIL);
  assert.ok(result, 'returns a case');
  assert.ok(result.id, 'case has id');
  assert.ok(result.title.includes('REF/2026/12345'), 'title includes reference');
  assert.equal(result.issueCategory, 'other');
  assert.equal(result.organisation, 'Jane Doe');
});

test('parseEmailToCase returns null for empty input', () => {
  assert.equal(parseEmailToCase(''), null);
  assert.equal(parseEmailToCase(null), null);
  assert.equal(parseEmailToCase(undefined), null);
});

test('parseEmailToCase extracts references into notes', () => {
  const result = parseEmailToCase(SAMPLE_EMAIL);
  assert.ok(result.notes.includes('REF/2026/12345'), 'notes include reference');
  assert.ok(result.notes.includes('CASE-2026-67890'), 'notes include case number');
});

test('parseEmailToCase sets deadline from date pattern', () => {
  const result = parseEmailToCase(SAMPLE_EMAIL);
  assert.ok(result.deadline, 'deadline is set');
});

test('renderParsedData returns HTML string', () => {
  const html = renderParsedData({
    references: ['REF/2026/12345'],
    deadlines: [{ type: 'date', date: '10/07/2026' }],
    authority: 'Council Housing',
    nextSteps: ['Provide photos'],
    dates: [{ date: '15/06/2026', event: 'Email sent' }]
  });
  assert.ok(html.includes('REF/2026/12345'));
  assert.ok(html.includes('Council Housing'));
  assert.ok(html.includes('Provide photos'));
  assert.ok(html.startsWith('<dl>'));
});

test('renderParsedData handles empty data', () => {
  const html = renderParsedData({
    references: [],
    deadlines: [],
    authority: '',
    nextSteps: [],
    dates: []
  });
  assert.ok(html.includes('No key information'));
});

test('renderParsedData returns fallback for null', () => {
  const html = renderParsedData(null);
  assert.ok(html.includes('No parsed data'));
});

test('addToCaseFromEmail merges into existing case', () => {
  const existing = createCase({ title: 'Test case', organisation: '' });
  const parsed = {
    references: ['REF-999'],
    deadlines: [],
    authority: 'Test Council',
    nextSteps: [],
    dates: []
  };
  const merged = addToCaseFromEmail(parsed, existing);
  assert.equal(merged.organisation, 'Test Council');
  assert.ok(merged.notes.includes('REF-999'));
  assert.ok(merged.evidence.length > 0, 'evidence added');
});

test('addToCaseFromEmail does not overwrite existing organisation', () => {
  const existing = createCase({ title: 'Test', organisation: 'Existing Org' });
  const parsed = { references: [], deadlines: [], authority: 'New Org', nextSteps: [], dates: [] };
  const merged = addToCaseFromEmail(parsed, existing);
  assert.equal(merged.organisation, 'Existing Org');
});

test('addToCaseFromEmail returns original case when no parsed data', () => {
  const existing = createCase({ title: 'Test' });
  const result = addToCaseFromEmail(null, existing);
  assert.equal(result.id, existing.id);
});

test('getParseConfidence returns 0 for null', () => {
  assert.equal(getParseConfidence(null), 0);
});

test('getParseConfidence returns full score for all fields', () => {
  const score = getParseConfidence({
    references: ['REF-1'],
    authority: 'Council',
    deadlines: [{ type: 'date', date: '01/01/2026' }],
    nextSteps: ['Do something'],
    dates: [{ date: '01/01/2026', event: 'Event' }]
  });
  assert.equal(score, 100);
});

test('getParseConfidence returns partial score', () => {
  const score = getParseConfidence({
    references: ['REF-1'],
    authority: '',
    deadlines: [],
    nextSteps: [],
    dates: []
  });
  assert.equal(score, 30);
});

test('generateCaseSummaryFromEmail returns plain text', () => {
  const summary = generateCaseSummaryFromEmail({
    references: ['REF-1'],
    authority: 'Test Council',
    deadlines: [{ type: 'date', date: '01/01/2026' }],
    nextSteps: ['Provide evidence'],
    dates: [{ date: '15/06/2026', event: 'Email received' }]
  });
  assert.ok(summary.includes('Email Import Summary'));
  assert.ok(summary.includes('Test Council'));
  assert.ok(summary.includes('REF-1'));
  assert.ok(summary.includes('Provide evidence'));
});

test('generateCaseSummaryFromEmail handles null', () => {
  const summary = generateCaseSummaryFromEmail(null);
  assert.ok(summary.includes('No email data'));
});

test('serializeEmailDraft and parseEmailDraft round-trip', () => {
  const draft = { emailText: 'test content', timestamp: '2026-06-15' };
  const serialized = serializeEmailDraft(draft);
  assert.equal(typeof serialized, 'string');
  const parsed = parseEmailDraft(serialized);
  assert.deepEqual(parsed, draft);
});

test('parseEmailDraft returns null for invalid JSON', () => {
  assert.equal(parseEmailDraft('not json'), null);
  assert.equal(parseEmailDraft(null), null);
});

test('parseEmailDraft returns null for non-object', () => {
  assert.equal(parseEmailDraft('"just a string"'), null);
  assert.equal(parseEmailDraft('42'), null);
});
