// SEND Helper - core logic
// Tracks SEND appeals with deadline calculation, letter generation, and evidence checklists.

import {
  getAppealTypes,
  getExclusionDeadlines,
  getSENDTribunalDeadline,
  generateExclusionReviewText,
  generateSENDTribunalText,
  getEvidenceChecklist,
  serializeSEND,
  parseSEND
} from '../../shared/send-appeals/index.mjs';

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
