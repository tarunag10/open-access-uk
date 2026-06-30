// Case Builder - Email Parser Extension
// Bridges shared/email-parser with case-builder records.

import {
  extractKeyInformation,
  parseReferenceNumbers,
  parseDeadlines,
  parseAuthorityInfo,
  parseCaseTimeline,
  formatParsedEmail,
  serializeEmailParser,
  parseEmailParser
} from '../../shared/email-parser/index.mjs';

import { createCase } from './builder.js';

const EMAIL_DRAFT_KEY = 'open-access-uk:case-builder:email-import';

export function parseEmailToCase(emailText) {
  if (!emailText || typeof emailText !== 'string') {
    return null;
  }
  const keyInfo = extractKeyInformation(emailText);
  const authorityInfo = parseAuthorityInfo(emailText);
  const title = keyInfo.references.length > 0
    ? `Email correspondence — ${keyInfo.references[0]}`
    : keyInfo.authority
      ? `Email correspondence with ${keyInfo.authority}`
      : 'Imported email correspondence';
  const deadline = resolveDeadline(keyInfo.deadlines);
  const description = formatParsedEmail(keyInfo);
  return createCase({
    title,
    description,
    issueCategory: 'other',
    status: 'planning',
    organisation: keyInfo.authority || authorityInfo.name || '',
    contactName: '',
    contactDetails: authorityInfo.emails.length > 0 ? authorityInfo.emails[0] : '',
    sentDate: '',
    responseDate: '',
    deadline,
    notes: `Imported from email.\nReferences: ${keyInfo.references.join(', ') || 'None found'}\nNext steps: ${keyInfo.nextSteps.join('; ') || 'None found'}`,
    evidence: buildEvidenceFromEmail(keyInfo),
    letters: [],
    journey: []
  });
}

function resolveDeadline(deadlines) {
  if (!deadlines || deadlines.length === 0) return '';
  const dateDeadline = deadlines.find((d) => d.type === 'date' && d.date);
  if (dateDeadline) return dateDeadline.date;
  const workingDays = deadlines.find((d) => d.type === 'working_days' && d.days);
  if (workingDays) {
    const d = new Date();
    d.setDate(d.getDate() + Math.ceil(workingDays.days * 1.4));
    return d.toISOString().slice(0, 10);
  }
  return '';
}

function buildEvidenceFromEmail(keyInfo) {
  const items = [];
  if (keyInfo.references.length > 0) {
    items.push({
      type: 'email',
      title: 'Email correspondence',
      description: `References found: ${keyInfo.references.join(', ')}`,
      date: ''
    });
  }
  return items;
}

export function renderParsedData(parsedData) {
  if (!parsedData) return '<p>No parsed data available.</p>';
  const sections = [];
  if (parsedData.references && parsedData.references.length > 0) {
    sections.push(`<dt>References</dt><dd>${parsedData.references.join(', ')}</dd>`);
  }
  if (parsedData.deadlines && parsedData.deadlines.length > 0) {
    const dl = parsedData.deadlines.map((d) =>
      d.type === 'working_days' ? `${d.days} working days` : d.date
    ).join(', ');
    sections.push(`<dt>Deadlines</dt><dd>${dl}</dd>`);
  }
  if (parsedData.authority) {
    sections.push(`<dt>Authority</dt><dd>${parsedData.authority}</dd>`);
  }
  if (parsedData.nextSteps && parsedData.nextSteps.length > 0) {
    const steps = parsedData.nextSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
    sections.push(`<dt>Next steps</dt><dd><ul>${steps}</ul></dd>`);
  }
  if (parsedData.dates && parsedData.dates.length > 0) {
    const dates = parsedData.dates.map((d) =>
      `<li><strong>${escapeHtml(d.date)}</strong> — ${escapeHtml(d.event)}</li>`
    ).join('');
    sections.push(`<dt>Timeline</dt><dd><ul>${dates}</ul></dd>`);
  }
  if (sections.length === 0) {
    return '<p>No key information extracted from this email.</p>';
  }
  return `<dl>${sections.join('')}</dl>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function addToCaseFromEmail(parsedData, existingCase) {
  if (!parsedData || !existingCase) return existingCase;
  const merged = createCase(existingCase);
  if (parsedData.authority && !merged.organisation) {
    merged.organisation = parsedData.authority;
  }
  if (parsedData.references.length > 0) {
    const refNote = `Email refs: ${parsedData.references.join(', ')}`;
    merged.notes = merged.notes
      ? `${merged.notes}\n${refNote}`
      : refNote;
  }
  const deadline = resolveDeadline(parsedData.deadlines);
  if (deadline && !merged.deadline) {
    merged.deadline = deadline;
  }
  if (parsedData.references.length > 0) {
    merged.evidence.push({
      type: 'email',
      title: 'Imported email correspondence',
      description: `References: ${parsedData.references.join(', ')}`,
      date: ''
    });
  }
  merged.updatedAt = new Date().toISOString();
  return merged;
}

export function getParseConfidence(parsedData) {
  if (!parsedData) return 0;
  let score = 0;
  if (parsedData.references && parsedData.references.length > 0) score += 30;
  if (parsedData.authority) score += 25;
  if (parsedData.deadlines && parsedData.deadlines.length > 0) score += 20;
  if (parsedData.nextSteps && parsedData.nextSteps.length > 0) score += 15;
  if (parsedData.dates && parsedData.dates.length > 0) score += 10;
  return Math.min(score, 100);
}

export function generateCaseSummaryFromEmail(parsedData) {
  if (!parsedData) return 'No email data parsed.';
  const lines = [
    'Email Import Summary',
    '',
    `Authority: ${parsedData.authority || 'Not identified'}`,
    `References: ${parsedData.references.length > 0 ? parsedData.references.join(', ') : 'None found'}`,
    '',
    `Deadlines: ${
      parsedData.deadlines.length > 0
        ? parsedData.deadlines.map((d) => d.type === 'working_days' ? `${d.days} working days` : d.date).join(', ')
        : 'None identified'
    }`,
    '',
    'Next steps:',
    ...(parsedData.nextSteps.length > 0
      ? parsedData.nextSteps.map((s) => `- ${s}`)
      : ['- No next steps identified.']),
    '',
    'Timeline:',
    ...(parsedData.dates.length > 0
      ? parsedData.dates.map((d) => `- ${d.date}: ${d.event}`)
      : ['- No timeline events found.'])
  ];
  return lines.join('\n');
}

export function serializeEmailDraft(draft) {
  try {
    return JSON.stringify(draft);
  } catch {
    return null;
  }
}

export function parseEmailDraft(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
