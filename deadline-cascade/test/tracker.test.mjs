import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCascadeTemplates,
  buildCascade,
  getStepStatus,
  calculateCascadeProgress,
  exportCascadeICS,
  serializeCascade,
  parseCascade
} from '../src/tracker.js';

test('getCascadeTemplates returns array of templates', () => {
  const templates = getCascadeTemplates();
  assert.ok(Array.isArray(templates));
  assert.ok(templates.length >= 4);
});

test('getCascadeTemplates includes required template IDs', () => {
  const templates = getCascadeTemplates();
  const ids = templates.map(t => t.id);
  assert.ok(ids.includes('foi-complaint'));
  assert.ok(ids.includes('nhs-complaint'));
  assert.ok(ids.includes('housing-repair'));
  assert.ok(ids.includes('benefits-appeal'));
});

test('each template has required fields', () => {
  const templates = getCascadeTemplates();
  for (const t of templates) {
    assert.ok(t.id, 'template has id');
    assert.ok(t.name, 'template has name');
    assert.ok(t.description, 'template has description');
    assert.ok(Array.isArray(t.steps), 'template has steps array');
    assert.ok(t.steps.length > 0, 'template has at least one step');
    for (const step of t.steps) {
      assert.ok(step.name, 'step has name');
      assert.equal(typeof step.offsetDays, 'number', 'step has numeric offsetDays');
      assert.equal(typeof step.workingDays, 'boolean', 'step has boolean workingDays');
      assert.ok(step.description, 'step has description');
    }
  }
});

test('buildCascade returns array of steps for valid template', () => {
  const cascade = buildCascade('foi-complaint', '2026-01-01');
  assert.ok(Array.isArray(cascade));
  assert.ok(cascade.length > 0);
});

test('buildCascade throws for unknown template', () => {
  assert.throws(() => buildCascade('nonexistent', '2026-01-01'), /Unknown template/);
});

test('buildCascade throws for invalid date', () => {
  assert.throws(() => buildCascade('foi-complaint', 'not-a-date'), /Invalid start date/);
});

test('each step has required fields', () => {
  const cascade = buildCascade('foi-complaint', '2026-01-06');
  for (const step of cascade) {
    assert.ok(step.name, 'step has name');
    assert.ok(step.deadline, 'step has deadline');
    assert.ok(step.description, 'step has description');
    assert.equal(typeof step.index, 'number', 'step has index');
    assert.equal(typeof step.workingDays, 'boolean', 'step has workingDays');
  }
});

test('first step has same date as start date', () => {
  const cascade = buildCascade('foi-complaint', '2026-01-06');
  assert.equal(cascade[0].deadline, '2026-01-06');
});

test('working days offset adds working days correctly', () => {
  const cascade = buildCascade('foi-complaint', '2026-01-06');
  const step1 = cascade[1];
  assert.equal(step1.deadline, '2026-02-03');
});

test('non-working days offset adds calendar days correctly', () => {
  const cascade = buildCascade('housing-repair', '2026-01-06');
  const step1 = cascade[1];
  assert.equal(step1.deadline, '2026-01-07');
});

test('getStepStatus returns completed when date equals deadline', () => {
  const step = { deadline: '2026-01-01' };
  assert.equal(getStepStatus(step, '2026-01-01'), 'completed');
});

test('getStepStatus returns current when date is before deadline', () => {
  const step = { deadline: '2026-01-10' };
  assert.equal(getStepStatus(step, '2026-01-06'), 'current');
});

test('getStepStatus returns overdue when date is after deadline', () => {
  const step = { deadline: '2026-01-01' };
  assert.equal(getStepStatus(step, '2026-01-05'), 'overdue');
});

test('calculateCascadeProgress returns 0 for empty cascade', () => {
  assert.equal(calculateCascadeProgress([], '2026-01-01'), 0);
});

test('calculateCascadeProgress returns 100 when all steps completed', () => {
  const cascade = [
    { deadline: '2026-01-01' },
    { deadline: '2026-01-02' },
    { deadline: '2026-01-03' }
  ];
  assert.equal(calculateCascadeProgress(cascade, '2026-01-05'), 100);
});

test('calculateCascadeProgress returns partial percentage', () => {
  const cascade = [
    { deadline: '2026-01-01' },
    { deadline: '2026-01-10' },
    { deadline: '2026-01-20' }
  ];
  assert.equal(calculateCascadeProgress(cascade, '2026-01-01'), 33);
});

test('calculateCascadeProgress returns 0 when no steps completed', () => {
  const cascade = [
    { deadline: '2026-01-10' },
    { deadline: '2026-01-20' }
  ];
  assert.equal(calculateCascadeProgress(cascade, '2026-01-01'), 0);
});

test('exportCascadeICS returns ICS content for cascade', () => {
  const cascade = [
    { name: 'Step 1', deadline: '2026-01-01', description: 'First step' }
  ];
  const ics = exportCascadeICS(cascade);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('END:VCALENDAR'));
  assert.ok(ics.includes('Step 1'));
  assert.ok(ics.includes('First step'));
});

test('exportCascadeICS handles multiple events', () => {
  const cascade = [
    { name: 'Step 1', deadline: '2026-01-01', description: 'First' },
    { name: 'Step 2', deadline: '2026-01-02', description: 'Second' }
  ];
  const ics = exportCascadeICS(cascade);
  const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(veventCount, 2);
});

test('exportCascadeICS returns empty string for empty cascade', () => {
  assert.equal(exportCascadeICS([]), '');
});

test('serializeCascade and parseCascade round-trip', () => {
  const cascade = buildCascade('foi-complaint', '2026-01-06');
  const serialized = serializeCascade(cascade);
  const parsed = parseCascade(serialized);
  assert.deepEqual(parsed, cascade);
});

test('parseCascade returns null for invalid JSON', () => {
  assert.equal(parseCascade('not json'), null);
});

test('parseCascade returns null for null input', () => {
  assert.equal(parseCascade(null), null);
});

test('nhs-complaint template has 6 steps', () => {
  const cascade = buildCascade('nhs-complaint', '2026-06-01');
  assert.equal(cascade.length, 6);
  assert.equal(cascade[0].name, 'PALS Contact');
  assert.equal(cascade[5].name, 'PHSO Complaint');
});

test('benefits-appeal template has 5 steps', () => {
  const cascade = buildCascade('benefits-appeal', '2026-06-01');
  assert.equal(cascade.length, 5);
  assert.equal(cascade[0].name, 'Decision Received');
  assert.equal(cascade[4].name, 'Tribunal Hearing');
});

test('housing-repair template has 7 steps', () => {
  const cascade = buildCascade('housing-repair', '2026-06-01');
  assert.equal(cascade.length, 7);
  assert.equal(cascade[0].name, 'Repair Reported');
  assert.equal(cascade[6].name, 'Housing Ombudsman');
});
