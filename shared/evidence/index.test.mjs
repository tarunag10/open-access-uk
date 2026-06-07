import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EVIDENCE_HANDOFF_KEY,
  createEvidencePack,
  serializeEvidence,
  parseEvidence
} from './index.mjs';

test('handoff key is namespaced', () => {
  assert.equal(EVIDENCE_HANDOFF_KEY, 'open-access-uk:evidence-handoff');
});

test('createEvidencePack normalises items and source', () => {
  const pack = createEvidencePack({
    source: 'letter-generator',
    items: ['Receipt', '', '  Photos ']
  });
  assert.equal(pack.source, 'letter-generator');
  assert.deepEqual(pack.items, ['Receipt', 'Photos']);
});

test('serialize then parse round-trips', () => {
  const pack = createEvidencePack({ source: 'x', items: ['a', 'b'] });
  const parsed = parseEvidence(serializeEvidence(pack));
  assert.deepEqual(parsed.items, ['a', 'b']);
  assert.equal(parsed.source, 'x');
});

test('parseEvidence tolerates garbage', () => {
  assert.deepEqual(parseEvidence('not json'), { source: '', items: [] });
  assert.deepEqual(parseEvidence('{"items":"nope"}').items, []);
});
