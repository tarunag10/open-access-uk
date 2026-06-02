import {
  analyzeRepoReadiness,
  buildCategoryIssueMarkdown,
  buildContributorOnboardingPack,
  buildIssueMarkdown,
  buildMaintainerActionPlan,
  buildMaintainerLaunchPack,
  buildMaintainerRoadmap,
  currentGuidance,
  fileListPresets,
  suggestGoodFirstIssues,
  suggestPolicyTodos
} from './helper.js';

const input = document.querySelector('#files');
const output = document.querySelector('#output');
const sample = document.querySelector('#sample');
const presets = document.querySelector('#presets');
const savedExamples = document.querySelector('#saved-examples');
const currentGuidanceMount = document.querySelector('#current-guidance');
const savedExamplesKey = 'open-access-uk:saved-file-list-examples';

const sampleFiles = `README.md
LICENSE
CONTRIBUTING.md
ACCESSIBILITY.md
index.html
.github/ISSUE_TEMPLATE/bug_report.md
.github/labels.yml`;

function parseFiles() {
  return input.value
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function renderList(items) {
  return items.map((item) => `<li>${item}</li>`).join('');
}

function renderIssues(issues) {
  return issues
    .map(
      (issue, index) => `<article class="card">
    <h3>${issue.title}</h3>
    <p>${issue.body}</p>
    <p class="keywords"><strong>Labels:</strong> ${issue.labels.join(', ')}</p>
    <button type="button" class="secondary copy-suggestion" data-suggestion="${index}">Copy issue text</button>
  </article>`
    )
    .join('');
}

function renderRoadmap(roadmap) {
  return roadmap
    .map(
      (group, groupIndex) => `<section class="recommendation-group">
    <h4>${group.category} <span>${group.complete}/${group.total}</span></h4>
    <button type="button" class="secondary copy-category" data-group="${groupIndex}">Copy category issue</button>
    <ul>${group.items
      .map(
        (item) => `<li>
      <strong>${item.status === 'complete' ? 'Done' : 'Next'}:</strong> ${item.title}
      <p>${item.why}</p>
      <p class="keywords"><strong>Acceptance:</strong> ${item.acceptanceCriteria.join('; ')}</p>
      <button type="button" class="secondary copy-recommendation" data-item="${item.id}">Copy issue text</button>
    </li>`
      )
      .join('')}</ul>
  </section>`
    )
    .join('');
}

function loadSavedExamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(savedExamplesKey) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((example) => example && Array.isArray(example.files))
      .map((example) => ({
        id: String(example.id || `saved-${Date.now()}`),
        name: String(example.name || 'Saved file list'),
        files: example.files.map(String).filter(Boolean)
      }));
  } catch {
    return [];
  }
}

function saveCurrentExample() {
  const files = parseFiles();
  if (files.length === 0) return;
  const examples = [
    {
      id: `saved-${Date.now()}`,
      name: `Saved example ${new Date().toLocaleString()}`,
      files
    },
    ...loadSavedExamples()
  ].slice(0, 5);
  localStorage.setItem(savedExamplesKey, JSON.stringify(examples));
  renderSavedExamples();
}

function renderPresetButtons() {
  presets.innerHTML = `<h2>Starter presets</h2>
    ${fileListPresets.map((preset) => `<button type="button" class="secondary preset" data-preset="${preset.id}">${preset.name}</button>`).join('')}
    <button id="save-example" type="button">Save current list</button>`;

  for (const button of document.querySelectorAll('.preset')) {
    button.addEventListener('click', () => {
      const preset = fileListPresets.find((item) => item.id === button.dataset.preset);
      input.value = preset.files.join('\n');
      update();
      input.focus();
    });
  }

  document.querySelector('#save-example').addEventListener('click', saveCurrentExample);
}

function renderSavedExamples() {
  const examples = loadSavedExamples();
  savedExamples.innerHTML = `<h2>Saved examples</h2>
    ${
      examples.length
        ? examples
            .map(
              (example) =>
                `<button type="button" class="secondary saved-example" data-example="${example.id}">${example.name}</button>`
            )
            .join('') +
          '<button id="clear-examples" type="button" class="secondary">Clear examples</button>'
        : '<p>No saved file lists yet.</p>'
    }`;

  for (const button of document.querySelectorAll('.saved-example')) {
    button.addEventListener('click', () => {
      const example = examples.find((item) => item.id === button.dataset.example);
      input.value = example.files.join('\n');
      update();
      input.focus();
    });
  }

  const clear = document.querySelector('#clear-examples');
  if (clear) {
    clear.addEventListener('click', () => {
      localStorage.removeItem(savedExamplesKey);
      renderSavedExamples();
    });
  }
}

