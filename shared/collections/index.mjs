export const COLLECTIONS_KEY = 'open-access-uk:legal-templates:collections';

export function addToCollection(state, name, id) {
  const key = String(name).trim();
  const value = String(id).trim();
  if (!key || !value) return state;
  const existing = Array.isArray(state[key]) ? state[key] : [];
  if (existing.includes(value)) return state;
  return { ...state, [key]: [...existing, value] };
}

export function removeFromCollection(state, name, id) {
  if (!Array.isArray(state[name])) return state;
  const next = state[name].filter((x) => x !== id);
  const copy = { ...state };
  if (next.length) copy[name] = next;
  else delete copy[name];
  return copy;
}

export function serializeCollections(state) {
  return JSON.stringify(state || {});
}

export function parseCollections(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [name, ids] of Object.entries(parsed)) {
      if (Array.isArray(ids)) clean[name] = ids.filter((x) => typeof x === 'string');
    }
    return clean;
  } catch {
    return {};
  }
}
