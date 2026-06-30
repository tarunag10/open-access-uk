import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getProtocolTypes,
  getProtocolRequirements,
  generateLetterOfClaim,
  getResponseDeadline,
  getComplianceChecklist,
  generateADROffer,
  serializeProtocols,
  parseProtocols
} from './index.mjs';

test('getProtocolTypes returns array of protocol types', () => {
  const types = getProtocolTypes();
  assert.ok(Array.isArray(types));
  assert.equal(types.length, 4);
  const ids = types.map((t) => t.id);
  assert.ok(ids.includes('housing-disrepair'));
  assert.ok(ids.includes('debt'));
  assert.ok(ids.includes('personal-injury'));
  assert.ok(ids.includes('professional-negligence'));
});

test('getProtocolTypes each type has required fields', () => {
  const types = getProtocolTypes();
  for (const type of types) {
    assert.ok(type.name, `${type.id} missing name`);
    assert.ok(type.description, `${type.id} missing description`);
    assert.ok(type.source, `${type.id} missing source`);
    assert.equal(typeof type.responseDays, 'number');
  }
});

test('getProtocolRequirements returns required elements for housing-disrepair', () => {
  const reqs = getProtocolRequirements('housing-disrepair');
  assert.ok(reqs);
  assert.ok(Array.isArray(reqs));
  assert.ok(reqs.includes('summary of facts'));
  assert.ok(reqs.includes('evidence list'));
  assert.ok(reqs.includes('ADR proposal'));
  assert.ok(reqs.includes('compliance checklist'));
});

test('getProtocolRequirements returns required elements for debt', () => {
  const reqs = getProtocolRequirements('debt');
  assert.ok(Array.isArray(reqs));
  assert.ok(reqs.includes('summary of facts'));
  assert.ok(reqs.includes('evidence list'));
  assert.ok(reqs.includes('ADR proposal'));
  assert.ok(reqs.includes('compliance checklist'));
});

test('getProtocolRequirements returns required elements for personal-injury', () => {
  const reqs = getProtocolRequirements('personal-injury');
  assert.ok(Array.isArray(reqs));
  assert.ok(reqs.includes('summary of facts'));
  assert.ok(reqs.includes('evidence list'));
  assert.ok(reqs.includes('ADR proposal'));
  assert.ok(reqs.includes('compliance checklist'));
});

test('getProtocolRequirements returns null for unknown type', () => {
  assert.equal(getProtocolRequirements('unknown'), null);
});

test('generateLetterOfClaim returns complete letter', () => {
  const letter = generateLetterOfClaim({
    claimantName: 'Jane Doe',
    defendantName: 'Acme Corp',
    defendantAddress: '123 High Street, London',
    protocolType: 'debt',
    summaryOfFacts: 'Unpaid invoice for services rendered.',
    lossAndDamage: '£5,000',
    evidenceList: ['Invoice', 'Contract', 'Emails'],
    adrProposal: 'Mediation',
    statementOfTruth: 'I believe the facts stated are true.'
  });
  assert.ok(letter);
  assert.equal(typeof letter, 'string');
  assert.ok(letter.includes('Jane Doe'));
  assert.ok(letter.includes('Acme Corp'));
  assert.ok(letter.includes('123 High Street, London'));
  assert.ok(letter.includes('Unpaid invoice for services rendered.'));
  assert.ok(letter.includes('£5,000'));
  assert.ok(letter.includes('Invoice'));
  assert.ok(letter.includes('Contract'));
  assert.ok(letter.includes('Emails'));
  assert.ok(letter.includes('Mediation'));
  assert.ok(letter.includes('I believe the facts stated are true.'));
});

test('generateLetterOfClaim includes protocol name', () => {
  const letter = generateLetterOfClaim({
    claimantName: 'Claimant',
    defendantName: 'Defendant',
    defendantAddress: 'Address',
    protocolType: 'housing-disrepair',
    summaryOfFacts: 'Damp and mould throughout property.',
    lossAndDamage: '£10,000',
    evidenceList: ['Photos'],
    adrProposal: 'Negotiation',
    statementOfTruth: 'Truth'
  });
  assert.ok(letter.includes('Housing Disrepair Protocol'));
});

