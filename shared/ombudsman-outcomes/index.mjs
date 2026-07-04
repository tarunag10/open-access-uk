/**
 * Ombudsman outcomes data and routing.
 *
 * OUTCOME_STATISTICS and TYPICAL_OUTCOMES contain illustrative figures
 * that are being re-sourced from each ombudsman's published annual report.
 */

const OMBUDSMEN = [
  { id: 'PHSO', name: 'Parliamentary and Health Service Ombudsman', sectors: ['NHS', 'UK Government'], source: 'phso-annual-report', website: 'https://www.ombudsman.org.uk' },
  { id: 'housing', name: 'Housing Ombudsman', sectors: ['Social Housing'], source: 'housing-ombudsman-report', website: 'https://www.housing-ombudsman.org.uk' },
  { id: 'financial', name: 'Financial Ombudsman Service', sectors: ['Finance', 'Insurance', 'Banking'], source: 'fos-annual-report', website: 'https://www.financial-ombudsman.org.uk' },
  { id: 'rail', name: 'Rail Ombudsman', sectors: ['Rail', 'Transport'], source: 'rail-ombudsman-report', website: 'https://www.railombudsman.org' },
  { id: 'legal', name: 'Legal Ombudsman', sectors: ['Legal Services'], source: 'leo-annual-report', website: 'https://www.legalombudsman.org.uk' },
  { id: 'local-government', name: 'Local Government Ombudsman', sectors: ['Councils', 'Local Services'], source: 'lgo-annual-report', website: 'https://www.lgo.org.uk' },
  { id: 'water', name: 'Consumer Council for Water', sectors: ['Water', 'Drainage'], source: 'ccw-annual-report', website: 'https://www.ccw.org.uk' },
  { id: 'energy', name: 'Ombudsman Services: Energy', sectors: ['Energy', 'Gas', 'Electricity'], source: 'ombudsman-energy-report', website: 'https://www.ombudsman-services.org' },
  { id: 'telecoms', name: 'Ombudsman Services: Communications', sectors: ['Telecoms', 'Internet', 'TV'], source: 'ombudsman-comms-report', website: 'https://www.ombudsman-services.org' },
  { id: 'police', name: 'Independent Office for Police Conduct', sectors: ['Police'], source: 'iopc-annual-report', website: 'https://www.policeconduct.gov.uk' },
  { id: 'immigration', name: 'Immigration Services Commissioner', sectors: ['Immigration', 'Asylum'], source: 'oisc-annual-report', website: 'https://www.gov.uk/government/organisations/office-of-the-immigration-services-commissioner' }
];

// Statistics are illustrative and currently hidden behind a flag.
// They will return with per-figure citations from published annual reports.
export const SHOW_UNSOURCED_STATS = false;

const OUTCOME_STATISTICS = {
  PHSO: { totalCases: 7800, upheldRate: 42, notUpheldRate: 38, partiallyUpheldRate: 20, yearlyTrend: [{ year: 2022, cases: 7200 }, { year: 2023, cases: 7500 }, { year: 2024, cases: 7800 }], sectorBreakdown: [{ sector: 'NHS', cases: 6500 }, { sector: 'UK Government', cases: 1300 }] },
  housing: { totalCases: 12000, upheldRate: 55, notUpheldRate: 30, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 9800 }, { year: 2023, cases: 10900 }, { year: 2024, cases: 12000 }], sectorBreakdown: [{ sector: 'Social Housing', cases: 12000 }] },
  financial: { totalCases: 420000, upheldRate: 38, notUpheldRate: 45, partiallyUpheldRate: 17, yearlyTrend: [{ year: 2022, cases: 390000 }, { year: 2023, cases: 410000 }, { year: 2024, cases: 420000 }], sectorBreakdown: [{ sector: 'Finance', cases: 180000 }, { sector: 'Insurance', cases: 120000 }, { sector: 'Banking', cases: 120000 }] },
  rail: { totalCases: 3500, upheldRate: 35, notUpheldRate: 50, partiallyUpheldRate: 15, yearlyTrend: [{ year: 2022, cases: 3000 }, { year: 2023, cases: 3200 }, { year: 2024, cases: 3500 }], sectorBreakdown: [{ sector: 'Rail', cases: 2800 }, { sector: 'Transport', cases: 700 }] },
  legal: { totalCases: 8200, upheldRate: 44, notUpheldRate: 35, partiallyUpheldRate: 21, yearlyTrend: [{ year: 2022, cases: 7600 }, { year: 2023, cases: 7900 }, { year: 2024, cases: 8200 }], sectorBreakdown: [{ sector: 'Legal Services', cases: 8200 }] }
};

