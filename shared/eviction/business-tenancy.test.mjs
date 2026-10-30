import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BUSINESS_TENANCY_SOURCES, validateBusinessTenancyNotice } from './business-tenancy.mjs';

const base = {
  tenantName: 'Example Retail Ltd',
  tenantAddressForService: '1 High Street, London',
  landlordName: 'Example Estates Ltd',
  landlordAddressForService: '2 High Street, London',
  propertyAddress: '1 High Street, London',
  noticeDate: '2027-01-14',
  serviceMethod: 'post',
  contractedOut: 'no',
  leaseExpiryDate: '2027-09-30',
  telecomTenancy: 'no'
};

test('business notice guidance points to official guide and prescribed forms', () => {
  assert.match(BUSINESS_TENANCY_SOURCES.guidance, /^https:\/\/www\.gov\.uk\//);
  assert.match(BUSINESS_TENANCY_SOURCES.prescribedForms, /forms-prescribed/);
  assert.match(BUSINESS_TENANCY_SOURCES.section29A, /section\/29A/);
  assert.match(BUSINESS_TENANCY_SOURCES.section29B, /section\/29B/);
  assert.match(BUSINESS_TENANCY_SOURCES.practiceDirection56, /pd_part56/);
});

test('Section 25 reports the statutory claim deadline as the termination date', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years at £24,000 per annum',
    extensionStatus: 'no'
  });
  assert.equal(result.applicationDeadline.statutoryDate, '2027-09-30');
  assert.equal(result.applicationDeadline.extensionDate, null);
  assert.equal(result.applicationDeadline.status, 'calculated');
});

test('Section 26 reports the day before commencement and earliest claim date', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'unknown',
    extensionStatus: 'no'
  });
  assert.equal(result.applicationDeadline.statutoryDate, '2027-09-30');
  assert.equal(result.applicationDeadline.earliestDate, '2027-03-15');
});

test('Section 26 counter-notice allows an earlier application only after it is given', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'opposes',
    counterNoticeDate: '2027-02-20',
    oppositionGrounds: 'Ground 30(1)(g)',
    extensionStatus: 'no'
  });
  assert.equal(result.applicationDeadline.earliestDate, '2027-02-20');
});

test('Section 29B reports a timely agreed extension and rejects an unverified late agreement', () => {
  const details = {
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years',
    extensionAgreementDate: '2027-08-31',
    extendedPeriodEndDate: '2027-12-31',
    extensionStatus: 'yes'
  };
  const extended = validateBusinessTenancyNotice(details);
  assert.equal(extended.applicationDeadline.extensionDate, '2027-12-31');
  assert.equal(extended.applicationDeadline.status, 'review-required');
  const late = validateBusinessTenancyNotice({ ...details, extensionAgreementDate: '2027-10-01' });
  assert.equal(late.applicationDeadline.status, 'review-required');
  assert.equal(late.applicationDeadline.extensionDate, null);
  assert.ok(
    late.warnings.some((warning) =>
      warning.includes('agreement date is after the statutory period')
    )
  );
  const beforeService = validateBusinessTenancyNotice({
    ...details,
    extensionAgreementDate: '2026-12-01'
  });
  assert.equal(beforeService.applicationDeadline.extensionDate, null);
  assert.equal(beforeService.applicationDeadline.status, 'review-required');
  const further = validateBusinessTenancyNotice({
    ...details,
    extendedPeriodEndDate: '2027-11-30',
    furtherExtensionAgreementDate: '2027-11-15',
    finalExtendedPeriodEndDate: '2028-02-29'
  });
  assert.equal(further.applicationDeadline.extensionDate, '2028-02-29');
  assert.equal(further.applicationDeadline.status, 'review-required');
});

test('deadline stays uncalculated when dates are missing or malformed', () => {
  const result = validateBusinessTenancyNotice({ ...base, noticeType: 'section25' });
  assert.equal(result.applicationDeadline.statutoryDate, null);
  assert.equal(result.applicationDeadline.status, 'incomplete');
});

test('unsupported notice types do not receive a Section 25 or Section 26 deadline', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'unknown',
    newTenancyDate: '2027-10-01',
    serviceDate: '2027-01-15',
    extensionStatus: 'no'
  });
  assert.equal(result.applicationDeadline.statutoryDate, null);
  assert.equal(result.applicationDeadline.earliestDate, null);
  assert.equal(result.applicationDeadline.statutoryEndpoint, 'not-calculated');
  assert.equal(result.applicationDeadline.status, 'incomplete');
});

test('Section 26 two-month boundary and counter-notice boundary are preserved', () => {
  const withinWindow = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-31',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'opposes',
    counterNoticeDate: '2027-03-31',
    oppositionGrounds: 'Ground 30(1)(g)',
    extensionStatus: 'no'
  });
  assert.equal(withinWindow.applicationDeadline.earliestDate, '2027-03-31');
  assert.equal(
    withinWindow.errors.some((error) => error.includes('two calendar months')),
    false
  );
  const beyondWindow = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-31',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'opposes',
    counterNoticeDate: '2027-04-01',
    oppositionGrounds: 'Ground 30(1)(g)',
    extensionStatus: 'no'
  });
  assert.ok(beyondWindow.errors.some((error) => error.includes('two calendar months')));
  assert.equal(beyondWindow.applicationDeadline.earliestDate, '2027-03-31');
  const beforeRequest = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'opposes',
    counterNoticeDate: '2027-01-14',
    oppositionGrounds: 'Ground 30(1)(g)',
    extensionStatus: 'no'
  });
  assert.equal(beforeRequest.applicationDeadline.earliestDate, '2027-03-15');
  assert.ok(beforeRequest.errors.some((error) => error.includes('before the request date')));
});

