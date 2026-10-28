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
  section30: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/30',
  section29A: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/29A',
  section29B: 'https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/29B',
  part56: 'https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56',
  practiceDirection56:
    'https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56/pd_part56',
  telecomJurisdiction: 'https://www.legislation.gov.uk/uksi/2026/569/regulation/3/made'
};

function addDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return toLocalDateString(date);
}

function calculateApplicationDeadline(data, warnings) {
  const is25 = data.noticeType === 'section25';
  const is26 = data.noticeType === 'section26';
  const statutoryDate = parseLocalDate(
    is25 ? data.terminationDate : is26 ? data.newTenancyDate : null
  );
  const result = {
    statutoryDate: statutoryDate
      ? is25
        ? data.terminationDate
        : addDays(data.newTenancyDate, -1)
      : null,
    statutoryEndpoint: is25
      ? 'on-or-before-termination-date'
      : is26
        ? 'immediately-before-new-tenancy-date'
        : 'not-calculated',
    extensionDate: null,
    earliestDate: null,
    status: statutoryDate ? 'calculated' : 'incomplete',
    jurisdiction: 'court'
  };

  if (is26 && parseLocalDate(data.serviceDate)) {
    result.earliestDate = addMonths(data.serviceDate, 2);
    const counterNoticeDate = parseLocalDate(data.counterNoticeDate);
    if (
      counterNoticeDate &&
      data.landlordResponse === 'opposes' &&
      counterNoticeDate < parseLocalDate(result.earliestDate)
    ) {
      result.earliestDate = data.counterNoticeDate;
      warnings.push(
        'A Section 24(1) application may be issued before the usual two-month waiting period only after the landlord has given a Section 26(6) counter-notice. The date entered cannot establish the time it was given or the counter-notice’s validity.'
      );
    }
  }

  if (data.extensionStatus === 'yes') {
    const agreementDate = parseLocalDate(data.extensionAgreementDate);
    const extensionDate = parseLocalDate(data.extendedPeriodEndDate);
    const serviceDate = parseLocalDate(data.serviceDate);
    if (!agreementDate || !extensionDate || !statutoryDate || !serviceDate) {
      result.status = 'incomplete';
      warnings.push(
        'Enter the date of the Section 29B agreement and the agreed extended period end date. The extension cannot be assessed from incomplete dates.'
      );
    } else {
      // The Section 26 statutory period ends immediately before its proposed start date.
      const statutoryEndBoundary = is25 ? data.terminationDate : addDays(data.newTenancyDate, -1);
      if (agreementDate < serviceDate) {
        result.status = 'review-required';
        warnings.push(
          'The recorded first Section 29B agreement predates service of the notice/request. Section 29B permits an extension agreement only after the notice or request; do not rely on the displayed extension date.'
        );
      } else if (agreementDate > parseLocalDate(statutoryEndBoundary)) {
        result.status = 'review-required';
        warnings.push(
          'The recorded Section 29B agreement date is after the statutory period. It may not extend time under section 29B(1); obtain urgent advice and do not rely on the displayed extended date.'
        );
      } else if (extensionDate <= parseLocalDate(statutoryEndBoundary)) {
        result.status = 'review-required';
        warnings.push(
          'The recorded extended period end date does not fall after the statutory period as section 29B requires. Check the written agreement.'
        );
      } else {
        const furtherAgreementDate = parseLocalDate(data.furtherExtensionAgreementDate);
        const finalExtensionDate = parseLocalDate(data.finalExtendedPeriodEndDate);
        if (
          Boolean(data.furtherExtensionAgreementDate) !== Boolean(data.finalExtendedPeriodEndDate)
        ) {
          result.status = 'incomplete';
          warnings.push(
            'Enter both dates for the further section 29B extension, or clear both fields.'
          );
        } else if (furtherAgreementDate && finalExtensionDate) {
          if (furtherAgreementDate > extensionDate || finalExtensionDate <= extensionDate) {
            result.status = 'review-required';
            warnings.push(
              'The further extension dates do not show an agreement made before the earlier period ended and a later new end date. Check the written agreements urgently.'
            );
          } else {
            result.extensionDate = data.finalExtendedPeriodEndDate;
            result.status = 'review-required';
          }
        } else {
          result.extensionDate = data.extendedPeriodEndDate;
          result.status = 'review-required';
        }
        warnings.push(
          'The displayed extended date is a preliminary estimate from the dates entered. Check that each agreement satisfies section 29B and that no further extension changes the current period.'
        );
      }
    }
  } else if (data.extensionStatus === 'unsure') {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push(
      'It is not known whether the parties made a Section 29B agreement extending the application period. Check all written agreements before relying on the statutory date.'
    );
  } else if (data.extensionStatus && data.extensionStatus !== 'no') {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push('State whether the parties agreed an extension under section 29B.');
  } else if (!data.extensionStatus) {
    result.status = statutoryDate ? 'review-required' : 'incomplete';
    warnings.push(
      'Confirm whether the parties agreed any extension under section 29B before relying on the displayed statutory date.'
    );
  }

  if (data.telecomTenancy === 'yes') {
    const possiblyWithinSpecialJurisdiction =
      data.telecomSubsistingAgreement !== 'no' && data.telecomPrimaryPurposeCodeRights !== 'no';
    if (possiblyWithinSpecialJurisdiction) {
      result.jurisdiction = 'tribunal-review-required';
      warnings.push(
        'From 30 July 2026, specified proceedings for a subsisting telecommunications agreement whose primary purpose is to confer electronic communications code rights are heard by the First-tier Tribunal or Upper Tribunal. Confirm whether this agreement meets both statutory conditions; this checker cannot determine the correct forum or tribunal procedure.'
      );
    }
  }
  return result;
}

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
    'This is a preliminary checklist only. It does not confirm that Part II applies, that the tenancy qualifies for renewal, that a notice was correctly completed or served, or that a court/tribunal application is valid or in time.',
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
        'A landlord wishing to oppose a Section 26 request generally must serve a counter-notice within two months. Confirm the response and check the calculated earliest application date.'
      );
    }
  }

  const applicationDeadline = calculateApplicationDeadline(data, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    applicationDeadline,
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
