import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ISSUE_CATEGORIES,
  CASE_STATUS,
  EVIDENCE_TYPES,
  JOURNEY_TOOLS,
  createCase,
  parseCase,
  serializeCase,
  parseCaseList,
  serializeCaseList,
  getStatusMeta,
  getIssueMeta,
  getEvidenceTypeMeta,
  getJourneyToolMeta,
  buildSummary,
  buildStatusBreakdown,
  addEvidence,
  removeEvidence,
  addLetter,
  removeLetter,
  addJourneyStep,
  removeJourneyStep,
  suggestJourney,
  buildCaseFile,
  parseCaseFile,
  buildCaseMarkdown,
  buildEvidenceManifest,
  buildTimelineMarkdown,
  buildHandoffPack,
  buildCaseJsonExport
} from '../src/builder.js';
import { buildExportList, groupByType, buildCombinedMarkdown } from '../src/export-hub.js';

test('createCase produces a valid case with defaults', () => {
  const c = createCase({ title: 'Test case' });
  assert.equal(c.title, 'Test case');
  assert.equal(c.status, 'planning');
  assert.equal(c.issueCategory, 'other');
  assert.ok(c.id.startsWith('case-'));
  assert.ok(c.createdAt);
  assert.ok(c.evidence);
  assert.ok(c.letters);
  assert.ok(c.journey);
});

test('serializeCase and parseCase round-trip', () => {
  const original = createCase({ title: 'Test', organisation: 'Org' });
  const serialized = serializeCase(original);
  const parsed = parseCase(serialized);
  assert.deepEqual(parsed.organisation, 'Org');
  assert.equal(parsed.title, 'Test');
});

test('parseCase returns null for invalid JSON', () => {
  assert.equal(parseCase('not json'), null);
  assert.equal(parseCase(''), null);
});

test('parseCaseList handles empty and invalid input', () => {
  assert.deepEqual(parseCaseList(''), []);
  assert.deepEqual(parseCaseList('not json'), []);
  assert.deepEqual(parseCaseList('"a string"'), []);
});

test('parseCaseList parses valid list', () => {
  const list = [createCase({ title: 'A' }), createCase({ title: 'B' })];
  const serialized = serializeCaseList(list);
  const parsed = parseCaseList(serialized);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].title, 'A');
});

test('getStatusMeta returns known and fallback status', () => {
  assert.equal(getStatusMeta('sent').value, 'sent');
  assert.equal(getStatusMeta('unknown').value, 'planning');
});

test('getIssueMeta returns known and fallback category', () => {
  assert.equal(getIssueMeta('access').value, 'access');
  assert.equal(getIssueMeta('unknown').value, 'other');
});

test('getEvidenceTypeMeta returns known and fallback type', () => {
  assert.equal(getEvidenceTypeMeta('email').value, 'email');
  assert.equal(getEvidenceTypeMeta('unknown').value, 'document');
});

test('getJourneyToolMeta returns known and fallback tool', () => {
  assert.equal(getJourneyToolMeta('letter-generator').value, undefined);
  assert.equal(getJourneyToolMeta('unknown').id, 'letter-generator');
});

test('CASE_STATUS includes all expected statuses', () => {
  const values = CASE_STATUS.map((s) => s.value);
  for (const expected of [
    'planning',
    'drafting',
    'sent',
    'awaiting',
    'overdue',
    'escalated',
    'resolved',
    'closed'
  ]) {
    assert.ok(values.includes(expected), `missing status ${expected}`);
  }
});

test('ISSUE_CATEGORIES includes all expected categories', () => {
  const values = ISSUE_CATEGORIES.map((c) => c.value);
  for (const expected of [
    'access',
    'complaint',
    'foi',
    'sar',
    'housing',
    'consumer',
    'travel',
    'employment',
    'education',
    'health',
    'other'
  ]) {
    assert.ok(values.includes(expected), `missing category ${expected}`);
  }
});

test('EVIDENCE_TYPES includes all expected types', () => {
  const values = EVIDENCE_TYPES.map((t) => t.value);
  for (const expected of [
    'document',
    'email',
    'letter',
    'photo',
    'screenshot',
    'call-log',
    'form',
    'invoice',
    'other'
  ]) {
    assert.ok(values.includes(expected), `missing type ${expected}`);
  }
});

test('JOURNEY_TOOLS includes expected tool ids', () => {
  const ids = JOURNEY_TOOLS.map((t) => t.id);
  for (const expected of [
    'letter-generator',
    'public-service-directory',
    'legal-templates',
    'foi-tracker'
  ]) {
    assert.ok(ids.includes(expected), `missing tool ${expected}`);
  }
});

