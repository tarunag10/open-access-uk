import { readYamlRecords } from './yaml-records.mjs';

const sourceIds = new Set(readYamlRecords('data/sources.yml').map((record) => record.id));
const rules = readYamlRecords('data/deadline-rules.yml');
const riskLevels = new Set(['low', 'medium', 'high']);
const dayTypes = new Set(['calendar', 'working']);
const errors = [];
const seen = new Set();

for (const rule of rules) {
  for (const key of ['id', 'name', 'source_id', 'day_type', 'risk_level', 'explanation']) {
    if (!rule[key]) errors.push(`${rule.id || 'unknown'}: missing ${key}`);
  }

  if (seen.has(rule.id)) errors.push(`${rule.id}: duplicate id`);
  seen.add(rule.id);

  if (!sourceIds.has(rule.source_id))
    errors.push(`${rule.id}: unknown source_id ${rule.source_id}`);
  if (!riskLevels.has(rule.risk_level)) errors.push(`${rule.id}: invalid risk_level`);
  if (!dayTypes.has(rule.day_type)) errors.push(`${rule.id}: invalid day_type`);

  const durations = ['days', 'weeks', 'months'].filter((key) => rule[key]);
  if (durations.length !== 1)
    errors.push(`${rule.id}: exactly one of days, weeks, or months is required`);
  for (const key of durations) {
    const value = Number(rule[key]);
    if (!Number.isInteger(value) || value <= 0)
      errors.push(`${rule.id}: ${key} must be a positive integer`);
  }
}

if (rules.length < 5) errors.push(`expected at least 5 deadline rules, found ${rules.length}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${rules.length} deadline rules.`);
