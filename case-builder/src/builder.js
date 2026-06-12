// Case Builder - core case management logic
// Combines letters, evidence, deadlines, and escalation into portable case files.

export const ISSUE_CATEGORIES = [
  {
    value: 'access',
    label: 'Access or reasonable adjustment',
    description: 'Barriers in services, employment, education, or premises.'
  },
  {
    value: 'complaint',
    label: 'Complaint or service failure',
    description: 'Service has failed or treated you unfairly.'
  },
  {
    value: 'foi',
    label: 'Freedom of Information',
    description: 'Request information from a public authority.'
  },
  {
    value: 'sar',
    label: 'Subject access request',
    description: 'Request your personal data from an organisation.'
  },
  {
    value: 'housing',
    label: 'Housing or disrepair',
    description: 'Repairs, landlord issues, council housing.'
  },
  {
    value: 'consumer',
    label: 'Consumer or financial',
    description: 'Refunds, chargebacks, banking, utilities.'
  },
  {
    value: 'travel',
    label: 'Travel or transport',
    description: 'Rail, airline, bus, or other transport issues.'
  },
  {
    value: 'employment',
    label: 'Employment or workplace',
    description: 'Workplace issues, grievance, dismissal.'
  },
  {
    value: 'education',
    label: 'Education or SEND',
    description: 'School, university, SEND, exams.'
  },
  {
    value: 'health',
    label: 'Health or social care',
    description: 'NHS, social care, accessibility.'
  },
  { value: 'other', label: 'Other', description: 'Something not covered above.' }
];

export const CASE_STATUS = [
  { value: 'planning', label: 'Planning', description: 'Gathering facts and deciding next steps.' },
  { value: 'drafting', label: 'Drafting', description: 'Writing the request or complaint.' },
  { value: 'sent', label: 'Sent', description: 'Initial request or complaint sent.' },
  {
    value: 'awaiting',
    label: 'Awaiting response',
    description: 'Waiting for a reply within the response window.'
  },
  { value: 'overdue', label: 'Overdue', description: 'Response deadline has passed.' },
  {
    value: 'escalated',
    label: 'Escalated',
    description: 'Internal review or ombudsman route started.'
  },
  { value: 'resolved', label: 'Resolved', description: 'Issue resolved to your satisfaction.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export const EVIDENCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'letter', label: 'Letter' },
  { value: 'photo', label: 'Photo' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'call-log', label: 'Phone call log' },
  { value: 'form', label: 'Form or application' },
  { value: 'invoice', label: 'Invoice or receipt' },
  { value: 'other', label: 'Other' }
];

export const JOURNEY_TOOLS = [
  {
    id: 'letter-generator',
    label: 'Public-Service Letter Generator',
    url: 'https://letter-generator-psi.vercel.app/',
    category: 'letters',
    description: 'Draft reasonable adjustments, FOI, SAR, and complaint follow-ups.'
  },
  {
    id: 'accessible-forms',
    label: 'Accessible Public Forms',
    url: 'https://accessible-forms-two.vercel.app/',
    category: 'forms',
    description: 'Audit and fix inaccessible public-service forms.'
  },
  {
    id: 'public-service-directory',
    label: 'Public Service Directory',
    url: 'https://public-service-directory.vercel.app/',
    category: 'directory',
    description: 'Find escalation routes and ombudsmen.'
  },
  {
    id: 'legal-templates',
    label: 'Legal Templates UK',
    url: 'https://legal-templates-seven.vercel.app/',
    category: 'templates',
    description: 'Plain-English legal templates for everyday issues.'
  },
  {
    id: 'design-system',
    label: 'Open Access Design System',
    url: 'https://design-system-two-delta.vercel.app/',
    category: 'design-system',
    description: 'Accessible design tokens and component patterns.'
  },
  {
    id: 'foi-tracker',
    label: 'FOI Response Tracker',
    url: 'https://foi-tracker.vercel.app/',
    category: 'foi',
    description: 'Track FOI requests, deadlines, and escalations.'
  }
];

export function generateCaseId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `case-${stamp}-${random}`;
}

