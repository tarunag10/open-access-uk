import test from 'node:test';
import assert from 'node:assert/strict';
import { getRepairCategories, getHousingOmbudsmanRoute } from '../src/repairs.js';

test('getRepairCategories returns categories from shared module', () => {
  const categories = getRepairCategories();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length >= 3);
  const ids = categories.map((c) => c.id);
  assert.ok(ids.includes('emergency'));
  assert.ok(ids.includes('urgent'));
  assert.ok(ids.includes('routine'));
});

test('getHousingOmbudsmanRoute returns stages', () => {
  const stages = getHousingOmbudsmanRoute();
  assert.ok(Array.isArray(stages));
  assert.ok(stages.length >= 3);
  const ids = stages.map((s) => s.id);
  assert.ok(ids.includes('stage-1'));
  assert.ok(ids.includes('stage-2'));
  assert.ok(ids.includes('ombudsman'));
});

test('getRepairCategories returns objects with required fields', () => {
  const categories = getRepairCategories();
  for (const cat of categories) {
    assert.ok(cat.id, 'category has id');
    assert.ok(cat.name, 'category has name');
    assert.ok(cat.description, 'category has description');
  }
});

test('getHousingOmbudsmanRoute returns objects with required fields', () => {
  const stages = getHousingOmbudsmanRoute();
  for (const stage of stages) {
    assert.ok(stage.id, 'stage has id');
    assert.ok(stage.name, 'stage has name');
    assert.ok(stage.description, 'stage has description');
  }
});
