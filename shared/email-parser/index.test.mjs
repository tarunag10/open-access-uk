import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseReferenceNumbers,
  parseDeadlines,
  parseAuthorityInfo,
  parseCaseTimeline,
  extractKeyInformation,
  generateCaseEntry,
  formatParsedEmail,
  serializeEmailParser,
  parseEmailParser
} from './index.mjs';

describe('parseReferenceNumbers', () => {
  it('extracts REF/XXXXX style references', () => {
    const refs = parseReferenceNumbers('Your reference is REF/12345. Please quote this.');
    assert.deepStrictEqual(refs, ['REF/12345']);
  });

  it('extracts Case No: references', () => {
    const refs = parseReferenceNumbers('Case No: 67890');
    assert.deepStrictEqual(refs, ['Case No: 67890']);
  });

  it('extracts Reference: ABC-12345 style', () => {
    const refs = parseReferenceNumbers('Reference: ABC-12345');
    assert.deepStrictEqual(refs, ['Reference: ABC-12345']);
  });

  it('extracts Your reference: style', () => {
    const refs = parseReferenceNumbers('Your reference: 12345678');
    assert.deepStrictEqual(refs, ['Your reference: 12345678']);
  });

  it('returns empty array for no matches', () => {
    const refs = parseReferenceNumbers('No reference here');
    assert.deepStrictEqual(refs, []);
  });

  it('extracts multiple references', () => {
    const refs = parseReferenceNumbers('REF/11111 and Case No: 22222');
    assert.ok(refs.includes('REF/11111'));
    assert.ok(refs.includes('Case No: 22222'));
  });
});

describe('parseDeadlines', () => {
  it('extracts working days deadlines', () => {
    const deadlines = parseDeadlines('You must respond within 20 working days');
    assert.equal(deadlines.length, 1);
    assert.equal(deadlines[0].days, 20);
    assert.equal(deadlines[0].type, 'working_days');
  });

  it('extracts explicit date deadlines', () => {
    const deadlines = parseDeadlines('Submit by 15 July 2026');
    assert.equal(deadlines.length, 1);
    assert.ok(deadlines[0].date.includes('15'));
    assert.ok(deadlines[0].date.includes('July'));
    assert.ok(deadlines[0].date.includes('2026'));
  });

  it('extracts numeric date deadlines', () => {
    const deadlines = parseDeadlines('Deadline: 30/06/2026');
    assert.equal(deadlines.length, 1);
    assert.equal(deadlines[0].date, '30/06/2026');
  });

  it('returns empty array for no deadlines', () => {
    const deadlines = parseDeadlines('No deadline mentioned here');
    assert.deepStrictEqual(deadlines, []);
  });

  it('extracts multiple deadlines', () => {
    const deadlines = parseDeadlines('First within 10 working days, then by 15 August 2026');
    assert.ok(deadlines.length >= 2);
  });
});

describe('parseAuthorityInfo', () => {
  it('extracts NHS trust name', () => {
    const info = parseAuthorityInfo('Regards,\nNHS Foundation Trust\nPatient Services');
    assert.ok(info.name);
    assert.ok(info.name.length > 0);
  });

  it('extracts email from signature', () => {
    const info = parseAuthorityInfo('Regards,\nJohn Smith\njohn.smith@nhs.net');
    assert.ok(info.emails && info.emails.length > 0);
    assert.ok(info.emails[0].includes('nhs.net'));
  });

  it('extracts phone number', () => {
    const info = parseAuthorityInfo('Tel: +44 (0)20 1234 5678');
    assert.ok(info.phones && info.phones.length > 0);
  });

  it('returns empty objects for no signature', () => {
    const info = parseAuthorityInfo('Plain email text');
    assert.ok(info.name === '' || info.name === undefined);
  });
});

describe('parseCaseTimeline', () => {
  it('extracts dated events', () => {
    const timeline = parseCaseTimeline('15/03/2026 - Complaint submitted\n20/03/2026 - Acknowledged');
    assert.equal(timeline.length, 2);
    assert.ok(timeline[0].date.includes('15'));
    assert.ok(timeline[1].date.includes('20'));
  });

  it('returns empty array for no dates', () => {
    const timeline = parseCaseTimeline('No dates here');
    assert.deepStrictEqual(timeline, []);
  });
});

describe('extractKeyInformation', () => {
  it('returns all fields', () => {
    const result = extractKeyInformation('REF/12345 within 20 working days\nKind regards,\nNHS Trust');
    assert.ok(result.references);
    assert.ok(result.deadlines);
    assert.ok(result.authority);
    assert.ok(result.nextSteps);
    assert.ok(result.dates);
  });

  it('extracts references into result', () => {
    const result = extractKeyInformation('Your reference: ABC-12345');
    assert.ok(result.references.includes('Your reference: ABC-12345'));
  });

  it('extracts deadlines into result', () => {
    const result = extractKeyInformation('within 30 working days');
    assert.ok(result.deadlines.length > 0);
  });
});

describe('generateCaseEntry', () => {
  it('returns case-builder compatible object', () => {
    const parsed = extractKeyInformation('REF/99999');
    const entry = generateCaseEntry(parsed);
    assert.ok(entry.id);
    assert.ok(entry.createdAt);
    assert.equal(entry.type, 'email');
    assert.ok(entry.references);
  });

  it('includes the raw parsed data', () => {
    const parsed = extractKeyInformation('REF/99999 within 15 working days');
    const entry = generateCaseEntry(parsed);
    assert.ok(entry.references.includes('REF/99999'));
    assert.ok(entry.deadlines.length > 0);
  });
});

describe('formatParsedEmail', () => {
  it('returns formatted string', () => {
    const parsed = extractKeyInformation('REF/12345');
    const formatted = formatParsedEmail(parsed);
    assert.equal(typeof formatted, 'string');
    assert.ok(formatted.length > 0);
  });

  it('contains reference information', () => {
    const parsed = extractKeyInformation('REF/12345');
    const formatted = formatParsedEmail(parsed);
    assert.ok(formatted.includes('REF/12345'));
  });
});

describe('serializeEmailParser / parseEmailParser', () => {
  it('round-trips data', () => {
    const data = { references: ['REF/111'], deadlines: [], authority: '', nextSteps: [], dates: [] };
    const serialized = serializeEmailParser(data);
    const parsed = parseEmailParser(serialized);
    assert.deepStrictEqual(parsed, data);
  });

  it('returns default on invalid input', () => {
    const result = parseEmailParser('not json');
    assert.deepStrictEqual(result, { references: [], deadlines: [], authority: '', nextSteps: [], dates: [] });
  });

  it('returns default on null', () => {
    const result = parseEmailParser(null);
    assert.deepStrictEqual(result, { references: [], deadlines: [], authority: '', nextSteps: [], dates: [] });
  });
});
