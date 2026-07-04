/**
 * shared/jurisdiction/index.mjs
 *
 * Jurisdiction resolution engine — determines nation, regime, and applicable law
 * from a postcode (via postcodes.io, opt-in) or explicit user choice.
 *
 * This is the shared module consumed by every tool for jurisdiction badges,
 * route switching, and source selection.
 */

// Jurisdiction metadata per tool — maps tool IDs to applicable jurisdictions
export const TOOL_JURISDICTIONS = {
  'eviction-notice-validator': {
    label: 'England only',
    jurisdiction: 'england',
    note: 'Wales uses Renting Homes (Wales) Act 2016 section 173. Scotland and Northern Ireland have separate regimes.'
  },
  'nhs-complaints-tracker': {
    label: 'England',
    jurisdiction: 'england',
    note: 'Scotland has SPSO, Wales PSOW, NI NIPSO.'
  },
  'employment-tribunal': {
    label: 'Great Britain',
    jurisdiction: 'england-wales-scotland',
    note: 'Northern Ireland has separate industrial tribunals.'
  },
  'send-helper': {
    label: 'England',
    jurisdiction: 'england',
    note: 'Wales has ALN, Scotland ASL.'
  },
  'fee-calculator': {
    label: 'England & Wales',
    jurisdiction: 'england-wales',
    note: 'Scotland and NI have separate court systems.'
  },
  'uc-sanctions': {
    label: 'Great Britain',
    jurisdiction: 'england-wales-scotland',
    note: 'Universal Credit is a GB-wide benefit.'
  },
  'benefits-appeals': {
    label: 'Great Britain',
    jurisdiction: 'england-wales-scotland',
    note: 'Social security is reserved to UK Parliament.'
  },
  'foi-tracker': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Scotland has FOISA and the Scottish Information Commissioner.'
  },
  'batch-foi': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Scotland has FOISA; NI has its own FOI framework.'
  },
  'deadline-cascade': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Deadlines may differ by jurisdiction — check each process.'
  },
  'evidence-checker': {
    label: 'England & Wales',
    jurisdiction: 'england-wales',
    note: 'Tribunal rules differ in Scotland and NI.'
  },
  'letter-generator': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Law differs across England, Wales, Scotland, NI.'
  },
  'legal-templates': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Templates reference UK-wide law where applicable.'
  },
  'public-service-directory': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Ombudsman routes differ by nation.'
  },
  'accessible-forms': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Equality Act 2010 applies across GB.'
  },
  'design-system': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Design patterns are jurisdiction-neutral.'
  },
  'case-builder': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Case law and deadlines may be jurisdiction-specific.'
  },
  'immigration-complaints': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Immigration is reserved to UK Parliament.'
  },
  'professional-complaints': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Regulators vary by profession and nation.'
  },
  'ombudsman-outcomes': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Ombudsman jurisdiction varies by body.'
  },
  'accessible-formats-request': {
    label: 'UK-wide',
    jurisdiction: 'uk',
    note: 'Equality Act 2010 applies across GB.'
  },
  'send-helper': {
    label: 'England',
    jurisdiction: 'england',
    note: 'Wales has ALN system, Scotland has ASL.'
  }
};

// Remove duplicate send-helper entry
delete TOOL_JURISDICTIONS['send-helper'];
TOOL_JURISDICTIONS['send-helper'] = {
  label: 'England',
  jurisdiction: 'england',
  note: 'Wales has ALN system, Scotland has ASL.'
};

/**
 * Returns the jurisdiction metadata for a given tool ID.
 */
export function getToolJurisdiction(toolId) {
  return TOOL_JURISDICTIONS[toolId] || { label: 'UK-wide', jurisdiction: 'uk', note: '' };
}

/**
 * Resolves jurisdiction from a UK postcode using postcodes.io.
 * Returns { nation, jurisdictionId } or null if lookup fails.
 *
 * This is an opt-in runtime call — the user must explicitly choose to look up
 * their postcode. The fallback is a manual nation picker.
 *
 * Usage:
 *   const result = await resolvePostcodeJurisdiction('SW1A 1AA');
 *   // { nation: 'England', jurisdictionId: 'england' }
 */
export async function resolvePostcodeJurisdiction(postcode) {
  if (!postcode || postcode.trim().length < 3) return null;

  try {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.result || !data.result.country) return null;

    const country = data.result.country;
    let jurisdictionId;

    if (country === 'England') jurisdictionId = 'england';
    else if (country === 'Wales') jurisdictionId = 'wales';
    else if (country === 'Scotland') jurisdictionId = 'scotland';
    else if (country === 'Northern Ireland') jurisdictionId = 'northern-ireland';
    else jurisdictionId = 'uk';

    return { nation: country, jurisdictionId };
  } catch {
    return null;
  }
}

/**
 * Maps a user's nation choice to a jurisdiction for tool filtering.
 * Used as fallback when postcode lookup is not available.
 */
export function nationToJurisdiction(nation) {
  const map = {
    england: 'england',
    wales: 'wales',
    scotland: 'scotland',
    'northern-ireland': 'northern-ireland'
  };
  return map[nation?.toLowerCase()] || 'uk';
}

/**
 * Returns the list of UK nations for the manual picker.
 */
export function getNations() {
  return [
    { id: 'england', name: 'England' },
    { id: 'wales', name: 'Wales' },
    { id: 'scotland', name: 'Scotland' },
    { id: 'northern-ireland', name: 'Northern Ireland' }
  ];
}
