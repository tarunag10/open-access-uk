// FOI Response Tracker - core logic
// Tracks FOI requests across public authorities with deadline calculation, escalation, and export.

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Drafting', description: 'Request not yet sent.' },
  { value: 'sent', label: 'Sent', description: 'Request sent, awaiting acknowledgement.' },
  { value: 'acknowledged', label: 'Acknowledged', description: 'Authority has confirmed receipt.' },
  {
    value: 'partial',
    label: 'Partial response',
    description: 'Some information received, more pending.'
  },
  { value: 'responded', label: 'Responded', description: 'Full response received.' },
  { value: 'refused', label: 'Refused', description: 'Authority refused the request.' },
  {
    value: 'overdue',
    label: 'Overdue',
    description: 'Response deadline has passed without reply.'
  },
  {
    value: 'escalated',
    label: 'Escalated',
    description: 'Complaint to ICO or internal review started.'
  },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

export const AUTHORITY_TYPES = [
  {
    value: 'central',
    label: 'Central government',
    examples: ['ministry', 'agency', 'HMRC', 'Home Office']
  },
  {
    value: 'local',
    label: 'Local council',
    examples: ['county council', 'borough council', 'city council']
  },
  { value: 'nhs', label: 'NHS body', examples: ['trust', 'integrated care board', 'GP practice'] },
  { value: 'police', label: 'Police', examples: ['constabulary', 'police and crime commissioner'] },
  {
    value: 'education',
    label: 'Education body',
    examples: ['university', 'college', 'academy trust']
  },
  {
    value: 'housing',
    label: 'Housing association',
    examples: ['registered provider', 'arms-length body']
  },
  {
    value: 'other',
    label: 'Other public body',
    examples: ['regulator', 'quango', 'executive agency']
  }
];

export const FOI_RULE = {
  id: 'foi-response',
  name: 'Freedom of Information response',
  days: 20,
  day_type: 'working',
  risk_level: 'high',
  source_id: 'govuk-foi-request',
  explanation: 'Public authorities normally have 20 working days to respond to an FOI request.'
};

export const ICO_COMPLAINT_WINDOW = {
  id: 'ico-complaint-window',
  name: 'ICO complaint window',
  weeks: 12,
  day_type: 'calendar',
  source_id: 'ico-foi-complaint',
  explanation:
    'You can complain to the ICO if you have not had a response within 20 working days, or are unhappy with the response.'
};

export function generateRequestId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `foi-${stamp}-${random}`;
}

export function createRequest(data = {}) {
  return {
    id: data.id || generateRequestId(),
    authority: String(data.authority || '').trim(),
    authorityType: data.authorityType || 'central',
    subject: String(data.subject || '').trim(),
    requestText: String(data.requestText || '').trim(),
    sentDate: data.sentDate || '',
    responseDate: data.responseDate || '',
    status: data.status || 'draft',
    reference: String(data.reference || '').trim(),
    responseNotes: String(data.responseNotes || '').trim(),
    escalationDate: data.escalationDate || '',
    escalationNotes: String(data.escalationNotes || '').trim(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function parseRequest(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createRequest(parsed);
  } catch {
    return null;
  }
}

export function serializeRequest(request) {
  return JSON.stringify(createRequest(request));
}

export function parseRequestList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createRequest(item));
  } catch {
    return [];
  }
}

export function serializeRequestList(list) {
  return JSON.stringify(list.map((item) => createRequest(item)));
}

export function getStatusMeta(status) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

export function getAuthorityTypeMeta(type) {
  return AUTHORITY_TYPES.find((t) => t.value === type) || AUTHORITY_TYPES[0];
}

export function isOverdue(request, today = new Date()) {
  if (!request.sentDate) return false;
  if (['responded', 'closed', 'refused', 'escalated'].includes(request.status)) return false;
  return computeDeadline(request.sentDate, today) < 0;
}

export function computeDeadline(sentDate, today = new Date()) {
  if (!sentDate) return null;
  const sent = new Date(sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const target = addWorkingDaysLocal(sent, 20);
  const today_ = new Date(today);
  today_.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today_) / (1000 * 60 * 60 * 24));
  return diff;
}

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkingDaysLocal(date, days) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  result.setHours(0, 0, 0, 0);
  return result;
}

export function daysUntilDeadline(request, today = new Date()) {
  if (!request.sentDate) return null;
  return computeDeadline(request.sentDate, today);
}

