import {
  getTribunalFormats,
  getAcceptedFormats,
  getRedactionChecklist,
  getMetadataStrippingChecklist,
  validateFileForUpload,
  checkFileCompliance,
  generateEvidenceManifest,
  serializeEvidenceUpload,
  parseEvidenceUpload
} from '../../shared/evidence-upload/index.mjs';

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
  html += `</tbody></table>`;
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

export {
  TRIBUNAL_OPTIONS,
  escapeHtml,
  renderComplianceResult,
  renderRedactionChecklist,
  renderMetadataChecklist,
  renderEvidenceManifest,
  renderTribunalGuidance,
  formatBytes,
  getTribunalFormats,
  getAcceptedFormats,
  getRedactionChecklist,
  getMetadataStrippingChecklist,
  validateFileForUpload,
  checkFileCompliance,
  generateEvidenceManifest,
  serializeEvidenceUpload,
  parseEvidenceUpload
};