function renderCurrentGuidance() {
  currentGuidanceMount.innerHTML = currentGuidance
    .map(
      (item) => `<article class="card">
    <h3>${item.title}</h3>
    <p>${item.detail}</p>
    <a href="${item.url}" rel="noreferrer">${item.source}</a>
  </article>`
    )
    .join('');
}

async function copyText(value) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const fallback = document.createElement('textarea');
  fallback.value = value;
  document.body.append(fallback);
  fallback.select();
  document.execCommand('copy');
  fallback.remove();
}

function update() {
  const files = parseFiles();
  const analysis = analyzeRepoReadiness(files);
  const todos = suggestPolicyTodos(files);
  const roadmap = buildMaintainerRoadmap(files);
  const issues = suggestGoodFirstIssues(files);
  const onboardingPack = buildContributorOnboardingPack(files, {
    projectName: 'Open Access UK repo'
  });
  const launchPack = buildMaintainerLaunchPack(files, { projectName: 'Open Access UK repo' });
  const actionPlan = buildMaintainerActionPlan(files, { projectName: 'Open Access UK repo' });
  output.innerHTML = `<h2>Readiness score: ${analysis.score}%</h2>
    <p>${analysis.present.length} of ${analysis.total} maintainer signals found.</p>
    <h3>Found</h3>
    <ul>${renderList(analysis.present.map((check) => check.label)) || '<li>Nothing yet</li>'}</ul>
    <h3>Grouped roadmap checklist</h3>
    ${renderRoadmap(roadmap)}
    <h3>Policy and documentation TODOs</h3>
    <ul>${renderList(todos) || '<li>No obvious policy gaps.</li>'}</ul>
    <h3>Contributor onboarding pack</h3>
    <article class="card">
      <p>Suggested first issue: <strong>${onboardingPack.suggestedFirstIssue.title}</strong></p>
      <textarea id="onboarding-pack" readonly>${onboardingPack.markdown}</textarea>
      <button id="copy-onboarding-pack" type="button" class="secondary">Copy onboarding pack</button>
      <button id="copy-launch-pack" type="button" class="secondary">Copy launch pack</button>
      <button id="copy-action-plan" type="button" class="secondary">Copy action plan</button>
    </article>
    <h3>Good-first-issue suggestions</h3>
    <div class="cards">${renderIssues(issues)}</div>`;

  for (const button of document.querySelectorAll('.copy-category')) {
    button.addEventListener('click', async () => {
      await copyText(buildCategoryIssueMarkdown(roadmap[Number(button.dataset.group)]));
    });
  }

  for (const button of document.querySelectorAll('.copy-recommendation')) {
    button.addEventListener('click', async () => {
      const item = roadmap
        .flatMap((group) => group.items)
        .find((recommendation) => recommendation.id === button.dataset.item);
      await copyText(buildIssueMarkdown(item));
    });
  }

  for (const button of document.querySelectorAll('.copy-suggestion')) {
    button.addEventListener('click', async () => {
      const issue = issues[Number(button.dataset.suggestion)];
      await copyText(
        [
          '## Summary',
          issue.title,
          '',
          '## Task',
          issue.body,
          '',
          '## Suggested labels',
          `Labels: ${issue.labels.join(', ')}`
        ].join('\n')
      );
    });
  }

  document.querySelector('#copy-onboarding-pack').addEventListener('click', async () => {
    await copyText(onboardingPack.markdown);
  });

  document.querySelector('#copy-launch-pack').addEventListener('click', async () => {
    await copyText(launchPack.markdown);
  });

  document.querySelector('#copy-action-plan').addEventListener('click', async () => {
    await copyText(actionPlan.markdown);
  });
}

sample.addEventListener('click', () => {
  input.value = sampleFiles;
  update();
  input.focus();
});

input.addEventListener('input', update);
update();
renderPresetButtons();
renderSavedExamples();
renderCurrentGuidance();
