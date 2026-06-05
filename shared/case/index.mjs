// Phase 2: Case composition aggregator foundations (pure, local-only)
// Composes outputs from packs, letters, reports into a single "case file" with consistent privacy + sources.

export function buildCaseFile({ title = 'My local case file', context = '', sections = [], sources = [], safetyNotes = [] } = {}) {
  const lines = [
    `# ${title}`,
    '',
    'Generated locally in the browser. Nothing was sent to a server.',
    'This is an informational drafting aid and case organiser, not legal advice. Check all deadlines, official routes, and professional advice before acting.',
    '',
    context ? `Context: ${context}` : '',
    ''
  ].filter(Boolean);

  for (const sec of sections) {
    lines.push(`## ${sec.heading || 'Section'}`);
    if (sec.items && Array.isArray(sec.items)) {
      for (const item of sec.items) {
        lines.push(`- ${item}`);
      }
    } else if (sec.content) {
      lines.push(sec.content);
    }
    lines.push('');
  }

  if (safetyNotes.length) {
    lines.push('## Safety notes');
    for (const n of safetyNotes) lines.push(`- ${n}`);
    lines.push('');
  }

  if (sources.length) {
    lines.push('## Current source notes');
    for (const s of sources) {
      lines.push(`- ${s.title || s}: ${s.detail || ''} Source: ${s.url || ''}`);
    }
    lines.push('');
  }

  return {
    title,
    markdown: lines.join('\n').trimEnd() + '\n',
    sectionCount: sections.length,
  };
}

export function composeFromPacks(packResults = [], options = {}) {
  // packResults: array of {title, markdown, ...} from various build*Pack
  const sections = packResults.map((p, i) => ({
    heading: p.title || `Part ${i + 1}`,
    content: p.markdown || String(p),
  }));
  const sources = options.sources || [];
  const safety = options.safetyNotes || ['Keep private details proportionate.', 'Verify all dates and routes before sending.'];
  return buildCaseFile({
    title: options.title || 'Combined local case file',
    context: options.context || 'Combined from letter, templates, directory, forms, and design packs.',
    sections,
    sources,
    safetyNotes: safety,
  });
}
