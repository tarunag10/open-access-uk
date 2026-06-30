import { addWorkingDays, parseLocalDate, toLocalDateString, formatDateForDisplay, buildICS } from '../deadlines/index.mjs';

const CASCADE_TEMPLATES = [
  {
    id: 'foi-complaint',
    name: 'FOI Complaint',
    description: 'Track FOI request through internal review and ICO complaint',
    steps: [
      { name: 'Initial FOI Request', offsetDays: 0, workingDays: false, description: 'Submit FOI request' },
      { name: 'Response Deadline', offsetDays: 20, workingDays: true, description: 'Authority must respond within 20 working days' },
      { name: 'Internal Review', offsetDays: 40, workingDays: true, description: 'Request internal review if unsatisfied' },
      { name: 'ICO Complaint', offsetDays: 60, workingDays: true, description: 'Complain to ICO if still unsatisfied' }
    ],
    source: 'foia-2000'
  },
  {
    id: 'nhs-complaint',
    name: 'NHS Complaint',
    description: 'Track NHS complaint through PALS, formal, and PHSO stages',
    steps: [
      { name: 'PALS Contact', offsetDays: 0, workingDays: false, description: 'Contact Patient Advice and Liaison Service' },
      { name: 'PALS Acknowledgement', offsetDays: 3, workingDays: true, description: 'PALS should acknowledge within 3 working days' },
      { name: 'PALS Response', offsetDays: 25, workingDays: true, description: 'PALS should respond within 25 working days' },
      { name: 'Formal Complaint', offsetDays: 30, workingDays: false, description: 'Submit formal written complaint to trust' },
      { name: 'Trust Response', offsetDays: 55, workingDays: true, description: 'Trust should respond within 25 working days' },
      { name: 'PHSO Complaint', offsetDays: 365, workingDays: false, description: 'Escalate to Parliamentary and Health Service Ombudsman within 12 months' }
    ],
    source: 'nhs-england-complaints'
  },
  {
    id: 'housing-repair',
    name: 'Housing Repair',
    description: 'Track repair request through housing ombudsman stages',
    steps: [
      { name: 'Repair Reported', offsetDays: 0, workingDays: false, description: 'Report repair to landlord' },
      { name: 'Emergency Deadline', offsetDays: 1, workingDays: false, description: 'Emergency repairs should be completed within 24 hours' },
      { name: 'Urgent Deadline', offsetDays: 5, workingDays: true, description: 'Urgent repairs within 5 working days' },
      { name: 'Routine Deadline', offsetDays: 28, workingDays: false, description: 'Routine repairs within 28 calendar days' },
      { name: 'Stage 1 Complaint', offsetDays: 56, workingDays: false, description: 'Landlord Stage 1 investigation (56 days)' },
      { name: 'Stage 2 Complaint', offsetDays: 112, workingDays: false, description: 'Landlord Stage 2 review (56 days)' },
      { name: 'Housing Ombudsman', offsetDays: 180, workingDays: false, description: 'Escalate to Housing Ombudsman' }
    ],
    source: 'housing-ombudsman-guidance'
  },
  {
    id: 'benefits-appeal',
    name: 'Benefits Appeal',
    description: 'Track benefits appeal through mandatory reconsideration and tribunal',
    steps: [
      { name: 'Decision Received', offsetDays: 0, workingDays: false, description: 'Receive benefits decision' },
      { name: 'Mandatory Reconsideration', offsetDays: 30, workingDays: false, description: 'Request mandatory reconsideration within 1 calendar month' },
      { name: 'MR Response', offsetDays: 56, workingDays: false, description: 'DWP should respond within 8 weeks' },
      { name: 'Tribunal Appeal', offsetDays: 77, workingDays: false, description: 'Appeal to First-tier Tribunal within 1 calendar month of MR decision' },
      { name: 'Tribunal Hearing', offsetDays: 180, workingDays: false, description: 'Tribunal hearing typically scheduled within 6 months' }
    ],
    source: 'dwp-appeals-guidance'
  },
  {
    id: 'parking-appeal',
    name: 'Parking Appeal',
    description: 'Track parking PCN through internal review and tribunal stages',
    steps: [
      { name: 'PCN Received', offsetDays: 0, workingDays: false, description: 'Receive Penalty Charge Notice' },
      { name: 'Discount Period', offsetDays: 14, workingDays: false, description: 'Pay within 14 days for 50% discount' },
      { name: 'Formal Appeal', offsetDays: 28, workingDays: false, description: 'Submit formal appeal to council within 28 days' },
      { name: 'Appeal Response', offsetDays: 56, workingDays: false, description: 'Council should respond within 56 days' },
      { name: 'Tribunal Appeal', offsetDays: 112, workingDays: false, description: 'Appeal to Parking and Traffic Tribunal within 28 days of rejection' }
    ],
    source: 'traffic-management-act-2004'
  }
];

export function getCascadeTemplates() {
  return CASCADE_TEMPLATES;
}

function getTemplate(templateId) {
  const template = CASCADE_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return template;
}

export function buildCascade(templateId, startDate) {
  const date = parseLocalDate(startDate);
  if (!date) throw new Error('Invalid start date');
  const template = getTemplate(templateId);
  
  return template.steps.map((step, index) => {
    let deadline;
    if (index === 0) {
      deadline = toLocalDateString(date);
    } else if (step.workingDays) {
      deadline = addWorkingDays(startDate, step.offsetDays);
    } else {
      const result = new Date(date.getTime());
      result.setUTCDate(result.getUTCDate() + step.offsetDays);
      deadline = toLocalDateString(result);
    }
    
    return {
      name: step.name,
      deadline,
      description: step.description,
      index,
      workingDays: step.workingDays
    };
  });
}

export function getStepStatus(step, currentDate) {
  const current = parseLocalDate(currentDate);
  const deadline = parseLocalDate(step.deadline);
  if (!current || !deadline) return 'unknown';
  
  if (current > deadline) return 'overdue';
  if (current.getTime() === deadline.getTime()) return 'completed';
  return 'current';
}

export function calculateCascadeProgress(cascade, currentDate) {
  if (!cascade || cascade.length === 0) return 0;
  const current = parseLocalDate(currentDate);
  if (!current) return 0;
  
  let completed = 0;
  for (const step of cascade) {
    const deadline = parseLocalDate(step.deadline);
    if (deadline && current >= deadline) completed++;
  }
  
  return Math.round((completed / cascade.length) * 100);
}

export function exportCascadeICS(cascade) {
  if (!cascade || cascade.length === 0) return '';
  
  const events = [];
  for (const step of cascade) {
    const event = buildICS(step.name, step.deadline, step.description);
    if (event) {
      const lines = event.split('\r\n');
      for (const line of lines) {
        if (!line.startsWith('BEGIN:VCALENDAR') && 
            !line.startsWith('VERSION:2.0') && 
            !line.startsWith('PRODID:') && 
            !line.startsWith('END:VCALENDAR')) {
          events.push(line);
        }
      }
    }
  }
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Cascade//EN',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');
}

export function formatCascadeTimeline(cascade, currentDate) {
  if (!cascade || cascade.length === 0) return '';
  
  const lines = [];
  for (const step of cascade) {
    const status = getStepStatus(step, currentDate);
    const indicator = status === 'completed' ? '[x]' : status === 'overdue' ? '[!]' : '[ ]';
    lines.push(`${indicator} ${step.name} - ${step.deadline}`);
  }
  
  return lines.join('\n');
}

export function serializeCascade(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function parseCascade(value) {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
