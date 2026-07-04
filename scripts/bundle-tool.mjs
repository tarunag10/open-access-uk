/**
 * bundle-tool.mjs
 *
 * Generates an inlined app.js for a tool by resolving its tracker.js
 * import graph from shared/ and emitting a single-file bundle.
 *
 * Usage:
 *   node scripts/bundle-tool.mjs <tool-dir>          # write app.js
 *   node scripts/bundle-tool.mjs <tool-dir> --check   # diff against existing
 *   node scripts/bundle-tool.mjs --all                # bundle every tool
 *   node scripts/bundle-tool.mjs --all --check        # check every tool
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

const TOOL_DIRS = [
  'accessible-formats-request', 'batch-foi', 'benefits-appeals',
  'deadline-cascade', 'employment-tribunal', 'eviction-notice-validator',
  'evidence-checker', 'fee-calculator', 'immigration-complaints',
  'nhs-complaints-tracker', 'ombudsman-outcomes', 'professional-complaints',
  'send-helper', 'uc-sanctions'
];

function bundleApp(toolDir) {
  const trackerPath = join(root, toolDir, 'src', 'tracker.js');
  const appPath = join(root, toolDir, 'src', 'app.js');

  if (!existsSync(trackerPath)) {
    console.error(`  SKIP  ${toolDir}  (no tracker.js)`);
    return null;
  }

  const trackerSrc = readFileSync(trackerPath, 'utf8');

  // Extract all import paths from tracker.js
  const imports = [];
  const importRegex = /import\s+(?:[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(trackerSrc)) !== null) {
    imports.push(match[1]);
  }

  // Inline each shared dependency
  const inlinedModules = [];
  for (const importPath of imports) {
    if (!importPath.startsWith('../../shared/')) continue;
    const sharedPath = join(root, importPath.replace('../../', ''));
    if (!existsSync(sharedPath)) {
      console.warn(`  WARN  ${toolDir}  (shared module not found: ${importPath})`);
      continue;
    }
    const moduleSrc = readFileSync(sharedPath, 'utf8');
    // Strip export keywords for inlining
    const stripped = moduleSrc
      .replace(/^export\s+const\s+/gm, 'const ')
      .replace(/^export\s+function\s+/gm, 'function ')
      .replace(/^export\s+\{\s*[^}]+\s*\};?/gm, '');
    inlinedModules.push(`// ===== ${importPath} =====\n${stripped}`);
  }

  // Remove imports from tracker src, add inlined modules at top
  const trackerWithoutImports = trackerSrc.replace(/^import\s+[^;]+;\n?/gm, '');
  const banner = `// ${toolDir}/src/app.js — generated bundle (all shared modules inlined)\n// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs ${toolDir}\n\n`;
  const bundled = banner + inlinedModules.join('\n\n') + '\n\n// ===== tracker.js (imports resolved) =====\n' + trackerWithoutImports;

  return { bundled, existingPath: appPath };
}

// CLI
const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const allMode = args.includes('--all');

const targets = allMode ? TOOL_DIRS : args.filter(a => !a.startsWith('--'));

if (targets.length === 0) {
  console.error('Usage: node scripts/bundle-tool.mjs <tool-dir> [--check] [--all]');
  process.exit(1);
}

let failures = 0;

for (const target of targets) {
  const result = bundleApp(target);
  if (!result) continue;

  if (checkMode) {
    if (!existsSync(result.existingPath)) {
      console.error(`  FAIL  ${target}  (app.js not found)`);
      failures++;
      continue;
    }
    const existing = readFileSync(result.existingPath, 'utf8');
    if (existing.trim() !== result.bundled.trim()) {
      console.error(`  FAIL  ${target}  (app.js differs from generated bundle — shared modules may have diverged)`);
      failures++;
    } else {
      console.log(`  OK    ${target}  (app.js is up to date)`);
    }
  } else {
    writeFileSync(result.existingPath, result.bundled, 'utf8');
    console.log(`  OK    ${target}  (app.js regenerated)`);
  }
}

if (checkMode && failures > 0) {
  console.error(`\n${failures} divergence(s) found. Run 'node scripts/bundle-tool.mjs <tool>' to regenerate.`);
  process.exit(1);
}
