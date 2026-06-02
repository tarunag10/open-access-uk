import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const requiredRootFiles = [
  'LICENSE',
  'NOTICE',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md',
  'GOVERNANCE.md',
  'ROADMAP.md',
  'data/sources.yml',
  'data/repositories.yml'
];

for (const file of requiredRootFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const siteHtml = readFileSync(join('open-access-uk-site', 'index.html'), 'utf8');
for (const required of ['rel="canonical"', 'site.webmanifest', 'aria-live', 'aria-pressed']) {
  if (!siteHtml.includes(required)) throw new Error(`Site missing quality marker: ${required}`);
}

console.log('Static quality checks passed');
