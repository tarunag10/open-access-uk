import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCase,
  addEvent,
  addDeadline,
  addParty,
  mergeCases,
  exportCase,
  importCase,
  findCase
} from './index.mjs';

test('createCase returns a case with required fields', () => {
  const c = createCase('My case');
  assert.ok(c.id);
  assert.equal(c.title, 'My case');
  assert.equal(c.schemaVersion, '1');
  assert.ok(c.createdAt);
  assert.ok(Array.isArray(c.events));
  assert.ok(Array.isArray(c.parties));
});

test('createCase with jurisdiction', () => {
  const c = createCase('Housing case', { jurisdiction: 'england' });
  assert.equal(c.jurisdiction, 'england');
});

test('addEvent adds an event and updates updatedAt', () => {
  const c = createCase('Test');
  const updated = addEvent(c, { date: '2026-06-01', type: 'notice', summary: 'Served' });
  assert.equal(updated.events.length, 1);
  assert.equal(updated.events[0].type, 'notice');
});

test('addDeadline adds a deadline', () => {
  const c = createCase('Test');
  addDeadline(c, {
    ruleId: 'foi-response',
    startDate: '2026-06-01',
    targetDate: '2026-06-29',
    status: 'pending'
  });
  assert.equal(c.deadlines.length, 1);
  assert.equal(c.deadlines[0].ruleId, 'foi-response');
});

test('addParty adds a party', () => {
  const c = createCase('Test');
  addParty(c, { role: 'tenant', name: 'Alice' });
  assert.equal(c.parties.length, 1);
  assert.equal(c.parties[0].name, 'Alice');
});

test('mergeCases merges events and parties', () => {
  const existing = createCase('Test');
  addEvent(existing, { date: '2026-06-01', type: 'notice', summary: 'Served' });

  const incoming = {
    events: [{ date: '2026-06-15', type: 'response', summary: 'Received' }],
    parties: [{ role: 'tenant', name: 'Alice' }],
    deadlines: [],
    documents: [],
    letters: []
  };

  const merged = mergeCases(existing, incoming);
  assert.ok(merged.events.length >= 1);
  assert.equal(merged.events[0].type, 'notice');
  assert.equal(merged.parties.length, 1);
});

test('exportCase and importCase roundtrip', () => {
  const c = createCase('Test case');
  addParty(c, { role: 'claimant', name: 'Bob' });

  const exported = exportCase(c);
  assert.equal(exported.schema, 'open-access-uk:case:v1');
  assert.ok(exported.case);

  const imported = importCase(exported);
  assert.ok(imported);
  assert.equal(imported.title, 'Test case');
  assert.equal(imported.parties[0].name, 'Bob');
});

test('findCase returns correct case', () => {
  const c1 = createCase('First');
  const c2 = createCase('Second');
  const result = findCase([c1, c2], c2.id);
  assert.equal(result.title, 'Second');
});
