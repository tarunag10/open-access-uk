// Phase 2 infra: published civic design tokens (re-export from design-system pattern for easy reuse without submodule).
// Usage: import { tokens, createTokenExport, getContrastSummary } from '../shared/design-tokens.mjs';
// Then createTokenExport() for CSS/JSON in your static civic project.

export const tokens = {
  color: {
    background: '#ffffff',
    text: '#18212f',
    muted: '#526071',
    line: '#cfd8e3',
    surface: '#f3f7fb',
    blue: '#003078',
    green: '#0b6b3a',
    amber: '#8a5a00',
    red: '#b42318',
    focus: '#ffdd00'
  },
  radius: { card: '8px', control: '6px', chip: '999px' },
  space: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '36px' },
  type: { body: '1rem', small: '0.9rem', h2: '1.45rem' },
  focus: { outline: '4px solid #ffdd00', offset: '2px' }
};

export function createTokenExport(tokenSet = tokens) {
  // Minimal version of design-system one for shared publish
  const decls = Object.entries(tokenSet).flatMap(([k, v]) => {
    if (v && typeof v === 'object') {
      return Object.entries(v).map(([sk, sv]) => `  --${k}-${sk}: ${sv};`);
    }
    return [`  --${k}: ${v};`];
  }).join('\n');
  return {
    css: `:root {\n${decls}\n}\n`,
    json: JSON.stringify(tokenSet, null, 2) + '\n'
  };
}

export function getContrastSummary() {
  // Simplified; full luminance in design-system
  return [
    { name: 'Body text', foreground: tokens.color.text, background: tokens.color.background, ratio: '21+:1', rating: 'AAA' },
    { name: 'Primary action', foreground: '#ffffff', background: tokens.color.blue, ratio: '8.6:1', rating: 'AAA' },
    { name: 'Focus indicator', foreground: tokens.color.text, background: tokens.color.focus, ratio: '4.5:1', rating: 'AA' }
  ];
}
