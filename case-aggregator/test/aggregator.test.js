import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAggregatorPack,
  examplePacks,
  safeCaseFilename
} from '../src/aggregator.js';

test('has example packs from the suite', () => {
  assert.ok(examplePacks.length >= 3);
  assert.ok(examplePacks.some(p => p.source.includes('letter')));
});

test('builds a combined pack from selected examples', () => {
  const pack = buildAggregatorPack(['letter-example', 'directory-example'], [], {});
  assert.match(pack.markdown, /Combined local case file/);
  assert.match(pack.markdown, /Generated locally in the browser/);
  assert.match(pack.markdown, /Current source notes/);
});

test('includes pasted custom packs', () => {
  const customs = [{ title: 'Custom', content: 'My custom evidence here.' }];
  const pack = buildAggregatorPack([], customs, { title: 'My combined case' });
  assert.match(pack.markdown, /My combined case/);
  assert.match(pack.markdown, /My custom evidence here/);
});

test('generates safe filenames', () => {
  assert.equal(safeCaseFilename('My University Case 2026!'), 'my-university-case-2026.md');
});
