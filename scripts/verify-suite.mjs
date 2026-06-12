import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const repos = [
  'open-access-uk-site',
  'letter-generator',
  'accessible-forms',
  'public-service-directory',
  'legal-templates',
  'design-system',
  'foi-tracker',
  'case-builder',
  'contributor-tools/maintainer-helper'
].filter((entry) => existsSync(join(root, entry, 'package.json')));

const summaries = [];

for (const repo of repos) {
  const cwd = join(root, repo);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf8' });

  for (const command of [
    ['npm', ['test']],
    ['npm', ['run', 'build']],
    ['node', ['--check', 'src/app.js']]
  ]) {
    const [bin, args] = command;
    const result = spawnSync(bin, args, { cwd, stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`${repo}: ${bin} ${args.join(' ')} failed`);
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
console.log(`Verified ${repos.length} Open Access UK suite entries.`);
