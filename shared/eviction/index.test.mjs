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
  parseEviction,
  checkSection21Transition,
  daysBetween,
  RRA_COMMENCEMENT
} from './index.mjs';

// --- getNoticeTypes ---

test('getNoticeTypes returns all 9 notice types (6 pre-RRA + 3 RRA)', () => {
  const types = getNoticeTypes();
  assert.ok(Array.isArray(types));
  assert.equal(types.length, 9);
});

test('getNoticeTypes includes section21 with abolished flag', () => {
  const types = getNoticeTypes();
  const s21 = types.find((t) => t.id === 'section21');
  assert.ok(s21);
  assert.equal(s21.abolished, true);
  assert.equal(s21.abolishedDate, '2026-05-01');
  assert.ok(s21.source);
});

test('getNoticeTypes includes all pre-RRA section 8 grounds', () => {
  const types = getNoticeTypes();
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('section8-ground8'));
  assert.ok(ids.includes('section8-ground10'));
  assert.ok(ids.includes('section8-ground11'));
  assert.ok(ids.includes('section8-ground12'));
  assert.ok(ids.includes('section8-ground14'));
});

test('getNoticeTypes includes new RRA grounds', () => {
  const types = getNoticeTypes();
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('rra-ground-landlord-sale'));
  assert.ok(ids.includes('rra-ground-landlord-move-in'));
  assert.ok(ids.includes('rra-ground-serious-arrears'));
});

test('getNoticeTypes each type has required fields', () => {
  const types = getNoticeTypes();
  for (const t of types) {
    assert.ok(t.id, `${t.id} missing id`);
    assert.ok(t.name, `${t.id} missing name`);
    assert.ok(t.description, `${t.id} missing description`);
    assert.ok(t.source, `${t.id} missing source`);
  }
});

// --- checkSection21Transition ---

test('checkSection21Transition pre-abolition notice returns transition status', () => {
  const result = checkSection21Transition('2026-04-30');
  assert.equal(result.status, 'transition');
});

test('checkSection21Transition post-abolition notice with court deadline returns critical status', () => {
  const result = checkSection21Transition('2026-06-01');
  assert.equal(result.status, 'critical');
  assert.ok(result.message.includes('abolished'));
});

test('checkSection21Transition on commencement date returns critical status', () => {
  const result = checkSection21Transition(RRA_COMMENCEMENT);
  assert.equal(result.status, 'critical');
});

test('checkSection21Transition invalid date returns unknown', () => {
  const result = checkSection21Transition('');
  assert.equal(result.status, 'unknown');
});

// --- daysBetween (UTC-safe) ---

test('daysBetween returns correct day count', () => {
  const days = daysBetween('2026-05-01', '2026-06-15');
  assert.equal(days, 45);
});

test('daysBetween returns NaN for invalid dates', () => {
  assert.ok(Number.isNaN(daysBetween('not-a-date', '2026-06-15')));
});

test('daysBetween handles month boundaries correctly', () => {
  const days = daysBetween('2026-01-31', '2026-03-01');
  assert.equal(days, 29);
});

// --- getGroundsOfSection8 ---

test('getGroundsOfSection8 returns 8 grounds (5 pre-RRA + 3 RRA)', () => {
  const grounds = getGroundsOfSection8();
  assert.ok(Array.isArray(grounds));
  assert.equal(grounds.length, 8);
});

test('getGroundsOfSection8 ground 8 is mandatory', () => {
  const grounds = getGroundsOfSection8();
  const g8 = grounds.find((g) => g.id === 'ground8');
  assert.ok(g8);
  assert.equal(g8.type, 'mandatory');
  assert.ok(g8.requirement.toLowerCase().includes('rent arrears'));
});

test('getGroundsOfSection8 ground 14 is discretionary with immediate proceedings', () => {
  const grounds = getGroundsOfSection8();
  const g14 = grounds.find((g) => g.id === 'ground14');
  assert.ok(g14);
  assert.equal(g14.type, 'discretionary');
  assert.equal(g14.noticeDays, 0);
});

test('getGroundsOfSection8 includes RRA grounds', () => {
  const grounds = getGroundsOfSection8();
  const ids = grounds.map((g) => g.id);
  assert.ok(ids.includes('rra-ground-landlord-sale'));
  assert.ok(ids.includes('rra-ground-landlord-move-in'));
  assert.ok(ids.includes('rra-ground-serious-arrears'));
});

// --- validateSection21 (now hard-blocks post-abolition dates) ---

