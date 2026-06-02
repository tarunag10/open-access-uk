import test from 'node:test';
import assert from 'node:assert/strict';
import { clearKnownStorage, describeStorageRegistry, storageRegistry } from './local-storage.mjs';

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
