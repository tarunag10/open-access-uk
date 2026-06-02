import { readFileSync } from 'node:fs';

function scalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
}

export function readYamlRecords(path) {
  const text = readFileSync(path, 'utf8');
  const records = [];
  let current = null;
  let activeList = null;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const recordStart = rawLine.match(/^-\s+([^:]+):\s*(.*)$/);
    if (recordStart) {
      current = { [recordStart[1]]: scalar(recordStart[2]) };
      records.push(current);
      activeList = null;
      continue;
    }

    if (!current) throw new Error(`${path}: field before first record`);

    const listItem = rawLine.match(/^\s+-\s+(.*)$/);
    if (listItem && activeList) {
      current[activeList].push(scalar(listItem[1]));
      continue;
    }

    const field = rawLine.match(/^\s*([^:]+):\s*(.*)$/);
    if (!field) throw new Error(`${path}: cannot parse line "${rawLine}"`);

    const [, key, value] = field;
    if (value.trim() === '') {
      current[key] = [];
      activeList = key;
    } else {
      current[key] = scalar(value);
      activeList = null;
    }
  }

  return records;
}
