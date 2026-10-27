// Fees checked against HMCTS guidance on 27 October 2026.
export const OPTIONS = {
  'county-court': [
    ['money', 'Money claim issue fee', null],
    ['possession', 'Possession claim', 415],
    ['n244-notice', 'General application on notice (N244, where no other fee applies)', 321],
    [
      'n244-consent',
      'General application by consent or without notice (N244, where no other fee applies)',
      126
    ],
    ['vary', 'Vary judgment or suspend enforcement', 16],
    ['small-hearing', 'Small claims track hearing', null],
    ['fast-hearing', 'Fast track hearing', 619],
    ['multi-hearing', 'Intermediate or multi-track hearing', 1334],
    ['warrant-control', 'Warrant of control', 96],
    ['warrant-possession', 'Warrant of possession', 152],
    ['warrant-delivery', 'Warrant of delivery', 152],
    ['attachment', 'Attachment of earnings', 139],
    ['charging', 'Charging order', 139],
    ['third-party', 'Third-party debt order', 139],
    ['information', 'Order to obtain information from debtor', 69]
  ],
  'family-court': [
    ['divorce', 'Divorce, nullity or dissolution', 628],
    ['separation', 'Judicial separation', 426],
    ['financial', 'Financial order (not by consent)', 321],
    ['consent', 'Financial order by consent', 62],
    ['children', 'New Children Act application (specified orders)', 270],
    ['non-molestation', 'Non-molestation order', 0],
    ['occupation', 'Occupation order', 0]
  ],
  'immigration-tribunal': [
    ['paper', 'First-tier appeal without a hearing', 82],
    ['hearing', 'First-tier appeal with a hearing', 144]
  ],
  'property-tribunal': [
    ['service-charge', 'Leasehold service charge or administration charge application', 114, 227],
    ['enfranchisement', 'Leasehold enfranchisement application', 114, 227],
    ['pitch', 'Mobile home pitch fee determination', 23, 0],
    ['mobile-terms', 'Mobile homes: written statement or terms order (PH1–PH3)', 114, 227],
    ['rent-increase', 'Appeal a rent increase', 47, 0],
    ['electrical', 'Electrical safety standards application', 200, 300]
  ],
  'employment-tribunal': [['claim', 'Employment tribunal claim', 0]]
};
export function getFeeCategories() {
  return Object.keys(OPTIONS);
}
export function getFeeSchedules(category) {
  return OPTIONS[category] || [];
}
function validAmount(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== '' &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0 &&
    Math.abs(Math.round(Number(value) * 100) - Number(value) * 100) < 1e-7
  );
}
export function calculateFee(category, amount) {
  if (category !== 'county-court' || !validAmount(amount)) return null;
  const n = Number(amount);
  for (const [max, fee] of [
    [300, 35],
    [500, 50],
    [1000, 70],
    [1500, 80],
    [3000, 115],
    [5000, 205],
    [10000, 455]
  ])
    if (n <= max) return fee;
  return n <= 200000 ? Math.floor(Math.round(n * 100) / 20) / 100 : 10000;
}
export function calculateSelection(category, type, amount, hearing = false) {
  const option = OPTIONS[category]?.find((x) => x[0] === type);
  if (!option) return null;
  let fee = option[2];
  if (type === 'money' && category === 'county-court') fee = calculateFee(category, amount);
  if (type === 'small-hearing' && category === 'county-court') {
    if (!validAmount(amount)) return null;
    const n = Number(amount);
    fee = n <= 300 ? 27 : n <= 500 ? 59 : n <= 1000 ? 85 : n <= 1500 ? 123 : n <= 3000 ? 181 : 346;
  }
  if (fee === null) return null;
  return {
    label: option[1],
    fee,
    hearing: category === 'property-tribunal' && hearing ? option[3] : 0,
    total: fee + (category === 'property-tribunal' && hearing ? option[3] : 0)
  };
}
export function getHelpWithFeesEligibility() {
  return {
    eligible: null,
    reason: 'Eligibility depends on your circumstances. Use the official Help with Fees service.'
  };
}
export function getExemptions() {
  return [];
}
export function generateFeeEstimate(category, claimAmount) {
  const fee = calculateFee(category, claimAmount);
  return {
    category,
    claimAmount,
    items: fee === null ? [] : [{ description: 'Money claim issue fee', amount: fee }],
    totalFee: fee
  };
}
export function getFeeRemissionForm() {
  return { reference: 'EX160', name: 'Help with Fees' };
}
export function serializeFeesCalculator(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
export function parseFeesCalculator(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
