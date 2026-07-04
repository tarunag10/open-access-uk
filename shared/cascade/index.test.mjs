import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCascadeTemplates,
  buildCascade,
  getStepStatus,
  calculateCascadeProgress,
  exportCascadeICS,
  formatCascadeTimeline,
  serializeCascade,
  parseCascade
} from './index.mjs';

describe('getCascadeTemplates()', () => {
  it('returns array of templates', () => {
    const templates = getCascadeTemplates();
    assert.ok(Array.isArray(templates));
    assert.ok(templates.length >= 5);
  });

  it('includes required template IDs', () => {
    const templates = getCascadeTemplates();
    const ids = templates.map((t) => t.id);
    assert.ok(ids.includes('foi-complaint'));
    assert.ok(ids.includes('nhs-complaint'));
    assert.ok(ids.includes('housing-repair'));
    assert.ok(ids.includes('benefits-appeal'));
    assert.ok(ids.includes('parking-appeal'));
  });

  it('each template has required fields', () => {
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
});

describe('buildCascade()', () => {
  it('returns array of steps for valid template', () => {
    const cascade = buildCascade('foi-complaint', '2026-01-01');
    assert.ok(Array.isArray(cascade));
    assert.ok(cascade.length > 0);
  });

  it('throws for unknown template', () => {
    assert.throws(() => buildCascade('nonexistent', '2026-01-01'), /Unknown template/);
  });

  it('throws for invalid date', () => {
    assert.throws(() => buildCascade('foi-complaint', 'not-a-date'), /Invalid start date/);
  });

  it('each step has required fields', () => {
    const cascade = buildCascade('foi-complaint', '2026-01-06');
    for (const step of cascade) {
      assert.ok(step.name, 'step has name');
      assert.ok(step.deadline, 'step has deadline');
      assert.ok(step.description, 'step has description');
      assert.equal(typeof step.index, 'number', 'step has index');
      assert.equal(typeof step.workingDays, 'boolean', 'step has workingDays');
    }
  });

  it('first step has same date as start date', () => {
    const cascade = buildCascade('foi-complaint', '2026-01-06');
    assert.equal(cascade[0].deadline, '2026-01-06');
  });

  it('working days offset adds working days correctly', () => {
    const cascade = buildCascade('foi-complaint', '2026-01-06');
    const step1 = cascade[1];
    assert.equal(step1.deadline, '2026-02-03');
  });

  it('non-working days offset adds calendar days correctly', () => {
    const cascade = buildCascade('housing-repair', '2026-01-06');
    const step1 = cascade[1];
    assert.equal(step1.deadline, '2026-01-07');
  });
});

describe('getStepStatus()', () => {
  it('returns completed when date equals deadline', () => {
    const step = { deadline: '2026-01-01' };
    assert.equal(getStepStatus(step, '2026-01-01'), 'completed');
  });

  it('returns current when date is before deadline', () => {
    const step = { deadline: '2026-01-10' };
    assert.equal(getStepStatus(step, '2026-01-06'), 'current');
  });

  it('returns overdue when date is after deadline', () => {
    const step = { deadline: '2026-01-01' };
    assert.equal(getStepStatus(step, '2026-01-05'), 'overdue');
  });
});

describe('calculateCascadeProgress()', () => {
  it('returns 0 for empty cascade', () => {
    assert.equal(calculateCascadeProgress([], '2026-01-01'), 0);
  });

  it('returns 100 when all steps completed', () => {
    const cascade = [
      { deadline: '2026-01-01' },
      { deadline: '2026-01-02' },
      { deadline: '2026-01-03' }
    ];
    assert.equal(calculateCascadeProgress(cascade, '2026-01-05'), 100);
  });

  it('returns partial percentage', () => {
    const cascade = [
      { deadline: '2026-01-01' },
      { deadline: '2026-01-10' },
      { deadline: '2026-01-20' }
    ];
    assert.equal(calculateCascadeProgress(cascade, '2026-01-01'), 33);
  });

  it('returns 0 when no steps completed', () => {
    const cascade = [{ deadline: '2026-01-10' }, { deadline: '2026-01-20' }];
    assert.equal(calculateCascadeProgress(cascade, '2026-01-01'), 0);
  });
});

describe('exportCascadeICS()', () => {
  it('returns ICS content for cascade', () => {
    const cascade = [{ name: 'Step 1', deadline: '2026-01-01', description: 'First step' }];
    const ics = exportCascadeICS(cascade);
    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('END:VCALENDAR'));
    assert.ok(ics.includes('Step 1'));
    assert.ok(ics.includes('First step'));
  });

  it('handles multiple events', () => {
    const cascade = [
      { name: 'Step 1', deadline: '2026-01-01', description: 'First' },
      { name: 'Step 2', deadline: '2026-01-02', description: 'Second' }
    ];
    const ics = exportCascadeICS(cascade);
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.equal(veventCount, 2);
  });

  it('returns empty string for empty cascade', () => {
    assert.equal(exportCascadeICS([]), '');
  });
});

describe('formatCascadeTimeline()', () => {
  it('returns plain text timeline', () => {
    const cascade = [
      { name: 'Step 1', deadline: '2026-01-01', description: 'First' },
      { name: 'Step 2', deadline: '2026-01-10', description: 'Second' }
    ];
    const timeline = formatCascadeTimeline(cascade, '2026-01-05');
    assert.ok(timeline.includes('Step 1'));
    assert.ok(timeline.includes('Step 2'));
    assert.ok(timeline.includes('2026-01-01'));
  });

  it('includes status indicators', () => {
    const cascade = [
      { name: 'Past', deadline: '2026-01-01', description: 'Done' },
      { name: 'Future', deadline: '2026-01-10', description: 'Upcoming' }
    ];
    const timeline = formatCascadeTimeline(cascade, '2026-01-05');
    assert.ok(timeline.includes('[x]') || timeline.includes('[ ]'), 'has status indicators');
  });
});

describe('serializeCascade() / parseCascade()', () => {
  it('round-trips cascade data', () => {
    const cascade = buildCascade('foi-complaint', '2026-01-06');
    const serialized = serializeCascade(cascade);
    const parsed = parseCascade(serialized);
    assert.deepEqual(parsed, cascade);
  });

  it('returns null for invalid JSON', () => {
    assert.equal(parseCascade('not json'), null);
  });

  it('returns null for null input', () => {
    assert.equal(parseCascade(null), null);
  });
});