export function needsEscalation(request, today = new Date()) {
  if (!request.sentDate) return false;
  if (['escalated', 'closed', 'responded', 'refused'].includes(request.status)) return false;
  const days = computeDeadline(request.sentDate, today);
  return days !== null && days < 0;
}

export function buildOverdueList(requests, today = new Date()) {
  return requests.filter((r) => needsEscalation(r, today));
}

export function buildSummary(requests, today = new Date()) {
  const total = requests.length;
  const active = requests.filter((r) => !['closed', 'responded'].includes(r.status)).length;
  const overdue = requests.filter((r) => needsEscalation(r, today)).length;
  const escalated = requests.filter((r) => r.status === 'escalated').length;
  const responded = requests.filter((r) => ['responded', 'closed'].includes(r.status)).length;
  return { total, active, overdue, escalated, responded };
}

export function buildStatusBreakdown(requests) {
  const breakdown = {};
  for (const option of STATUS_OPTIONS) {
    breakdown[option.value] = requests.filter((r) => r.status === option.value).length;
  }
  return breakdown;
}

export function buildEscalationLetter(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const overdueDays = daysUntilDeadline(request, new Date()) || 0;
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const body = [
    `To: ${request.authority} Information Rights Team`,
    `Date: ${today}`,
    `Reference: ${request.reference || 'Not provided'}`,
    '',
    `Dear Information Rights Officer,`,
    '',
    `I am writing to request an internal review of the handling of my Freedom of Information request.`,
    '',
    `Subject: ${request.subject || 'Not specified'}`,
    `Date sent: ${request.sentDate || 'Not recorded'}`,
    `Status: ${getStatusMeta(request.status).label}`,
    '',
    `I submitted the request on ${request.sentDate || 'the date above'} and have not received a substantive response within the 20 working day window.${overdueDays < 0 ? ` The deadline was ${Math.abs(overdueDays)} working day(s) ago.` : ''}`,
    '',
    `Original request:`,
    request.requestText || '[Original request text]',
    '',
    `I would like you to:`,
    `1. Confirm receipt of this request for internal review.`,
    `2. Provide a substantive response or an estimated completion date.`,
    `3. Explain any lawful extension or exemption you are relying on, with reasons.`,
    '',
    `If I do not receive a satisfactory response, I plan to complain to the Information Commissioner's Office.`,
    '',
    `Yours sincerely,`,
    name,
    contact
  ];
  return body.join('\n');
}

export function buildIcoComplaintLetter(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const body = [
    `To: Information Commissioner's Office`,
    `Date: ${today}`,
    '',
    `Dear ICO,`,
    '',
    `I am writing to complain about the handling of a Freedom of Information request by ${request.authority || '[Authority name]'}.`,
    '',
    `Request subject: ${request.subject || 'Not specified'}`,
    `Date sent: ${request.sentDate || 'Not recorded'}`,
    `Authority reference: ${request.reference || 'Not provided'}`,
    `Current status: ${getStatusMeta(request.status).label}`,
    '',
    `Summary of the issue:`,
    request.responseNotes ||
      'The authority has not provided a substantive response within the 20 working day window.',
    '',
    `Steps already taken:`,
    request.escalationNotes || 'I have written to the authority requesting an internal review.',
    '',
    `I would like the ICO to consider whether the authority has complied with the Freedom of Information Act 2000.`,
    '',
    `Yours sincerely,`,
    name,
    contact
  ];
  return body.join('\n');
}

