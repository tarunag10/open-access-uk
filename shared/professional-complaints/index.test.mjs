import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRegulators,
  getRegulatorDetails,
  generateComplaintText,
  getComplaintDeadlines,
  getFitnessToPractiseProcess,
  getComplaintCategories,
  serializeProfessionalComplaints,
  parseProfessionalComplaints
} from './index.mjs';

describe('getRegulators', () => {
  it('returns all 8 regulators', () => {
    const regulators = getRegulators();
    assert.equal(regulators.length, 8);
  });

  it('includes GMC for doctors', () => {
    const regulators = getRegulators();
    const gmc = regulators.find((r) => r.id === 'GMC');
    assert.ok(gmc);
    assert.equal(gmc.profession, 'Doctors');
  });

  it('includes SRA for solicitors', () => {
    const regulators = getRegulators();
    const sra = regulators.find((r) => r.id === 'SRA');
    assert.ok(sra);
    assert.equal(sra.profession, 'Solicitors');
  });

  it('includes LeO for legal ombudsman', () => {
    const regulators = getRegulators();
    const leo = regulators.find((r) => r.id === 'LeO');
    assert.ok(leo);
    assert.equal(leo.profession, 'Legal Services');
  });

  it('includes ACCA for accountants', () => {
    const regulators = getRegulators();
    const acca = regulators.find((r) => r.id === 'ACCA');
    assert.ok(acca);
    assert.equal(acca.profession, 'Accountants');
  });

  it('includes RICS for surveyors', () => {
    const regulators = getRegulators();
    const rics = regulators.find((r) => r.id === 'RICS');
    assert.ok(rics);
    assert.equal(rics.profession, 'Surveyors');
  });

  it('includes NMC for nurses', () => {
    const regulators = getRegulators();
    const nmc = regulators.find((r) => r.id === 'NMC');
    assert.ok(nmc);
    assert.equal(nmc.profession, 'Nurses and Midwives');
  });

  it('includes GPhC for pharmacists', () => {
    const regulators = getRegulators();
    const gphc = regulators.find((r) => r.id === 'GPhC');
    assert.ok(gphc);
    assert.equal(gphc.profession, 'Pharmacists');
  });

  it('includes BPS for psychologists', () => {
    const regulators = getRegulators();
    const bps = regulators.find((r) => r.id === 'BPS');
    assert.ok(bps);
    assert.equal(bps.profession, 'Psychologists');
  });

  it('returns a copy, not the original array', () => {
    const a = getRegulators();
    const b = getRegulators();
    assert.notEqual(a, b);
  });
});

describe('getRegulatorDetails', () => {
  it('returns full details for GMC', () => {
    const details = getRegulatorDetails('GMC');
    assert.equal(details.id, 'GMC');
    assert.equal(details.name, 'General Medical Council');
    assert.equal(details.profession, 'Doctors');
    assert.equal(details.source, 'gmc-complaints');
    assert.equal(details.website, 'https://www.gmc-uk.org');
    assert.equal(details.fitnessToPractise, true);
    assert.equal(details.deadlineNote, 'No statutory time limit but prompt action recommended');
  });

  it('returns full details for SRA', () => {
    const details = getRegulatorDetails('SRA');
    assert.equal(details.id, 'SRA');
    assert.equal(details.name, 'Solicitors Regulation Authority');
    assert.equal(details.profession, 'Solicitors');
    assert.equal(details.source, 'sra-complaints');
    assert.equal(details.website, 'https://www.sra.org.uk');
    assert.equal(details.fitnessToPractise, true);
    assert.equal(details.deadlineNote, 'Within 6 years of the issue');
  });

  it('returns full details for LeO', () => {
    const details = getRegulatorDetails('LeO');
    assert.equal(details.id, 'LeO');
    assert.equal(details.name, 'Legal Ombudsman');
    assert.equal(details.profession, 'Legal Services');
    assert.equal(details.fitnessToPractise, false);
  });

  it('returns full details for ACCA', () => {
    const details = getRegulatorDetails('ACCA');
    assert.equal(details.id, 'ACCA');
    assert.equal(details.profession, 'Accountants');
    assert.equal(details.deadlineNote, 'Within 5 years');
  });

  it('returns full details for RICS', () => {
    const details = getRegulatorDetails('RICS');
    assert.equal(details.id, 'RICS');
    assert.equal(details.profession, 'Surveyors');
    assert.equal(details.deadlineNote, 'Within 6 years');
  });

  it('returns full details for NMC', () => {
    const details = getRegulatorDetails('NMC');
    assert.equal(details.id, 'NMC');
    assert.equal(details.profession, 'Nurses and Midwives');
    assert.equal(details.deadlineNote, 'No statutory time limit');
  });

  it('returns full details for GPhC', () => {
    const details = getRegulatorDetails('GPhC');
    assert.equal(details.id, 'GPhC');
    assert.equal(details.profession, 'Pharmacists');
    assert.equal(details.deadlineNote, 'No statutory time limit');
  });

  it('returns full details for BPS', () => {
    const details = getRegulatorDetails('BPS');
    assert.equal(details.id, 'BPS');
    assert.equal(details.profession, 'Psychologists');
    assert.equal(details.deadlineNote, 'Within 5 years');
  });

  it('returns null for unknown regulator', () => {
    const details = getRegulatorDetails('UNKNOWN');
    assert.equal(details, null);
  });
});

