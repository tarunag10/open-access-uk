import { readYamlRecords } from './yaml-records.mjs';

const knownTools = new Set([
  'open-access-uk-site',
  'letter-generator',
  'accessible-forms',
  'public-service-directory',
  'legal-templates',
  'design-system',
  'foi-tracker',
  'case-builder',
  'maintainer-helper',
  'shared'
]);
const statuses = new Set(['planned', 'in-progress', 'shipped', 'paused']);
const priorities = new Set(['low', 'medium', 'high']);
const riskLevels = new Set(['low', 'medium', 'high']);
const required = ['id', 'name', 'tool', 'status', 'priority', 'risk_level', 'source_needs', 'mvp'];
const records = readYamlRecords('data/features.yml');
const seen = new Set();
const errors = [];

for (const record of records) {
  for (const key of required) {
    if (!record[key]) errors.push(`${record.id || 'unknown'}: missing ${key}`);
  }

  if (seen.has(record.id)) errors.push(`${record.id}: duplicate id`);
  seen.add(record.id);

  if (!knownTools.has(record.tool)) errors.push(`${record.id}: unknown tool ${record.tool}`);
  if (!statuses.has(record.status)) errors.push(`${record.id}: invalid status`);
  if (!priorities.has(record.priority)) errors.push(`${record.id}: invalid priority`);
  if (!riskLevels.has(record.risk_level)) errors.push(`${record.id}: invalid risk_level`);
  if (record.risk_level === 'high' && record.source_needs === 'internal') {
    errors.push(
      `${record.id}: high-risk features need an external or source-backed source_needs value`
    );
  }
}

if (records.length < 8) errors.push(`expected at least 8 feature records, found ${records.length}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${records.length} feature records.`);