test('telecom jurisdiction check distinguishes possible code-rights cases', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years',
    telecomTenancy: 'yes',
    telecomSubsistingAgreement: 'yes',
    telecomPrimaryPurposeCodeRights: 'yes'
  });
  assert.equal(result.applicationDeadline.jurisdiction, 'tribunal-review-required');
  assert.ok(result.warnings.some((warning) => warning.includes('First-tier Tribunal')));
  const excluded = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years',
    extensionStatus: 'no',
    telecomTenancy: 'yes',
    telecomSubsistingAgreement: 'no',
    telecomPrimaryPurposeCodeRights: 'yes'
  });
  assert.equal(excluded.applicationDeadline.jurisdiction, 'court');
  assert.equal(
    excluded.warnings.some((warning) => warning.includes('First-tier Tribunal')),
    false
  );
});

test('unopposed Section 25 checklist accepts a complete in-window Form 1', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years at £24,000 per annum'
  });
  assert.equal(result.valid, true);
  assert.equal(result.status, 'check-required');
  assert.ok(result.warnings.length);
});

test('opposed Section 25 requires Form 2 and Section 30 grounds', () => {
  const missing = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'opposed'
  });
  assert.ok(missing.errors.some((error) => error.includes('does not match')));
  assert.ok(missing.errors.some((error) => error.includes('Section 30')));
  const complete = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form2',
    serviceDate: '2027-01-15',
    terminationDate: '2027-09-30',
    opposition: 'opposed',
    oppositionGrounds: 'Ground 30(1)(g), redevelopment'
  });
  assert.equal(complete.valid, true);
});

test('Section 26 checks Form 3, proposed terms and counter-notice timing', () => {
  const complete = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years; rent to be agreed',
    proposedProperty: 'Whole premises',
    landlordResponse: 'accepts'
  });
  assert.equal(complete.valid, true);
  const late = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Three years',
    proposedProperty: 'Whole premises',
    landlordResponse: 'opposes',
    counterNoticeDate: '2027-04-16',
    oppositionGrounds: 'Ground 30(1)(a)'
  });
  assert.ok(late.errors.some((error) => error.includes('two calendar months')));
});

test('business date checks flag notices outside six to twelve months and dates before lease expiry', () => {
  const tooEarly = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section25',
    noticeForm: 'form1',
    serviceDate: '2026-09-29',
    terminationDate: '2027-09-30',
    opposition: 'unopposed',
    landlordProposedTerms: 'Five years at £24,000 per annum'
  });
  assert.ok(tooEarly.errors.some((error) => error.includes('6-to-12-month')));
  const beforeExpiry = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-09-29',
    proposedTerms: 'Rent to be agreed',
    proposedProperty: 'Whole premises',
    landlordResponse: 'unknown'
  });
  assert.ok(beforeExpiry.errors.some((error) => error.includes('before the lease expiry')));
});

test('contracting out and the 30 July 2026 telecom change are surfaced', () => {
  const result = validateBusinessTenancyNotice({
    ...base,
    noticeType: 'section26',
    noticeForm: 'form3',
    serviceDate: '2027-01-15',
    newTenancyDate: '2027-10-01',
    proposedTerms: 'Rent to be agreed',
    proposedProperty: 'Whole premises',
    landlordResponse: 'unknown',
    contractedOut: 'yes',
    telecomTenancy: 'yes'
  });
  assert.ok(result.errors.some((error) => error.includes('contracted out')));
  assert.ok(result.warnings.some((warning) => warning.includes('30 July 2026')));
});

test('business tenancy tab exposes accessible fields and official forms links', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../../eviction-notice-validator/index.html', import.meta.url)),
    'utf8'
  );
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="business-tenancy-panel"/);
  for (const field of [
    'tenantAddressForService',
    'landlordAddressForService',
    'noticeDate',
    'serviceMethod',
    'noticeForm',
    'serviceDate',
    'leaseExpiryDate',
    'terminationDate',
    'newTenancyDate',
    'proposedProperty',
    'proposedTerms',
    'landlordProposedTerms',
    'counterNoticeDate',
    'oppositionGrounds',
    'extensionStatus',
    'extensionAgreementDate',
    'extendedPeriodEndDate',
    'furtherExtensionAgreementDate',
    'finalExtendedPeriodEndDate',
    'telecomSubsistingAgreement',
    'telecomPrimaryPurposeCodeRights'
  ]) {
    assert.match(html, new RegExp(`name="${field}"`), `${field} is missing`);
  }
  assert.match(html, /forms-prescribed-under-the-landlord-and-tenant-act-1954/);
  assert.match(html, /business lease renewal guide/);
  assert.match(html, /section 29B/);
  assert.match(html, /Was the application period extended by agreement under section 29B/i);
  assert.doesNotMatch(html, /extended by written agreement under section 29B/i);
  assert.doesNotMatch(html, /Date the first written extension agreement was made/i);
  assert.match(html, /Date the first agreement extending the application period was made/i);
  assert.match(html, /application deadline \(preliminary estimate\)/i);
  assert.match(html, /section\/29A/);
  assert.match(html, /section\/29B/);
  assert.match(html, /rules\/part56/);
  const tracker = readFileSync(
    fileURLToPath(new URL('../../eviction-notice-validator/src/tracker.js', import.meta.url)),
    'utf8'
  );
  assert.match(tracker, /Deadline or extension details need review\./);
  assert.match(tracker, /applicationDeadline\.status === 'calculated'/);
});
