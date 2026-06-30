// ===== src/app.js =====
// Evidence Upload Readiness Checker — bundled app (all shared modules inlined)

// ===== ../shared/theme/index.mjs =====
const THEME_STORAGE_KEY = 'open-access-uk:theme';
const VALID_THEMES = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID_THEMES.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

// ===== ../shared/evidence-upload/index.mjs =====
const EVIDENCE_UPLOAD_KEY = 'open-access-uk:evidence-upload';

const TRIBUNAL_FORMATS = {
  SSCS: { name: 'Social Security and Child Support Tribunal', acceptedFormats: ['.pdf'], maxSizeMB: 10, source: 'hmcts-sscs-guidance' },
  FTT: { name: 'First-tier Tribunal (Tax)', acceptedFormats: ['.pdf', '.docx'], maxSizeMB: 25, source: 'hmcts-tribunal-guidance' },
  countyCourt: { name: 'County Court', acceptedFormats: ['.pdf'], maxSizeMB: 20, source: 'hmcts-county-court-guidance' },
  employment: { name: 'Employment Tribunal', acceptedFormats: ['.pdf', '.docx'], maxSizeMB: 25, source: 'et-practice-direction' },
  housing: { name: 'Housing Tribunal', acceptedFormats: ['.pdf'], maxSizeMB: 15, source: 'housing-tribunal-guidance' }
};

const REDACTION_CHECKLIST = [
  'NI numbers',
  'bank details',
  'medical record numbers',
  "children's names"
];

const METADATA_STRIPPING_CHECKLIST = [
  'GPS coordinates',
  'device info',
  'author names'
];

function getTribunalFormats(tribunalType) {
  const t = TRIBUNAL_FORMATS[tribunalType];
  if (!t) return { name: '', acceptedFormats: [], maxSizeMB: 0, source: '' };
  return { ...t };
}

function getAcceptedFormats(tribunalType) {
  const t = TRIBUNAL_FORMATS[tribunalType];
  if (!t) return [];
  return [...t.acceptedFormats];
}

function getRedactionChecklist() {
  return [...REDACTION_CHECKLIST];
}

function getMetadataStrippingChecklist() {
  return [...METADATA_STRIPPING_CHECKLIST];
}

function validateFileForUpload(fileData, tribunalType) {
  const tribunal = TRIBUNAL_FORMATS[tribunalType];
  if (!tribunal) return { valid: false, errors: ['Unknown tribunal type'] };

  const errors = [];
  const ext = fileData.name ? '.' + fileData.name.split('.').pop().toLowerCase() : '';

  if (!tribunal.acceptedFormats.includes(ext)) {
    errors.push(`File format ${ext || 'unknown'} not accepted. Accepted: ${tribunal.acceptedFormats.join(', ')}`);
  }

  const maxBytes = tribunal.maxSizeMB * 1024 * 1024;
  if (fileData.size > maxBytes) {
    errors.push(`File size exceeds ${tribunal.maxSizeMB}MB limit`);
  }

  return { valid: errors.length === 0, errors };
}

