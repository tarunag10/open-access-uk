import {
  buildAggregatorPack,
  composeFromPacks,
  examplePacks,
  safeCaseFilename
} from './aggregator.js';

const form = document.querySelector('form');
const examplesMount = document.querySelector('#examples');
const customTextarea = document.querySelector('#custom-packs');
const composeBtn = document.querySelector('#compose');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const copyBtn = document.querySelector('#copyPack');
const downloadBtn = document.querySelector('#downloadPack');
const printBtn = document.querySelector('#printPack');
const resetBtn = document.querySelector('#reset');
const currentGuidanceMount = document.querySelector('#current-guidance');

function renderExamples() {
  examplesMount.innerHTML = examplePacks.map(pack => `
    <label class="checkbox-row">
      <input type="checkbox" name="example" value="${pack.id}" />
      <span>${pack.title} <small>(${pack.source})</small></span>
    </label>
  `).join('');
}

function getSelectedExamples() {
  return [...form.querySelectorAll('input[name="example"]:checked')].map(cb => cb.value);
}

function getCustomPacks() {
  const raw = (customTextarea.value || '').trim();
  if (!raw) return [];
  // Support simple format: --- title --- \n content \n --- 
  const parts = raw.split(/^\s*---\s*(.+?)\s*---\s*$/m).filter(Boolean);
  const packs = [];
  for (let i = 0; i < parts.length; i += 2) {
    const title = parts[i] ? parts[i].trim() : 'Pasted pack';
    const content = parts[i + 1] ? parts[i + 1].trim() : '';
    if (content) packs.push({ title, content });
  }
  if (packs.length === 0 && raw.length > 20) {
    packs.push({ title: 'Pasted pack', content: raw });
  }
  return packs;
}

function update() {
  const selected = getSelectedExamples();
  const customs = getCustomPacks();
  const pack = buildAggregatorPack(selected, customs, {});
  preview.textContent = pack.markdown;
}

function copyPack() {
  navigator.clipboard?.writeText(preview.textContent).then(() => {
    status.textContent = 'Case file copied locally. Nothing was sent to a server.';
  }).catch(() => {
    status.textContent = 'Copy failed. Select the preview and copy manually.';
  });
}

function downloadPack() {
  const metadata = { filename: safeCaseFilename('combined-case'), mimeType: 'text/markdown;charset=utf-8' };
  const blob = new Blob([preview.textContent], { type: metadata.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = metadata.filename;
  a.click();
  URL.revokeObjectURL(url);
  status.textContent = `Downloaded ${metadata.filename}. Nothing was sent to a server.`;
}

function printPack() {
  window.print();
  status.textContent = 'Opened print dialog. Nothing was sent to a server.';
}

function resetAll() {
  form.reset();
  customTextarea.value = '';
  preview.textContent = '';
  status.textContent = 'Reset. All local to this browser.';
}

function renderCurrentGuidance() {
  if (!currentGuidanceMount) return;
  const guidance = [
    {
      title: 'Local case composition',
      detail: 'Combine only packs you control. Remove sensitive personal, medical, or financial details before sharing any output.',
      source: 'Open Access UK case aggregator',
      url: '#'
    },
    {
      title: 'Source provenance',
      detail: 'Every combined file should retain the original Current source notes from the source tools.',
      source: 'Open Access UK data provenance',
      url: 'https://github.com/tarunag10/open-access-uk'
    }
  ];
  currentGuidanceMount.innerHTML = guidance.map(item => `
    <article class="card">
      <h3>${item.title}</h3>
      <p>${item.detail}</p>
      <a href="${item.url}" rel="noreferrer">${item.source}</a>
    </article>
  `).join('');
}

renderExamples();
renderCurrentGuidance();

form.addEventListener('input', update);
form.addEventListener('change', update);
composeBtn.addEventListener('click', (e) => { e.preventDefault(); update(); });
copyBtn.addEventListener('click', copyPack);
downloadBtn.addEventListener('click', downloadPack);
printBtn.addEventListener('click', printPack);
resetBtn.addEventListener('click', resetAll);

update();
