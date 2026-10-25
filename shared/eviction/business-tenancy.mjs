/**
 * Preliminary checks for business tenancy renewal notices under Part II of
 * the Landlord and Tenant Act 1954. This is a date and completeness checklist,
 * not a determination of statutory validity.
 */

import { parseLocalDate, toLocalDateString } from '../deadlines/index.mjs';

export const BUSINESS_TENANCY_SOURCES = {
  guidance:
    'https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords',
  prescribedForms:
    'https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords/forms-prescribed-under-the-landlord-and-tenant-act-1954-part-2-notices-regulations-2004',
  section25: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/25',
  section26: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/26',
  section30: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/30'
};

function addMonths(value, months) {
  const date = parseLocalDate(value);
  if (!date) return null;
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return toLocalDateString(target);
}

function checkNoticeWindow(serviceDate, anchorDate, label, errors) {
  const served = parseLocalDate(serviceDate);
  const anchor = parseLocalDate(anchorDate);
  if (!served || !anchor) {
    errors.push(
      `Enter both the date the notice/request was served and the proposed ${label} date to check the 6-to-12-month window.`
    );
    return;
  }
  const earliest = parseLocalDate(addMonths(anchorDate, -12));
  const latest = parseLocalDate(addMonths(anchorDate, -6));
  if (served < earliest || served > latest) {
    errors.push(
      `The service date entered falls outside the statutory 6-to-12-month window before the proposed ${label} date. Check the prescribed form, service rules and exact dates.`
    );
  }
}

