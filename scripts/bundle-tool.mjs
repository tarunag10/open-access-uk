/**
 * bundle-tool.mjs
 *
 * Regenerates each tool's src/app.js by:
 *   1. Resolving shared/ imports from src/tracker.js
 *   2. Inlining the current shared module content
 *   3. Preserving the tool-specific app logic (DOM handlers, form code)
 *
 * Usage:
 *   node scripts/bundle-tool.mjs <tool-dir>
 *   node scripts/bundle-tool.mjs <tool-dir> --check
 *   node scripts/bundle-tool.mjs --all
 *   node scripts/bundle-tool.mjs --all --check
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

/**
 * Build a fresh app.js for a tool.
 *
 * Strategy:
 *   - Read current app.js to extract the app logic portion (after inlined modules).
 *   - Read tracker.js to find which shared modules it imports.
 *   - Inline fresh copies of those shared modules.
 *   - Concatenate: banner + fresh inlined modules + theme + app logic.
 */
function bundleApp(toolDir) {
  const appPath = join(root, toolDir, 'src', 'app.js');
  const trackerPath = join(root, toolDir, 'src', 'tracker.js');

  if (!existsSync(appPath)) {
    console.error(`  SKIP  ${toolDir}  (no app.js)`);
    return null;
  }
  if (!existsSync(trackerPath)) {
    console.error(`  SKIP  ${toolDir}  (no tracker.js)`);
    return null;
  }

  const currentApp = readFileSync(appPath, 'utf8');
  const trackerSrc = readFileSync(trackerPath, 'utf8');

  // 1. Find shared module imports from tracker.js
  const importPaths = [];
  const importRegex = /import\s+(?:[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(trackerSrc)) !== null) {
    if (match[1].startsWith('../../shared/')) {
      importPaths.push(match[1]);
    }
  }

  // 2. Inline fresh copies of shared modules
  const inlinedModules = [];
  for (const importPath of importPaths) {
    const sharedPath = join(root, importPath.replace('../../', ''));
    if (!existsSync(sharedPath)) {
      console.warn(`  WARN  ${toolDir}  (shared module not found: ${importPath})`);
      continue;
    }
    const moduleSrc = readFileSync(sharedPath, 'utf8');
    // Strip export keywords for inlining
    const stripped = moduleSrc
      .replace(/^import\s+[^;]+;\n?/gm, '')
      .replace(/^export\s+const\s+/gm, 'const ')
      .replace(/^export\s+function\s+/gm, 'function ')
      .replace(/^export\s+\{\s*[^}]+\s*\};?\n?/gm, '')
      .replace(/^export\s+default\s+/gm, '');
    inlinedModules.push(`// ===== ${importPath} =====\n${stripped}`);
  }

  // 3. Extract app logic: everything after the inlined shared/tracker section
  //    The marker is typically "// ===== App logic =====" or the first section after tracker.js
  //    Look for the first line that isn't a comment or whitespace after the inlined section
  const appLogicStart = currentApp.search(/\n\/\/ ===== (?:App logic|Theme init)/);
  const appLogic = appLogicStart >= 0
    ? currentApp.slice(appLogicStart + 1)
    : currentApp;

  // 4. Build the banner and assemble
  const banner = `// ${toolDir}/src/app.js — generated bundle (all shared modules inlined)\n` +
    `// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs ${toolDir}\n\n`;

  // Add theme module inline if not already covered by imports
  const themeSrc = [];
  if (!importPaths.some(p => p.includes('theme'))) {
    const themePath = join(root, 'shared', 'theme', 'index.mjs');
    if (existsSync(themePath)) {
      const themeModule = readFileSync(themePath, 'utf8')
        .replace(/^export\s+const\s+/gm, 'const ')
        .replace(/^export\s+function\s+/gm, 'function ')
        .replace(/^export\s+\{\s*[^}]+\s*\};?\n?/gm, '');
      themeSrc.push(`// ===== ../../shared/theme/index.mjs =====\n${themeModule}`);
    }
  }

  // Build the tracker inline (with escapeHtml and other helpers)
  const trackerHelpers = trackerSrc
    .replace(/^import\s+[^;]+;\n?/gm, '');

  const bundled = banner +
    inlinedModules.join('\n\n') + '\n\n' +
    (themeSrc.length > 0 ? themeSrc.join('\n\n') + '\n\n' : '') +
    `// ===== src/tracker.js (imports resolved) =====\n${trackerHelpers}\n\n` +
    appLogic;

  return { bundled, existingPath: appPath };
}

// ---- CLI ----
const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const allMode = args.includes('--all');

const targets = allMode
  ? TOOL_DIRS
  : args.filter(a => !a.startsWith('--'));

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
      console.error(`  FAIL  ${target}  (app.js differs from generated bundle)`);
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
  console.error(`\n${failures} divergence(s) found. Run node scripts/bundle-tool.mjs --all to regenerate.`);
  process.exit(1);
}