function checkFileCompliance(fileData, tribunalType) {
  const tribunal = TRIBUNAL_FORMATS[tribunalType];
  if (!tribunal) return { valid: false, errors: ['Unknown tribunal type'], warnings: [] };

  const errors = [];
  const warnings = [];
  const ext = fileData.name ? '.' + fileData.name.split('.').pop().toLowerCase() : '';

  if (!tribunal.acceptedFormats.includes(ext)) {
    errors.push(`File format ${ext || 'unknown'} not accepted. Accepted: ${tribunal.acceptedFormats.join(', ')}`);
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

function generateEvidenceManifest(evidenceItems) {
  if (!Array.isArray(evidenceItems) || evidenceItems.length === 0) {
    return { items: [], totalSize: 0 };
  }

  const items = evidenceItems.map(item => ({
    filename: item.filename || '',
    description: item.description || '',
    category: item.category || '',
    size: item.size || 0
  }));

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return { items, totalSize };
}

function serializeEvidenceUpload(value) {
  return JSON.stringify(value);
}

function parseEvidenceUpload(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return { files: Array.isArray(parsed.files) ? parsed.files : [], tribunal: parsed.tribunal || '' };
  } catch {
    return { files: [], tribunal: '' };
  }
}

// ===== src/tracker.js (inlined) =====
const TRIBUNAL_OPTIONS = [
  { value: 'SSCS', label: 'Social Security and Child Support Tribunal' },
  { value: 'FTT', label: 'First-tier Tribunal (Tax)' },
  { value: 'countyCourt', label: 'County Court' },
  { value: 'employment', label: 'Employment Tribunal' },
  { value: 'housing', label: 'Housing Tribunal' }
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderComplianceResult(result, tribunalType) {
  const tribunal = getTribunalFormats(tribunalType);
  let html = '<div class="compliance-result">';

  const statusCls = result.valid ? 'result-valid' : 'result-invalid';
  const statusLabel = result.valid ? 'Pass' : 'Fail';
  html += `<div class="${statusCls}"><strong>Status:</strong> ${statusLabel}</div>`;

  if (result.errors && result.errors.length > 0) {
    html += '<div class="error-list">';
    html += '<strong>Errors:</strong><ul>';
    for (const err of result.errors) {
      html += `<li>${escapeHtml(err)}</li>`;
    }
    html += '</ul></div>';
  }

  if (result.warnings && result.warnings.length > 0) {
    html += '<div class="warning-list">';
    html += '<strong>Warnings:</strong><ul>';
    for (const warn of result.warnings) {
      html += `<li>${escapeHtml(warn)}</li>`;
    }
    html += '</ul></div>';
  }

  if (result.valid) {
    html += '<p class="result-note">File meets tribunal upload requirements.</p>';
  }

  html += '</div>';
  return html;
}

function renderRedactionChecklist() {
  const items = getRedactionChecklist();
  let html = '<ul class="checklist">';
  for (const item of items) {
    html += `<li><label><input type="checkbox" class="redaction-check" /> ${escapeHtml(item)}</label></li>`;
  }
  html += '</ul>';
  return html;
}

function renderMetadataChecklist() {
  const items = getMetadataStrippingChecklist();
  let html = '<ul class="checklist">';
  for (const item of items) {
    html += `<li><label><input type="checkbox" class="metadata-check" /> ${escapeHtml(item)}</label></li>`;
  }
  html += '</ul>';
  return html;
}

function renderEvidenceManifest(files) {
  if (files.length === 0) {
    return '<p class="empty-state">No evidence files checked yet.</p>';
  }
  const manifest = generateEvidenceManifest(files);
  let html = '<table class="manifest-table"><thead><tr><th>Filename</th><th>Description</th><th>Size</th></tr></thead><tbody>';
  for (const item of manifest.items) {
    html += `<tr><td>${escapeHtml(item.filename)}</td><td>${escapeHtml(item.description || '-')}</td><td>${formatBytes(item.size)}</td></tr>`;
  }
  html += '</tbody></table>';
  html += `<p class="manifest-total"><strong>Total size:</strong> ${formatBytes(manifest.totalSize)}</p>`;
  return html;
}

function renderTribunalGuidance(tribunalType) {
  const tribunal = getTribunalFormats(tribunalType);
  if (!tribunal.name) return '<p>Select a tribunal type to see specific requirements.</p>';
  let html = `<h3>${escapeHtml(tribunal.name)}</h3>`;
  html += `<p><strong>Accepted formats:</strong> ${tribunal.acceptedFormats.join(', ')}</p>`;
  html += `<p><strong>Max file size:</strong> ${tribunal.maxSizeMB}MB</p>`;
  html += `<p><strong>Source:</strong> ${escapeHtml(tribunal.source)}</p>`;
  return html;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return mb.toFixed(1) + ' MB';
  const kb = bytes / 1024;
  return kb.toFixed(1) + ' KB';
}

// ===== Theme init =====
function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let stored;
  try { stored = window.localStorage.getItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
  let theme = resolveInitialTheme({ stored, prefersDark });
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }

  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* ignore */ }
  });
}

// ===== App logic =====
const STORAGE_KEY = 'open-access-uk:evidence-checker:checks';

const form = document.querySelector('#check-form');
const statusEl = document.querySelector('#form-status');
const resultPanel = document.querySelector('#result-panel');
const resultContent = document.querySelector('#result-content');
const checklistPanel = document.querySelector('#checklist-panel');
const checklistContent = document.querySelector('#checklist-content');
const manifestPanel = document.querySelector('#manifest-panel');
const manifestContent = document.querySelector('#manifest-content');
const guidancePanel = document.querySelector('#guidance-panel');
const guidanceContent = document.querySelector('#guidance-content');