export function validateBusinessTenancyNotice(data = {}) {
  const errors = [];
  const warnings = [
    'This is a preliminary checklist only. It does not confirm that Part II applies, that the tenancy qualifies for renewal, that a notice was correctly completed or served, or that a court/tribunal deadline has been met.',
    'Check the current prescribed notice form and the full GOV.UK guidance. The parties should obtain specialist advice before serving a notice or allowing a court deadline to expire.'
  ];

  if (!['section25', 'section26'].includes(data.noticeType)) {
    errors.push('Choose a Section 25 landlord notice or Section 26 tenant request.');
  }
  if (!data.propertyAddress?.trim()) errors.push('Enter the business premises address.');
  if (!data.landlordName?.trim()) errors.push('Enter the landlord name.');
  if (!data.tenantName?.trim()) errors.push('Enter the tenant name.');
  if (!data.landlordAddressForService?.trim())
    errors.push('Enter the landlord address shown on the notice/request.');
  if (!data.tenantAddressForService?.trim())
    errors.push('Enter the tenant address shown on the notice/request.');
  if (!data.noticeDate) errors.push('Enter the date shown on the notice/request.');
  if (!data.serviceMethod)
    errors.push(
      'Record how the notice/request was served. This checklist cannot determine whether that method was valid.'
    );
  if (data.contractedOut === 'yes') {
    errors.push(
      'The form indicates that the tenancy may have been contracted out of Part II. The renewal procedure may not apply; review the lease and contracting-out documents with a specialist.'
    );
  } else if (data.contractedOut === 'unsure') {
    warnings.push(
      'It is not known whether the tenancy was contracted out of Part II. Review the lease and contracting-out documents before relying on the renewal procedure.'
    );
  } else if (data.contractedOut !== 'no') {
    errors.push('State whether the tenancy was contracted out of Part II, or select “Not sure”.');
  }

  const is25 = data.noticeType === 'section25';
  if (data.noticeType === 'section25' || data.noticeType === 'section26') {
    const dateField = is25 ? 'terminationDate' : 'newTenancyDate';
    const dateLabel = is25 ? 'termination' : 'new tenancy start';
    if (!data.serviceDate) errors.push('Enter the date the notice/request was served.');
    if (!data[dateField]) errors.push(`Enter the proposed ${dateLabel} date.`);
    checkNoticeWindow(data.serviceDate, data[dateField], dateLabel, errors);

    const proposed = parseLocalDate(data[dateField]);
    const expiry = parseLocalDate(data.leaseExpiryDate);
    if (!expiry)
      errors.push('Enter the current lease expiry date so the proposed date can be checked.');
    else if (proposed && proposed < expiry) {
      errors.push(
        `The proposed ${dateLabel} date is before the lease expiry date entered. Verify the lease and statutory date rules.`
      );
    }
  }

  if (is25) {
    const expectedForm =
      data.opposition === 'opposed'
        ? ['form2', 'form7']
        : data.opposition === 'unopposed'
          ? ['form1']
          : [];
    if (!data.noticeForm) errors.push('Select which prescribed Section 25 form was used.');
    else if (expectedForm.length && !expectedForm.includes(data.noticeForm))
      errors.push(
        'The selected Section 25 form does not match whether the landlord opposes renewal. Confirm the current prescribed form and notice wording.'
      );
    if (data.noticeForm === 'form7')
      warnings.push(
        'Form 7 applies to a special case where the tenant may have rights under the Leasehold Reform Act 1967. This checklist does not assess eligibility.'
      );
    if (!['opposed', 'unopposed'].includes(data.opposition)) {
      errors.push('State whether the landlord opposes the grant of a new tenancy.');
    }
    if (data.opposition === 'opposed' && !data.oppositionGrounds?.trim()) {
      errors.push(
        'For an opposed Section 25 notice, enter the Section 30 ground or grounds stated in the notice.'
      );
    }
    if (data.opposition === 'unopposed' && !data.landlordProposedTerms?.trim()) {
      errors.push('For Form 1, enter the landlord’s proposed new tenancy terms from the schedule.');
    }
    if (data.opposition === 'unopposed' && data.oppositionGrounds?.trim()) {
      warnings.push(
        'The landlord has selected an unopposed notice but entered opposition grounds. Check the notice type and its prescribed wording.'
      );
    }
  }

  if (data.noticeType === 'section26') {
    if (data.noticeForm !== 'form3')
      errors.push(
        'Select the prescribed Section 26 Form 3 used, and check it against the current official version.'
      );
    if (!data.proposedProperty?.trim())
      errors.push('Enter the property (or part of the property) proposed for the new tenancy.');
    if (!data.proposedTerms?.trim())
      errors.push('Enter the tenant’s proposed terms for the new tenancy.');
    if (data.landlordResponse === 'opposes' && !data.counterNoticeDate) {
      errors.push(
        'Enter the date the landlord served a counter-notice opposing the Section 26 request.'
      );
    }
    const requestDate = parseLocalDate(data.serviceDate);
    const responseDate = parseLocalDate(data.counterNoticeDate);
    if (requestDate && responseDate) {
      const twoMonthsAfter = parseLocalDate(addMonths(data.serviceDate, 2));
      if (responseDate > twoMonthsAfter) {
        errors.push(
          'The counter-notice date entered is more than two calendar months after the request date. Verify service, any agreed extension and court orders.'
        );
      }
    }
    if (data.landlordResponse === 'opposes' && !data.oppositionGrounds?.trim()) {
      errors.push(
        'Record the Section 30 ground or grounds stated in the landlord’s counter-notice.'
      );
    }
    if (data.landlordResponse === 'unknown') {
      warnings.push(
        'A landlord wishing to oppose a Section 26 request generally must serve a counter-notice within two months. Confirm the response and calculate all court deadlines urgently.'
      );
    }
  }

  if (data.telecomTenancy === 'yes') {
    warnings.push(
      'GOV.UK guidance updated 30 July 2026: for certain legacy telecommunications tenancies, references to “the court” in prescribed forms must be read as references to the tribunal with jurisdiction. Confirm whether this tenancy falls within that class.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    status: errors.length === 0 ? 'check-required' : 'review-required',
    checkedFields: [
      'noticeType',
      'parties',
      'serviceDate',
      'proposed date',
      'lease expiry',
      'contracting out',
      'opposition details'
    ]
  };
}
