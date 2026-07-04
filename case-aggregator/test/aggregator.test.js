import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, addParty, exportCase, importCase } from '../../shared/case/index.mjs';
import { examplePacks, safeCaseFilename } from '../src/aggregator.js';

test('has example packs from the suite', () => {
  assert.ok(examplePacks.length >= 3);
});

test('generates safe filenames', () => {
  assert.equal(safeCaseFilename('My University Case 2026!'), 'my-university-case-2026.md');
});

test('imports and exports work with shared case module', () => {
  const c = createCase('Test case');
  addParty(c, { role: 'claimant', name: 'Alice' });
  const exported = exportCase(c);
  assert.equal(exported.schema, 'open-access-uk:case:v1');
  const imported = importCase(exported);
  assert.equal(imported.title, 'Test case');
  assert.equal(imported.parties[0].name, 'Alice');
});
