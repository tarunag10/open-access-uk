import { readYamlRecords } from './yaml-records.mjs';

const required = ['id', 'name', 'repo', 'demo', 'category', 'status', 'risk_level', 'maintainers'];
const riskLevels = new Set(['low', 'medium', 'high']);
const records = readYamlRecords('data/repositories.yml');
const seen = new Set();
const errors = [];

for (const record of records) {
  for (const key of required) {
    if (!record[key] || (Array.isArray(record[key]) && record[key].length === 0)) {
      errors.push(`${record.id || 'unknown'}: missing ${key}`);
    }
  }
  if (seen.has(record.id)) errors.push(`${record.id}: duplicate id`);
  seen.add(record.id);
  if (!riskLevels.has(record.risk_level)) errors.push(`${record.id}: invalid risk_level`);
  if (!/^[\w.-]+\/[\w.-]+$/.test(record.repo || ''))
    errors.push(`${record.id}: repo must be owner/name`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${records.length} repository records.`);
