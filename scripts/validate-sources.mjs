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
  'maintainer-helper'
]);
const required = [
  'id',
  'name',
  'publisher',
  'url',
  'used_by',
  'risk_level',
  'last_checked',
  'review_due'
];
const riskLevels = new Set(['low', 'medium', 'high']);
const records = readYamlRecords('data/sources.yml');
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

  if (!/^https?:\/\//.test(record.url || '')) errors.push(`${record.id}: url must be absolute`);
  if (!riskLevels.has(record.risk_level)) errors.push(`${record.id}: invalid risk_level`);
  if (record.risk_level === 'high' && !record.reviewer)
    errors.push(`${record.id}: high risk needs reviewer`);
  if (new Date(record.review_due) < new Date(record.last_checked)) {
    errors.push(`${record.id}: review_due is before last_checked`);
  }

  for (const tool of record.used_by || []) {
    if (!knownTools.has(tool)) errors.push(`${record.id}: unknown used_by ${tool}`);
  }
}

if (records.length < 10) errors.push(`expected at least 10 sources, found ${records.length}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${records.length} source records.`);
