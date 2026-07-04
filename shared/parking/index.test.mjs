import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getParkingOperators,
  getAppealDeadlines,
  generateAppealText,
  getGroundsOfAppeal,
  getTribunalRoute,
  checkNoticeValidity,
  serializeParking,
  parseParking
} from './index.mjs';

describe('getParkingOperators', () => {
  it('returns all expected operators', () => {
    const operators = getParkingOperators();
    const ids = operators.map((o) => o.id);
    assert.ok(ids.includes('council'));
    assert.ok(ids.includes('parking-ey'));
    assert.ok(ids.includes('apcoa'));
    assert.ok(ids.includes('ncp'));
    assert.ok(ids.includes('q-park'));
    assert.ok(ids.includes('traffic-penalty-tribunal'));
  });

  it('each operator has required fields', () => {
    const operators = getParkingOperators();
    for (const op of operators) {
      assert.ok(op.id, `operator ${JSON.stringify(op)} missing id`);
      assert.ok(op.name, `operator ${JSON.stringify(op)} missing name`);
      assert.ok(op.type, `operator ${JSON.stringify(op)} missing type`);
    }
  });
});

describe('getAppealDeadlines', () => {
  it('council returns 28 days for formal appeal', () => {
    const d = getAppealDeadlines('council');
    assert.equal(d.formalAppealDays, 28);
  });

  it('private operator returns 28 days', () => {
    const d = getAppealDeadlines('parking-ey');
    assert.equal(d.formalAppealDays, 28);
  });

  it('tribunal returns 28 days from rejection', () => {
    const d = getAppealDeadlines('traffic-penalty-tribunal');
    assert.equal(d.tribunalDays, 28);
  });
});

describe('generateAppealText', () => {
  it('returns appeal letter with required fields', () => {
    const text = generateAppealText({
      operatorType: 'council',
      penaltyNoticeNumber: 'PCN123456',
      dateOfViolation: '2026-01-15',
      grounds: 'No clear signage',
      evidence: 'Photographs of the location'
    });
    assert.ok(text.includes('PCN123456'));
    assert.ok(text.includes('2026-01-15'));
    assert.ok(text.includes('No clear signage'));
    assert.ok(text.includes('Photographs of the location'));
    assert.ok(text.includes('council'));
  });
});

describe('getGroundsOfAppeal', () => {
  it('returns common grounds', () => {
    const grounds = getGroundsOfAppeal();
    assert.ok(grounds.some((g) => g.includes('signage') || g.includes('No')));
    assert.ok(grounds.some((g) => g.includes('incorrect') || g.includes('Incorrect')));
    assert.ok(grounds.some((g) => g.includes('extenuating') || g.includes('Extenuating')));
    assert.ok(grounds.some((g) => g.includes('procedural') || g.includes('Procedural')));
    assert.ok(grounds.some((g) => g.includes('permit') || g.includes('Permit')));
  });
});

describe('getTribunalRoute', () => {
  it('council is eligible for tribunal', () => {
    assert.equal(getTribunalRoute('council'), true);
  });

  it('private operator is not eligible', () => {
    assert.equal(getTribunalRoute('parking-ey'), false);
  });
});

describe('checkNoticeValidity', () => {
  it('valid notice passes', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 30);
    const result = checkNoticeValidity({
      noticeDate: recent.toISOString().split('T')[0],
      pcnNumber: 'PCN123456'
    });
    assert.equal(result.valid, true);
  });

  it('notice older than 6 months fails', () => {
    const old = new Date();
    old.setMonth(old.getMonth() - 7);
    const result = checkNoticeValidity({
      noticeDate: old.toISOString().split('T')[0],
      pcnNumber: 'PCN123456'
    });
    assert.equal(result.valid, false);
  });

  it('invalid PCN format fails', () => {
    const result = checkNoticeValidity({
      noticeDate: '2026-06-01',
      pcnNumber: 'INVALID'
    });
    assert.equal(result.valid, false);
  });
});

describe('serializeParking / parseParking', () => {
  it('round-trips a value', () => {
    const data = { foo: 'bar', num: 42 };
    const serialized = serializeParking(data);
    const parsed = parseParking(serialized);
    assert.deepEqual(parsed, data);
  });

  it('handles strings', () => {
    const val = 'hello';
    assert.equal(parseParking(serializeParking(val)), val);
  });

  it('handles null', () => {
    const val = null;
    assert.equal(parseParking(serializeParking(val)), val);
  });
});