describe('generateComplaintText', () => {
  it('generates a complaint letter with all fields', () => {
    const data = {
      complainantName: 'Jane Smith',
      professionalName: 'Dr John Doe',
      professionalAddress: '123 Medical St, London, SW1A 1AA',
      regulator: 'GMC',
      complaintType: 'Clinical Negligence',
      descriptionOfConcern: 'Misdiagnosis leading to delayed treatment',
      desiredOutcome: 'Investigation and apology'
    };
    const text = generateComplaintText(data);
    assert.ok(text.includes('Jane Smith'));
    assert.ok(text.includes('Dr John Doe'));
    assert.ok(text.includes('123 Medical St, London, SW1A 1AA'));
    assert.ok(text.includes('General Medical Council'));
    assert.ok(text.includes('Clinical Negligence'));
    assert.ok(text.includes('Misdiagnosis leading to delayed treatment'));
    assert.ok(text.includes('Investigation and apology'));
  });

  it('includes date in output', () => {
    const data = {
      complainantName: 'Test User',
      professionalName: 'Test Professional',
      professionalAddress: 'Test Address',
      regulator: 'SRA',
      complaintType: 'Misconduct',
      descriptionOfConcern: 'Test concern',
      desiredOutcome: 'Test outcome'
    };
    const text = generateComplaintText(data);
    const year = new Date().getFullYear().toString();
    assert.ok(text.includes(year));
  });

  it('throws when required fields are missing', () => {
    assert.throws(() => generateComplaintText({}), /complainantName is required/);
    assert.throws(
      () => generateComplaintText({ complainantName: 'X' }),
      /professionalName is required/
    );
  });

  it('uses "Not specified" for unknown regulator', () => {
    const data = {
      complainantName: 'Test',
      professionalName: 'Test',
      professionalAddress: 'Test',
      regulator: 'UNKNOWN',
      complaintType: 'Test',
      descriptionOfConcern: 'Test',
      desiredOutcome: 'Test'
    };
    const text = generateComplaintText(data);
    assert.ok(text.includes('Not specified'));
  });
});

describe('getComplaintDeadlines', () => {
  it('returns deadline info for GMC', () => {
    const deadlines = getComplaintDeadlines('GMC');
    assert.ok(deadlines);
    assert.equal(deadlines.regulatorId, 'GMC');
    assert.equal(deadlines.note, 'No statutory time limit but prompt action recommended');
  });

  it('returns deadline info for SRA', () => {
    const deadlines = getComplaintDeadlines('SRA');
    assert.equal(deadlines.note, 'Within 6 years of the issue');
  });

  it('returns deadline info for LeO', () => {
    const deadlines = getComplaintDeadlines('LeO');
    assert.equal(deadlines.note, 'Within 6 months of final response from service provider');
  });

  it('returns deadline info for ACCA', () => {
    const deadlines = getComplaintDeadlines('ACCA');
    assert.equal(deadlines.note, 'Within 5 years');
  });

  it('returns deadline info for RICS', () => {
    const deadlines = getComplaintDeadlines('RICS');
    assert.equal(deadlines.note, 'Within 6 years');
  });

  it('returns deadline info for NMC', () => {
    const deadlines = getComplaintDeadlines('NMC');
    assert.equal(deadlines.note, 'No statutory time limit');
  });

  it('returns deadline info for GPhC', () => {
    const deadlines = getComplaintDeadlines('GPhC');
    assert.equal(deadlines.note, 'No statutory time limit');
  });

  it('returns deadline info for BPS', () => {
    const deadlines = getComplaintDeadlines('BPS');
    assert.equal(deadlines.note, 'Within 5 years');
  });

  it('returns null for unknown regulator', () => {
    const deadlines = getComplaintDeadlines('UNKNOWN');
    assert.equal(deadlines, null);
  });
});

