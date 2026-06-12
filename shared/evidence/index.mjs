export const EVIDENCE_HANDOFF_KEY = 'open-access-uk:evidence-handoff';

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((i) => String(i).trim()).filter(Boolean))];
}

export function createEvidencePack({ source = '', items = [] } = {}) {
  return { source: String(source).trim(), items: cleanItems(items) };
}

export function serializeEvidence(pack) {
  return JSON.stringify(createEvidencePack(pack));
}

export function parseEvidence(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return createEvidencePack({ source: parsed.source, items: parsed.items });
  } catch {
    return { source: '', items: [] };
  }
}