export function createCase(data = {}) {
  return {
    id: data.id || generateCaseId(),
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim(),
    issueCategory: data.issueCategory || 'other',
    status: data.status || 'planning',
    organisation: String(data.organisation || '').trim(),
    contactName: String(data.contactName || '').trim(),
    contactDetails: String(data.contactDetails || '').trim(),
    sentDate: data.sentDate || '',
    responseDate: data.responseDate || '',
    deadline: data.deadline || '',
    notes: String(data.notes || '').trim(),
    evidence: Array.isArray(data.evidence) ? data.evidence.map(normaliseEvidence) : [],
    letters: Array.isArray(data.letters) ? data.letters.map(normaliseLetter) : [],
    journey: Array.isArray(data.journey) ? data.journey.map(normaliseJourneyStep) : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function normaliseEvidence(item) {
  if (!item) return null;
  return {
    id: item.id || `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: item.type || 'document',
    title: String(item.title || '').trim(),
    description: String(item.description || '').trim(),
    date: item.date || '',
    reference: String(item.reference || '').trim()
  };
}

function normaliseLetter(item) {
  if (!item) return null;
  return {
    id: item.id || `let-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: item.type || 'custom',
    subject: String(item.subject || '').trim(),
    recipient: String(item.recipient || '').trim(),
    body: String(item.body || '').trim(),
    sentDate: item.sentDate || '',
    reference: String(item.reference || '').trim()
  };
}

function normaliseJourneyStep(item) {
  if (!item) return null;
  return {
    id: item.id || `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    tool: item.tool || 'letter-generator',
    note: String(item.note || '').trim(),
    status: item.status || 'pending',
    completedDate: item.completedDate || ''
  };
}

export function cleanEvidence(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseEvidence).filter(Boolean);
}

export function cleanLetters(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseLetter).filter(Boolean);
}

export function cleanJourney(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseJourneyStep).filter(Boolean);
}

export function parseCase(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createCase(parsed);
  } catch {
    return null;
  }
}

export function serializeCase(c) {
  return JSON.stringify(createCase(c));
}

export function parseCaseList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createCase(item));
  } catch {
    return [];
  }
}

export function serializeCaseList(list) {
  return JSON.stringify(list.map((item) => createCase(item)));
}

export function getStatusMeta(status) {
  return CASE_STATUS.find((s) => s.value === status) || CASE_STATUS[0];
}

export function getIssueMeta(category) {
  return (
    ISSUE_CATEGORIES.find((c) => c.value === category) ||
    ISSUE_CATEGORIES.find((c) => c.value === 'other') ||
    ISSUE_CATEGORIES[0]
  );
}

export function getEvidenceTypeMeta(type) {
  return EVIDENCE_TYPES.find((t) => t.value === type) || EVIDENCE_TYPES[0];
}

export function getJourneyToolMeta(id) {
  return JOURNEY_TOOLS.find((t) => t.id === id) || JOURNEY_TOOLS[0];
}

export function buildSummary(cases) {
  const total = cases.length;
  const active = cases.filter((c) => !['resolved', 'closed'].includes(c.status)).length;
  const overdue = cases.filter((c) => c.status === 'overdue').length;
  const escalated = cases.filter((c) => c.status === 'escalated').length;
  const resolved = cases.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
  return { total, active, overdue, escalated, resolved };
}

export function buildStatusBreakdown(cases) {
  const breakdown = {};
  for (const option of CASE_STATUS) {
    breakdown[option.value] = cases.filter((c) => c.status === option.value).length;
  }
  return breakdown;
}

export function addEvidence(caseObj, evidence) {
  const c = createCase(caseObj);
  const item = normaliseEvidence(evidence);
  if (!item) return c;
  c.evidence.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function removeEvidence(caseObj, evidenceId) {
  const c = createCase(caseObj);
  c.evidence = c.evidence.filter((e) => e.id !== evidenceId);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function addLetter(caseObj, letter) {
  const c = createCase(caseObj);
  const item = normaliseLetter(letter);
  if (!item) return c;
  c.letters.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function removeLetter(caseObj, letterId) {
  const c = createCase(caseObj);
  c.letters = c.letters.filter((l) => l.id !== letterId);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function addJourneyStep(caseObj, step) {
  const c = createCase(caseObj);
  const item = normaliseJourneyStep(step);
  if (!item) return c;
  c.journey.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function removeJourneyStep(caseObj, stepId) {
  const c = createCase(caseObj);
  c.journey = c.journey.filter((s) => s.id !== stepId);
  c.updatedAt = new Date().toISOString();
  return c;
}

export function suggestJourney(issueCategory) {
  const journeys = {
    access: ['letter-generator', 'public-service-directory', 'legal-templates'],
    complaint: ['letter-generator', 'public-service-directory', 'legal-templates'],
    foi: ['letter-generator', 'foi-tracker', 'public-service-directory'],
    sar: ['letter-generator', 'public-service-directory'],
    housing: ['letter-generator', 'public-service-directory', 'legal-templates'],
    consumer: ['legal-templates', 'public-service-directory', 'letter-generator'],
    travel: ['letter-generator', 'public-service-directory'],
    employment: ['letter-generator', 'public-service-directory', 'legal-templates'],
    education: ['letter-generator', 'public-service-directory'],
    health: ['letter-generator', 'public-service-directory'],
    other: ['letter-generator', 'public-service-directory']
  };
  const steps = journeys[issueCategory] || journeys.other;
  return steps.map((tool, i) => ({
    id: `step-${Date.now().toString(36)}-${i}`,
    tool,
    note: '',
    status: 'pending',
    completedDate: ''
  }));
}

export function buildCaseFile(c) {
  return {
    schema: 'open-access-uk:case:v1',
    case: createCase(c)
  };
}

export function parseCaseFile(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.schema === 'open-access-uk:case:v1' && parsed.case) {
      return createCase(parsed.case);
    }
    if (parsed && parsed.id && parsed.title !== undefined) {
      return createCase(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

export function buildCaseMarkdown(c) {
  const statusMeta = getStatusMeta(c.status);
  const issueMeta = getIssueMeta(c.issueCategory);
  const sections = [
    `# Case: ${c.title || 'Untitled'}`,
    '',
    `## Summary`,
    `- Status: ${statusMeta.label}`,
    `- Issue category: ${issueMeta.label}`,
    `- Organisation: ${c.organisation || 'Not specified'}`,
    `- Contact: ${c.contactName || 'Not specified'}`,
    `- Created: ${new Date(c.createdAt).toLocaleDateString()}`,
    `- Updated: ${new Date(c.updatedAt).toLocaleDateString()}`,
    '',
    `## Description`,
    c.description || 'No description recorded.',
    '',
    `## Key dates`,
    `- Sent: ${c.sentDate || 'Not sent yet'}`,
    `- Response received: ${c.responseDate || 'Not received yet'}`,
    `- Deadline: ${c.deadline || 'Not set'}`,
    '',
    `## Evidence (${c.evidence.length})`,
    ...(c.evidence.length === 0
      ? ['- No evidence recorded yet.']
      : c.evidence.map(
          (e) =>
            `- [${getEvidenceTypeMeta(e.type).label}] ${e.title}${e.date ? ` (${e.date})` : ''}${e.description ? `: ${e.description}` : ''}`
        )),
    '',
    `## Letters (${c.letters.length})`,
    ...(c.letters.length === 0
      ? ['- No letters recorded yet.']
      : c.letters
          .flatMap((l) => [
            `### ${l.subject || l.type}`,
            `- Recipient: ${l.recipient || 'Not specified'}`,
            l.sentDate ? `- Sent: ${l.sentDate}` : '',
            l.reference ? `- Reference: ${l.reference}` : '',
            '',
            l.body || '(no body recorded)',
            ''
          ])
          .filter(Boolean)),
    `## Journey (${c.journey.length} steps)`,
    ...(c.journey.length === 0
      ? ['- No journey steps recorded yet.']
      : c.journey.map((s, i) => {
          const tool = getJourneyToolMeta(s.tool);
          const status = s.status === 'completed' ? '✓' : s.status === 'in-progress' ? '…' : '○';
          return `${i + 1}. ${status} [${tool.label}](${tool.url})${s.note ? ` — ${s.note}` : ''}`;
        })),
    '',
    `## Notes`,
    c.notes || 'No additional notes.',
    '',
    '> This case file is a drafting aid, not legal advice. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance.'
  ];
  return sections.filter(Boolean).join('\n');
}

export function buildEvidenceManifest(c) {
  const lines = [
    `# Evidence manifest: ${c.title || 'Untitled'}`,
    '',
    `Total items: ${c.evidence.length}`,
    '',
    '| # | Type | Title | Date | Reference | Description |',
    '|---|------|-------|------|-----------|-------------|'
  ];
  c.evidence.forEach((e, i) => {
    const type = getEvidenceTypeMeta(e.type).label;
    const title = (e.title || '').replace(/\|/g, '\\|');
    const date = e.date || '';
    const reference = (e.reference || '').replace(/\|/g, '\\|');
    const description = (e.description || '').replace(/\|/g, '\\|');
    lines.push(`| ${i + 1} | ${type} | ${title} | ${date} | ${reference} | ${description} |`);
  });
  return lines.join('\n');
}

export function buildTimelineMarkdown(c) {
  const events = [];
  if (c.sentDate) {
    events.push({
      date: c.sentDate,
      label: 'Request sent',
      detail: `Sent to ${c.organisation || 'organisation'}`
    });
  }
  for (const letter of c.letters) {
    if (letter.sentDate) {
      events.push({
        date: letter.sentDate,
        label: `Letter sent: ${letter.subject || letter.type}`,
        detail: `To ${letter.recipient || 'recipient'}`
      });
    }
  }
  for (const step of c.journey) {
    if (step.completedDate) {
      const tool = getJourneyToolMeta(step.tool);
      events.push({
        date: step.completedDate,
        label: `Journey step: ${tool.label}`,
        detail: step.note || ''
      });
    }
  }
  if (c.responseDate) {
    events.push({ date: c.responseDate, label: 'Response received', detail: '' });
  }
  events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const lines = [
    `# Timeline: ${c.title || 'Untitled'}`,
    '',
    events.length === 0 ? 'No timeline events recorded.' : '',
    ...events.map((e) => `- **${e.date}** — ${e.label}${e.detail ? `: ${e.detail}` : ''}`)
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildCaseJsonExport(c) {
  return JSON.stringify(buildCaseFile(c), null, 2);
}

export function buildHandoffPack(c) {
  return [
    `# Case pack: ${c.title || 'Untitled'}`,
    '',
    '## Summary',
    buildCaseMarkdown(c),
    '',
    '## Evidence manifest',
    buildEvidenceManifest(c),
    '',
    '## Timeline',
    buildTimelineMarkdown(c),
    '',
    '---',
    '',
    '> Drafting aid only. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance.'
  ].join('\n');
}
