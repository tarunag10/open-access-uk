import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPOSIT_SCHEMES,
  escapeHtml,
  getNoticeTypes,
  getGroundsOfSection8,
  getDepositProtectionChecklist,
  validateSection21,
  validateSection8,
  generateChallengeText,
  getCourtTimeline,
  serializeEviction,
  parseEviction
} from '../src/tracker.js';

test('DEPOSIT_SCHEMES includes all three schemes', () => {
  const values = DEPOSIT_SCHEMES.map((s) => s.value);
  assert.ok(values.includes('dps'), 'missing DPS');
  assert.ok(values.includes('mydeposits'), 'missing mydeposits');
  assert.ok(values.includes('tenancy-deposit-scheme'), 'missing TDS');
});

test('escapeHtml escapes special characters', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml("O'Brien"), 'O&#39;Brien');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
});

test('getNoticeTypes returns all 6 notice types', () => {
  const types = getNoticeTypes();
  assert.ok(Array.isArray(types));
  assert.equal(types.length, 6);
});

test('getNoticeTypes includes section21', () => {
  const types = getNoticeTypes();
  const s21 = types.find((t) => t.id === 'section21');
  assert.ok(s21);
  assert.equal(s21.noticeDays, 62);
});

test('getNoticeTypes includes all section 8 grounds', () => {
  const types = getNoticeTypes();
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('section8-ground8'));
  assert.ok(ids.includes('section8-ground10'));
  assert.ok(ids.includes('section8-ground11'));
  assert.ok(ids.includes('section8-ground12'));
  assert.ok(ids.includes('section8-ground14'));
});

test('getGroundsOfSection8 returns 5 grounds', () => {
  const grounds = getGroundsOfSection8();
  assert.ok(Array.isArray(grounds));
  assert.equal(grounds.length, 5);
});

test('getGroundsOfSection8 ground 8 is mandatory', () => {
  const grounds = getGroundsOfSection8();
  const g8 = grounds.find((g) => g.id === 'ground8');
  assert.ok(g8);
  assert.equal(g8.type, 'mandatory');
  assert.equal(g8.noticeDays, 14);
});

test('getDepositProtectionChecklist returns array with items', () => {
  const checklist = getDepositProtectionChecklist();
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length > 0);
});

test('getDepositProtectionChecklist each item has id and description', () => {
  const checklist = getDepositProtectionChecklist();
  for (const item of checklist) {
    assert.ok(item.id);
    assert.ok(item.description);
    assert.equal(typeof item.required, 'boolean');
  }
});

test('validateSection21 valid notice returns no errors', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('validateSection21 missing noticeServedDate returns error', () => {
  const result = validateSection21({
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('date') || e.includes('Date')));
});

test('validateSection21 notice period less than 62 days returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-06-25',
    possessionDate: '2026-07-10',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('period') || e.includes('days') || e.includes('2 month')));
});

test('validateSection21 missing prescribed form returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: false,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('prescribed form')));
});

test('validateSection21 deposit not protected returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: true,
    depositProtected: false,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('deposit')));
});

test('validateSection8 valid ground 8 returns no errors', () => {
  const result = validateSection8({
    ground: 'ground8',
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 3,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('validateSection8 missing ground returns error', () => {
  const result = validateSection8({
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 3,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('ground')));
});

test('validateSection8 ground 8 with insufficient arrears returns error', () => {
  const result = validateSection8({
    ground: 'ground8',
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 1,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('arrears') || e.toLowerCase().includes('rent')));
});

test('validateSection8 missing service method returns error', () => {
  const result = validateSection8({
    ground: 'ground8',
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 3
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('service')));
});

test('validateSection8 ground 12 with no breach details returns error', () => {
  const result = validateSection8({
    ground: 'ground12',
    noticeServedDate: '2026-05-01',
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('breach') || e.toLowerCase().includes('obligation')));
});

test('validateSection8 ground 14 with no nuisance details returns error', () => {
  const result = validateSection8({
    ground: 'ground14',
    noticeServedDate: '2026-05-01',
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('nuisance') || e.toLowerCase().includes('anti-social')));
});

test('generateChallengeText returns a string', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served']
  });
  assert.equal(typeof text, 'string');
  assert.ok(text.length > 0);
});

test('generateChallengeText includes tenant name', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served']
  });
  assert.ok(text.includes('John Smith'));
});

test('generateChallengeText includes landlord name', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served']
  });
  assert.ok(text.includes('Acme Lettings'));
});

test('generateChallengeText includes issue details', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served', 'Deposit not protected']
  });
  assert.ok(text.includes('prescribed form'));
  assert.ok(text.includes('Deposit'));
});

test('generateChallengeText includes notice type', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['Invalid notice']
  });
  assert.ok(text.includes('Section 21'));
});

test('getCourtTimeline section21 returns timeline with 3 stages', () => {
  const timeline = getCourtTimeline('section21');
  assert.ok(Array.isArray(timeline));
  assert.ok(timeline.length >= 3);
});

test('getCourtTimeline section21 first stage is notice period', () => {
  const timeline = getCourtTimeline('section21');
  assert.ok(timeline[0].name.toLowerCase().includes('notice'));
});

test('getCourtTimeline section21 includes possession hearing', () => {
  const timeline = getCourtTimeline('section21');
  const hearing = timeline.find((s) => s.name.toLowerCase().includes('hearing') || s.name.toLowerCase().includes('court'));
  assert.ok(hearing);
});

test('getCourtTimeline section21 includes bailiff stage', () => {
  const timeline = getCourtTimeline('section21');
  const bailiff = timeline.find((s) => s.name.toLowerCase().includes('bailiff'));
  assert.ok(bailiff);
  assert.ok(bailiff.minDays >= 28);
});

test('getCourtTimeline section8 returns valid timeline', () => {
  const timeline = getCourtTimeline('section8-ground8');
  assert.ok(Array.isArray(timeline));
  assert.ok(timeline.length >= 3);
});

test('getCourtTimeline unknown type returns section21 as fallback', () => {
  const timeline = getCourtTimeline('unknown');
  assert.ok(Array.isArray(timeline));
  assert.ok(timeline.length >= 3);
});

test('serializeEviction produces JSON string', () => {
  const data = [{ id: '1', tenantName: 'Test' }];
  const serialized = serializeEviction(data);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed[0].tenantName, 'Test');
});

test('parseEviction parses valid JSON', () => {
  const data = [{ id: '1', tenantName: 'Test' }];
  const json = JSON.stringify(data);
  const result = parseEviction(json);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 1);
  assert.equal(result[0].tenantName, 'Test');
});

test('parseEviction returns empty array for invalid JSON', () => {
  assert.deepEqual(parseEviction('not-json'), []);
});

test('parseEviction returns empty array for non-array JSON', () => {
  assert.deepEqual(parseEviction('{"foo":"bar"}'), []);
});

test('parseEviction returns empty array for empty string', () => {
  assert.deepEqual(parseEviction(''), []);
});

test('serializeEviction and parseEviction roundtrip', () => {
  const d1 = { id: 'e1', tenantName: 'Alice', noticeType: 'section21' };
  const d2 = { id: 'e2', tenantName: 'Bob', noticeType: 'section8-ground8' };
  const roundtripped = parseEviction(serializeEviction([d1, d2]));
  assert.equal(roundtripped.length, 2);
  assert.equal(roundtripped[0].tenantName, 'Alice');
  assert.equal(roundtripped[1].tenantName, 'Bob');
});
