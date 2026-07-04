/**
 * scripts/ingest/bank-holidays.mjs
 *
 * Fetches UK bank holidays from GOV.UK and writes them to data/generated/bank-holidays.json.
 *
 * Usage: node scripts/ingest/bank-holidays.mjs
 *
 * Source: https://www.gov.uk/bank-holidays.json (OGL v3)
 */

import { fetchJSON, writeDataset, todayISO } from './lib.mjs';

const SOURCE_URL = 'https://www.gov.uk/bank-holidays.json';

async function ingestBankHolidays() {
  console.log('Fetching bank holidays from GOV.UK...');
  const data = await fetchJSON(SOURCE_URL);

  const divisions = {
    'england-and-wales': 'england-and-wales',
    scotland: 'scotland',
    'northern-ireland': 'northern-ireland'
  };

  const records = {};

  for (const [key, divisionId] of Object.entries(divisions)) {
    const division = data[divisionId];
    if (!division) {
      console.warn(`  WARN  Division "${divisionId}" not found in response`);
      continue;
    }
    records[key] = division.events.map((e) => e.date).sort();
    console.log(`  OK    ${key}: ${records[key].length} bank holidays`);
  }

  // Flatten to an array of per-jurisdiction year groups for the generated file
  const output = [];
  for (const [jurisdiction, dates] of Object.entries(records)) {
    output.push({ jurisdiction, dates });
  }

  writeDataset('bank-holidays', output, {
    source: 'GOV.UK Bank Holidays API',
    source_url: SOURCE_URL,
    licence: 'OGL v3',
    retrieved_at: todayISO(),
    refresh_cadence: 'monthly',
    schema: 'data/schemas/bank-holidays.schema.json'
  });

  console.log('Done.');
}

ingestBankHolidays().catch((err) => {
  console.error(err);
  process.exit(1);
});
