import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalDate, toLocalDateString } from './dates.mjs';
import {
  parseLocalDate as originalParse,
  toLocalDateString as originalString
} from '../deadlines/index.mjs';

test('browser-safe date helpers preserve established date semantics', () => {
  for (const value of [
    '2024-02-29',
    '2025-02-29',
    '2026-02-30',
    '2026-12-31',
    '2027-01-01',
    '2026-05-01',
    '',
    'invalid'
  ]) {
    assert.equal(parseLocalDate(value)?.getTime(), originalParse(value)?.getTime());
    assert.equal(toLocalDateString(parseLocalDate(value)), originalString(originalParse(value)));
  }
});
