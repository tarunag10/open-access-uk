// Case Builder - Housing Repairs Extension
// Bridges shared/repairs with case-builder records.

import {
  getRepairCategories as sharedGetRepairCategories,
  getRepairDeadlines,
  createRepairRecord,
  getDeadlineStatus,
  getDisrepairEvidence,
  getHousingOmbudsmanRoute as sharedGetHousingOmbudsmanRoute,
  serializeRepairs,
  parseRepairs
} from '../../shared/repairs/index.mjs';

import {
  createCase,
  buildHandoffPack,
  buildTimelineMarkdown,
  buildEvidenceManifest,
  getStatusMeta
} from './builder.js';

const REPAIR_DRAFT_KEY = 'open-access-uk:case-builder:repair-draft';

export function getRepairCategories() {
  return sharedGetRepairCategories();
}

export function getHousingOmbudsmanRoute() {
  return sharedGetHousingOmbudsmanRoute();
}

export function createRepairCase(data) {
  const record = createRepairRecord(data);
  const category = sharedGetRepairCategories().find((c) => c.id === data.category);
  const deadlineStatus = getDeadlineStatus(record);
  const caseRecord = createCase({
    title: `${category ? category.name : data.category} - ${data.propertyAddress}`,
    description: data.description,
    issueCategory: 'housing',
    status: deadlineStatus === 'overdue' ? 'overdue' : 'sent',
    organisation: data.landlordName,
    sentDate: data.reportedDate,
    deadline: computeDeadline(record, category),
    notes: `Repair reference: ${record.referenceNumber}`,
    evidence: buildInitialEvidence(data),
    letters: [],
    journey: [
      {
        id: `rpr-step-${Date.now().toString(36)}-0`,
        tool: 'letter-generator',
        note: 'Send initial repair request to landlord',
        status: 'completed',
        completedDate: data.reportedDate
      }
    ]
  });
  return caseRecord;
}

function computeDeadline(record, category) {
  if (!category) return '';
  const reported = new Date(record.reportedDate);
  if (category.deadlineHours) {
    reported.setTime(reported.getTime() + category.deadlineHours * 60 * 60 * 1000);
  } else if (category.deadlineWorkingDays) {
    reported.setDate(reported.getDate() + Math.ceil(category.deadlineWorkingDays * 1.4));
  } else if (category.deadlineCalendarDays) {
    reported.setDate(reported.getDate() + category.deadlineCalendarDays);
  }
  return reported.toISOString().slice(0, 10);
}

function buildInitialEvidence(data) {
  const items = [];
  if (data.photos) {
    items.push({
      type: 'photo',
      title: 'Photographs of disrepair',
      description: 'Photos documenting the repair issue',
      date: data.reportedDate
    });
  }
  if (data.medicalEvidence) {
    items.push({
      type: 'document',
      title: 'Medical evidence',
      description: 'GP letter or medical report linking health issues to disrepair',
      date: data.reportedDate
    });
  }
  return items;
}

export function renderRepairTimeline(repair) {
  const events = [];
  if (repair.sentDate) {
    events.push({
      date: repair.sentDate,
      label: 'Repair reported',
      detail: `To ${repair.organisation || 'landlord'}`
    });
  }
  if (repair.deadline) {
    events.push({ date: repair.deadline, label: 'Deadline', detail: 'Expected completion' });
  }
  if (repair.responseDate) {
    events.push({ date: repair.responseDate, label: 'Landlord response', detail: '' });
  }
  events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const lines = [
    `# Repair Timeline: ${repair.title || 'Untitled'}`,
    '',
    events.length === 0 ? 'No timeline events recorded.' : '',
    ...events.map((e) => `- **${e.date}** — ${e.label}${e.detail ? `: ${e.detail}` : ''}`)
  ].filter(Boolean);
  return lines.join('\n');
}

export function getRepairEvidenceChecklist(category) {
  return getDisrepairEvidence().map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    required:
      category === 'emergency'
        ? ['photos', 'dates', 'correspondence'].includes(item.id)
        : ['photos', 'dates', 'correspondence', 'impact'].includes(item.id)
  }));
}

export function generateRepairCaseSummary(repair) {
  const category = sharedGetRepairCategories().find((c) => c.id === repair.issueCategory);
  const statusMeta = getStatusMeta(repair.status);
  return [
    `Repair Case Summary`,
    ``,
    `Title: ${repair.title || 'Untitled'}`,
    `Status: ${statusMeta.label}`,
    `Category: ${category ? category.name : repair.issueCategory || 'Unknown'}`,
    `Property: ${repair.organisation || 'Not specified'}`,
    `Landlord: ${repair.organisation || 'Not specified'}`,
    ``,
    `Description`,
    repair.description || 'No description recorded.',
    ``,
    `Key dates`,
    `- Reported: ${repair.sentDate || 'Not recorded'}`,
    `- Deadline: ${repair.deadline || 'Not set'}`,
    `- Response: ${repair.responseDate || 'Not received'}`,
    ``,
    `Evidence (${repair.evidence.length} items)`,
    ...(repair.evidence.length === 0
      ? ['- No evidence recorded yet.']
      : repair.evidence.map((e) => `- [${e.type}] ${e.title}${e.date ? ` (${e.date})` : ''}`)),
    ``,
    `Landlord response deadline: 28 calendar days from initial report.`,
    ``,
    `Next steps`,
    repair.status === 'overdue'
      ? '- Escalate to Housing Ombudsman Stage 1.'
      : '- Gather evidence and await landlord response.'
  ].join('\n');
}

export function createRepairHandoffPack(repair) {
  const category = sharedGetRepairCategories().find((c) => c.id === repair.issueCategory);
  const sections = [
    `# Repair Case Pack: ${repair.title || 'Untitled'}`,
    '',
    '## Summary',
    generateRepairCaseSummary(repair),
    '',
    '## Repair Report',
    `Category: ${category ? category.name : 'Unknown'}`,
    `Description: ${repair.description || 'Not provided'}`,
    `Reported: ${repair.sentDate || 'Not recorded'}`,
    `Status: ${repair.status}`,
    '',
    '## Timeline',
    buildTimelineMarkdown(repair),
    '',
    '## Evidence Manifest',
    buildEvidenceManifest(repair),
    '',
    '## Housing Ombudsman Route',
    ...sharedGetHousingOmbudsmanRoute().map((stage) => `- ${stage.name}: ${stage.description}`),
    '',
    '---',
    '',
    '> Drafting aid only. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance.'
  ];
  return sections.join('\n');
}

export function serializeRepairDraft(draft) {
  try {
    return JSON.stringify(draft);
  } catch {
    return null;
  }
}

export function parseRepairDraft(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
