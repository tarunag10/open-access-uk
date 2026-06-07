// Export hub - produces downloadable files for a case
import {
  buildCaseMarkdown,
  buildEvidenceManifest,
  buildTimelineMarkdown,
  buildHandoffPack,
  buildCaseJsonExport,
  createCase
} from './builder.js';

export function buildExportList(c) {
  return [
    {
      id: 'case-markdown',
      label: 'Case summary (Markdown)',
      description: 'Single Markdown file with the case summary, letters, evidence, and journey.',
      filename: safeFilename(c, 'case'),
      mimeType: 'text/markdown',
      content: buildCaseMarkdown(c)
    },
    {
      id: 'evidence-manifest',
      label: 'Evidence manifest (Markdown table)',
      description: 'Markdown table of all evidence items with type, date, and reference.',
      filename: safeFilename(c, 'evidence-manifest'),
      mimeType: 'text/markdown',
      content: buildEvidenceManifest(c)
    },
    {
      id: 'timeline',
      label: 'Timeline (Markdown)',
      description: 'Chronological list of events across the case.',
      filename: safeFilename(c, 'timeline'),
      mimeType: 'text/markdown',
      content: buildTimelineMarkdown(c)
    },
    {
      id: 'handoff-pack',
      label: 'Handoff pack (combined Markdown)',
      description: 'All of the above in one file, ready to share with an adviser.',
      filename: safeFilename(c, 'handoff-pack'),
      mimeType: 'text/markdown',
      content: buildHandoffPack(c)
    },
    {
      id: 'case-json',
      label: 'Case file (JSON, portable)',
      description:
        'Portable JSON case file that can be imported back into the Case Builder or another tool.',
      filename: safeFilename(c, 'case'),
      mimeType: 'application/json',
      content: buildCaseJsonExport(c)
    },
    ...buildLetterExports(c),
    ...buildJsonListExport(c)
  ];
}

function buildLetterExports(c) {
  return c.letters.map((letter, i) => ({
    id: `letter-${letter.id || i}`,
    label: `Letter: ${letter.subject || letter.type || 'Untitled'}`,
    description: `Letter to ${letter.recipient || 'recipient'}${letter.sentDate ? ` (sent ${letter.sentDate})` : ''}.`,
    filename: safeFilename(c, `letter-${i + 1}-${(letter.type || 'letter').toLowerCase()}`),
    mimeType: 'text/plain',
    content: letter.body || '(no body recorded)'
  }));
}

function buildJsonListExport(c) {
  return [
    {
      id: 'evidence-json',
      label: 'Evidence list (JSON)',
      description: 'Machine-readable list of evidence items.',
      filename: safeFilename(c, 'evidence'),
      mimeType: 'application/json',
      content: JSON.stringify({ caseId: c.id, evidence: c.evidence }, null, 2)
    }
  ];
}

function safeFilename(c, suffix) {
  const title = String(c.title || 'case')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const id = String(c.id || 'untitled').slice(0, 20);
  return `${title || 'case'}-${id}-${suffix}.md`.replace(/\.md\.md$/, '.md');
}

export function groupByType(exports) {
  const groups = { markdown: [], json: [], text: [] };
  for (const exp of exports) {
    if (exp.mimeType.includes('markdown')) groups.markdown.push(exp);
    else if (exp.mimeType.includes('json')) groups.json.push(exp);
    else groups.text.push(exp);
  }
  return groups;
}

export function buildCombinedMarkdown(exports) {
  const sections = [
    '# Combined case export',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This file combines the following exports:',
    ...exports.map((e) => `- ${e.label}`),
    '',
    '---',
    ''
  ];
  const body = exports
    .map((e) => [`## ${e.label}`, '', e.content, '', '---', ''].join('\n'))
    .join('\n');
  return sections.join('\n') + body;
}
