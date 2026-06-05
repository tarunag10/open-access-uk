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
  'docs/product-map.md',
  'data/sources.yml',
  'data/repositories.yml',
  'data/features.yml',
  'data/deadline-rules.yml',
  'shared/privacy/local-storage.mjs',
  'shared/exports/index.mjs',
  'shared/deadlines/index.mjs'
];

for (const file of requiredRootFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const siteHtml = readFileSync(join('open-access-uk-site', 'index.html'), 'utf8');
const siteApp = readFileSync(join('open-access-uk-site', 'src', 'app.js'), 'utf8');
const maintainerApp = readFileSync(
  join('contributor-tools', 'maintainer-helper', 'src', 'app.js'),
  'utf8'
);
for (const required of [
  'rel="canonical"',
  'site.webmanifest',
  'aria-live',
  'aria-pressed',
  'id="source-safety"',
  'id="privacy"',
  'id="privacy-clear"',
  'privacy-interactive',
  'id="glossary"',
  'id="glossary-filter"',
  'data-workflow="plan"',
  'sw.js'
]) {
  if (!siteHtml.includes(required)) throw new Error(`Site missing quality marker: ${required}`);
}
if (!siteApp.includes('publicRepositories')) throw new Error('Site must use repository metadata');
if (!maintainerApp.includes('Source freshness dashboard')) {
  throw new Error('Maintainer helper must show source freshness dashboard');
}

console.log('Static quality checks passed');