export function buildReminderEvent(request) {
  if (!request.sentDate) return null;
  const sent = new Date(request.sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const due = addWorkingDaysLocal(sent, 14);
  return {
    title: `FOI follow-up: ${request.authority || 'Authority'}`,
    description: `Halfway through the 20 working day window for: ${request.subject || 'request'}`,
    date: due.toISOString().slice(0, 10),
    uid: `foi-reminder-${request.id}-halfway`
  };
}

export function buildDeadlineEvent(request) {
  if (!request.sentDate) return null;
  const sent = new Date(request.sentDate);
  if (Number.isNaN(sent.getTime())) return null;
  const due = addWorkingDaysLocal(sent, 20);
  return {
    title: `FOI response due: ${request.authority || 'Authority'}`,
    description: `20 working day deadline for: ${request.subject || 'request'}. Escalate if no response.`,
    date: due.toISOString().slice(0, 10),
    uid: `foi-deadline-${request.id}`
  };
}

export function buildExportCsv(requests) {
  const headers = [
    'id',
    'authority',
    'authorityType',
    'subject',
    'sentDate',
    'responseDate',
    'status',
    'reference',
    'overdue',
    'createdAt',
    'updatedAt'
  ];
  const rows = requests.map((r) => [
    r.id,
    csvField(r.authority),
    r.authorityType,
    csvField(r.subject),
    r.sentDate,
    r.responseDate,
    r.status,
    csvField(r.reference),
    needsEscalation(r) ? 'yes' : 'no',
    r.createdAt,
    r.updatedAt
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

export function buildExportJson(requests) {
  return JSON.stringify(
    requests.map((r) => createRequest(r)),
    null,
    2
  );
}

export function buildHandoffPack(request, options = {}) {
  const today = options.today || new Date().toISOString().slice(0, 10);
  const name = options.name || '[Your name]';
  const contact = options.contact || '[Your contact details]';
  const sections = [
    `# FOI request pack: ${request.authority || 'Authority'}`,
    '',
    `## Request summary`,
    `- Authority: ${request.authority || 'Not specified'}`,
    `- Authority type: ${getAuthorityTypeMeta(request.authorityType).label}`,
    `- Subject: ${request.subject || 'Not specified'}`,
    `- Reference: ${request.reference || 'Not provided'}`,
    `- Date sent: ${request.sentDate || 'Not recorded'}`,
    `- Current status: ${getStatusMeta(request.status).label}`,
    `- Deadline: 20 working days from sent date`,
    '',
    `## Original request text`,
    request.requestText || '[Original request text]',
    '',
    `## Response received`,
    request.responseNotes || 'No substantive response received yet.',
    '',
    `## Escalation notes`,
    request.escalationNotes || 'No internal review or ICO complaint started yet.',
    '',
    `## Suggested next steps`,
    '1. Check whether the deadline has passed.',
    '2. If overdue, request an internal review from the authority.',
    '3. If still unresolved, complain to the ICO using the ICO complaint letter.',
    '4. Keep copies of all correspondence and timestamps.',
    '',
    `## Contact`,
    name,
    contact,
    `Pack generated: ${today}`,
    '',
    '> This pack is a drafting aid, not legal advice. Verify deadlines and routes against the current GOV.UK and ICO guidance.'
  ];
  return sections.join('\n');
}

export function buildActionChecklist(request, today = new Date()) {
  const checklist = [
    'Save a copy of the sent request and any acknowledgement email.',
    'Note the sent date and the authority reference if provided.',
    'Mark your calendar for 14 working days (mid-window check) and 20 working days (deadline).',
    'If the deadline passes without a substantive response, request an internal review.',
    'If the internal review is unsatisfactory, complain to the ICO.',
    'Keep records of phone calls, names, and reference numbers.'
  ];
  if (request.status === 'refused') {
    checklist.push(
      'Check whether the cited exemption applies and whether a public interest balance favours disclosure.'
    );
    checklist.push('Consider asking the authority to carry out an internal review of the refusal.');
  }
  if (request.status === 'partial') {
    checklist.push('Clarify which parts of the request were answered and which were withheld.');
    checklist.push('Ask for reasons and exemption references for any withheld information.');
  }
  if (needsEscalation(request, today)) {
    checklist.unshift('Request is overdue: consider escalating to an internal review or the ICO.');
  }
  return checklist;
}

export function buildLocalActionPack(request) {
  const checklist = buildActionChecklist(request);
  return [
    `# Local action pack: ${request.authority || 'Authority'}`,
    '',
    `## Evidence to keep`,
    '- Copy of the sent FOI request',
    '- Acknowledgement email or letter',
    '- Any response received, with dates',
    '- Reference numbers and contact names',
    '',
    `## Safety checks`,
    '- Avoid sharing unnecessary personal data in the request text.',
    '- Check the request does not identify a vulnerable third party.',
    '- Do not include payment card numbers, medical records, or full account numbers.',
    '',
    `## Action checklist`,
    ...checklist.map((item) => `- ${item}`),
    '',
    `## Escalation notes`,
    request.escalationNotes || 'No escalation started yet.',
    '',
    '> Drafting aid only. Verify deadlines, exemptions, and routes against current GOV.UK and ICO guidance.'
  ].join('\n');
}
