import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRepairCategories,
  getRepairDeadlines,
  createRepairRecord,
  getDeadlineStatus,
  generateRepairReport,
  getDisrepairEvidence,
  getHousingOmbudsmanRoute,
  serializeRepairs,
  parseRepairs
} from './index.mjs';

describe('getRepairCategories', () => {
  it('returns array of categories', () => {
    const categories = getRepairCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
  });

  it('includes emergency category', () => {
    const categories = getRepairCategories();
    const emergency = categories.find(c => c.id === 'emergency');
    assert.ok(emergency);
    assert.equal(emergency.name, 'Emergency Repair');
  });

  it('includes urgent category', () => {
    const categories = getRepairCategories();
    const urgent = categories.find(c => c.id === 'urgent');
    assert.ok(urgent);
    assert.equal(urgent.name, 'Urgent Repair');
  });

  it('includes routine category', () => {
    const categories = getRepairCategories();
    const routine = categories.find(c => c.id === 'routine');
    assert.ok(routine);
    assert.equal(routine.name, 'Routine Repair');
  });
});

describe('getRepairDeadlines', () => {
  it('emergency deadline is 24 hours', () => {
    const deadline = getRepairDeadlines('emergency');
    assert.ok(deadline);
    assert.equal(deadline.deadlineHours, 24);
  });

  it('urgent deadline is 5 working days', () => {
    const deadline = getRepairDeadlines('urgent');
    assert.ok(deadline);
    assert.equal(deadline.deadlineWorkingDays, 5);
  });

  it('routine deadline is 28 calendar days', () => {
    const deadline = getRepairDeadlines('routine');
    assert.ok(deadline);
    assert.equal(deadline.deadlineCalendarDays, 28);
  });

  it('returns null for unknown category', () => {
    const deadline = getRepairDeadlines('unknown');
    assert.equal(deadline, null);
  });
});

describe('createRepairRecord', () => {
  it('creates repair record with valid data', () => {
    const data = {
      propertyAddress: '123 Test Street, London, SW1A 1AA',
      landlordName: 'Test Council',
      category: 'emergency',
      description: 'Gas leak in kitchen',
      reportedDate: '2026-06-01'
    };
    const record = createRepairRecord(data);
    assert.ok(record);
    assert.ok(record.referenceNumber);
    assert.equal(record.propertyAddress, data.propertyAddress);
    assert.equal(record.landlordName, data.landlordName);
    assert.equal(record.category, data.category);
    assert.equal(record.description, data.description);
    assert.equal(record.reportedDate, data.reportedDate);
    assert.equal(record.status, 'reported');
  });

  it('throws error for missing required fields', () => {
    assert.throws(() => createRepairRecord({}));
    assert.throws(() => createRepairRecord({ propertyAddress: 'test' }));
  });

  it('throws error for invalid category', () => {
    const data = {
      propertyAddress: '123 Test Street',
      landlordName: 'Test Council',
      category: 'invalid',
      description: 'Test',
      reportedDate: '2026-06-01'
    };
    assert.throws(() => createRepairRecord(data));
  });
});

describe('getDeadlineStatus', () => {
  it('returns overdue for past deadline', () => {
    const repair = {
      category: 'emergency',
      reportedDate: '2026-06-20' // More than 24 hours ago
    };
    const status = getDeadlineStatus(repair, '2026-06-25');
    assert.equal(status, 'overdue');
  });

  it('returns on-track for future deadline', () => {
    const repair = {
      category: 'emergency',
      reportedDate: '2026-06-25'
    };
    const status = getDeadlineStatus(repair, '2026-06-25');
    assert.equal(status, 'on-track');
  });

  it('returns due-soon for deadline within 25% of time', () => {
    const repair = {
      category: 'routine',
      reportedDate: '2026-05-29'
    };
    const status = getDeadlineStatus(repair, '2026-06-25');
    assert.equal(status, 'due-soon');
  });
});

describe('generateRepairReport', () => {
  it('returns plain text repair summary', () => {
    const repair = {
      referenceNumber: 'RPR-001',
      propertyAddress: '123 Test Street',
      landlordName: 'Test Council',
      category: 'emergency',
      description: 'Gas leak',
      reportedDate: '2026-06-01',
      status: 'reported'
    };
    const report = generateRepairReport(repair);
    assert.ok(typeof report === 'string');
    assert.ok(report.includes('RPR-001'));
    assert.ok(report.includes('123 Test Street'));
    assert.ok(report.includes('Test Council'));
    assert.ok(report.includes('emergency'));
    assert.ok(report.includes('Gas leak'));
  });
});

describe('getDisrepairEvidence', () => {
  it('returns evidence checklist', () => {
    const evidence = getDisrepairEvidence();
    assert.ok(Array.isArray(evidence));
    assert.ok(evidence.length > 0);
  });

  it('includes photos', () => {
    const evidence = getDisrepairEvidence();
    const photos = evidence.find(e => e.id === 'photos');
    assert.ok(photos);
  });

  it('includes dates', () => {
    const evidence = getDisrepairEvidence();
    const dates = evidence.find(e => e.id === 'dates');
    assert.ok(dates);
  });

  it('includes correspondence', () => {
    const evidence = getDisrepairEvidence();
    const correspondence = evidence.find(e => e.id === 'correspondence');
    assert.ok(correspondence);
  });

  it('includes medical evidence', () => {
    const evidence = getDisrepairEvidence();
    const medical = evidence.find(e => e.id === 'medical');
    assert.ok(medical);
  });

  it('includes impact statement', () => {
    const evidence = getDisrepairEvidence();
    const impact = evidence.find(e => e.id === 'impact');
    assert.ok(impact);
  });
});

describe('getHousingOmbudsmanRoute', () => {
  it('returns escalation path', () => {
    const route = getHousingOmbudsmanRoute();
    assert.ok(Array.isArray(route));
    assert.ok(route.length > 0);
  });

  it('includes stage 1', () => {
    const route = getHousingOmbudsmanRoute();
    const stage1 = route.find(s => s.id === 'stage-1');
    assert.ok(stage1);
    assert.equal(stage1.deadlineWorkingDays, 56);
  });

  it('includes stage 2', () => {
    const route = getHousingOmbudsmanRoute();
    const stage2 = route.find(s => s.id === 'stage-2');
    assert.ok(stage2);
    assert.equal(stage2.deadlineWorkingDays, 56);
  });

  it('includes housing ombudsman', () => {
    const route = getHousingOmbudsmanRoute();
    const ombudsman = route.find(s => s.id === 'ombudsman');
    assert.ok(ombudsman);
  });
});

describe('serializeRepairs and parseRepairs', () => {
  it('round-trips repair data', () => {
    const repairs = [
      { referenceNumber: 'RPR-001', category: 'emergency' },
      { referenceNumber: 'RPR-002', category: 'routine' }
    ];
    const serialized = serializeRepairs(repairs);
    const parsed = parseRepairs(serialized);
    assert.deepEqual(parsed, repairs);
  });

  it('returns empty array for invalid input', () => {
    const parsed = parseRepairs('invalid json');
    assert.deepEqual(parsed, []);
  });
});
