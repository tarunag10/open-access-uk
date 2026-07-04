import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAdviserPack,
  generateCaseSummary,
  safeFilename,
  createTextExport
} from './index.mjs';

test('generateAdviserPack produces HTML with case data', () => {
  const caseObj = {
    title: 'My Housing Case',
    jurisdiction: 'england',
    parties: [{ role: 'tenant', name: 'Alice' }],
    events: [{ date: '2026-06-01', type: 'notice-served', summary: 'Section 21 notice' }],
    deadlines: [
      { ruleId: 'et-claim', startDate: '2026-06-01', targetDate: '2026-09-01', status: 'pending' }
    ],
    documents: [{ name: 'Photo', kind: 'evidence', addedAt: '2026-06-02' }],
    letters: [{ toolId: 'eviction', templateId: 'challenge', renderedAt: '2026-06-03', fields: {} }]
  };
  const pack = generateAdviserPack(caseObj);
  assert.ok(pack);
  assert.ok(pack.html.includes('My Housing Case'));
  assert.ok(pack.html.includes('notice'));
});

test('generateAdviserPack returns null for no case', () => {
  assert.equal(generateAdviserPack(null), null);
});

test('generateCaseSummary includes case title', () => {
  const s = generateCaseSummary({
    title: 'Test',
    events: [],
    deadlines: [],
    documents: [],
    letters: []
  });
  assert.ok(s.includes('Test'));
  assert.ok(s.includes('Not legal advice'));
});

test('safeFilename creates safe filenames', () => {
  assert.equal(safeFilename('FOI / Council', 'md'), 'foi-council.md');
  assert.equal(safeFilename('test', 'txt'), 'test.txt');
});

test('createTextExport creates export object', () => {
  const e = createTextExport('Letter', 'Hello', { extension: 'txt' });
  assert.equal(e.filename, 'letter.txt');
  assert.equal(e.content, 'Hello\n');
});
