const FEE_SCHEDULES = {
  'county-court': [
    { claimRange: 'Up to £300', fee: 35, source: 'hmcts-county-court-fees' },
    { claimRange: '£300.01 - £1,000', fee: 80, source: 'hmcts-county-court-fees' },
    { claimRange: '£1,000.01 - £5,000', fee: 115, source: 'hmcts-county-court-fees' },
    { claimRange: '£5,000.01 - £10,000', fee: 205, source: 'hmcts-county-court-fees' },
    { claimRange: '£10,000.01 - £50,000', fee: 455, source: 'hmcts-county-court-fees' },
    { claimRange: '£50,000.01 - £100,000', fee: 10000, source: 'hmcts-county-court-fees' }
  ],
  'employment-tribunal': [
    { claimRange: 'No fee (discrimination)', fee: 0, source: 'et-fee-exemption' },
    { claimRange: 'No fee (all claims from 2017)', fee: 0, source: 'et-fee-exemption' }
  ],
  'family-court': [
    { claimRange: 'Under £1,000', fee: 215, source: 'hmcts-family-court-fees' },
    { claimRange: '£1,000 - £5,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: '£5,001 - £15,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: '£15,001 - £50,000', fee: 335, source: 'hmcts-family-court-fees' },
    { claimRange: 'Over £50,000', fee: 335, source: 'hmcts-family-court-fees' }
  ],
  'immigration-tribunal': [
    { claimRange: 'Tier 1 (Asylum)', fee: 80, source: 'hmcts-immigration-fees' },
    { claimRange: 'Tier 2 (Immigration)', fee: 140, source: 'hmcts-immigration-fees' }
  ],
  'property-tribunal': [
    { claimRange: 'Under £30,000', fee: 0, source: 'property-tribunal-fee' },
    { claimRange: '£30,000 - £100,000', fee: 0, source: 'property-tribunal-fee' },
    { claimRange: 'Over £100,000', fee: 0, source: 'property-tribunal-fee' }
  ]
};

const FEE_BANDS = {
  'county-court': [
    { min: 0, max: 300, fee: 35 },
    { min: 300.01, max: 1000, fee: 80 },
    { min: 1000.01, max: 5000, fee: 115 },
    { min: 5000.01, max: 10000, fee: 205 },
    { min: 10000.01, max: 50000, fee: 455 },
    { min: 50000.01, max: 100000, fee: 10000 }
  ],
  'employment-tribunal': [{ min: 0, max: Infinity, fee: 0 }],
  'family-court': [{ min: 0, max: Infinity, fee: 335 }],
  'immigration-tribunal': [{ min: 0, max: Infinity, fee: 140 }],
  'property-tribunal': [{ min: 0, max: Infinity, fee: 0 }]
};

const EXEMPTIONS = [
  {
    id: 'domestic-violence',
    name: 'Domestic Violence',
    description: 'Fee waiver for victims of domestic violence'
  },
  {
    id: 'asylum',
    name: 'Asylum Seekers',
    description: 'Fee exemption for asylum seekers and refugees'
  },
  {
    id: 'benefits',
    name: 'Benefits Recipients',
    description: 'Fee waiver for those receiving qualifying benefits'
  },
  {
    id: 'low-income',
    name: 'Low Income',
    description: 'Fee reduction or waiver based on low income'
  }
];

export function getFeeCategories() {
  return Object.keys(FEE_SCHEDULES);
}

export function getFeeSchedules(category) {
  return FEE_SCHEDULES[category] || [];
}

export function calculateFee(category, claimAmount) {
  const amount = Number(claimAmount);
  if (Number.isNaN(amount) || amount < 0) return null;

  const bands = FEE_BANDS[category];
  if (!bands) return null;

  for (const band of bands) {
    if (amount >= band.min && amount <= band.max) {
      return band.fee;
    }
  }
  return null;
}

export function getHelpWithFeesEligibility(income, savings, benefits) {
  const monthlyIncome = Number(income);
  const totalSavings = Number(savings);
  const receivingBenefits = Boolean(benefits);

  if (receivingBenefits) {
    return {
      eligible: true,
      reason:
        'Eligible: receiving qualifying benefits (Universal Credit, income-based JSA, income-based ESA, Income Support, Pension Guarantee Credit, Working Tax Credit, 24+ Advanced Learning Loan)'
    };
  }

  const threshold = 3000;
  const savingsThreshold = 16000;

  if (monthlyIncome < threshold && totalSavings < savingsThreshold) {
    return {
      eligible: true,
      reason: `Eligible: monthly income (£${monthlyIncome}) below threshold (£${threshold}) and savings (£${totalSavings}) below threshold (£${savingsThreshold})`
    };
  }

  return {
    eligible: false,
    reason: `Not eligible: income (£${monthlyIncome}) or savings (£${totalSavings}) exceed Help with Fees thresholds`
  };
}

export function getExemptions() {
  return EXEMPTIONS.map((e) => e.id);
}

export function generateFeeEstimate(category, claimAmount, extras = {}) {
  const items = [];
  const baseFee = calculateFee(category, claimAmount);

  if (baseFee !== null) {
    items.push({ description: `Court/Tribunal fee (${category})`, amount: baseFee });
  }

  if (extras.hearing) {
    items.push({ description: 'Additional hearing fee', amount: 50 });
  }

  if (extras.expedited) {
    items.push({ description: 'Expedited procedure fee', amount: 100 });
  }

  if (extras.witness) {
    const witnessFee = typeof extras.witness === 'number' ? extras.witness : 25;
    items.push({ description: 'Witness fee', amount: witnessFee });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    category,
    claimAmount: Number(claimAmount),
    items,
    totalFee
  };
}

export function getFeeRemissionForm() {
  return {
    reference: 'EX160',
    name: 'Request for a fee remission'
  };
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
