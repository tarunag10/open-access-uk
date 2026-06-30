const REFERENCE_PATTERNS = [
  /\bREF\/[\d\/]{4,}\b/gi,
  /\bcase\s*(?:no|number|#)\s*[:=]?\s*[A-Z0-9][\w\-\/]{4,30}\b/gi,
  /\b(?:your\s+)?reference\s*[:=]\s*[A-Z0-9][\w\-\/]{4,30}\b/gi
];

const DEADLINE_PATTERNS = [
  /(?:within|by|before|deadline[:\s]*)\s*(\d{1,2})\s*(working\s*days?)/gi,
  /(?:by|before|deadline[:\s]*)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  /(?:by|before|deadline[:\s]*)\s*(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi
];

const DATE_EVENT_PATTERN = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*[-–:]\s*(.+)/g;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_PATTERN = /(?:tel(?:ephone)?|phone|mobile|fax)[:\s]*(\+?[\d\s\-()]{7,20})/gi;

const SIGNATURE_SEPARATORS = ['--', '---', 'Kind regards', 'Best regards', 'Regards', 'Yours sincerely', 'Yours faithfully'];

export function parseReferenceNumbers(text) {
  if (!text) return [];
  const refs = new Set();
  for (const pattern of REFERENCE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      refs.add(match[0].trim());
    }
  }
  return [...refs];
}

export function parseDeadlines(text) {
  if (!text) return [];
  const deadlines = [];
  for (const pattern of DEADLINE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0].trim();
      if (match[2] && /working\s*days?/i.test(match[2])) {
        deadlines.push({
          type: 'working_days',
          days: parseInt(match[1], 10),
          raw: fullMatch
        });
      } else {
        const dateStr = match[1] || match[2] || fullMatch.replace(/^(?:by|before|deadline[:\s]*)/i, '').trim();
        deadlines.push({
          type: 'date',
          date: dateStr,
          raw: fullMatch
        });
      }
    }
  }
  return deadlines;
}

export function parseAuthorityInfo(text) {
  if (!text) return { name: '', emails: [], phones: [] };

  let sigStart = text.length;
  for (const sep of SIGNATURE_SEPARATORS) {
    const idx = text.indexOf(sep);
    if (idx !== -1 && idx < sigStart) {
      sigStart = idx;
    }
  }
  const signature = sigStart < text.length ? text.slice(sigStart) : text;

  const emails = [];
  let emailMatch;
  const emailRegex = new RegExp(EMAIL_PATTERN.source, EMAIL_PATTERN.flags);
  while ((emailMatch = emailRegex.exec(signature)) !== null) {
    emails.push(emailMatch[0]);
  }

  const phones = [];
  let phoneMatch;
  const phoneRegex = new RegExp(PHONE_PATTERN.source, PHONE_PATTERN.flags);
  while ((phoneMatch = phoneRegex.exec(signature)) !== null) {
    phones.push(phoneMatch[1].trim());
  }

  const lines = signature.split('\n').map((l) => l.trim()).filter(Boolean);
  let name = '';
  for (const line of lines) {
    if (hasEmail(line) || /phone|tel|fax|mobile|email/i.test(line)) continue;
    if (/kind|best|regards|sincerely|faithfully/i.test(line)) continue;
    if (/^[A-Z][\w\s&']{2,60}$/.test(line) && line.length > 3) {
      name = line;
      break;
    }
  }

  return { name, emails, phones };
}

function hasEmail(line) {
  return /[\w.+-]+@[\w-]+\.[\w.-]+/.test(line);
}

export function parseCaseTimeline(text) {
  if (!text) return [];
  const events = [];
  const regex = new RegExp(DATE_EVENT_PATTERN.source, DATE_EVENT_PATTERN.flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    events.push({
      date: match[1],
      event: match[2].trim()
    });
  }
  return events;
}

export function extractKeyInformation(emailText) {
  if (!emailText) {
    return { references: [], deadlines: [], authority: '', nextSteps: [], dates: [] };
  }
  return {
    references: parseReferenceNumbers(emailText),
    deadlines: parseDeadlines(emailText),
    authority: parseAuthorityInfo(emailText).name,
    nextSteps: extractNextSteps(emailText),
    dates: parseCaseTimeline(emailText)
  };
}

function extractNextSteps(text) {
  const steps = [];
  const patterns = [
    /(?:please|kindly)\s+(.{10,80})/gi,
    /(?:you (?:should|must|need to|are required to))\s+(.{10,80})/gi,
    /(?:next steps?[:\s]+)(.{10,80})/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      steps.push(match[0].trim());
    }
  }
  return steps;
}

function generateId() {
  return 'em-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function generateCaseEntry(parsedData) {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    type: 'email',
    references: parsedData.references || [],
    deadlines: parsedData.deadlines || [],
    authority: parsedData.authority || '',
    nextSteps: parsedData.nextSteps || [],
    dates: parsedData.dates || []
  };
}

export function formatParsedEmail(parsedData) {
  const lines = [];
  if (parsedData.references && parsedData.references.length) {
    lines.push(`References: ${parsedData.references.join(', ')}`);
  }
  if (parsedData.deadlines && parsedData.deadlines.length) {
    const dl = parsedData.deadlines.map((d) => {
      if (d.type === 'working_days') return `${d.days} working days`;
      return d.date;
    });
    lines.push(`Deadlines: ${dl.join(', ')}`);
  }
  if (parsedData.authority) lines.push(`Authority: ${parsedData.authority}`);
  if (parsedData.nextSteps && parsedData.nextSteps.length) {
    lines.push('Next Steps:');
    for (const step of parsedData.nextSteps) {
      lines.push(`  - ${step}`);
    }
  }
  if (parsedData.dates && parsedData.dates.length) {
    lines.push('Timeline:');
    for (const entry of parsedData.dates) {
      lines.push(`  ${entry.date}: ${entry.event}`);
    }
  }
  return lines.join('\n');
}

export function serializeEmailParser(value) {
  return JSON.stringify(value);
}

export function parseEmailParser(value) {
  const defaultValue = { references: [], deadlines: [], authority: '', nextSteps: [], dates: [] };
  if (!value || typeof value !== 'string') return defaultValue;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? { ...defaultValue, ...parsed } : defaultValue;
  } catch {
    return defaultValue;
  }
}
