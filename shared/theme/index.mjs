// shared/theme/index.mjs
export const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

export function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}
