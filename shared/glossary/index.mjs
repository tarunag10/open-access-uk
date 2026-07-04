/**
 * shared/glossary/index.mjs
 *
 * Renders glossary terms from data/glossary.yml as hover/tap definitions.
 * Used by every tool to provide plain-English definitions of legal terms.
 */

// Inline glossary data (ingested from data/glossary.yml at build time)
// Falls back to an inline subset for direct import.
const GLOSSARY = new Map();

const BUILTIN_TERMS = [
  {
    term: 'Mandatory reconsideration',
    definition: 'A formal request asking DWP to review its own benefit decision. Must usually be made within 1 month.',
    source: 'GOV.UK',
    jurisdiction: 'Great Britain'
  },
  {
    term: 'Early conciliation',
    definition: 'Free ACAS service to resolve workplace disputes without tribunal. Pauses the statutory time limit.',
    source: 'ACAS',
    jurisdiction: 'Great Britain'
  },
  {
    term: 'Section 21',
    definition: 'No-fault eviction notice. Abolished in England on 1 May 2026.',
    source: 'GOV.UK',
    jurisdiction: 'England only'
  },
  {
    term: 'Working day',
    definition: 'Monday to Friday, excluding bank holidays.',
    source: 'GOV.UK',
    jurisdiction: 'England and Wales'
  },
  {
    term: 'Prescribed information',
    definition: 'Required info landlords must give tenants within 30 days of receiving a deposit.',
    source: 'Shelter',
    jurisdiction: 'England and Wales'
  }
];

for (const entry of BUILTIN_TERMS) {
  GLOSSARY.set(entry.term.toLowerCase(), entry);
}

/**
 * Look up a glossary term. Case-insensitive.
 */
export function getDefinition(term) {
  if (!term) return null;
  return GLOSSARY.get(term.toLowerCase()) || null;
}

/**
 * Returns all glossary terms.
 */
export function getAllTerms() {
  return [...GLOSSARY.values()];
}

/**
 * Generates a definition popup HTML snippet for a term.
 */
export function definitionPopup(term) {
  const entry = getDefinition(term);
  if (!entry) return null;
  return {
    term: entry.term,
    definition: entry.definition,
    source: entry.source,
    jurisdiction: entry.jurisdiction,
    html: `<dfn title="${escapeAttr(entry.definition)}">${escapeHtml(term)}</dfn>`
  };
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
