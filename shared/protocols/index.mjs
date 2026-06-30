const PROTOCOL_TYPES = [
  { id: 'housing-disrepair', name: 'Housing Disrepair Protocol', responseDays: 90, source: 'cpr-practice-direction-pre-action', description: 'Claims for disrepair against landlords' },
  { id: 'debt', name: 'Pre-Action Protocol for Debt Claims', responseDays: 30, source: 'cpr-practice-direction-pre-action', description: 'Claims by businesses for payment of debts' },
  { id: 'personal-injury', name: 'Pre-Action Protocol for Personal Injury', responseDays: 120, source: 'cpr-practice-direction-pre-action', description: 'Personal injury claims (RTA, EL, PL)' },
  { id: 'professional-negligence', name: 'Professional Negligence Protocol', responseDays: 90, source: 'cpr-practice-direction-pre-action', description: 'Claims against professionals for negligence' }
];

const PROTOCOL_REQUIREMENTS = {
  'housing-disrepair': ['summary of facts', 'evidence list', 'ADR proposal', 'compliance checklist'],
  'debt': ['summary of facts', 'evidence list', 'ADR proposal', 'compliance checklist'],
  'personal-injury': ['summary of facts', 'evidence list', 'ADR proposal', 'compliance checklist'],
  'professional-negligence': ['summary of facts', 'evidence list', 'ADR proposal', 'compliance checklist']
};

const COMPLIANCE_CHECKLISTS = {
  'housing-disrepair': [
    'Check compliance with Housing Disrepair Protocol',
    'Ensure letter before claim complies with PD pre-action conduct',
    'Confirm response deadline of 90 days',
    'Verify all evidence of disrepair included',
    'Confirm ADR proposal enclosed',
    'Check statement of truth signed'
  ],
  'debt': [
    'Check compliance with Pre-Action Protocol for Debt Claims',
    'Ensure letter before claim complies with PD pre-action conduct',
    'Confirm response deadline of 30 days',
    'Verify debt amount and calculation',
    'Confirm ADR proposal enclosed',
    'Check statement of truth signed'
  ],
  'personal-injury': [
    'Check compliance with Pre-Action Protocol for Personal Injury',
    'Ensure letter before claim complies with PD pre-action conduct',
    'Confirm response deadline of 120 days',
    'Verify medical evidence included',
    'Confirm ADR proposal enclosed',
    'Check statement of truth signed'
  ],
  'professional-negligence': [
    'Check compliance with Professional Negligence Protocol',
    'Ensure letter before claim complies with PD pre-action conduct',
    'Confirm response deadline of 90 days',
    'Verify duty of care and breach established',
    'Confirm ADR proposal enclosed',
    'Check statement of truth signed'
  ]
};

function generateId() {
  return 'proto-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function getProtocolTypes() {
  return [...PROTOCOL_TYPES];
}

export function getProtocolRequirements(protocolType) {
  if (!PROTOCOL_REQUIREMENTS[protocolType]) return null;
  return [...PROTOCOL_REQUIREMENTS[protocolType]];
}

export function generateLetterOfClaim(data) {
  if (!data) throw new Error('data is required');
  const required = ['claimantName', 'defendantName', 'defendantAddress', 'protocolType', 'summaryOfFacts', 'lossAndDamage', 'evidenceList', 'adrProposal', 'statementOfTruth'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  const protocol = PROTOCOL_TYPES.find((p) => p.id === data.protocolType);
  const protocolName = protocol ? protocol.name : data.protocolType;

  const evidenceBlock = Array.isArray(data.evidenceList)
    ? data.evidenceList.map((e) => `  - ${e}`).join('\n')
    : '';

  return [
    `Letter of Claim under ${protocolName}`,
    '',
    `Claimant: ${data.claimantName}`,
    `Defendant: ${data.defendantName}`,
    `Defendant Address: ${data.defendantAddress}`,
    '',
    'Summary of Facts:',
    data.summaryOfFacts,
    '',
    'Loss and Damage:',
    data.lossAndDamage,
    '',
    'Evidence:',
    evidenceBlock,
    '',
    'ADR Proposal:',
    data.adrProposal,
    '',
    'Statement of Truth:',
    data.statementOfTruth
  ].join('\n');
}

export function getResponseDeadline(protocolType) {
  const protocol = PROTOCOL_TYPES.find((p) => p.id === protocolType);
  return protocol ? protocol.responseDays : null;
}

export function getComplianceChecklist(protocolType) {
  if (!COMPLIANCE_CHECKLISTS[protocolType]) return null;
  return [...COMPLIANCE_CHECKLISTS[protocolType]];
}

export function generateADROffer(data) {
  if (!data) throw new Error('data is required');
  if (!data.proposalType) throw new Error('proposalType is required');

  const protocol = PROTOCOL_TYPES.find((p) => p.id === data.protocolType);
  const protocolName = protocol ? protocol.name.replace('Pre-Action Protocol for ', '').replace(' Protocol', '') : data.protocolType;

  const lines = [
    `Alternative Dispute Resolution Proposal - ${protocolName}`,
    '',
    `We propose ${data.proposalType} as a means of resolving this dispute.`,
    '',
    'We invite the defendant to consider this proposal and respond within the protocol timeframe.',
    '',
    'Contact details:',
    data.contactDetails || 'Not provided'
  ];

  return lines.join('\n');
}

export function serializeProtocols(value) {
  return JSON.stringify(value);
}

export function parseProtocols(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
