/**
 * validate-storage-keys.mjs
 *
 * Scans tool src/app.js files for localStorage keys (open-access-uk:*)
 * and verifies every key is registered in shared/privacy/local-storage.mjs.
 *
 * Usage: node scripts/validate-storage-keys.mjs
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load the registry
const registryModule = await import(join(root, 'shared', 'privacy', 'local-storage.mjs'));
const registeredKeys = new Set(registryModule.storageRegistry.map((e) => e.key));

// Known non-storage key patterns that contain "open-access-uk:" but aren't localStorage
const NON_STORAGE_PATTERNS = new Set([
  'open-access-uk:case:v1' // JSON schema marker for case import/export
]);

const TOOL_DIRS = [
  'accessible-formats-request',
  'batch-foi',
  'benefits-appeals',
  'deadline-cascade',
  'employment-tribunal',
  'eviction-notice-validator',
  'evidence-checker',
  'fee-calculator',
  'foi-tracker',
  'immigration-complaints',
  'nhs-complaints-tracker',
  'ombudsman-outcomes',
  'professional-complaints',
  'send-helper',
  'uc-sanctions',
  'case-builder'
];

let allKeysFound = new Set();
const unregisteredKeys = new Set();

for (const tool of TOOL_DIRS) {
  const appPath = join(root, tool, 'src', 'app.js');
  try {
    const src = readFileSync(appPath, 'utf8');
    const keyRegex = /['"]open-access-uk:[^'"]+/g;
    const matches = src.match(keyRegex) || [];
    for (const match of matches) {
      const cleanKey = match.replace(/['"]/g, '');
      if (NON_STORAGE_PATTERNS.has(cleanKey)) continue;
      allKeysFound.add(cleanKey);
      if (!registeredKeys.has(cleanKey)) {
        unregisteredKeys.add(cleanKey);
      }
    }
  } catch {
    // skip if no app.js
  }
}

if (unregisteredKeys.size > 0) {
  console.error(`FAIL: ${unregisteredKeys.size} unregistered localStorage key(s) found:`);
  for (const key of [...unregisteredKeys].sort()) {
    console.error(`  - ${key}`);
  }
  console.error('\nAdd them to shared/privacy/local-storage.mjs');
  process.exit(1);
}

console.log(`OK: All ${allKeysFound.size} localStorage keys found across tools are registered.`);