function loadAll() {
  try {
    return parseEvidenceUpload(localStorage.getItem(STORAGE_KEY));
  } catch {
    return { files: [], tribunal: '' };
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, serializeEvidenceUpload(data));
  } catch { /* ignore */ }
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderChecklist() {
  checklistContent.innerHTML = renderRedactionChecklist() + renderMetadataChecklist();
}

function renderGuidance(tribunalType) {
  guidanceContent.innerHTML = renderTribunalGuidance(tribunalType);
}

function renderManifest(files) {
  manifestContent.innerHTML = renderEvidenceManifest(files);
}

function handleCheck(event) {
  event.preventDefault();
  const data = values();

  if (!data.fileName?.trim()) {
    statusEl.textContent = 'Enter a file name before checking.';
    return;
  }

  const fileData = {
    name: data.fileName.trim(),
    size: parseFloat(data.fileSize) * 1024 * 1024 || 0
  };

  const result = checkFileCompliance(fileData, data.tribunalType);

  resultContent.innerHTML = renderComplianceResult(result, data.tribunalType);
  resultPanel.hidden = false;

  renderGuidance(data.tribunalType);

  const stored = loadAll();
  const newFile = {
    filename: fileData.name,
    description: '',
    category: '',
    size: fileData.size,
    tribunal: data.tribunalType,
    result: result,
    checkedAt: new Date().toISOString()
  };
  stored.files.push(newFile);
  stored.tribunal = data.tribunalType;
  saveAll(stored);

  renderManifest(stored.files);

  if (result.valid) {
    statusEl.textContent = 'File passes compliance check.';
  } else {
    statusEl.textContent = 'File has compliance issues. See result panel.';
  }
}

function handleLoadSample() {
  const sampleFiles = [
    { filename: 'medical-evidence.pdf', description: 'GP letter', category: 'medical', size: 2.5 * 1024 * 1024, tribunal: 'SSCS' },
    { filename: 'witness-statement.docx', description: 'Witness statement', category: 'statement', size: 1.2 * 1024 * 1024, tribunal: 'FTT' },
    { filename: 'bank-statements.pdf', description: '3 months bank statements', category: 'financial', size: 5.8 * 1024 * 1024, tribunal: 'SSCS' }
  ];

  const stored = loadAll();
  for (const f of sampleFiles) {
    const result = checkFileCompliance({ name: f.filename, size: f.size }, f.tribunal);
    stored.files.push({ ...f, result, checkedAt: new Date().toISOString() });
  }
  stored.tribunal = stored.tribunal || 'SSCS';
  saveAll(stored);

  if (!form.elements.tribunalType.value) form.elements.tribunalType.value = 'SSCS';
  renderGuidance(form.elements.tribunalType.value);
  renderManifest(stored.files);
  statusEl.textContent = 'Loaded sample evidence files.';
}

function handleClearAll() {
  const stored = loadAll();
  if (stored.files.length === 0) {
    statusEl.textContent = 'No evidence records to clear.';
    return;
  }
  if (!confirm(`Delete all ${stored.files.length} checked file(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  resultPanel.hidden = true;
  resultContent.innerHTML = '';
  manifestContent.innerHTML = '<p class="empty-state">No evidence files checked yet.</p>';
  statusEl.textContent = 'All evidence records cleared from this browser.';
}

function handleExport() {
  const stored = loadAll();
  if (stored.files.length === 0) {
    statusEl.textContent = 'No evidence records to export.';
    return;
  }
  const blob = new Blob([serializeEvidenceUpload(stored)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'evidence-checker-records.json';
  link.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = 'Exported evidence records. Nothing was sent to a server.';
}

// ===== Initialise =====
form.addEventListener('submit', handleCheck);

const clearAllBtn = document.querySelector('#clearAll');
const exportBtn = document.querySelector('#exportJson');
const loadSampleBtn = document.querySelector('#loadSample');

clearAllBtn?.addEventListener('click', handleClearAll);
exportBtn?.addEventListener('click', handleExport);
loadSampleBtn?.addEventListener('click', handleLoadSample);

const tribunalSelect = form.elements.tribunalType;
tribunalSelect?.addEventListener('change', () => {
  renderGuidance(tribunalSelect.value);
});

renderChecklist();
renderGuidance(tribunalSelect?.value || 'SSCS');

const stored = loadAll();
renderManifest(stored.files);

initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
