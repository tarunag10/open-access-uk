export const EVIDENCE_UPLOAD_KEY = 'open-access-uk:evidence-upload';

const TRIBUNAL_FORMATS = {
  SSCS: {
    name: 'Social Security and Child Support Tribunal',
    acceptedFormats: ['.pdf'],
    maxSizeMB: 10,
    source: 'hmcts-sscs-guidance'
  },
  FTT: {
    name: 'First-tier Tribunal (Tax)',
    acceptedFormats: ['.pdf', '.docx'],
    maxSizeMB: 25,
    source: 'hmcts-tribunal-guidance'
  },
  countyCourt: {
    name: 'County Court',
    acceptedFormats: ['.pdf'],
    maxSizeMB: 20,
    source: 'hmcts-county-court-guidance'
  },
  employment: {
    name: 'Employment Tribunal',
    acceptedFormats: ['.pdf', '.docx'],
    maxSizeMB: 25,
    source: 'et-practice-direction'
  },
  housing: {
    name: 'Housing Tribunal',
    acceptedFormats: ['.pdf'],
    maxSizeMB: 15,
    source: 'housing-tribunal-guidance'
  }
};

const REDACTION_CHECKLIST = [
  'NI numbers',
  'bank details',
  'medical record numbers',
  "children's names"
];

const METADATA_STRIPPING_CHECKLIST = ['GPS coordinates', 'device info', 'author names'];

export function getTribunalFormats(tribunalType) {
  const t = TRIBUNAL_FORMATS[tribunalType];
  if (!t) return { name: '', acceptedFormats: [], maxSizeMB: 0, source: '' };
  return { ...t };
}

export function getAcceptedFormats(tribunalType) {
  const t = TRIBUNAL_FORMATS[tribunalType];
  if (!t) return [];
  return [...t.acceptedFormats];
}

export function getRedactionChecklist() {
  return [...REDACTION_CHECKLIST];
}

export function getMetadataStrippingChecklist() {
  return [...METADATA_STRIPPING_CHECKLIST];
}

export function validateFileForUpload(fileData, tribunalType) {
  const tribunal = TRIBUNAL_FORMATS[tribunalType];
  if (!tribunal) return { valid: false, errors: ['Unknown tribunal type'] };

  const errors = [];
  const ext = fileData.name ? '.' + fileData.name.split('.').pop().toLowerCase() : '';

  if (!tribunal.acceptedFormats.includes(ext)) {
    errors.push(
      `File format ${ext || 'unknown'} not accepted. Accepted: ${tribunal.acceptedFormats.join(', ')}`
    );
  }

  const maxBytes = tribunal.maxSizeMB * 1024 * 1024;
  if (fileData.size > maxBytes) {
    errors.push(`File size exceeds ${tribunal.maxSizeMB}MB limit`);
  }

  return { valid: errors.length === 0, errors };
}

export function checkFileCompliance(fileData, tribunalType) {
  const tribunal = TRIBUNAL_FORMATS[tribunalType];
  if (!tribunal) return { valid: false, errors: ['Unknown tribunal type'], warnings: [] };

  const errors = [];
  const warnings = [];
  const ext = fileData.name ? '.' + fileData.name.split('.').pop().toLowerCase() : '';

  if (!tribunal.acceptedFormats.includes(ext)) {
    errors.push(
      `File format ${ext || 'unknown'} not accepted. Accepted: ${tribunal.acceptedFormats.join(', ')}`
    );
  }

  const maxBytes = tribunal.maxSizeMB * 1024 * 1024;
  if (fileData.size > maxBytes) {
    errors.push(`File size exceeds ${tribunal.maxSizeMB}MB limit`);
  }

  if (fileData.size > maxBytes * 0.9) {
    warnings.push(`File is close to ${tribunal.maxSizeMB}MB limit`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function generateEvidenceManifest(evidenceItems) {
  if (!Array.isArray(evidenceItems) || evidenceItems.length === 0) {
    return { items: [], totalSize: 0 };
  }

  const items = evidenceItems.map((item) => ({
    filename: item.filename || '',
    description: item.description || '',
    category: item.category || '',
    size: item.size || 0
  }));

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return { items, totalSize };
}

export function serializeEvidenceUpload(value) {
  return JSON.stringify(value);
}

export function parseEvidenceUpload(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return {
      files: Array.isArray(parsed.files) ? parsed.files : [],
      tribunal: parsed.tribunal || ''
    };
  } catch {
    return { files: [], tribunal: '' };
  }
}
