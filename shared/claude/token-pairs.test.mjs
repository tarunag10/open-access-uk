// shared/claude/token-pairs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenPairs, contrastPair, auditTokenPairs } from './token-pairs.mjs';

test('contrastPair matches a known value (black on white ~21)', () => {
  assert.ok(Math.abs(contrastPair('#000000', '#ffffff') - 21) < 0.1);
});

test('every documented token pair meets its required ratio', () => {
  const results = auditTokenPairs();
  const failures = results.filter((r) => !r.passes);
  assert.deepEqual(
    failures,
    [],
    `Token pairs below required contrast: ${failures.map((f) => `${f.name} ${f.ratio}:1`).join(', ')}`
  );
});

test('each pair declares both hex values and a minimum ratio', () => {
  for (const pair of tokenPairs) {
    assert.match(pair.foreground, /^#[0-9a-f]{6}$/i, `${pair.name} foreground hex`);
    assert.match(pair.background, /^#[0-9a-f]{6}$/i, `${pair.name} background hex`);
    assert.ok(pair.min === 4.5 || pair.min === 3, `${pair.name} min must be 4.5 or 3`);
  }
});