test('buildSummary counts cases by status', () => {
  const cases = [
    createCase({ status: 'planning' }),
    createCase({ status: 'sent' }),
    createCase({ status: 'escalated' }),
    createCase({ status: 'resolved' }),
    createCase({ status: 'closed' })
  ];
  const summary = buildSummary(cases);
  assert.equal(summary.total, 5);
  assert.equal(summary.active, 3);
  assert.equal(summary.escalated, 1);
  assert.equal(summary.resolved, 2);
});

test('buildStatusBreakdown counts each status', () => {
  const cases = [
    createCase({ status: 'planning' }),
    createCase({ status: 'planning' }),
    createCase({ status: 'resolved' })
  ];
  const breakdown = buildStatusBreakdown(cases);
  assert.equal(breakdown.planning, 2);
  assert.equal(breakdown.resolved, 1);
  assert.equal(breakdown.closed, 0);
});

test('addEvidence adds an evidence item', () => {
  const c = createCase({ title: 'Test' });
  const updated = addEvidence(c, { type: 'email', title: 'Test email' });
  assert.equal(updated.evidence.length, 1);
  assert.equal(updated.evidence[0].title, 'Test email');
  assert.equal(updated.evidence[0].type, 'email');
});

test('removeEvidence removes an evidence item', () => {
  const c = createCase({ title: 'Test' });
  const withEv = addEvidence(c, { type: 'email', title: 'Test' });
  const removed = removeEvidence(withEv, withEv.evidence[0].id);
  assert.equal(removed.evidence.length, 0);
});

test('addLetter adds a letter', () => {
  const c = createCase({ title: 'Test' });
  const updated = addLetter(c, { type: 'FOI', subject: 'Test subject', body: 'Body' });
  assert.equal(updated.letters.length, 1);
  assert.equal(updated.letters[0].subject, 'Test subject');
});

test('removeLetter removes a letter', () => {
  const c = createCase({ title: 'Test' });
  const withLetter = addLetter(c, { subject: 'Test' });
  const removed = removeLetter(withLetter, withLetter.letters[0].id);
  assert.equal(removed.letters.length, 0);
});

test('addJourneyStep adds a step', () => {
  const c = createCase({ title: 'Test' });
  const updated = addJourneyStep(c, { tool: 'letter-generator', note: 'Draft initial' });
  assert.equal(updated.journey.length, 1);
  assert.equal(updated.journey[0].tool, 'letter-generator');
});

test('removeJourneyStep removes a step', () => {
  const c = createCase({ title: 'Test' });
  const withStep = addJourneyStep(c, { tool: 'letter-generator' });
  const removed = removeJourneyStep(withStep, withStep.journey[0].id);
  assert.equal(removed.journey.length, 0);
});

test('suggestJourney returns steps for access category', () => {
  const steps = suggestJourney('access');
  assert.ok(steps.length >= 2);
  assert.ok(steps.some((s) => s.tool === 'letter-generator'));
});

test('suggestJourney returns steps for FOI category', () => {
  const steps = suggestJourney('foi');
  assert.ok(steps.some((s) => s.tool === 'foi-tracker'));
});

test('suggestJourney returns fallback for unknown category', () => {
  const steps = suggestJourney('unknown');
  assert.ok(steps.length >= 2);
});

test('buildCaseFile wraps case in schema envelope', () => {
  const c = createCase({ title: 'Test' });
  const file = buildCaseFile(c);
  assert.equal(file.schema, 'open-access-uk:case:v1');
  assert.equal(file.case.title, 'Test');
});

test('parseCaseFile reads schema envelope', () => {
  const c = createCase({ title: 'Test' });
  const file = buildCaseFile(c);
  const json = JSON.stringify(file);
  const parsed = parseCaseFile(json);
  assert.equal(parsed.title, 'Test');
});

test('parseCaseFile reads plain case object', () => {
  const c = createCase({ title: 'Test' });
  const json = JSON.stringify(c);
  const parsed = parseCaseFile(json);
  assert.equal(parsed.title, 'Test');
});

test('parseCaseFile returns null for invalid', () => {
  assert.equal(parseCaseFile('not json'), null);
  assert.equal(parseCaseFile('{}'), null);
});

test('buildCaseMarkdown includes all sections', () => {
  const c = createCase({
    title: 'Test case',
    issueCategory: 'foi',
    status: 'sent',
    organisation: 'Test Council',
    description: 'Test description',
    sentDate: '2026-06-01'
  });
  const md = buildCaseMarkdown(c);
  assert.match(md, /Test case/);
  assert.match(md, /Freedom of Information/);
  assert.match(md, /Test Council/);
  assert.match(md, /Test description/);
  assert.match(md, /2026-06-01/);
  assert.match(md, /Evidence/);
  assert.match(md, /Letters/);
  assert.match(md, /Journey/);
});