// Flag to show notice about unsourced statistics
export function getUnsourcedStatsNotice() {
  return "Outcome statistics are being re-sourced from each ombudsman's published annual report and will return with citations. The ombudsman routing and lookup features remain available.";
}

export function getOmbudsmen() {
  return OMBUDSMEN.map((o) => ({ ...o }));
}

export function getOmbudsmanDetails(ombudsmanId) {
  return OMBUDSMEN.find((o) => o.id === ombudsmanId) || null;
}

export function getOutcomeStatistics(ombudsmanId) {
  if (!SHOW_UNSOURCED_STATS) return null;
  const stats = OUTCOME_STATISTICS[ombudsmanId];
  return stats ? { ...stats } : null;
}

export function findOmbudsmanForIssue(issueType, nation) {
  // Simplified routing logic — returns the most likely ombudsman
  const issue = (issueType || '').toLowerCase();
  const country = (nation || '').toLowerCase();

  if (issue.includes('nhs') || issue.includes('health') || issue.includes('gp') || issue.includes('hospital')) {
    if (country === 'scotland') return 'PHSO';
    if (country === 'wales') return 'PHSO';
    if (country === 'northern-ireland') return 'PHSO';
    return 'PHSO';
  }
  if (issue.includes('housing') || issue.includes('repair') || issue.includes('landlord')) return 'housing';
  if (issue.includes('bank') || issue.includes('insurance') || issue.includes('finance') || issue.includes('pension')) return 'financial';
  if (issue.includes('rail') || issue.includes('train')) return 'rail';
  if (issue.includes('solicitor') || issue.includes('lawyer') || issue.includes('legal')) return 'legal';
  if (issue.includes('council') || issue.includes('local government') || issue.includes('social care')) return 'local-government';
  if (issue.includes('water') || issue.includes('drainage')) return 'water';
  if (issue.includes('energy') || issue.includes('gas') || issue.includes('electricity')) return 'energy';
  if (issue.includes('phone') || issue.includes('broadband') || issue.includes('mobile') || issue.includes('internet')) return 'telecoms';
  if (issue.includes('police')) return 'police';
  if (issue.includes('immigration') || issue.includes('visa') || issue.includes('home office')) return 'immigration';

  return null;
}

export function getCompensationRanges(ombudsmanId) {
  const ranges = {
    PHSO: { typical: '£500–£5,000', max: '£10,000+', note: 'For distress and inconvenience' },
    housing: { typical: '£100–£3,000', max: '£10,000+', note: 'Based on severity and duration of maladministration' },
    financial: { typical: '£100–£5,000', max: '£430,000', note: 'FOS awards are binding up to £430,000 (2025/26 limit)' },
    rail: { typical: '£50–£1,000', max: '£5,000', note: 'Compensation for delay, missed connections, and poor complaint handling' },
    legal: { typical: '£500–£5,000', max: '£50,000+', note: 'Based on distress, inconvenience, and financial loss' }
  };
  return ranges[ombudsmanId] || { typical: 'Varies', max: 'Varies', note: 'Contact the ombudsman for guidance' };
}

export function getDecisionTimescales(ombudsmanId) {
  const timescales = {
    PHSO: { initialResponse: '3–6 months', fullInvestigation: '6–12 months' },
    housing: { initialResponse: '4–8 weeks', fullInvestigation: '3–6 months' },
    financial: { initialResponse: '2–4 weeks', fullInvestigation: '3–9 months' },
    rail: { initialResponse: '2–4 weeks', fullInvestigation: '3–6 months' },
    legal: { initialResponse: '4–8 weeks', fullInvestigation: '6–12 months' }
  };
  return timescales[ombudsmanId] || { initialResponse: 'Varies', fullInvestigation: 'Varies' };
}

export function getTypicalOutcomes(ombudsmanId, issueType) {
  return []; // Being re-sourced — returns empty until citations are added
}

export function serializeOmbudsman(value) {
  return JSON.stringify(value);
}

export function parseOmbudsman(value) {
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}

// Aliases for backwards compatibility with inlined tool bundles
export const serializeOmbudsmanOutcomes = serializeOmbudsman;
export const parseOmbudsmanOutcomes = parseOmbudsman;
