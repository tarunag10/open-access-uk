import { addWorkingDays } from '../deadlines/index.mjs';

const AUTHORITY_TYPES = [
  { id: 'council', name: 'Local Council', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'nhs-trust', name: 'NHS Trust', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'police', name: 'Police Force', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'university', name: 'University', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'government-department', name: 'Government Department', deadlineWorkingDays: 20, source: 'foia-2000' },
  { id: 'police-fire-authority', name: 'Police and Fire Authority', deadlineWorkingDays: 20, source: 'foia-2000' }
];

const DEFAULT_AUTHORITIES = {
  council: [
    { name: 'Westminster City Council', type: 'council' },
    { name: 'Birmingham City Council', type: 'council' },
    { name: 'Leeds City Council', type: 'council' }
  ],
  'nhs-trust': [
    { name: 'NHS England', type: 'nhs-trust' },
    { name: 'NHS Wales', type: 'nhs-trust' }
  ]
};

function generateId() {
  return 'bfoi-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function getAuthorityTypes() {
  return [...AUTHORITY_TYPES];
}

export function getDefaultAuthorities(type) {
  return [...(DEFAULT_AUTHORITIES[type] || [])];
}

export function createBatchRequest(data) {
  if (!data || !data.subject) {
    throw new Error('subject is required');
  }
  if (!data.authorities || !Array.isArray(data.authorities) || data.authorities.length === 0) {
    throw new Error('authorities array is required and must not be empty');
  }
  if (!data.sentDate) {
    throw new Error('sentDate is required');
  }
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    subject: data.subject,
    description: data.description || '',
    authorities: data.authorities.map((a) => ({ ...a })),
    sentDate: data.sentDate,
    deadlineDays: data.deadlineDays || 20,
    notes: data.notes || ''
  };
}

export function calculateBatchDeadlines(sentDate) {
  if (!sentDate || !/^\d{4}-\d{2}-\d{2}$/.test(sentDate)) {
    return [];
  }
  const deadline = addWorkingDays(sentDate, 20);
  if (!deadline) return [];
  return [
    {
      authority: 'Westminster City Council',
      deadline,
      workingDays: 20
    }
  ];
}

export function generateBatchCoverLetter(data) {
  const lines = [];
  lines.push('Freedom of Information Act 2000 - Information Request');
  lines.push('');
  lines.push(`Subject: ${data.subject || ''}`);
  lines.push('');
  if (data.description) {
    lines.push(data.description);
    lines.push('');
  }
  lines.push(`Date of request: ${data.sentDate || ''}`);
  lines.push('');
  lines.push('Please respond within 20 working days as required by the Freedom of Information Act 2000.');
  lines.push('');
  lines.push('This request was generated locally. Nothing was sent to a server.');
  return lines.join('\n');
}

export function aggregateBatchResponses(batch) {
  if (!batch || !batch.authorities || !Array.isArray(batch.authorities)) {
    return [];
  }
  const today = new Date().toISOString().slice(0, 10);
  return batch.authorities.map((a) => {
    let status = 'pending';
    if (a.responseDate) {
      status = 'received';
    } else if (batch.sentDate && today > batch.sentDate) {
      status = 'overdue';
    }
    return {
      authority: a.name,
      type: a.type,
      status,
      responseDate: a.responseDate || ''
    };
  });
}

export function exportBatchCSV(batch) {
  if (!batch || !batch.authorities || !Array.isArray(batch.authorities)) {
    return '';
  }
  const lines = ['authority,type,sentDate,deadline,status,responseDate'];
  const deadline = addWorkingDays(batch.sentDate, batch.deadlineDays || 20) || '';
  for (const a of batch.authorities) {
    const status = a.responseDate ? 'received' : 'pending';
    lines.push([a.name, a.type, batch.sentDate, deadline, status, a.responseDate || ''].join(','));
  }
  return lines.join('\n');
}

export function serializeBatchFOI(value) {
  return JSON.stringify(value);
}

export function parseBatchFOI(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && parsed.subject) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
