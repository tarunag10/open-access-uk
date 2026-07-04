/**
 * verify-suite.mjs
 *
 * Reads the tool list from data/repositories.yml instead of a hardcoded array.
 * Collects all failures into a summary table instead of throwing on the first.
 * Also checks: every top-level tool directory with index.html has a metadata row.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const repoYmlPath = join(root, 'data', 'repositories.yml');

// Parse YAML without a dependency — simple line-based parser for this format
function parseYmlList(text) {
  const items = [];
  let current = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('- id:')) {
      if (current) items.push(current);
      current = { id: line.replace('- id:', '').trim() };
    } else if (current) {
      const m = line.match(/^\s+(\w+):\s*(.+)$/);
      if (m) current[m[1]] = m[2].trim();
    }
  }
  if (current) items.push(current);
  return items;
}

const reposRaw = readFileSync(repoYmlPath, 'utf8');
const allRepos = parseYmlList(reposRaw);

// Filter to deployable tool IDs (skip umbrella-site, contributor-tooling, local-only)
const verifiable = allRepos.filter(r =>
  r.category !== 'umbrella-site' &&
  r.demo !== 'local-only' &&
  r.category !== 'contributor-tooling'
);

// Build tool directory list from metadata
let TOOL_DIRS = verifiable
  .map(r => r.id)
  .filter(entry => existsSync(join(root, entry, 'package.json')));

// Also include tools that have package.json but aren't in metadata (catch drift)
const allDirs = readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(root, d.name, 'package.json')))
  .map(d => d.name);

for (const dir of allDirs) {
  if (!TOOL_DIRS.includes(dir) && dir !== 'contributor-tools') {
    TOOL_DIRS.push(dir);
  }
}

// --- CI check: every top-level tool directory must have a metadata row ---
const toolDirsWithIndex = readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(root, d.name, 'index.html')) && !d.name.startsWith('.'))
  .map(d => d.name);

const metaIds = new Set(allRepos.map(r => r.id));
const unregistered = toolDirsWithIndex.filter(d => !metaIds.has(d));

if (unregistered.length > 0) {
  console.error(`FAIL: ${unregistered.length} tool director(ies) with index.html but no metadata row in data/repositories.yml:`);
  for (const d of unregistered) console.error(`  - ${d}`);
  process.exit(1);
}

// --- Run verification ---
const summaries = [];
const failures = [];

for (const repo of TOOL_DIRS) {
  const cwd = join(root, repo);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf8' });

  const checks = [
    { cmd: 'npm', args: ['test'], optional: false },
    { cmd: 'npm', args: ['run', 'build'], optional: true },
    { cmd: 'node', args: ['--check', 'src/app.js'], optional: true }
  ];

  for (const { cmd, args, optional } of checks) {
    const result = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
    if (result.status !== 0 && !optional) {
      failures.push(`${repo}: ${cmd} ${args.join(' ')} failed`);
    }
  }

  summaries.push({
    repo,
    packageName: packageJson.name || repo,
    remote: remote.status === 0 ? remote.stdout.trim() : 'Tracked in parent repo'
  });
}

console.log('\nOpen Access UK suite summary');
for (const summary of summaries) {
  console.log(`- ${summary.repo}: ${summary.packageName} | ${summary.remote}`);
}
console.log(`\nVerified ${summaries.length} entries, ${allRepos.length} total in metadata.`);

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
