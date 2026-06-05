import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCaseFile, composeFromPacks } from './index.mjs';

test('buildCaseFile produces privacy note and sections', () => {
  const cf = buildCaseFile({
    title: 'Test case',
    sections: [{ heading: 'Evidence', items: ['photo 1', 'letter'] }],
    sources: [{ title: 'Test source', detail: 'foo', url: 'https://ex' }],
  });
  assert.match(cf.markdown, /Generated locally in the browser/);
  assert.match(cf.markdown, /## Evidence/);
  assert.match(cf.markdown, /Current source notes/);
  assert.equal(cf.sectionCount, 1);
});

test('composeFromPacks stitches multiple pack outputs', () => {
  const packs = [
    { title: 'Letter', markdown: 'Dear sir...' },
    { title: 'Plan', markdown: 'Step 1...' },
  ];
  const composed = composeFromPacks(packs, { title: 'Full case' });
  assert.match(composed.markdown, /## Letter/);
  assert.match(composed.markdown, /## Plan/);
  assert.match(composed.markdown, /Combined from letter/);
});
