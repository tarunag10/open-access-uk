import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getComplaintTypes,
  getComplaintDeadlines,
  generateComplaintText,
  getEscalationRoute,
  getRequiredDocuments,
  generateICIBIText,
  getHomeOfficeContactInfo,
  serializeImmigration,
  parseImmigration
} from './index.mjs';

describe('getComplaintTypes', () => {
  it('returns all complaint types', () => {
    const types = getComplaintTypes();
    assert.ok(Array.isArray(types));
    assert.equal(types.length, 6);
  });

  it('includes all expected ids', () => {
    const types = getComplaintTypes();
    const ids = types.map((t) => t.id);
    assert.deepStrictEqual(ids, [
      'visa-delay',
      'brp-issue',
      'sponsorship-complaint',
      'right-to-rent',
      'asylum-support',
      'immigration-detention'
    ]);
  });

  it('returns a copy of the array', () => {
    const types = getComplaintTypes();
    types.push({ id: 'fake' });
    assert.equal(getComplaintTypes().length, 6);
  });
});

describe('getComplaintDeadlines', () => {
  it('returns deadline for visa-delay', () => {
    const result = getComplaintDeadlines('visa-delay', '2025-01-06');
    assert.ok(result);
    assert.equal(result.deadlineWorkingDays, 20);
    assert.ok(result.deadlineDate);
  });

  it('returns deadline for brp-issue', () => {
    const result = getComplaintDeadlines('brp-issue', '2025-01-06');
    assert.ok(result);
    assert.equal(result.deadlineWorkingDays, 20);
  });

  it('returns deadline for sponsorship-complaint', () => {
    const result = getComplaintDeadlines('sponsorship-complaint', '2025-01-06');
    assert.ok(result);
    assert.equal(result.deadlineWorkingDays, 20);
  });

  it('returns deadline for asylum-support with varies note', () => {
    const result = getComplaintDeadlines('asylum-support', '2025-01-06');
    assert.ok(result);
    assert.equal(result.deadlineWorkingDays, 20);
    assert.equal(result.varies, true);
  });

  it('returns null for unknown type', () => {
    assert.equal(getComplaintDeadlines('unknown'), null);
  });

  it('returns null if no start date', () => {
    assert.equal(getComplaintDeadlines('visa-delay'), null);
  });
});

describe('generateComplaintText', () => {
  it('generates a complaint letter', () => {
    const text = generateComplaintText({
      complainantName: 'Jane Doe',
      complainantAddress: '10 Downing Street, London, SW1A 2AA',
      type: 'visa-delay',
      applicationReference: 'REF-12345',
      dateSubmitted: '2025-01-06',
      descriptionOfIssue: 'My visa has been pending for 6 months with no update.',
      desiredOutcome: 'I want my visa processed within 20 working days.'
    });
    assert.ok(text.includes('Jane Doe'));
    assert.ok(text.includes('10 Downing Street'));
    assert.ok(text.includes('REF-12345'));
    assert.ok(text.includes('visa-delay') || text.includes('Visa Processing Delay'));
    assert.ok(text.includes('6 months'));
    assert.ok(text.includes('I want my visa processed'));
  });

  it('throws on missing required fields', () => {
    assert.throws(() => generateComplaintText({}), /complainantName/);
  });

  it('throws on missing type', () => {
    assert.throws(
      () => generateComplaintText({ complainantName: 'Jane Doe' }),
      /type/
    );
  });
});

describe('getEscalationRoute', () => {
  it('returns Home Office → ICIBI → Parliamentary Ombudsman', () => {
    const route = getEscalationRoute('visa-delay');
    assert.ok(Array.isArray(route));
    assert.equal(route.length, 3);
    assert.equal(route[0], 'Home Office');
    assert.equal(route[1], 'ICIBI');
    assert.equal(route[2], 'Parliamentary Ombudsman');
  });

  it('returns same route for all types', () => {
    const route = getEscalationRoute('immigration-detention');
    assert.equal(route.length, 3);
    assert.equal(route[0], 'Home Office');
  });

  it('returns null for unknown type', () => {
    assert.equal(getEscalationRoute('unknown'), null);
  });
});

describe('getRequiredDocuments', () => {
  it('returns evidence checklist for visa-delay', () => {
    const docs = getRequiredDocuments('visa-delay');
    assert.ok(Array.isArray(docs));
    assert.ok(docs.length > 0);
    assert.ok(docs.some((d) => d.includes('application') || d.includes('reference') || d.includes('submission')));
  });

  it('returns evidence checklist for brp-issue', () => {
    const docs = getRequiredDocuments('brp-issue');
    assert.ok(Array.isArray(docs));
    assert.ok(docs.length > 0);
  });

  it('returns evidence checklist for asylum-support', () => {
    const docs = getRequiredDocuments('asylum-support');
    assert.ok(Array.isArray(docs));
    assert.ok(docs.length > 0);
  });

  it('returns null for unknown type', () => {
    assert.equal(getRequiredDocuments('unknown'), null);
  });
});

describe('generateICIBIText', () => {
  it('generates an ICIBI escalation letter', () => {
    const text = generateICIBIText({
      complainantName: 'Jane Doe',
      originalComplaintDate: '2025-01-06',
      homeOfficeReference: 'HO-REF-67890',
      complaintType: 'visa-delay',
      summary: 'Home Office failed to respond within deadline.'
    });
    assert.ok(text.includes('Jane Doe'));
    assert.ok(text.includes('HO-REF-67890'));
    assert.ok(text.includes('ICIBI'));
  });

  it('throws on missing required fields', () => {
    assert.throws(() => generateICIBIText({}), /complainantName/);
  });
});

describe('getHomeOfficeContactInfo', () => {
  it('returns contact details for visa-delay', () => {
    const info = getHomeOfficeContactInfo('visa-delay');
    assert.ok(info);
    assert.ok(info.email || info.phone || info.post);
  });

  it('returns contact details for brp-issue', () => {
    const info = getHomeOfficeContactInfo('brp-issue');
    assert.ok(info);
  });

  it('returns null for unknown type', () => {
    assert.equal(getHomeOfficeContactInfo('unknown'), null);
  });
});

describe('serializeImmigration / parseImmigration', () => {
  it('round-trips data', () => {
    const data = [{ id: 'test', name: 'Test' }];
    const serialized = serializeImmigration(data);
    const parsed = parseImmigration(serialized);
    assert.deepStrictEqual(parsed, data);
  });

  it('returns empty array for null input', () => {
    assert.deepStrictEqual(parseImmigration(null), []);
  });

  it('returns empty array for non-string input', () => {
    assert.deepStrictEqual(parseImmigration(123), []);
  });

  it('returns empty array for invalid JSON', () => {
    assert.deepStrictEqual(parseImmigration('not json'), []);
  });

  it('returns empty array for non-array JSON', () => {
    assert.deepStrictEqual(parseImmigration('{}'), []);
  });
});