test('buildCaseMarkdown includes evidence items', () => {
  const c = createCase({ title: 'Test' });
  const withEv = addEvidence(c, { type: 'email', title: 'Test email', date: '2026-06-01' });
  const md = buildCaseMarkdown(withEv);
  assert.match(md, /Test email/);
  assert.match(md, /2026-06-01/);
});

test('buildCaseMarkdown includes letter bodies', () => {
  const c = createCase({ title: 'Test' });
  const withLetter = addLetter(c, {
    type: 'FOI',
    subject: 'Test subject',
    body: 'Test body content'
  });
  const md = buildCaseMarkdown(withLetter);
  assert.match(md, /Test subject/);
  assert.match(md, /Test body content/);
});

test('buildCaseMarkdown includes journey steps', () => {
  const c = createCase({ title: 'Test' });
  const withStep = addJourneyStep(c, { tool: 'letter-generator', note: 'Draft' });
  const md = buildCaseMarkdown(withStep);
  assert.match(md, /Public-Service Letter Generator/);
  assert.match(md, /Draft/);
});

test('buildEvidenceManifest produces a table', () => {
  const c = createCase({ title: 'Test' });
  const withEv = addEvidence(c, { type: 'email', title: 'Email 1', date: '2026-06-01' });
  const withEv2 = addEvidence(withEv, { type: 'document', title: 'Doc 1' });
  const manifest = buildEvidenceManifest(withEv2);
  assert.match(manifest, /Total items: 2/);
  assert.match(manifest, /Email 1/);
  assert.match(manifest, /Doc 1/);
  assert.match(manifest, /\| # \| Type \|/);
});

test('buildEvidenceManifest handles empty evidence', () => {
  const c = createCase({ title: 'Test' });
  const manifest = buildEvidenceManifest(c);
  assert.match(manifest, /Total items: 0/);
});

test('buildTimelineMarkdown sorts events by date', () => {
  const c = createCase({
    title: 'Test',
    sentDate: '2026-06-01',
    responseDate: '2026-06-15'
  });
  const withLetter = addLetter(c, { sentDate: '2026-06-05', subject: 'Follow-up' });
  const timeline = buildTimelineMarkdown(withLetter);
  const sentIdx = timeline.indexOf('Request sent');
  const letterIdx = timeline.indexOf('Follow-up');
  const responseIdx = timeline.indexOf('Response received');
  assert.ok(sentIdx > 0);
  assert.ok(letterIdx > sentIdx);
  assert.ok(responseIdx > letterIdx);
});

test('buildTimelineMarkdown handles empty case', () => {
  const c = createCase({ title: 'Test' });
  const timeline = buildTimelineMarkdown(c);
  assert.match(timeline, /No timeline events/);
});

test('buildHandoffPack includes all sections', () => {
  const c = createCase({ title: 'Test', organisation: 'Org' });
  const pack = buildHandoffPack(c);
  assert.match(pack, /Case pack/);
  assert.match(pack, /## Summary/);
  assert.match(pack, /Evidence manifest/);
  assert.match(pack, /Timeline/);
  assert.match(pack, /Test/);
});

test('buildCaseJsonExport returns valid JSON', () => {
  const c = createCase({ title: 'Test' });
  const json = buildCaseJsonExport(c);
  const parsed = JSON.parse(json);
  assert.equal(parsed.schema, 'open-access-uk:case:v1');
  assert.equal(parsed.case.title, 'Test');
});

test('buildExportList includes all standard exports', () => {
  const c = createCase({ title: 'Test', organisation: 'Org' });
  const exports = buildExportList(c);
  const ids = exports.map((e) => e.id);
  assert.ok(ids.includes('case-markdown'));
  assert.ok(ids.includes('evidence-manifest'));
  assert.ok(ids.includes('timeline'));
  assert.ok(ids.includes('handoff-pack'));
  assert.ok(ids.includes('case-json'));
  assert.ok(ids.includes('evidence-json'));
});

test('buildExportList includes letter exports', () => {
  const c = createCase({ title: 'Test' });
  const withLetter = addLetter(c, { subject: 'Test letter', body: 'Body' });
  const exports = buildExportList(withLetter);
  const letterExports = exports.filter((e) => e.id.startsWith('letter-'));
  assert.equal(letterExports.length, 1);
  assert.match(letterExports[0].filename, /letter/);
});

test('groupByType groups exports by mime type', () => {
  const c = createCase({ title: 'Test' });
  const exports = buildExportList(c);
  const groups = groupByType(exports);
  assert.ok(groups.markdown.length > 0);
  assert.ok(groups.json.length > 0);
});

test('buildCombinedMarkdown produces a combined file', () => {
  const c = createCase({ title: 'Test' });
  const exports = buildExportList(c);
  const combined = buildCombinedMarkdown(exports);
  assert.match(combined, /Combined case export/);
  assert.match(combined, /Case summary/);
  assert.match(combined, /Evidence manifest/);
});
