import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyseReadability, countSyllables } from './index.mjs';

test('countSyllables is reasonable for common words', () => {
  assert.equal(countSyllables('cat'), 1);
  assert.equal(countSyllables('reasonable'), 4);
  assert.ok(countSyllables('accessibility') >= 5);
});

test('analyseReadability returns metrics and flags', () => {
  const text =
    'I am writing to request a reasonable adjustment. The exam was inaccessible. Please respond.';
  const result = analyseReadability(text);
  assert.equal(typeof result.readingAge, 'number');
  assert.equal(typeof result.sentenceCount, 'number');
  assert.equal(typeof result.wordCount, 'number');
  assert.ok(Array.isArray(result.flags));
});

test('flags long sentences', () => {
  const long = 'This ' + 'very '.repeat(40) + 'long sentence keeps going and going.';
  const result = analyseReadability(long);
  assert.ok(result.flags.some((f) => f.type === 'long-sentence'));
});

test('flags passive voice', () => {
  const result = analyseReadability('The decision was made by the panel.');
  assert.ok(result.flags.some((f) => f.type === 'passive'));
});

test('flags jargon terms', () => {
  const result = analyseReadability(
    'Please find enclosed the aforementioned documentation herewith.'
  );
  assert.ok(result.flags.some((f) => f.type === 'jargon'));
});

test('empty text returns zeroed metrics, no crash', () => {
  const result = analyseReadability('');
  assert.equal(result.wordCount, 0);
  assert.equal(result.flags.length, 0);
});
