import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suiteIndex, searchSuite } from './index.mjs';

test('suiteIndex contains entries for all five tools', () => {
  const tools = new Set(suiteIndex.filter((e) => e.kind === 'tool').map((e) => e.id));
  for (const id of [
    'letter-generator',
    'accessible-forms',
    'public-service-directory',
    'legal-templates',
    'design-system'
  ]) {
    assert.ok(tools.has(id), `missing tool ${id}`);
  }
});

test('searchSuite matches by title and keywords, ranked', () => {
  const results = searchSuite('letter');
  assert.ok(results.length > 0);
  assert.equal(results[0].kind, 'tool');
  assert.equal(results[0].id, 'letter-generator');
});

test('searchSuite is case-insensitive and trims', () => {
  assert.ok(searchSuite('  ESCALATION ').some((r) => r.id === 'public-service-directory'));
});

test('empty query returns no results', () => {
  assert.deepEqual(searchSuite(''), []);
});

test('every entry has id, kind, title, url, keywords', () => {
  for (const e of suiteIndex) {
    assert.ok(e.id && e.kind && e.title && e.url);
    assert.ok(Array.isArray(e.keywords));
  }
});
