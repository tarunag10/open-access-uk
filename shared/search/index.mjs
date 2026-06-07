// Static client-side suite index + ranked substring search. No network.

export const suiteIndex = [
  {
    id: 'letter-generator',
    kind: 'tool',
    title: 'Public-Service Letter Generator',
    url: 'https://letter-generator-psi.vercel.app',
    keywords: [
      'letter',
      'foi',
      'freedom of information',
      'subject access',
      'sar',
      'adjustment',
      'complaint',
      'deadline'
    ]
  },
  {
    id: 'accessible-forms',
    kind: 'tool',
    title: 'Accessible Public Forms',
    url: 'https://accessible-forms-two.vercel.app',
    keywords: ['forms', 'accessibility', 'wcag', 'labels', 'readiness', 'remediation']
  },
  {
    id: 'public-service-directory',
    kind: 'tool',
    title: 'Public Service Directory',
    url: 'https://public-service-directory.vercel.app',
    keywords: ['escalation', 'ombudsman', 'complaint', 'council', 'regulator', 'readiness', 'route']
  },
  {
    id: 'legal-templates',
    kind: 'tool',
    title: 'Legal Templates UK',
    url: 'https://legal-templates-seven.vercel.app',
    keywords: ['template', 'refund', 'chargeback', 'housing', 'rail', 'data', 'sar', 'letter']
  },
  {
    id: 'design-system',
    kind: 'tool',
    title: 'Open Access Design System',
    url: 'https://design-system-two-delta.vercel.app',
    keywords: ['tokens', 'components', 'contrast', 'design', 'accessibility', 'recipes']
  },
  {
    id: 'workflow-information',
    kind: 'workflow',
    title: 'Workflow: Request information',
    url: 'https://openaccessuk.vercel.app/#workflows',
    keywords: ['foi', 'information', 'request', 'workflow']
  },
  {
    id: 'workflow-escalate',
    kind: 'workflow',
    title: 'Workflow: Escalate a complaint',
    url: 'https://openaccessuk.vercel.app/#workflows',
    keywords: ['escalate', 'complaint', 'ombudsman', 'workflow']
  }
];

export function searchSuite(query, index = suiteIndex) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const keywords = entry.keywords.join(' ').toLowerCase();
    let score = 0;
    if (title === q) score += 100;
    if (title.startsWith(q)) score += 40;
    if (title.includes(q)) score += 20;
    if (entry.keywords.some((k) => k.toLowerCase() === q)) score += 30;
    if (keywords.includes(q)) score += 10;
    if (score > 0) scored.push({ ...entry, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}
