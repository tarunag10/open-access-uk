/**
 * shared/case/index.mjs — Case Spine v1
 *
 * Unifies case data across the toolkit. Every tool reads/writes this schema.
 */

const CASE_STORAGE_KEY = 'open-access-uk:cases';

const DEFAULT_CASE = {
  schemaVersion: '1',
  parties: [],
  events: [],
  deadlines: [],
  documents: [],
  letters: [],
  route: {}
};

let _idCounter = Date.now();

function generateId() {
  return 'case-' + (_idCounter++).toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Creates a new Case with the given title and optional fields.
 */
export function createCase(title, options = {}) {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_CASE,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    title: title || 'Untitled case',
    jurisdiction: options.jurisdiction || 'uk',
    parties: options.parties || [],
    ...options
  };
}

/**
 * Loads all cases from localStorage.
 */
export function loadCases() {
  try {
    const raw = localStorage.getItem(CASE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves all cases to localStorage.
 */
export function saveCases(cases) {
  try {
    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Returns the storage key for privacy registry.
 */
export function getCaseStorageKey() {
  return CASE_STORAGE_KEY;
}

/**
 * Finds a case by ID.
 */
export function findCase(cases, id) {
  return cases.find((c) => c.id === id) || null;
}

/**
 * Adds an event to a case.
 */
export function addEvent(caseObj, event) {
  caseObj.events.push({
    date: event.date || new Date().toISOString().slice(0, 10),
    type: event.type || 'note',
    summary: event.summary || '',
    toolId: event.toolId,
    refs: event.refs || []
  });
  caseObj.updatedAt = new Date().toISOString();
  return caseObj;
}

/**
 * Adds a deadline to a case.
 */
export function addDeadline(caseObj, deadline) {
  caseObj.deadlines.push({
    ruleId: deadline.ruleId,
    startDate: deadline.startDate,
    targetDate: deadline.targetDate,
    status: deadline.status || 'pending',
    note: deadline.note
  });
  caseObj.updatedAt = new Date().toISOString();
  return caseObj;
}

/**
 * Adds a party to a case.
 */
export function addParty(caseObj, party) {
  caseObj.parties.push({
    role: party.role || 'unknown',
    name: party.name,
    org: party.org,
    contact: party.contact
  });
  caseObj.updatedAt = new Date().toISOString();
  return caseObj;
}

/**
 * Merges events from an incoming array into an existing case.
 * Deduplicates by (date + type + summary).
 */
export function mergeEvents(existing, incoming) {
  const seen = new Set(existing.events.map((e) => `${e.date}:${e.type}:${e.summary}`));
  for (const event of incoming) {
    const key = `${event.date}:${event.type}:${event.summary}`;
    if (!seen.has(key)) {
      existing.events.push(event);
      seen.add(key);
    }
  }
  existing.updatedAt = new Date().toISOString();
  return existing;
}

/**
 * Merges cases: last-write-wins per field group.
 * Events are concatenated and deduplicated.
 */
export function mergeCases(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  existing.title = incoming.title || existing.title;
  existing.jurisdiction = incoming.jurisdiction || existing.jurisdiction;
  existing.updatedAt = new Date().toISOString();

  // Merge parties: incoming overrides existing by role
  for (const party of incoming.parties) {
    const idx = existing.parties.findIndex((p) => p.role === party.role);
    if (idx >= 0) existing.parties[idx] = party;
    else existing.parties.push(party);
  }

  // Merge events (deduplicated)
  mergeEvents(existing, incoming.events);

  // Merge deadlines: latest status wins per ruleId
  for (const dl of incoming.deadlines) {
    const idx = existing.deadlines.findIndex((d) => d.ruleId === dl.ruleId);
    if (idx >= 0) existing.deadlines[idx] = dl;
    else existing.deadlines.push(dl);
  }

  // Merge documents: deduplicate by name + addedAt
  const docKeys = new Set(existing.documents.map((d) => `${d.name}:${d.addedAt}`));
  for (const doc of incoming.documents) {
    const key = `${doc.name}:${doc.addedAt}`;
    if (!docKeys.has(key)) {
      existing.documents.push(doc);
      docKeys.add(key);
    }
  }

  // Merge letters: latest renderedAt wins per templateId
  for (const letter of incoming.letters) {
    const idx = existing.letters.findIndex((l) => l.templateId === letter.templateId);
    if (idx >= 0 && letter.renderedAt > existing.letters[idx].renderedAt) {
      existing.letters[idx] = letter;
    } else if (idx < 0) {
      existing.letters.push(letter);
    }
  }

  return existing;
}

/**
 * Exports a case as a portable JSON object (strips internal IDs if needed).
 */
export function exportCase(caseObj) {
  return {
    schema: 'open-access-uk:case:v1',
    exportedAt: new Date().toISOString(),
    case: { ...caseObj }
  };
}

/**
 * Imports a case from a portable JSON object.
 */
export function importCase(data) {
  if (!data || data.schema !== 'open-access-uk:case:v1' || !data.case) return null;
  return { ...data.case };
}

/**
 * Serialization helpers for localStorage round-tripping.
 */
export function serializeCases(cases) {
  return JSON.stringify(cases);
}

export function parseCases(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
