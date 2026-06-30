import { addWorkingDays } from '../deadlines/index.mjs';

const COMPLAINT_TYPES = [
  { id: 'visa-delay', name: 'Visa Processing Delay', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Delay in processing visa applications' },
  { id: 'brp-issue', name: 'Biometric Residence Permit Issue', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Issues with BRP card (incorrect details, not received, damaged)' },
  { id: 'sponsorship-complaint', name: 'Sponsorship Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about sponsor licence decisions' },
  { id: 'right-to-rent', name: 'Right to Rent Dispute', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Disputes about right to rent checks' },
  { id: 'asylum-support', name: 'Asylum Support Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about asylum support decisions' },
  { id: 'immigration-detention', name: 'Immigration Detention Complaint', deadlineWorkingDays: 20, escalationLevel: 1, source: 'home-office-complaints', description: 'Complaints about detention conditions or decisions' }
];

const ESCALATION_ROUTE = ['Home Office', 'ICIBI', 'Parliamentary Ombudsman'];

const REQUIRED_DOCUMENTS = {
  'visa-delay': [
    'Copy of visa application and confirmation email',
    'Application reference number',
    'Proof of submission date',
    'Any correspondence with Home Office',
    'Evidence of urgency (e.g. travel bookings, employment start date)'
  ],
  'brp-issue': [
    'Copy of BRP card (front and back)',
    'Passport or travel document',
    'Application reference number',
    'Proof of collection or delivery attempt',
    'Any correspondence with Home Office'
  ],
  'sponsorship-complaint': [
    'Sponsor licence reference number',
    'Worker reference number',
    'Copy of sponsorship documents',
    'Any correspondence with Home Office',
    'Evidence of financial or reputational impact'
  ],
  'right-to-rent': [
    'Right to Rent check code or share code',
    'Passport or immigration document',
    'Tenancy agreement',
    'Any correspondence with landlord or agent',
    'Evidence of right to rent status'
  ],
  'asylum-support': [
    'Asylum support application reference',
    'National Asylum Support Service (NASS) letter',
    'Evidence of financial hardship',
    'Any correspondence with Home Office',
    'Medical or welfare evidence (if relevant)'
  ],
  'immigration-detention': [
    'Detention centre name and location',
    'Date of detention',
    'Immigration detention reference number',
    'Any correspondence with Home Office',
    'Medical or welfare evidence (if relevant)',
    'Legal representation details'
  ]
};

const HOME_OFFICE_CONTACTS = {
  'visa-delay': { email: 'ukvisafree@fcdo.gov.uk', phone: '0300 123 2241', post: 'UK Visas and Immigration, PO Box 306, Liverpool, L2 8PJ' },
  'brp-issue': { email: 'BRPcollection@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Biometric Residence Permits, PO Box 583, Glasgow, G3 8HN' },
  'sponsorship-complaint': { email: 'sponsorshipcomplaints@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Sponsorship and Licensing, PO Box 306, Liverpool, L2 8PJ' },
  'right-to-rent': { email: 'righttorent@homeoffice.gov.uk', phone: '0300 123 2241', post: 'Immigration Enforcement, PO Box 306, Liverpool, L2 8PJ' },
  'asylum-support': { email: 'asylumsupport@homeoffice.gov.uk', phone: '0808 801 0800', post: 'Asylum Support, PO Box 306, Liverpool, L2 8PJ' },
  'immigration-detention': { email: 'irc@homeoffice.gov.uk', phone: '0808 801 0800', post: 'Immigration Enforcement, PO Box 306, Liverpool, L2 8PJ' }
};

function typeById(id) {
  return COMPLAINT_TYPES.find((t) => t.id === id) || null;
}

export function getComplaintTypes() {
  return [...COMPLAINT_TYPES];
}

export function getComplaintDeadlines(typeId, startDate) {
  const type = typeById(typeId);
  if (!type || !startDate) return null;
  const deadlineDate = addWorkingDays(startDate, type.deadlineWorkingDays);
  return {
    type: type.id,
    typeName: type.name,
    deadlineWorkingDays: type.deadlineWorkingDays,
    startDate,
    deadlineDate,
    varies: typeId === 'asylum-support'
  };
}

export function generateComplaintText(data) {
  if (!data || !data.complainantName) throw new Error('complainantName is required');
  if (!data.type) throw new Error('type is required');
  const type = typeById(data.type);
  const typeName = type ? type.name : data.type;
  const lines = [
    'COMPLAINT TO THE HOME OFFICE',
    '',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    `To: Home Office Complaints`,
    '',
    `I am writing to make a formal complaint regarding: ${typeName}.`,
    '',
    `Complainant Name: ${data.complainantName}`,
    `Complainant Address: ${data.complainantAddress || 'Not provided'}`,
    `Application Reference: ${data.applicationReference || 'Not provided'}`,
    `Date Submitted: ${data.dateSubmitted || 'Not provided'}`,
    '',
    'Description of Issue:',
    `${data.descriptionOfIssue || 'Not provided'}`,
    '',
    'Desired Outcome:',
    `${data.desiredOutcome || 'Not provided'}`,
    '',
    'I look forward to receiving your acknowledgement within 5 working days and a full response within 20 working days.',
    '',
    'Yours sincerely,',
    data.complainantName
  ];
  return lines.join('\n');
}

export function getEscalationRoute(typeId) {
  const type = typeById(typeId);
  if (!type) return null;
  return [...ESCALATION_ROUTE];
}

export function getRequiredDocuments(typeId) {
  const docs = REQUIRED_DOCUMENTS[typeId];
  if (!docs) return null;
  return [...docs];
}

export function generateICIBIText(data) {
  if (!data || !data.complainantName) throw new Error('complainantName is required');
  const lines = [
    'ICIBI COMPLAINT ESCALATION',
    '',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'To: Independent Chief Inspector of Borders and Immigration (ICIBI)',
    '',
    'I am escalating a complaint that has not been resolved through the standard Home Office complaints process.',
    '',
    `Complainant Name: ${data.complainantName}`,
    `Original Complaint Date: ${data.originalComplaintDate || 'Not provided'}`,
    `Home Office Reference: ${data.homeOfficeReference || 'Not provided'}`,
    `Complaint Type: ${data.complaintType || 'Not provided'}`,
    '',
    'Summary of Complaint:',
    `${data.summary || 'Not provided'}`,
    '',
    'The Home Office has failed to provide a satisfactory response within the required timeframe. I request that the ICIBI investigate this matter.',
    '',
    'Yours sincerely,',
    data.complainantName
  ];
  return lines.join('\n');
}

export function getHomeOfficeContactInfo(typeId) {
  const info = HOME_OFFICE_CONTACTS[typeId];
  if (!info) return null;
  return { ...info };
}

export function serializeImmigration(value) {
  return JSON.stringify(value);
}

export function parseImmigration(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
