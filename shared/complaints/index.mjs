import { addWorkingDays } from '../deadlines/index.mjs';

const NHS_STAGES = [
  {
    id: 'pals',
    name: 'PALS (Patient Advice and Liaison Service)',
    description: 'Informal resolution through hospital PALS',
    acknowledgementDays: 3,
    responseWorkingDays: 25,
    source: 'nhs-england-complaints'
  },
  {
    id: 'formal',
    name: 'Formal Complaint',
    description: 'Written formal complaint to the trust',
    acknowledgementDays: 3,
    responseWorkingDays: 25,
    source: 'nhs-england-complaints'
  },
  {
    id: 'phso',
    name: 'Parliamentary and Health Service Ombudsman',
    description: 'Escalation to PHSO after trust responds',
    deadlineMonths: 12,
    source: 'phso-complaints'
  }
];

function generateId() {
  return 'cmp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function addMonths(value, months) {
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return null;
  let [, y, m, d] = parts.map(Number);
  m += months;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return [y, String(m).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}

const VALID_STAGES = NHS_STAGES.map((s) => s.id);

export function createComplaintRecord(data) {
  if (!data || !data.patientName) {
    throw new Error('patientName is required');
  }
  const stage = data.stage || 'pals';
  if (!VALID_STAGES.includes(stage)) {
    throw new Error(`Invalid stage "${stage}". Must be one of: ${VALID_STAGES.join(', ')}`);
  }
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'open',
    patientName: data.patientName,
    stage,
    sentDate: data.sentDate || '',
    trustName: data.trustName || '',
    reference: data.reference || '',
    notes: data.notes || '',
    responseDate: data.responseDate || '',
    ...data
  };
}

export function getComplaintStages() {
  return [...NHS_STAGES];
}

export function getNextStage(currentStage) {
  const idx = NHS_STAGES.findIndex((s) => s.id === currentStage);
  if (idx < 0 || idx >= NHS_STAGES.length - 1) return null;
  return NHS_STAGES[idx + 1].id;
}

export function getDeadlineForStage(stageId, sentDate) {
  const stage = NHS_STAGES.find((s) => s.id === stageId);
  if (!stage || !sentDate) return null;

  const result = { stageId, sentDate };

  if (stage.acknowledgementDays) {
    const ack = addWorkingDays(sentDate, stage.acknowledgementDays);
    if (!ack) return null;
    result.acknowledgementDate = ack;
    result.acknowledgementDays = stage.acknowledgementDays;
  }

  if (stage.responseWorkingDays) {
    const resp = addWorkingDays(sentDate, stage.responseWorkingDays);
    if (!resp) return null;
    result.responseDate = resp;
    result.responseWorkingDays = stage.responseWorkingDays;
  }

  if (stage.deadlineMonths) {
    const dl = addMonths(sentDate, stage.deadlineMonths);
    if (!dl) return null;
    result.deadlineDate = dl;
    result.deadlineMonths = stage.deadlineMonths;
  }

  return result;
}

function stageName(stageId) {
  const stage = NHS_STAGES.find((s) => s.id === stageId);
  return stage ? stage.name : stageId;
}

export function generateComplaintSummary(complaint) {
  const lines = [];
  lines.push(`Complaint: ${complaint.patientName}`);
  lines.push(`Stage: ${stageName(complaint.stage)}`);
  if (complaint.trustName) lines.push(`Trust: ${complaint.trustName}`);
  if (complaint.reference) lines.push(`Reference: ${complaint.reference}`);
  if (complaint.sentDate) lines.push(`Sent: ${complaint.sentDate}`);
  if (complaint.notes) lines.push(`Notes: ${complaint.notes}`);
  return lines.join('\n');
}

export function serializeComplaints(complaints) {
  return JSON.stringify(complaints);
}

export function parseComplaints(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