test('generateLetterOfClaim throws on missing required fields', () => {
  assert.throws(() => generateLetterOfClaim({}), /required/i);
});

test('getResponseDeadline returns 90 days for housing-disrepair', () => {
  const deadline = getResponseDeadline('housing-disrepair');
  assert.equal(deadline, 90);
});

test('getResponseDeadline returns 30 days for debt', () => {
  const deadline = getResponseDeadline('debt');
  assert.equal(deadline, 30);
});

test('getResponseDeadline returns 120 days for personal-injury', () => {
  const deadline = getResponseDeadline('personal-injury');
  assert.equal(deadline, 120);
});

test('getResponseDeadline returns 90 days for professional-negligence', () => {
  const deadline = getResponseDeadline('professional-negligence');
  assert.equal(deadline, 90);
});

test('getResponseDeadline returns null for unknown type', () => {
  assert.equal(getResponseDeadline('unknown'), null);
});

test('getComplianceChecklist returns array of items for housing-disrepair', () => {
  const checklist = getComplianceChecklist('housing-disrepair');
  assert.ok(Array.isArray(checklist));
  assert.ok(checklist.length > 0);
  assert.ok(checklist.some((item) => typeof item === 'string'));
});

test('getComplianceChecklist includes common items', () => {
  const checklist = getComplianceChecklist('debt');
  assert.ok(checklist.some((item) => item.toLowerCase().includes('protocol')));
  assert.ok(checklist.some((item) => item.toLowerCase().includes('deadline')));
});

test('getComplianceChecklist returns null for unknown type', () => {
  assert.equal(getComplianceChecklist('unknown'), null);
});

test('generateADROffer returns ADR proposal text', () => {
  const offer = generateADROffer({
    protocolType: 'debt',
    proposalType: 'Mediation',
    contactDetails: 'mediation@example.com'
  });
  assert.ok(offer);
  assert.equal(typeof offer, 'string');
  assert.ok(offer.includes('Mediation'));
  assert.ok(offer.includes('mediation@example.com'));
});

test('generateADROffer includes protocol reference', () => {
  const offer = generateADROffer({
    protocolType: 'personal-injury',
    proposalType: 'Negotiation',
    contactDetails: 'contact@example.com'
  });
  assert.ok(offer.includes('Personal Injury'));
});

test('generateADROffer throws on missing required field', () => {
  assert.throws(() => generateADROffer({ protocolType: 'debt' }), /proposalType/i);
});

test('serializeProtocols produces JSON string', () => {
  const protocols = [{ id: 'test', name: 'Test' }];
  const serialized = serializeProtocols(protocols);
  assert.equal(typeof serialized, 'string');
  const parsed = JSON.parse(serialized);
  assert.ok(Array.isArray(parsed));
  assert.equal(parsed.length, 1);
});

test('parseProtocols parses valid JSON', () => {
  const protocols = [{ id: 'test', name: 'Test' }];
  const json = JSON.stringify(protocols);
  const result = parseProtocols(json);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'test');
});

test('parseProtocols returns empty array for invalid JSON', () => {
  assert.deepEqual(parseProtocols('not-json'), []);
});

test('parseProtocols returns empty array for non-array JSON', () => {
  assert.deepEqual(parseProtocols('{"foo":"bar"}'), []);
});

test('parseProtocols returns empty array for empty string', () => {
  assert.deepEqual(parseProtocols(''), []);
});

test('serializeProtocols and parseProtocols roundtrip', () => {
  const p1 = { id: 'p1', name: 'Protocol 1' };
  const p2 = { id: 'p2', name: 'Protocol 2' };
  const roundtripped = parseProtocols(serializeProtocols([p1, p2]));
  assert.equal(roundtripped.length, 2);
  assert.equal(roundtripped[0].id, 'p1');
  assert.equal(roundtripped[1].id, 'p2');
});
