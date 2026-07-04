// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// send-helper/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs send-helper

// ===== ../../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
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

// ===== ../../shared/theme/index.mjs =====
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== src/tracker.js (imports resolved) =====
// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

export {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
};

export const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

export function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

export function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

export function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

export function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

export function getAppealTypeLabel(typeId) {
  const types = getAppealTypes();
  const found = types.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

export function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

export function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

export function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

export function buildTypeBreakdown(appeals) {
  const types = getAppealTypes();
  const breakdown = {};
  for (const t of types) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

export function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

export function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// ===== src/app.js =====
// ===== ../shared/send-appeals/index.mjs =====
const APPEAL_TYPES = [
  {
    id: 'exclusion-review',
    name: 'School Exclusion Review',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions'
  },
  {
    id: 'independent-review-panel',
    name: 'Independent Review Panel',
    deadlineSchoolDays: 15,
    source: 'govuk-school-exclusions-irp'
  },
  { id: 'send-tribunal', name: 'SEND Tribunal', deadlineMonths: 2, source: 'govuk-send-tribunal' },
  {
    id: 'ehcp-dispute',
    name: 'EHCP Dispute',
    deadlineNote: 'No statutory deadline but prompt action recommended',
    source: 'govuk-ehcp'
  },
  {
    id: 'mediation-request',
    name: 'SEND Mediation Request',
    deadlineMonths: 2,
    source: 'govuk-send-mediation'
  }
];

const SEND_TRIBUNAL_STAGES = ['mediation', 'tribunal application', 'hearing', 'decision'];

const EVIDENCE_CHECKLISTS = {
  'exclusion-review': [
    'Copy of the exclusion notice from the school',
    'Written statement of the reasons for exclusion',
    'Any correspondence with the school',
    "The pupil's education records",
    'Witness statements or evidence from the pupil',
    'Any relevant medical or SEN evidence'
  ],
  'independent-review-panel': [
    'Exclusion notice from the school',
    "Governors' decision letter",
    "Statement of the school's reasons",
    "The pupil's education and medical records",
    'Evidence of any SEN or disability',
    'Any correspondence with the school or governors'
  ],
  'send-tribunal': [
    'Copy of the EHCP or decision not to assess',
    'Mediation certificate or evidence of exemption',
    'Correspondence with the Local Authority',
    "Evidence of the child's needs and provision required",
    'Medical or educational reports',
    'Witness statements'
  ],
  'ehcp-dispute': [
    'Copy of the EHCP',
    'Correspondence with the Local Authority',
    'Evidence of the disputed provision or decision',
    'Educational or medical reports',
    'Any independent assessments'
  ],
  'mediation-request': [
    'Copy of the EHCP or decision letter',
    'Details of the dispute with the Local Authority',
    "Evidence of the child's needs",
    'Any relevant correspondence'
  ]
};

function getAppealTypes() {
  return [...APPEAL_TYPES];
}

function getExclusionDeadlines(exclusionType) {
  const schoolDays = 15;
  const notes = {
    'fixed-term': `${schoolDays} school days to request a review by the governors`,
    permanent: `${schoolDays} school days to request a review by the governors`,
    'exclusion-review': `${schoolDays} school days to request a review`,
    'independent-review-panel': `${schoolDays} school days to request a review`
  };
  return {
    schoolDays,
    note: notes[exclusionType] || `${schoolDays} school days to request a review`
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
    `Yours faithfully,`
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
    `Enclosed: Mediation certificate and supporting evidence.`
  ].join('\n');
}

function getEvidenceChecklist(appealType) {
  return [...(EVIDENCE_CHECKLISTS[appealType] || EVIDENCE_CHECKLISTS['send-tribunal'])];
}

function serializeSEND(value) {
  return JSON.stringify(value);
}

function parseSEND(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ===== src/tracker.js =====
const APPEAL_STATUS = [
  { value: 'draft', label: 'Drafting', description: 'Appeal not yet submitted.' },
  {
    value: 'submitted',
    label: 'Submitted',
    description: 'Appeal sent to school, LA, or tribunal.'
  },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Recipient has confirmed receipt.' },
  { value: 'in-progress', label: 'In progress', description: 'Appeal is being considered.' },
  { value: 'mediation', label: 'Mediation', description: 'Mediation in progress.' },
  { value: 'hearing', label: 'Hearing scheduled', description: 'Tribunal hearing date set.' },
  { value: 'decided', label: 'Decided', description: 'Decision received.' },
  { value: 'withdrawn', label: 'Withdrawn', description: 'Appeal withdrawn.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

function generateAppealId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `send-${stamp}-${random}`;
}

function createAppeal(data = {}) {
  return {
    id: data.id || generateAppealId(),
    appealType: data.appealType || 'exclusion-review',
    childName: String(data.childName || '').trim(),
    schoolName: String(data.schoolName || '').trim(),
    laName: String(data.laName || '').trim(),
    decisionDate: data.decisionDate || '',
    exclusionType: data.exclusionType || 'fixed-term',
    grounds: String(data.grounds || '').trim(),
    notes: String(data.notes || '').trim(),
    parentName: String(data.parentName || '').trim(),
    contact: String(data.contact || '').trim(),
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function parseAppeal(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createAppeal(parsed);
  } catch {
    return null;
  }
}

function serializeAppeal(appeal) {
  return JSON.stringify(createAppeal(appeal));
}

function parseAppealList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createAppeal(item));
  } catch {
    return [];
  }
}

function serializeAppealList(list) {
  return JSON.stringify(list.map((item) => createAppeal(item)));
}

function getAppealTypeLabel(typeId) {
  const found = APPEAL_TYPES.find((t) => t.id === typeId);
  return found ? found.name : typeId;
}

function getStatusMeta(status) {
  return APPEAL_STATUS.find((s) => s.value === status) || APPEAL_STATUS[0];
}

function computeDeadline(appeal) {
  if (!appeal.decisionDate) return null;
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    const schoolDays = getExclusionDeadlines(appeal.exclusionType).schoolDays;
    const date = new Date(appeal.decisionDate);
    if (Number.isNaN(date.getTime())) return null;
    let remaining = schoolDays;
    const result = new Date(date);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return { targetDate: result.toISOString().slice(0, 10), note: `${schoolDays} school days` };
  }
  if (appeal.appealType === 'send-tribunal' || appeal.appealType === 'mediation-request') {
    const { deadline } = getSENDTribunalDeadline(appeal.decisionDate);
    return { targetDate: deadline.toISOString().slice(0, 10), note: '2 months from decision' };
  }
  if (appeal.appealType === 'ehcp-dispute') {
    return { targetDate: null, note: 'No statutory deadline - act promptly' };
  }
  return null;
}

function daysUntilDeadline(appeal, today = new Date()) {
  const dl = computeDeadline(appeal);
  if (!dl || !dl.targetDate) return null;
  const target = new Date(dl.targetDate);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

function buildSummary(appeals) {
  const total = appeals.length;
  const active = appeals.filter(
    (a) => !['closed', 'decided', 'withdrawn'].includes(a.status)
  ).length;
  const overdue = appeals.filter((a) => {
    const days = daysUntilDeadline(a);
    return days !== null && days < 0 && !['closed', 'decided', 'withdrawn'].includes(a.status);
  }).length;
  const decided = appeals.filter((a) => ['decided', 'closed'].includes(a.status)).length;
  return { total, active, overdue, decided };
}

function buildTypeBreakdown(appeals) {
  const breakdown = {};
  for (const t of APPEAL_TYPES) {
    breakdown[t.id] = appeals.filter((a) => a.appealType === t.id).length;
  }
  return breakdown;
}

function generateLetterPreview(appeal) {
  if (
    appeal.appealType === 'exclusion-review' ||
    appeal.appealType === 'independent-review-panel'
  ) {
    return generateExclusionReviewText({
      pupilName: appeal.childName,
      schoolName: appeal.schoolName,
      exclusionType: appeal.exclusionType,
      exclusionDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  if (appeal.appealType === 'send-tribunal') {
    return generateSENDTribunalText({
      childName: appeal.childName,
      laName: appeal.laName,
      ehcpDate: appeal.decisionDate,
      grounds: appeal.grounds
    });
  }
  return [
    `${getAppealTypeLabel(appeal.appealType)}`,
    '',
    `To: ${appeal.laName || '[LA name]'}`,
    '',
    `Re: ${appeal.childName}`,
    `School: ${appeal.schoolName || '[School name]'}`,
    `Date: ${appeal.decisionDate || '[Date]'}`,
    '',
    `Grounds:`,
    appeal.grounds || '[Grounds for dispute]',
    '',
    appeal.notes ? `Additional notes:\n${appeal.notes}` : '',
    '',
    'Yours sincerely,',
    appeal.parentName || '[Your name]',
    appeal.contact || '[Your contact details]'
  ]
    .filter(Boolean)
    .join('\n');
}

function buildEvidenceChecklist(appeal) {
  return getEvidenceChecklist(appeal.appealType);
}

function buildExportCsv(appeals) {
  const headers = [
    'id',
    'appealType',
    'childName',
    'schoolName',
    'laName',
    'decisionDate',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const rows = appeals.map((a) => [
    a.id,
    a.appealType,
    csvField(a.childName),
    csvField(a.schoolName),
    csvField(a.laName),
    a.decisionDate,
    a.status,
    a.createdAt,
    a.updatedAt
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildExportJson(appeals) {
  return JSON.stringify(
    appeals.map((a) => createAppeal(a)),
    null,
    2
  );
}

// ===== src/app.js =====

const STORAGE_KEY = 'open-access-uk:send-helper:appeals';
const FORM_KEY = 'open-access-uk:send-helper:form-draft';

const form = document.querySelector('#appeal-form');
const list = document.querySelector('#appeal-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');

let activeId = null;

function loadAll() {
  return parseAppealList(localStorage.getItem(STORAGE_KEY));
}

function saveAll(appeals) {
  localStorage.setItem(STORAGE_KEY, serializeAppealList(appeals));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(appeals) {
  const stats = buildSummary(appeals);
  const cards = [
    { label: 'Total appeals', value: stats.total, tone: 'default' },
    { label: 'Active', value: stats.active, tone: 'default' },
    { label: 'Overdue', value: stats.overdue, tone: stats.overdue > 0 ? 'warning' : 'default' },
    { label: 'Decided', value: stats.decided, tone: 'default' }
  ];
  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = `summary-card ${c.tone === 'warning' ? 'warning' : ''}`;
      const label = document.createElement('p');
      label.className = 'summary-label';
      label.textContent = c.label;
      const value = document.createElement('p');
      value.className = 'summary-value';
      value.textContent = String(c.value);
      card.append(label, value);
      return card;
    })
  );

  const breakdownPanel = document.querySelector('#type-breakdown');
  if (breakdownPanel) {
    const breakdown = buildTypeBreakdown(appeals);
    breakdownPanel.replaceChildren(
      ...APPEAL_TYPES.map((t) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = t.name;
        const value = document.createElement('span');
        value.textContent = breakdown[t.id] || 0;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderList(appeals) {
  list.replaceChildren();
  if (appeals.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No appeals yet. Add one using the form to start tracking deadlines and generating letters.';
    list.append(empty);
    return;
  }
  const sorted = [...appeals].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  for (const appeal of sorted) {
    const item = document.createElement('article');
    item.className = 'request-item';
    if (appeal.id === activeId) item.classList.add('active');

    const head = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = appeal.childName || 'Unnamed child';
    const status = document.createElement('span');
    status.className = 'status-pill';
    status.textContent = getStatusMeta(appeal.status).label;
    head.append(title, status);

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${getAppealTypeLabel(appeal.appealType)} — ${appeal.schoolName || 'No school'}`;

    const dl = computeDeadline(appeal);
    const deadline = document.createElement('p');
    deadline.className = 'deadline';
    if (!dl) {
      deadline.textContent = 'Add a decision date to see the deadline.';
    } else if (!dl.targetDate) {
      deadline.textContent = dl.note;
    } else {
      const days = daysUntilDeadline(appeal);
      if (days === null) {
        deadline.textContent = dl.note;
      } else if (days < 0) {
        deadline.textContent = `Overdue by ${Math.abs(days)} day(s). ${dl.note}`;
      } else if (days === 0) {
        deadline.textContent = `Deadline is today. ${dl.note}`;
      } else {
        deadline.textContent = `${days} day(s) remaining. ${dl.note}`;
      }
    }

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => selectAppeal(appeal.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'secondary';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteAppeal(appeal.id));
    actions.append(viewBtn, deleteBtn);

    item.append(head, meta, deadline, actions);
    list.append(item);
  }
}

function selectAppeal(id) {
  activeId = id;
  const appeals = loadAll();
  const appeal = appeals.find((a) => a.id === id);
  if (!appeal) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(appeal);
  renderList(appeals);
}

function renderDetail(appeal) {
  detailContent.replaceChildren();

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = appeal.childName || 'Unnamed child';
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = getStatusMeta(appeal.status).label;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const dl = computeDeadline(appeal);
  const days = daysUntilDeadline(appeal);
  const deadlineText = !dl
    ? 'Add a decision date'
    : !dl.targetDate
      ? dl.note
      : days === null
        ? dl.note
        : days < 0
          ? `Overdue by ${Math.abs(days)} day(s)`
          : `${days} day(s) remaining`;
  const fields = [
    ['Appeal type', getAppealTypeLabel(appeal.appealType)],
    ['Child', appeal.childName || 'Not specified'],
    ['School', appeal.schoolName || 'Not specified'],
    ['Local Authority', appeal.laName || 'Not specified'],
    ['Decision date', appeal.decisionDate || 'Not recorded'],
    ['Deadline', deadlineText],
    ['Status', getStatusMeta(appeal.status).label],
    ['Created', new Date(appeal.createdAt).toLocaleString()],
    ['Updated', new Date(appeal.updatedAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const groundsSection = document.createElement('section');
  const groundsHeading = document.createElement('h3');
  groundsHeading.textContent = 'Grounds for appeal';
  const groundsText = document.createElement('p');
  groundsText.className = 'body-text';
  groundsText.textContent = appeal.grounds || 'No grounds recorded.';
  groundsSection.append(groundsHeading, groundsText);

  const notesSection = document.createElement('section');
  const notesHeading = document.createElement('h3');
  notesHeading.textContent = 'Additional notes';
  const notesText = document.createElement('p');
  notesText.className = 'body-text';
  notesText.textContent = appeal.notes || 'No notes recorded.';
  notesSection.append(notesHeading, notesText);

  const evidenceSection = document.createElement('section');
  const evidenceHeading = document.createElement('h3');
  evidenceHeading.textContent = 'Evidence checklist';
  const evidenceList = document.createElement('ul');
  for (const item of buildEvidenceChecklist(appeal)) {
    const li = document.createElement('li');
    li.textContent = item;
    evidenceList.append(li);
  }
  evidenceSection.append(evidenceHeading, evidenceList);

  const letterSection = document.createElement('section');
  const letterHeading = document.createElement('h3');
  letterHeading.textContent = 'Letter preview';
  const letterText = document.createElement('p');
  letterText.className = 'body-text';
  letterText.textContent = generateLetterPreview(appeal);
  letterSection.append(letterHeading, letterText);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const statusForm = document.createElement('div');
  statusForm.className = 'status-form';
  const statusLabel = document.createElement('label');
  statusLabel.htmlFor = 'detail-status';
  statusLabel.textContent = 'Update status';
  const statusSelect = document.createElement('select');
  statusSelect.id = 'detail-status';
  for (const s of APPEAL_STATUS) {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.label;
    statusSelect.append(opt);
  }
  statusSelect.value = appeal.status;
  statusSelect.addEventListener('change', () => updateStatus(appeal.id, statusSelect.value));
  statusForm.append(statusLabel, statusSelect);

  const copyLetter = document.createElement('button');
  copyLetter.type = 'button';
  copyLetter.className = 'secondary';
  copyLetter.textContent = 'Copy letter';
  copyLetter.addEventListener('click', () =>
    copyText(generateLetterPreview(appeal), 'Letter copied locally.')
  );

  const printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.className = 'secondary';
  printBtn.textContent = 'Print letter';
  printBtn.addEventListener('click', () => {
    const win = window.open('', '_blank');
    win.document.write(`<pre>${generateLetterPreview(appeal)}</pre>`);
    win.print();
  });

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'secondary';
  downloadBtn.textContent = 'Download letter';
  downloadBtn.addEventListener('click', () =>
    downloadText(generateLetterPreview(appeal), `send-letter-${appeal.id}.txt`, 'text/plain')
  );

  actions.append(statusForm, copyLetter, printBtn, downloadBtn);
  detailContent.append(
    header,
    grid,
    groundsSection,
    notesSection,
    evidenceSection,
    letterSection,
    actions
  );
}

function updateStatus(id, status) {
  const appeals = loadAll();
  const idx = appeals.findIndex((a) => a.id === id);
  if (idx === -1) return;
  appeals[idx] = { ...appeals[idx], status, updatedAt: new Date().toISOString() };
  saveAll(appeals);
  statusEl.textContent = `Status updated to ${getStatusMeta(status).label}.`;
  renderAll();
}

function deleteAppeal(id) {
  const appeals = loadAll();
  const remaining = appeals.filter((a) => a.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Appeal deleted locally.';
  renderAll();
}

function renderAll() {
  const appeals = loadAll();
  renderSummary(appeals);
  renderList(appeals);
  if (activeId) {
    const appeal = appeals.find((a) => a.id === activeId);
    if (appeal) renderDetail(appeal);
  }
}

function saveFormDraft() {
  if (!form) return;
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch {
    /* ignore */
  }
}

function restoreFormDraft() {
  if (!form) return;
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const [name, value] of Object.entries(data)) {
      const field = form.elements.namedItem(name);
      if (field && value) field.value = value;
    }
  } catch {
    /* ignore */
  }
}

function clearFormDraft() {
  localStorage.removeItem(FORM_KEY);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    statusEl.textContent = message;
  } catch {
    statusEl.textContent = 'Copy failed. You can still select and copy the text manually.';
  }
}

function downloadText(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = `Downloaded ${filename}. Nothing was sent to a server.`;
}

function handleAdd(event) {
  event.preventDefault();
  const data = values();
  if (!data.childName?.trim()) {
    statusEl.textContent = 'Add a child name before saving.';
    return;
  }
  const appeals = loadAll();
  const now = new Date().toISOString();
  const newAppeal = createAppeal({ ...data, createdAt: now, updatedAt: now });
  appeals.push(newAppeal);
  saveAll(appeals);
  form.reset();
  clearFormDraft();
  activeId = newAppeal.id;
  statusEl.textContent = `Saved appeal for ${newAppeal.childName}.`;
  renderAll();
}

function handleExport(format) {
  const appeals = loadAll();
  if (appeals.length === 0) {
    statusEl.textContent = 'No appeals to export.';
    return;
  }
  if (format === 'csv') {
    downloadText(buildExportCsv(appeals), 'send-appeals.csv', 'text/csv');
  } else {
    downloadText(buildExportJson(appeals), 'send-appeals.json', 'application/json');
  }
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('not a list');
      const existing = loadAll();
      const merged = [...existing];
      for (const item of parsed) {
        const a = createAppeal(item);
        if (!merged.find((e) => e.id === a.id)) merged.push(a);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} appeal(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of SEND appeals.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const appeals = loadAll();
  if (appeals.length === 0) {
    statusEl.textContent = 'No appeals to clear.';
    return;
  }
  if (!confirm(`Delete all ${appeals.length} appeal(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All appeals cleared from this browser.';
  renderAll();
}

// Initialise
restoreFormDraft();

form?.addEventListener('submit', handleAdd);
form?.addEventListener('input', saveFormDraft);

document.querySelector('#exportCsv')?.addEventListener('click', () => handleExport('csv'));
document.querySelector('#exportJson')?.addEventListener('click', () => handleExport('json'));
document.querySelector('#importJson')?.addEventListener('change', handleImport);
document.querySelector('#clearAll')?.addEventListener('click', handleClearAll);

renderAll();

// Theme toggle
const THEME_STORAGE_KEY = 'open-access-uk:theme';
const VALID = new Set(['light', 'dark']);

function readStored() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}
function writeStored(value) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* private mode */
  }
}
function applyTheme(theme, toggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }
}
function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
const toggle = document.querySelector('#theme-toggle');
let stored = readStored();
let theme = VALID.has(stored) ? stored : prefersDark ? 'dark' : 'light';
applyTheme(theme, toggle);

toggle?.addEventListener('click', () => {
  theme = nextTheme(theme);
  applyTheme(theme, toggle);
  writeStored(theme);
});

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
