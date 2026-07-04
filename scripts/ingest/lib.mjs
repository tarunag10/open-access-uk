/**
 * scripts/ingest/lib.mjs
 *
 * Shared library for all data-ingest jobs.
 *
 * Every ingest job should:
 *   1. Fetch data from an open source
 *   2. Normalise records
 *   3. Call writeDataset() to save to data/generated/
 *
 * Conventions:
 *   - data/generated/ is committed (reviewable diffs)
 *   - Never hand-edit generated files (enforced by Quality workflow)
 *   - Each file carries metadata: source, licence, retrieved_at, refresh_cadence
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const root = join(__dirname, '..', '..');
export const generatedDir = join(root, 'data', 'generated');

/**
 * Writes a generated dataset with provenance metadata.
 *
 * @param {string} name          — dataset name (used as filename: <name>.json)
 * @param {object[]} records     — array of data records
 * @param {object} meta          — provenance metadata
 * @param {string} meta.source     — e.g. "GOV.UK Bank Holidays API"
 * @param {string} meta.source_url — URL of the source
 * @param {string} meta.licence    — e.g. "OGL v3"
 * @param {string} meta.retrieved_at — ISO date string
 * @param {string} meta.refresh_cadence — e.g. "monthly", "annually"
 * @param {string} [meta.schema]  — optional path to JSON schema
 */
export function writeDataset(name, records, meta) {
  if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir, { recursive: true });
  }

  const filePath = join(generatedDir, `${name}.json`);
  const content = JSON.stringify({ meta, records }, null, 2) + '\n';

  writeFileSync(filePath, content, 'utf8');
  console.log(`  WROTE  ${filePath}  (${records.length} records, ${content.length} bytes)`);
  return filePath;
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Fetches a URL and returns parsed JSON.
 * Accepts a custom user-agent.
 */
export async function fetchJSON(url, options = {}) {
  const headers = {
    'User-Agent': 'open-access-uk-ingest/1.0 (github.com/tarunag10/open-access-uk)',
    Accept: 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
