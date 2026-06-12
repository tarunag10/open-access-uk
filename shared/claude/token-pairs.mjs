// shared/claude/token-pairs.mjs

// WCAG relative luminance + contrast ratio (sRGB).
function luminance(hex) {
  const rgb = hex
    .match(/[a-f0-9]{2}/gi)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastPair(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Canonical Claude palette. Light theme on warm paper; dark theme on warm charcoal.
export const palette = {
  light: {
    paper: '#faf9f5',
    paper2: '#f5f4ee',
    ink: '#1f1e1c',
    inkMuted: '#56524a',
    accent: '#c2410c', // clay, darkened from #d97757 to pass AA as text on paper
    accentInk: '#ffffff', // text on accent fill
    teal: '#0f5b5b', // energy accent / links
    success: '#1a6a3c',
    warning: '#8a5a00',
    danger: '#b42318',
    line: '#8f8b80' // darkened from #d9d6cc to pass 3:1 as a non-text UI border on paper
  },
  dark: {
    paper: '#1c1a17',
    paper2: '#262320',
    ink: '#f6f4ee',
    inkMuted: '#bdb7ab',
    accent: '#e8997a', // lighter clay for text on charcoal
    accentInk: '#1c1a17',
    teal: '#5fc9c9',
    success: '#5fd08a',
    warning: '#e0b150',
    danger: '#f0857c',
    line: '#787266' // lightened from #3a352f to pass 3:1 as a non-text UI border on charcoal
  }
};

// Foreground/background pairs that MUST meet contrast. min 4.5 = text, min 3 = large/UI.
export const tokenPairs = [
  // Light
  {
    name: 'light body text',
    foreground: palette.light.ink,
    background: palette.light.paper,
    min: 4.5
  },
  {
    name: 'light muted text',
    foreground: palette.light.inkMuted,
    background: palette.light.paper,
    min: 4.5
  },
  {
    name: 'light accent text',
    foreground: palette.light.accent,
    background: palette.light.paper,
    min: 4.5
  },
  {
    name: 'light text on accent',
    foreground: palette.light.accentInk,
    background: palette.light.accent,
    min: 4.5
  },
  { name: 'light link', foreground: palette.light.teal, background: palette.light.paper, min: 4.5 },
  {
    name: 'light success',
    foreground: palette.light.success,
    background: palette.light.paper,
    min: 4.5
  },
  {
    name: 'light warning',
    foreground: palette.light.warning,
    background: palette.light.paper,
    min: 4.5
  },
  {
    name: 'light danger',
    foreground: palette.light.danger,
    background: palette.light.paper,
    min: 4.5
  },
  { name: 'light border', foreground: palette.light.line, background: palette.light.paper, min: 3 },
  // Dark
  {
    name: 'dark body text',
    foreground: palette.dark.ink,
    background: palette.dark.paper,
    min: 4.5
  },
  {
    name: 'dark muted text',
    foreground: palette.dark.inkMuted,
    background: palette.dark.paper,
    min: 4.5
  },
  {
    name: 'dark accent text',
    foreground: palette.dark.accent,
    background: palette.dark.paper,
    min: 4.5
  },
  {
    name: 'dark text on accent',
    foreground: palette.dark.accentInk,
    background: palette.dark.accent,
    min: 4.5
  },
  { name: 'dark link', foreground: palette.dark.teal, background: palette.dark.paper, min: 4.5 },
  {
    name: 'dark success',
    foreground: palette.dark.success,
    background: palette.dark.paper,
    min: 4.5
  },
  {
    name: 'dark warning',
    foreground: palette.dark.warning,
    background: palette.dark.paper,
    min: 4.5
  },
  {
    name: 'dark danger',
    foreground: palette.dark.danger,
    background: palette.dark.paper,
    min: 4.5
  },
  { name: 'dark border', foreground: palette.dark.line, background: palette.dark.paper, min: 3 }
];

export function auditTokenPairs(pairs = tokenPairs) {
  return pairs.map((pair) => {
    const ratio = Number(contrastPair(pair.foreground, pair.background).toFixed(2));
    return { ...pair, ratio, passes: ratio >= pair.min };
  });
}
