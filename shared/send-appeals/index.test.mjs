import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getSENDTribunalStages,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND,
} from './index.mjs';

describe('getAppealTypes', () => {
  it('returns all five appeal types', () => {
    const types = getAppealTypes();
    assert.equal(types.length, 5);
    const ids = types.map((t) => t.id);
    assert.ok(ids.includes('exclusion-review'));
    assert.ok(ids.includes('independent-review-panel'));
    assert.ok(ids.includes('send-tribunal'));
    assert.ok(ids.includes('ehcp-dispute'));
    assert.ok(ids.includes('mediation-request'));
  });

  it('each type has required fields', () => {
    const types = getAppealTypes();
    for (const type of types) {
      assert.ok(type.id, 'has id');
      assert.ok(type.name, 'has name');
      assert.ok(type.source, 'has source');
    }
  });
});

describe('getExclusionDeadlines', () => {
  it('fixed-term exclusions have 15 school days', () => {
    const result = getExclusionDeadlines('fixed-term');
    assert.equal(result.schoolDays, 15);
    assert.ok(result.note.includes('15'));
  });

  it('permanent exclusions have 15 school days', () => {
    const result = getExclusionDeadlines('permanent');
    assert.equal(result.schoolDays, 15);
    assert.ok(result.note.includes('15'));
  });

  it('exclusion-review type has 15 school days', () => {
    const result = getExclusionDeadlines('exclusion-review');
    assert.equal(result.schoolDays, 15);
  });

  it('independent-review-panel type has 15 school days', () => {
    const result = getExclusionDeadlines('independent-review-panel');
    assert.equal(result.schoolDays, 15);
  });
});

describe('getSENDTribunalDeadline', () => {
  it('returns 2 months from mediation certificate', () => {
    const certDate = new Date('2026-03-01');
    const result = getSENDTribunalDeadline(certDate);
    assert.equal(result.months, 2);
    const expected = new Date('2026-05-01');
    assert.equal(result.deadline.getTime(), expected.getTime());
  });

  it('handles month-end dates', () => {
    const certDate = new Date('2026-01-31');
    const result = getSENDTribunalDeadline(certDate);
    assert.equal(result.months, 2);
    const expected = new Date('2026-03-31');
    assert.equal(result.deadline.getTime(), expected.getTime());
  });

  it('defaults to current date if no argument', () => {
    const result = getSENDTribunalDeadline();
    assert.equal(result.months, 2);
    assert.ok(result.deadline instanceof Date);
  });
});

describe('generateExclusionReviewText', () => {
  it('returns review letter with all fields', () => {
    const data = {
      schoolName: 'Oakwood Primary',
      pupilName: 'Alex Smith',
      exclusionType: 'fixed-term',
      exclusionDate: '2026-06-15',
      grounds: 'Disruptive behaviour in class',
    };
    const text = generateExclusionReviewText(data);
    assert.ok(text.includes('Oakwood Primary'));
    assert.ok(text.includes('Alex Smith'));
    assert.ok(text.includes('fixed-term'));
    assert.ok(text.includes('2026-06-15'));
    assert.ok(text.includes('Disruptive behaviour in class'));
  });

  it('returns a string', () => {
    const data = {
      schoolName: 'School',
      pupilName: 'Child',
      exclusionType: 'permanent',
      exclusionDate: '2026-01-01',
      grounds: 'Reason',
    };
    assert.equal(typeof generateExclusionReviewText(data), 'string');
  });
});

describe('generateSENDTribunalText', () => {
  it('returns tribunal application with all fields', () => {
    const data = {
      childName: 'Jordan Doe',
      laName: 'Bristol City Council',
      ehcpDate: '2025-09-01',
      grounds: 'The LA failed to issue the EHCP within statutory timescales',
    };
    const text = generateSENDTribunalText(data);
    assert.ok(text.includes('Jordan Doe'));
    assert.ok(text.includes('Bristol City Council'));
    assert.ok(text.includes('2025-09-01'));
    assert.ok(text.includes('The LA failed to issue the EHCP within statutory timescales'));
  });

  it('returns a string', () => {
    const data = {
      childName: 'Child',
      laName: 'Council',
      ehcpDate: '2025-01-01',
      grounds: 'Grounds',
    };
    assert.equal(typeof generateSENDTribunalText(data), 'string');
  });
});

describe('getSENDTribunalStages', () => {
  it('returns four stages in order', () => {
    const stages = getSENDTribunalStages();
    assert.equal(stages.length, 4);
    assert.equal(stages[0], 'mediation');
    assert.equal(stages[1], 'tribunal application');
    assert.equal(stages[2], 'hearing');
    assert.equal(stages[3], 'decision');
  });
});

describe('getEvidenceChecklist', () => {
  it('returns checklist for exclusion-review', () => {
    const list = getEvidenceChecklist('exclusion-review');
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0);
    assert.ok(list.some((item) => /letter/i.test(item) || /notice/i.test(item)));
  });

  it('returns checklist for send-tribunal', () => {
    const list = getEvidenceChecklist('send-tribunal');
    assert.ok(list.length > 0);
    assert.ok(list.some((item) => /EHCP/i.test(item)));
  });

  it('returns generic checklist for unknown type', () => {
    const list = getEvidenceChecklist('unknown-type');
    assert.ok(list.length > 0);
  });
});

describe('serializeSEND / parseSEND', () => {
  it('round-trips a value through localStorage mock', () => {
    const store = {};
    const localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    };

    const data = { childName: 'Test', appealType: 'send-tribunal', count: 3 };
    serializeSEND(data, localStorage);
    const result = parseSEND(localStorage.getItem('send-appeals-data'));
    assert.deepEqual(result, data);
  });

  it('returns null for empty input', () => {
    assert.equal(parseSEND(null), null);
    assert.equal(parseSEND(''), null);
  });

  it('returns null for invalid JSON', () => {
    assert.equal(parseSEND('not-json'), null);
  });
});
