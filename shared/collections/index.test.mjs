import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_KEY,
  addToCollection,
  removeFromCollection,
  parseCollections,
  serializeCollections
} from './index.mjs';

test('collections key is namespaced', () => {
  assert.equal(COLLECTIONS_KEY, 'open-access-uk:legal-templates:collections');
});

test('addToCollection creates and dedupes', () => {
  let state = {};
  state = addToCollection(state, 'My housing case', 'refund-request');
  state = addToCollection(state, 'My housing case', 'refund-request');
  state = addToCollection(state, 'My housing case', 'sar');
  assert.deepEqual(state['My housing case'], ['refund-request', 'sar']);
});

test('removeFromCollection prunes and drops empty collections', () => {
  let state = { case: ['a', 'b'] };
  state = removeFromCollection(state, 'case', 'a');
  assert.deepEqual(state.case, ['b']);
  state = removeFromCollection(state, 'case', 'b');
  assert.equal(state.case, undefined);
});

test('serialize/parse round-trips and rejects garbage', () => {
  const state = { a: ['x'] };
  assert.deepEqual(parseCollections(serializeCollections(state)), state);
  assert.deepEqual(parseCollections('garbage'), {});
  assert.deepEqual(parseCollections('{"a":"notarray"}'), {});
});
