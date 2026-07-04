import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// All tool directories with package.json
const TOOL_DIRS = [
  'open-access-uk-site',
  'letter-generator',
  'accessible-forms',
  'public-service-directory',
  'legal-templates',
  'design-system',
  'foi-tracker',
  'case-builder',
  'contributor-tools/maintainer-helper',
  'case-aggregator',
  'uc-sanctions',
  'immigration-complaints',
  'benefits-appeals',
  'eviction-notice-validator',
  'send-helper',
  'batch-foi',
  'deadline-cascade',
  'fee-calculator',
  'evidence-checker',
  'nhs-complaints-tracker',
  'ombudsman-outcomes',
  'professional-complaints',
  'employment-tribunal',
  'accessible-formats-request'
].filter((entry) => existsSync(join(root, entry, 'package.json')));

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
console.log(`\nVerified ${summaries.length} entries.`);

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