describe('getFitnessToPractiseProcess', () => {
  it('returns process steps for GMC', () => {
    const process = getFitnessToPractiseProcess('GMC');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
    assert.ok(process.every((s) => s.name && s.description));
  });

  it('returns process steps for SRA', () => {
    const process = getFitnessToPractiseProcess('SRA');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns process steps for NMC', () => {
    const process = getFitnessToPractiseProcess('NMC');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns process steps for GPhC', () => {
    const process = getFitnessToPractiseProcess('GPhC');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns process steps for BPS', () => {
    const process = getFitnessToPractiseProcess('BPS');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns process steps for ACCA', () => {
    const process = getFitnessToPractiseProcess('ACCA');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns process steps for RICS', () => {
    const process = getFitnessToPractiseProcess('RICS');
    assert.ok(Array.isArray(process));
    assert.ok(process.length > 0);
  });

  it('returns empty array for LeO (no fitness to practise)', () => {
    const process = getFitnessToPractiseProcess('LeO');
    assert.ok(Array.isArray(process));
    assert.equal(process.length, 0);
  });

  it('returns empty array for unknown regulator', () => {
    const process = getFitnessToPractiseProcess('UNKNOWN');
    assert.ok(Array.isArray(process));
    assert.equal(process.length, 0);
  });
});

describe('getComplaintCategories', () => {
  it('returns categories for GMC', () => {
    const categories = getComplaintCategories('GMC');
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for SRA', () => {
    const categories = getComplaintCategories('SRA');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for NMC', () => {
    const categories = getComplaintCategories('NMC');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for GPhC', () => {
    const categories = getComplaintCategories('GPhC');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for BPS', () => {
    const categories = getComplaintCategories('BPS');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for ACCA', () => {
    const categories = getComplaintCategories('ACCA');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for RICS', () => {
    const categories = getComplaintCategories('RICS');
    assert.ok(categories.includes('conduct'));
    assert.ok(categories.includes('performance'));
    assert.ok(categories.includes('health'));
    assert.ok(categories.includes('dishonesty'));
  });

  it('returns categories for LeO', () => {
    const categories = getComplaintCategories('LeO');
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
  });

  it('returns empty array for unknown regulator', () => {
    const categories = getComplaintCategories('UNKNOWN');
    assert.ok(Array.isArray(categories));
    assert.equal(categories.length, 0);
  });
});

describe('serializeProfessionalComplaints / parseProfessionalComplaints', () => {
  it('round-trips an array of complaints', () => {
    const complaints = [
      { id: 'pc-1', regulator: 'GMC', status: 'open' },
      { id: 'pc-2', regulator: 'SRA', status: 'closed' }
    ];
    const serialized = serializeProfessionalComplaints(complaints);
    const parsed = parseProfessionalComplaints(serialized);
    assert.deepEqual(parsed, complaints);
  });

  it('returns empty array for null input', () => {
    assert.deepEqual(parseProfessionalComplaints(null), []);
  });

  it('returns empty array for non-string input', () => {
    assert.deepEqual(parseProfessionalComplaints(123), []);
  });

  it('returns empty array for invalid JSON', () => {
    assert.deepEqual(parseProfessionalComplaints('not-json'), []);
  });

  it('returns empty array for non-array JSON', () => {
    assert.deepEqual(parseProfessionalComplaints('{"a":1}'), []);
  });
});
