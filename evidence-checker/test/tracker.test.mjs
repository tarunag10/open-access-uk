import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRIBUNAL_OPTIONS,
  getTribunalFormats,
  getAcceptedFormats,
  getRedactionChecklist,
  getMetadataStrippingChecklist,
  validateFileForUpload,
  checkFileCompliance,
  generateEvidenceManifest,
  serializeEvidenceUpload,
  parseEvidenceUpload,
  formatBytes
} from '../src/tracker.js';

test('TRIBUNAL_OPTIONS includes all expected tribunal types', () => {
  const values = TRIBUNAL_OPTIONS.map((t) => t.value);
  for (const expected of ['SSCS', 'FTT', 'countyCourt', 'employment', 'housing']) {
    assert.ok(values.includes(expected), `missing tribunal type ${expected}`);
  }
});

test('getTribunalFormats returns correct data for SSCS', () => {
  const t = getTribunalFormats('SSCS');
  assert.equal(t.name, 'Social Security and Child Support Tribunal');
  assert.deepEqual(t.acceptedFormats, ['.pdf']);
  assert.equal(t.maxSizeMB, 10);
  assert.ok(t.source);
});

test('getTribunalFormats returns correct data for FTT', () => {
  const t = getTribunalFormats('FTT');
  assert.equal(t.name, 'First-tier Tribunal (Tax)');
  assert.deepEqual(t.acceptedFormats, ['.pdf', '.docx']);
  assert.equal(t.maxSizeMB, 25);
});

test('getTribunalFormats returns empty for unknown type', () => {
  const t = getTribunalFormats('unknown');
  assert.equal(t.name, '');
  assert.deepEqual(t.acceptedFormats, []);
  assert.equal(t.maxSizeMB, 0);
});

test('getAcceptedFormats returns array of formats', () => {
  const formats = getAcceptedFormats('SSCS');
  assert.ok(Array.isArray(formats));
  assert.ok(formats.length > 0);
  assert.ok(formats.includes('.pdf'));
});

test('getAcceptedFormats returns empty for unknown type', () => {
  const formats = getAcceptedFormats('unknown');
  assert.deepEqual(formats, []);
});

test('getRedactionChecklist returns all expected items', () => {
  const items = getRedactionChecklist();
  assert.ok(Array.isArray(items));
  assert.ok(items.includes('NI numbers'));
  assert.ok(items.includes('bank details'));
  assert.ok(items.includes('medical record numbers'));
  assert.ok(items.includes("children's names"));
});

test('getMetadataStrippingChecklist returns all expected items', () => {
  const items = getMetadataStrippingChecklist();
  assert.ok(Array.isArray(items));
  assert.ok(items.includes('GPS coordinates'));
  assert.ok(items.includes('device info'));
  assert.ok(items.includes('author names'));
});

test('validateFileForUpload passes valid PDF for SSCS', () => {
  const result = validateFileForUpload({ name: 'evidence.pdf', size: 5 * 1024 * 1024 }, 'SSCS');
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('validateFileForUpload fails wrong format for SSCS', () => {
  const result = validateFileForUpload({ name: 'evidence.docx', size: 5 * 1024 * 1024 }, 'SSCS');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.match(result.errors[0], /not accepted/);
});

test('validateFileForUpload fails file too large', () => {
  const result = validateFileForUpload({ name: 'evidence.pdf', size: 15 * 1024 * 1024 }, 'SSCS');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.match(result.errors[0], /exceeds/);
});

test('validateFileForUpload fails for unknown tribunal', () => {
  const result = validateFileForUpload({ name: 'evidence.pdf', size: 1024 }, 'unknown');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('checkFileCompliance passes valid file', () => {
  const result = checkFileCompliance({ name: 'evidence.pdf', size: 5 * 1024 * 1024 }, 'SSCS');
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.ok(Array.isArray(result.warnings));
});

test('checkFileCompliance warns when close to limit', () => {
  const result = checkFileCompliance({ name: 'evidence.pdf', size: 9.5 * 1024 * 1024 }, 'SSCS');
  assert.equal(result.valid, true);
  assert.ok(result.warnings.length > 0);
  assert.match(result.warnings[0], /close to/);
});

test('checkFileCompliance errors on wrong format', () => {
  const result = checkFileCompliance({ name: 'evidence.txt', size: 1024 }, 'SSCS');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('checkFileCompliance fails for unknown tribunal', () => {
  const result = checkFileCompliance({ name: 'evidence.pdf', size: 1024 }, 'unknown');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.ok(Array.isArray(result.warnings));
});

test('generateEvidenceManifest returns empty for empty input', () => {
  const manifest = generateEvidenceManifest([]);
  assert.deepEqual(manifest.items, []);
  assert.equal(manifest.totalSize, 0);
});

test('generateEvidenceManifest returns empty for non-array input', () => {
  const manifest = generateEvidenceManifest(null);
  assert.deepEqual(manifest.items, []);
  assert.equal(manifest.totalSize, 0);
});

test('generateEvidenceManifest processes files correctly', () => {
  const files = [
    { filename: 'doc1.pdf', description: 'First doc', category: 'medical', size: 1024 },
    { filename: 'doc2.pdf', description: 'Second doc', category: 'financial', size: 2048 }
  ];
  const manifest = generateEvidenceManifest(files);
  assert.equal(manifest.items.length, 2);
  assert.equal(manifest.totalSize, 3072);
  assert.equal(manifest.items[0].filename, 'doc1.pdf');
  assert.equal(manifest.items[1].filename, 'doc2.pdf');
});

test('serializeEvidenceUpload and parseEvidenceUpload round-trip', () => {
  const data = {
    tribunal: 'SSCS',
    files: [
      { filename: 'evidence.pdf', size: 5 * 1024 * 1024 }
    ]
  };
  const serialized = serializeEvidenceUpload(data);
  const parsed = parseEvidenceUpload(serialized);
  assert.equal(parsed.tribunal, 'SSCS');
  assert.equal(parsed.files.length, 1);
  assert.equal(parsed.files[0].filename, 'evidence.pdf');
});

test('parseEvidenceUpload handles empty and invalid input', () => {
  assert.deepEqual(parseEvidenceUpload(''), { files: [], tribunal: '' });
  assert.deepEqual(parseEvidenceUpload(null), { files: [], tribunal: '' });
  assert.deepEqual(parseEvidenceUpload(undefined), { files: [], tribunal: '' });
  assert.deepEqual(parseEvidenceUpload('not json'), { files: [], tribunal: '' });
});

test('formatBytes returns correct output', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '0.5 KB');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1024 * 1024), '1.0 MB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.5 MB');
});
