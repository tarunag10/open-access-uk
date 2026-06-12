// shared/theme/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme } from './index.mjs';

test('storage key is namespaced', () => {
  assert.equal(THEME_STORAGE_KEY, 'open-access-uk:theme');
});

test('stored theme wins over system preference', () => {
  assert.equal(resolveInitialTheme({ stored: 'dark', prefersDark: false }), 'dark');
  assert.equal(resolveInitialTheme({ stored: 'light', prefersDark: true }), 'light');
});

test('falls back to system preference when nothing stored', () => {
  assert.equal(resolveInitialTheme({ stored: null, prefersDark: true }), 'dark');
  assert.equal(resolveInitialTheme({ stored: null, prefersDark: false }), 'light');
});

test('ignores invalid stored values', () => {
  assert.equal(resolveInitialTheme({ stored: 'banana', prefersDark: true }), 'dark');
});

test('nextTheme toggles', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});