test('validateSection21 pre-abolition notice with all requirements passes', () => {
  const result = validateSection21({
    noticeServedDate: '2026-04-15',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('validateSection21 post-abolition notice returns transition errors', () => {
  const result = validateSection21({
    noticeServedDate: '2026-06-01',
    prescribedForm: true,
    depositProtected: true,
    hmoLicense: true,
    epcProvided: true,
    gasSafetyCertificate: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('abolished')));
});

test('validateSection21 missing noticeServedDate returns error', () => {
  const result = validateSection21({
    prescribedForm: true,
    depositProtected: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('date') || e.includes('Date')));
});

test('validateSection21 returns transition object', () => {
  const result = validateSection21({
    noticeServedDate: '2026-04-01'
  });
  assert.ok(result.transition);
  assert.equal(result.transition.status, 'transition');
});

// --- validateSection8 (RRA-aware) ---

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

test('validateSection8 RRA serious arrears requires 3+ months', () => {
  const result = validateSection8({
    ground: 'rra-ground-serious-arrears',
    noticeServedDate: '2026-06-01',
    rentArrearsMonths: 2,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('3 months')));
});

test('validateSection8 RRA serious arrears passes with 3+ months', () => {
  const result = validateSection8({
    ground: 'rra-ground-serious-arrears',
    noticeServedDate: '2026-06-01',
    rentArrearsMonths: 3,
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, true);
});

test('validateSection8 RRA landlord sale requires evidence', () => {
  const result = validateSection8({
    ground: 'rra-ground-landlord-sale',
    noticeServedDate: '2026-06-01',
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Evidence') || e.includes('evidence')));
});

test('validateSection8 invalid ground returns error', () => {
  const result = validateSection8({ ground: 'invalid' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('ground')));
});

test('validateSection8 missing ground returns error', () => {
  const result = validateSection8({});
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
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('arrears')));
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

test('validateSection8 ground 14 with no nuisance details returns error', () => {
  const result = validateSection8({
    ground: 'ground14',
    noticeServedDate: '2026-05-01',
    serviceMethod: 'personal'
  });
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some(
      (e) => e.toLowerCase().includes('nuisance') || e.toLowerCase().includes('anti-social')
    )
  );
});

// --- generateChallengeText ---

test('generateChallengeText includes tenant and landlord names', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served']
  });
  assert.ok(text.includes('John Smith'));
  assert.ok(text.includes('Acme Lettings'));
});

test('generateChallengeText uses information language not invalid language', () => {
  const text = generateChallengeText({
    noticeType: 'section21',
    tenantName: 'John Smith',
    landlordName: 'Acme Lettings',
    issues: ['No prescribed form served']
  });
  assert.ok(text.includes('issues'));
  assert.ok(text.includes('information purposes'));
  assert.ok(!text.includes('invalid'));
});

// --- getDepositProtectionChecklist ---

test('getDepositProtectionChecklist returns array with 6 items', () => {
  const checklist = getDepositProtectionChecklist();
  assert.ok(Array.isArray(checklist));
  assert.equal(checklist.length, 6);
});

test('getDepositProtectionChecklist each item has required fields', () => {
  const checklist = getDepositProtectionChecklist();
  for (const item of checklist) {
    assert.ok(item.id);
    assert.ok(item.description);
    assert.equal(typeof item.required, 'boolean');
  }
});

// --- getCourtTimeline ---

test('getCourtTimeline returns timeline with 3 stages', () => {
  const timeline = getCourtTimeline('section21');
  assert.ok(Array.isArray(timeline));
  assert.equal(timeline.length, 3);
});

test('getCourtTimeline section21 first stage is notice period', () => {
  const timeline = getCourtTimeline('section21');
  assert.ok(timeline[0].name.toLowerCase().includes('notice'));
});

test('getCourtTimeline includes possession hearing and bailiff', () => {
  const timeline = getCourtTimeline('section8-ground8');
  assert.ok(timeline.some((s) => s.name.toLowerCase().includes('hearing')));
  assert.ok(timeline.some((s) => s.name.toLowerCase().includes('bailiff')));
});

// --- serializeEviction / parseEviction ---

test('serializeEviction and parseEviction roundtrip', () => {
  const data = [{ id: '1', tenantName: 'Alice' }];
  const result = parseEviction(serializeEviction(data));
  assert.equal(result.length, 1);
  assert.equal(result[0].tenantName, 'Alice');
});

test('parseEviction returns empty array for invalid JSON', () => {
  assert.deepEqual(parseEviction('not-json'), []);
});

test('parseEviction returns empty array for empty string', () => {
  assert.deepEqual(parseEviction(''), []);
});
