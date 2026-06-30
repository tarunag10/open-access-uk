import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNoticeTypes,
  validateSection21,
  validateSection8,
  getGroundsOfSection8,
  generateChallengeText,
  getDepositProtectionChecklist,
  getCourtTimeline,
  serializeEviction,
  parseEviction
} from './index.mjs';

// --- getNoticeTypes ---

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
  assert.ok(s21.source);
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

test('getNoticeTypes each type has required fields', () => {
  const types = getNoticeTypes();
  for (const t of types) {
    assert.ok(t.id, `${t.id} missing id`);
    assert.ok(t.name, `${t.id} missing name`);
    assert.ok(t.noticeDays > 0, `${t.id} missing noticeDays`);
    assert.ok(t.description, `${t.id} missing description`);
    assert.ok(t.source, `${t.id} missing source`);
  }
});

// --- getGroundsOfSection8 ---

test('getGroundsOfSection8 returns 5 grounds', () => {
  const grounds = getGroundsOfSection8();
  assert.ok(Array.isArray(grounds));
  assert.equal(grounds.length, 5);
});

test('getGroundsOfSection8 ground 8 is mandatory with 2 weeks rent arrears', () => {
  const grounds = getGroundsOfSection8();
  const g8 = grounds.find((g) => g.id === 'ground8');
  assert.ok(g8);
  assert.equal(g8.type, 'mandatory');
  assert.ok(g8.requirement.toLowerCase().includes('rent arrears'));
  assert.equal(g8.noticeDays, 14);
});

test('getGroundsOfSection8 ground 10 is discretionary with some rent arrears', () => {
  const grounds = getGroundsOfSection8();
  const g10 = grounds.find((g) => g.id === 'ground10');
  assert.ok(g10);
  assert.equal(g10.type, 'discretionary');
  assert.ok(g10.requirement.toLowerCase().includes('rent arrears'));
  assert.equal(g10.noticeDays, 14);
});

test('getGroundsOfSection8 ground 11 is discretionary with persistent late payment', () => {
  const grounds = getGroundsOfSection8();
  const g11 = grounds.find((g) => g.id === 'ground11');
  assert.ok(g11);
  assert.equal(g11.type, 'discretionary');
  assert.ok(g11.requirement.toLowerCase().includes('late payment') || g11.requirement.toLowerCase().includes('delay'));
  assert.equal(g11.noticeDays, 14);
});

test('getGroundsOfSection8 ground 12 is discretionary with breach of obligation', () => {
  const grounds = getGroundsOfSection8();
  const g12 = grounds.find((g) => g.id === 'ground12');
  assert.ok(g12);
  assert.equal(g12.type, 'discretionary');
  assert.ok(g12.requirement.toLowerCase().includes('breach') || g12.requirement.toLowerCase().includes('obligation'));
  assert.equal(g12.noticeDays, 14);
});

test('getGroundsOfSection8 ground 14 is discretionary with nuisance/ASB', () => {
  const grounds = getGroundsOfSection8();
  const g14 = grounds.find((g) => g.id === 'ground14');
  assert.ok(g14);
  assert.equal(g14.type, 'discretionary');
  assert.ok(g14.requirement.toLowerCase().includes('nuisance') || g14.requirement.toLowerCase().includes('anti-social'));
  assert.equal(g14.noticeDays, 14);
});

// --- validateSection21 ---

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

test('validateSection21 missing HMO license returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: false,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('hmo')));
});

test('validateSection21 missing EPC returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: false,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('epc')));
});

test('validateSection21 missing gas safety certificate returns error', () => {
  const result = validateSection21({
    noticeServedDate: '2026-05-01',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: false
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('gas')));
});

test('validateSection21 multiple failures collects all errors', () => {
  const result = validateSection21({
    noticeServedDate: '2026-06-25',
    possessionDate: '2026-07-01',
    prescribedForm: false,
    depositProtected: false,
    hmoLicense: false,
    epcProvided: false,
    gasSafetyCertificate: false
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4);
});

// --- validateSection8 ---

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

test('validateSection8 invalid ground returns error', () => {
  const result = validateSection8({
    ground: 'invalid',
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 3,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('ground')));
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

test('validateSection8 ground 10 with no rent arrears returns error', () => {
  const result = validateSection8({
    ground: 'ground10',
    noticeServedDate: '2026-05-01',
    rentArrearsMonths: 0,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('arrears') || e.toLowerCase().includes('rent')));
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

// --- generateChallengeText ---

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

// --- getDepositProtectionChecklist ---

test('getDepositProtectionChecklist returns an array', () => {
  const checklist = getDepositProtectionChecklist();
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length > 0);
});

test('getDepositProtectionChecklist each item has required fields', () => {
  const checklist = getDepositProtectionChecklist();
  for (const item of checklist) {
    assert.ok(item.id);
    assert.ok(item.description);
    assert.equal(typeof item.required, 'boolean');
  }
});

test('getDepositProtectionChecklist includes prescribed information', () => {
  const checklist = getDepositProtectionChecklist();
  const pi = checklist.find((c) => c.id === 'prescribed-information');
  assert.ok(pi);
  assert.equal(pi.required, true);
});

test('getDepositProtectionChecklist includes protection certificate', () => {
  const checklist = getDepositProtectionChecklist();
  const cert = checklist.find((c) => c.id === 'protection-certificate');
  assert.ok(cert);
  assert.equal(cert.required, true);
});

// --- getCourtTimeline ---

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

// --- serializeEviction / parseEviction ---

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
