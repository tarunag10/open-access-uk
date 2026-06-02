export function safeFilename(value = 'open-access-export', extension = 'txt') {
  const base = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'open-access-export'}.${extension.replace(/^\./, '')}`;
}

export function createTextExport(title, body, options = {}) {
  const extension = options.extension || 'txt';
  const mimeType = extension === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
  return {
    title,
    filename: safeFilename(title, extension),
    mimeType,
    content: String(body || '').trimEnd() + '\n'
  };
}

export function createMarkdownDocument(title, sections = []) {
  const lines = [`# ${title}`, ''];
  for (const section of sections) {
    lines.push(`## ${section.heading}`);
    for (const item of section.items || []) lines.push(`- ${item}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}

export function createPrintDocument(title, body) {
  return {
    title,
    body: String(body || ''),
    generatedLocally: true,
    privacyNote: 'Generated locally in the browser. Nothing was sent to a server.'
  };
}
