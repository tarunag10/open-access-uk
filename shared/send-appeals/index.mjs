const APPEAL_TYPES = [
  { id: 'exclusion-review', name: 'School Exclusion Review', deadlineSchoolDays: 15, source: 'govuk-school-exclusions' },
  { id: 'independent-review-panel', name: 'Independent Review Panel', deadlineSchoolDays: 15, source: 'govuk-school-exclusions-irp' },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  { id: 'ehcp-dispute', name: 'EHCP Dispute', deadlineNote: 'No statutory deadline but prompt action recommended', source: 'govuk-ehcp' },
  { id: 'mediation-request', name: 'SEND Mediation Request', deadlineMonths: 2, source: 'govuk-send-mediation' },
];

const SEND_TRIBUNAL_STAGES = [
  'mediation',
  'tribunal application',
  'hearing',
  'decision',
];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    'The pupil\'s education records',
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence',
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    'Governors\' decision letter',
    'Statement of the school\'s reasons',
    'The pupil\'s education and medical records',
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors',
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    'Evidence of the child\'s needs and provision required',
    'Medical or educational reports',
    'Witness statements',
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments',
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    'Evidence of the child\'s needs',
    'Any relevant correspondence',
  ],
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    'permanent': `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`,
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`,
  };
}

function getSENDTribunalDeadline(mediationCertificateDate) {
  const months = 2;
  const base = mediationCertificateDate || new Date();
  const deadline = new Date(base);
  deadline.setMonth(deadline.getMonth() + months);
  return { months, deadline };
}

function generateExclusionReviewText(data) {
  return [
    `School Exclusion Review Request`,
    ``,
    `To: ${data.schoolName}`,
    ``,
    `I am writing to request a review of the exclusion of ${data.pupilName}.`,
    ``,
    `Exclusion type: ${data.exclusionType}`,
    `Exclusion date: ${data.exclusionDate}`,
    `Grounds for exclusion: ${data.grounds}`,
    ``,
    `I request that the governors review this exclusion within the statutory ${getExclusionDeadlines(data.exclusionType).schoolDays} school day timeframe.`,
    ``,
    `Yours faithfully,`,
  ].join('\n');
}

function generateSENDTribunalText(data) {
  return [
    `First-tier Tribunal (Special Educational Needs and Disability)`,
    ``,
    `Appellant: ${data.childName}`,
    `Local Authority: ${data.laName}`,
    `EHCP Date: ${data.ehcpDate}`,
    ``,
    `Grounds for Appeal:`,
    data.grounds,
    ``,
    `I am making this application to the Tribunal seeking determination on the above matters.`,
    ``,
    `Enclosed: Mediation certificate and supporting evidence.`,
  ].join('\n');
}

function getSENDTribunalStages() {
  return [...SEND_TRIBUNAL_STAGES];
}

function getEvidenceChecklist(appealType) {
  return [...(EVIDENCE_CHECKLISTS[appealType] || EVIDENCE_CHECKLISTS['send-tribunal'])];
}

function serializeSEND(value, storage) {
  if (storage) {
    storage.setItem('send-appeals-data', JSON.stringify(value));
  }
}

function parseSEND(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getSENDTribunalStages,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND,
};
