import test from 'node:test';
import assert from 'node:assert/strict';
import { clearKnownStorage, describeStorageRegistry, storageRegistry } from './local-storage.mjs';
import { THEME_STORAGE_KEY } from '../theme/index.mjs';

test('lists known local storage keys with plain-English descriptions', () => {
  assert.ok(storageRegistry.length >= 6);
  assert.ok(storageRegistry.every((item) => item.key.startsWith('open-access-uk:')));
  assert.ok(describeStorageRegistry().some((line) => line.includes('Letter draft')));
});

test('clears known storage keys without touching unknown keys', () => {
  const store = new Map(storageRegistry.map((item) => [item.key, 'value']));
  store.set('other-product:key', 'keep');
  const storage = {
    removeItem(key) {
      store.delete(key);
    }
  };

  const result = clearKnownStorage(storage);

  assert.equal(result.failed.length, 0);
  assert.equal(result.cleared.length, storageRegistry.length);
  assert.equal(store.get('other-product:key'), 'keep');
});

test('storageRegistry includes the theme preference key', () => {
  const entry = storageRegistry.find((item) => item.key === THEME_STORAGE_KEY);
  assert.ok(entry, 'theme key must be registered');
  assert.equal(entry.tool, 'suite');
  assert.equal(entry.storage, 'localStorage');
});
