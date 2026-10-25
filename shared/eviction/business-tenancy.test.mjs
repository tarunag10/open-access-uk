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
    'oppositionGrounds'
  ]) {
    assert.match(html, new RegExp(`name="${field}"`), `${field} is missing`);
  }
  assert.match(html, /forms-prescribed-under-the-landlord-and-tenant-act-1954/);
  assert.match(html, /business lease renewal guide/);
});
