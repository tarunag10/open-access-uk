import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTribunalFormats,
  validateFileForUpload,
  getRedactionChecklist,
  getMetadataStrippingChecklist,
  generateEvidenceManifest,
  getAcceptedFormats,
  checkFileCompliance,
  serializeEvidenceUpload,
  parseEvidenceUpload
} from './index.mjs';

describe('getTribunalFormats', () => {
  it('returns SSCS formats', () => {
    const result = getTribunalFormats('SSCS');
    assert.equal(result.acceptedFormats.includes('.pdf'), true);
    assert.equal(result.maxSizeMB, 10);
    assert.equal(result.name, 'Social Security and Child Support Tribunal');
  });

  it('returns FTT formats', () => {
    const result = getTribunalFormats('FTT');
    assert.equal(result.acceptedFormats.includes('.pdf'), true);
    assert.equal(result.acceptedFormats.includes('.docx'), true);
    assert.equal(result.maxSizeMB, 25);
  });

  it('returns County Court formats', () => {
    const result = getTribunalFormats('countyCourt');
    assert.equal(result.acceptedFormats.includes('.pdf'), true);
    assert.equal(result.maxSizeMB, 20);
  });

  it('returns unknown tribunal with empty defaults', () => {
    const result = getTribunalFormats('unknown');
    assert.deepEqual(result.acceptedFormats, []);
    assert.equal(result.maxSizeMB, 0);
  });
});

describe('validateFileForUpload', () => {
  it('validates a compliant SSCS PDF file', () => {
    const fileData = { name: 'evidence.pdf', size: 5 * 1024 * 1024, type: 'application/pdf' };
    const result = validateFileForUpload(fileData, 'SSCS');
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('rejects file exceeding SSCS max size', () => {
    const fileData = { name: 'evidence.pdf', size: 15 * 1024 * 1024, type: 'application/pdf' };
    const result = validateFileForUpload(fileData, 'SSCS');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('10MB')));
  });

  it('rejects unsupported format', () => {
    const fileData = {
      name: 'evidence.xlsx',
      size: 1 * 1024 * 1024,
      type: 'application/vnd.ms-excel'
    };
    const result = validateFileForUpload(fileData, 'SSCS');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('format') || e.includes('.pdf')));
  });

  it('allows DOCX for FTT', () => {
    const fileData = {
      name: 'evidence.docx',
      size: 1 * 1024 * 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    const result = validateFileForUpload(fileData, 'FTT');
    assert.equal(result.valid, true);
  });
});

describe('getRedactionChecklist', () => {
  it('returns required redaction items', () => {
    const checklist = getRedactionChecklist();
    assert.ok(Array.isArray(checklist));
    assert.ok(checklist.includes('NI numbers'));
    assert.ok(checklist.includes('bank details'));
    assert.ok(checklist.includes('medical record numbers'));
    assert.ok(checklist.includes("children's names"));
  });

  it('returns at least 4 items', () => {
    assert.ok(getRedactionChecklist().length >= 4);
  });
});

describe('getMetadataStrippingChecklist', () => {
  it('returns required metadata items', () => {
    const checklist = getMetadataStrippingChecklist();
    assert.ok(Array.isArray(checklist));
    assert.ok(checklist.includes('GPS coordinates'));
    assert.ok(checklist.includes('device info'));
    assert.ok(checklist.includes('author names'));
  });

  it('returns at least 3 items', () => {
    assert.ok(getMetadataStrippingChecklist().length >= 3);
  });
});

describe('generateEvidenceManifest', () => {
  it('generates manifest from evidence items', () => {
    const items = [
      { filename: 'doc1.pdf', description: 'Medical report', category: 'medical', size: 1024 },
      { filename: 'doc2.pdf', description: 'Benefits letter', category: 'benefits', size: 2048 }
    ];
    const manifest = generateEvidenceManifest(items);
    assert.equal(manifest.items.length, 2);
    assert.equal(manifest.items[0].filename, 'doc1.pdf');
    assert.equal(manifest.totalSize, 3072);
  });

  it('returns empty manifest for empty input', () => {
    const manifest = generateEvidenceManifest([]);
    assert.deepEqual(manifest.items, []);
    assert.equal(manifest.totalSize, 0);
  });
});

describe('getAcceptedFormats', () => {
  it('returns PDF array for SSCS', () => {
    const formats = getAcceptedFormats('SSCS');
    assert.deepEqual(formats, ['.pdf']);
  });

  it('returns PDF and DOCX for FTT', () => {
    const formats = getAcceptedFormats('FTT');
    assert.deepEqual(formats, ['.pdf', '.docx']);
  });
});

describe('checkFileCompliance', () => {
  it('returns valid for compliant file', () => {
    const fileData = { name: 'doc.pdf', size: 5 * 1024 * 1024 };
    const result = checkFileCompliance(fileData, 'SSCS');
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('returns errors and warnings', () => {
    const fileData = { name: 'doc.pdf', size: 12 * 1024 * 1024 };
    const result = checkFileCompliance(fileData, 'SSCS');
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});

describe('serializeEvidenceUpload / parseEvidenceUpload', () => {
  it('roundtrips a value through localStorage serialization', () => {
    const value = { files: ['a.pdf'], tribunal: 'SSCS' };
    const serialized = serializeEvidenceUpload(value);
    const parsed = parseEvidenceUpload(serialized);
    assert.deepEqual(parsed, value);
  });

  it('returns default on invalid JSON', () => {
    const parsed = parseEvidenceUpload('not-json');
    assert.deepEqual(parsed, { files: [], tribunal: '' });
  });

  it('returns default on empty input', () => {
    const parsed = parseEvidenceUpload('');
    assert.deepEqual(parsed, { files: [], tribunal: '' });
  });
});
