import { initTheme } from './theme.js';
import {
  ISSUE_CATEGORIES,
  CASE_STATUS,
  EVIDENCE_TYPES,
  JOURNEY_TOOLS,
  createCase,
  parseCaseList,
  serializeCaseList,
  parseCaseFile,
  getStatusMeta,
  getIssueMeta,
  getEvidenceTypeMeta,
  getJourneyToolMeta,
  buildSummary,
  buildStatusBreakdown,
  addEvidence,
  removeEvidence,
  addLetter,
  removeLetter,
  addJourneyStep,
  removeJourneyStep,
  suggestJourney,
  buildCaseMarkdown,
  buildCaseJsonExport
} from './builder.js';
import { buildExportList, groupByType, buildCombinedMarkdown } from './export-hub.js';

const STORAGE_KEY = 'open-access-uk:case-builder:cases';
const FORM_KEY = 'open-access-uk:case-builder:form-draft';
const ACTIVE_KEY = 'open-access-uk:case-builder:active';

let activeId = null;

function loadAll() {
  return parseCaseList(localStorage.getItem(STORAGE_KEY));
}

function saveAll(cases) {
  localStorage.setItem(STORAGE_KEY, serializeCaseList(cases));
}

function setActive(id) {
  activeId = id;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

function getActive() {
  if (activeId) return activeId;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function populateSelect(select, entries, labelFor) {
  select.replaceChildren(
    ...entries.map(([value, data]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = labelFor(data, value);
      return option;
    })
  );
}

function renderSummary(cases) {
  const stats = buildSummary(cases);
  const summary = document.querySelector('#summary');
  if (!summary) return;
  const cards = [
    { label: 'Total cases', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Overdue', value: stats.overdue, tone: stats.overdue > 0 ? 'warning' : 'default' },
    { label: 'Escalated', value: stats.escalated },
    { label: 'Resolved or closed', value: stats.resolved }
  ];
  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = `summary-card ${c.tone === 'warning' ? 'warning' : ''}`;
      const label = document.createElement('p');
      label.className = 'summary-label';
      label.textContent = c.label;
      const value = document.createElement('p');
      value.className = 'summary-value';
      value.textContent = String(c.value);
      card.append(label, value);
      return card;
    })
  );
  const breakdown = document.querySelector('#status-breakdown');
  if (breakdown) {
    const breakdownStats = buildStatusBreakdown(cases);
    breakdown.replaceChildren(
      ...CASE_STATUS.map((s) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const label = document.createElement('span');
        label.textContent = s.label;
        const value = document.createElement('span');
        value.textContent = breakdownStats[s.value] || 0;
        row.append(label, value);
        return row;
      })
    );
  }
}

function renderCaseList(cases) {
  const list = document.querySelector('#case-list');
  if (!list) return;
  list.replaceChildren();
  if (cases.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent =
      'No cases yet. Create one to start combining letters, evidence, and deadlines.';
    list.append(empty);
    return;
  }
  const sorted = [...cases].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  for (const c of sorted) {
    const item = document.createElement('article');
    item.className = 'case-item';
    if (c.id === activeId) item.classList.add('active');
    if (c.status === 'overdue') item.classList.add('overdue');
    const header = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = c.title || 'Untitled case';
    const status = document.createElement('span');
    status.className = 'status-pill';
    status.textContent = getStatusMeta(c.status).label;
    header.append(title, status);
    const meta = document.createElement('p');
    meta.className = 'meta';
    const issue = getIssueMeta(c.issueCategory).label;
    const org = c.organisation || 'No organisation';
    meta.textContent = `${issue} — ${org}`;
    const counts = document.createElement('p');
    counts.className = 'counts';
    counts.textContent = `${c.evidence.length} evidence · ${c.letters.length} letters · ${c.journey.length} steps`;
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => selectCase(c.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'secondary';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteCase(c.id));
    actions.append(viewBtn, deleteBtn);
    item.append(header, meta, counts, actions);
    list.append(item);
  }
}

function selectCase(id) {
  setActive(id);
  const cases = loadAll();
  const c = cases.find((item) => item.id === id);
  if (!c) {
    document.querySelector('#detail-panel').hidden = true;
    return;
  }
  document.querySelector('#detail-panel').hidden = false;
  renderDetail(c);
  renderCaseList(cases);
}

function renderDetail(c) {
  const panel = document.querySelector('#detail-content');
  panel.replaceChildren();
  const statusMeta = getStatusMeta(c.status);
  const issueMeta = getIssueMeta(c.issueCategory);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = c.title || 'Untitled case';
  const status = document.createElement('span');
  status.className = 'status-pill';
  status.textContent = statusMeta.label;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    ['Issue category', issueMeta.label],
    ['Organisation', c.organisation || 'Not specified'],
    ['Contact', c.contactName || 'Not specified'],
    ['Contact details', c.contactDetails || 'Not specified'],
    ['Sent date', c.sentDate || 'Not sent yet'],
    ['Response date', c.responseDate || 'Not received'],
    ['Deadline', c.deadline || 'Not set'],
    ['Created', new Date(c.createdAt).toLocaleDateString()],
    ['Updated', new Date(c.updatedAt).toLocaleDateString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const descriptionSection = document.createElement('section');
  const descHeading = document.createElement('h3');
  descHeading.textContent = 'Description';
  const descText = document.createElement('p');
  descText.className = 'body-text';
  descText.textContent = c.description || 'No description recorded.';
  descriptionSection.append(descHeading, descText);

  const notesSection = document.createElement('section');
  const notesHeading = document.createElement('h3');
  notesHeading.textContent = 'Notes';
  const notesText = document.createElement('p');
  notesText.className = 'body-text';
  notesText.textContent = c.notes || 'No additional notes.';
  notesSection.append(notesHeading, notesText);

  const evidenceSection = renderEvidenceSection(c);
  const lettersSection = renderLettersSection(c);
  const journeySection = renderJourneySection(c);
  const actionsSection = renderActionsSection(c);

  panel.append(
    header,
    grid,
    descriptionSection,
    notesSection,
    evidenceSection,
    lettersSection,
    journeySection,
    actionsSection
  );
}

function renderEvidenceSection(c) {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = `Evidence (${c.evidence.length})`;
  const list = document.createElement('ul');
  list.className = 'evidence-list';
  if (c.evidence.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No evidence recorded yet.';
    list.append(empty);
  } else {
    for (const e of c.evidence) {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = e.title || 'Untitled evidence';
      const meta = document.createElement('p');
      meta.className = 'meta';
      const typeMeta = getEvidenceTypeMeta(e.type);
      const parts = [typeMeta.label];
      if (e.date) parts.push(e.date);
      if (e.reference) parts.push(e.reference);
      meta.textContent = parts.join(' · ');
      item.append(title, meta);
      if (e.description) {
        const desc = document.createElement('p');
        desc.className = 'body-text';
        desc.textContent = e.description;
        item.append(desc);
      }
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary small';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        const cases = loadAll();
        const idx = cases.findIndex((item) => item.id === c.id);
        if (idx === -1) return;
        cases[idx] = removeEvidence(cases[idx], e.id);
        saveAll(cases);
        renderAll();
        document.querySelector('#status-msg').textContent = 'Evidence removed.';
      });
      item.append(removeBtn);
      list.append(item);
    }
  }
  section.append(heading, list);

  // Add evidence form
  const form = document.createElement('form');
  form.className = 'inline-form';
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Type';
  const typeSelect = document.createElement('select');
  typeSelect.name = 'type';
  populateSelect(typeSelect, Object.entries(EVIDENCE_TYPES), (t) => t.label);
  typeLabel.append(typeSelect);
  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Title';
  const titleInput = document.createElement('input');
  titleInput.name = 'title';
  titleInput.placeholder = 'e.g. Email from HR';
  titleLabel.append(titleInput);
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Date';
  const dateInput = document.createElement('input');
  dateInput.name = 'date';
  dateInput.type = 'date';
  dateLabel.append(dateInput);
  const refLabel = document.createElement('label');
  refLabel.textContent = 'Reference';
  const refInput = document.createElement('input');
  refInput.name = 'reference';
  refInput.placeholder = 'e.g. REF-001';
  refLabel.append(refInput);
  const descLabel = document.createElement('label');
  descLabel.textContent = 'Description';
  const descInput = document.createElement('input');
  descInput.name = 'description';
  descInput.placeholder = 'Short description';
  descLabel.append(descInput);
  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Add evidence';
  form.append(typeLabel, titleLabel, dateLabel, refLabel, descLabel, addBtn);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.title?.trim()) {
      document.querySelector('#status-msg').textContent = 'Add a title for the evidence item.';
      return;
    }
    const cases = loadAll();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx === -1) return;
    cases[idx] = addEvidence(cases[idx], data);
    saveAll(cases);
    form.reset();
    populateSelect(typeSelect, Object.entries(EVIDENCE_TYPES), (t) => t.label);
    renderAll();
    document.querySelector('#status-msg').textContent = `Added evidence: ${data.title}`;
  });
  section.append(form);
  return section;
}

function renderLettersSection(c) {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = `Letters (${c.letters.length})`;
  const list = document.createElement('ul');
  list.className = 'letter-list';
  if (c.letters.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No letters recorded yet. Paste a letter you drafted in another tool.';
    list.append(empty);
  } else {
    for (const l of c.letters) {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = l.subject || l.type || 'Untitled letter';
      const meta = document.createElement('p');
      meta.className = 'meta';
      const parts = [`To ${l.recipient || 'recipient'}`];
      if (l.sentDate) parts.push(`sent ${l.sentDate}`);
      if (l.reference) parts.push(l.reference);
      meta.textContent = parts.join(' · ');
      item.append(title, meta);
      if (l.body) {
        const preview = document.createElement('p');
        preview.className = 'body-text';
        preview.textContent = l.body.length > 200 ? `${l.body.slice(0, 200)}…` : l.body;
        item.append(preview);
      }
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary small';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        const cases = loadAll();
        const idx = cases.findIndex((item) => item.id === c.id);
        if (idx === -1) return;
        cases[idx] = removeLetter(cases[idx], l.id);
        saveAll(cases);
        renderAll();
        document.querySelector('#status-msg').textContent = 'Letter removed.';
      });
      item.append(removeBtn);
      list.append(item);
    }
  }
  section.append(heading, list);

  const form = document.createElement('form');
  form.className = 'inline-form';
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Type';
  const typeInput = document.createElement('input');
  typeInput.name = 'type';
  typeInput.placeholder = 'e.g. FOI request';
  typeLabel.append(typeInput);
  const subjectLabel = document.createElement('label');
  subjectLabel.textContent = 'Subject';
  const subjectInput = document.createElement('input');
  subjectInput.name = 'subject';
  subjectInput.placeholder = 'e.g. SEND tribunal waiting times';
  subjectLabel.append(subjectInput);
  const recipientLabel = document.createElement('label');
  recipientLabel.textContent = 'Recipient';
  const recipientInput = document.createElement('input');
  recipientInput.name = 'recipient';
  recipientInput.placeholder = 'e.g. Department for Education';
  recipientLabel.append(recipientInput);
  const sentLabel = document.createElement('label');
  sentLabel.textContent = 'Sent date';
  const sentInput = document.createElement('input');
  sentInput.name = 'sentDate';
  sentInput.type = 'date';
  sentLabel.append(sentInput);
  const refLabel = document.createElement('label');
  refLabel.textContent = 'Reference';
  const refInput = document.createElement('input');
  refInput.name = 'reference';
  refInput.placeholder = 'e.g. DFE-2026-FOI-1234';
  refLabel.append(refInput);
  const bodyLabel = document.createElement('label');
  bodyLabel.textContent = 'Letter body';
  const bodyInput = document.createElement('textarea');
  bodyInput.name = 'body';
  bodyInput.rows = 4;
  bodyInput.placeholder = 'Paste the full letter text here.';
  bodyLabel.append(bodyInput);
  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Add letter';
  form.append(typeLabel, subjectLabel, recipientLabel, sentLabel, refLabel, bodyLabel, addBtn);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.subject?.trim() && !data.body?.trim()) {
      document.querySelector('#status-msg').textContent = 'Add a subject or body for the letter.';
      return;
    }
    const cases = loadAll();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx === -1) return;
    cases[idx] = addLetter(cases[idx], data);
    saveAll(cases);
    form.reset();
    renderAll();
    document.querySelector('#status-msg').textContent =
      `Added letter: ${data.subject || data.type}`;
  });
  section.append(form);
  return section;
}

function renderJourneySection(c) {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = `Journey (${c.journey.length} steps)`;
  const list = document.createElement('ol');
  list.className = 'journey-list';
  if (c.journey.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No journey steps yet. Add steps to plan which tools to use.';
    list.append(empty);
  } else {
    for (const s of c.journey) {
      const tool = getJourneyToolMeta(s.tool);
      const item = document.createElement('li');
      item.className = `journey-step status-${s.status}`;
      const title = document.createElement('strong');
      title.textContent = tool.label;
      const link = document.createElement('a');
      link.href = tool.url;
      link.rel = 'noreferrer';
      link.textContent = 'Open tool';
      title.append(' ', link);
      item.append(title);
      if (s.note) {
        const note = document.createElement('p');
        note.className = 'body-text';
        note.textContent = s.note;
        item.append(note);
      }
      const meta = document.createElement('p');
      meta.className = 'meta';
      const parts = [`Status: ${s.status}`];
      if (s.completedDate) parts.push(`Completed: ${s.completedDate}`);
      meta.textContent = parts.join(' · ');
      item.append(meta);
      const actions = document.createElement('div');
      actions.className = 'step-actions';
      const statusSelect = document.createElement('select');
      for (const status of ['pending', 'in-progress', 'completed', 'skipped']) {
        const opt = document.createElement('option');
        opt.value = status;
        opt.textContent = status;
        if (status === s.status) opt.selected = true;
        statusSelect.append(opt);
      }
      statusSelect.addEventListener('change', () => {
        const cases = loadAll();
        const idx = cases.findIndex((item) => item.id === c.id);
        if (idx === -1) return;
        const updated = [...cases[idx].journey];
        const stepIdx = updated.findIndex((st) => st.id === s.id);
        if (stepIdx === -1) return;
        updated[stepIdx] = {
          ...updated[stepIdx],
          status: statusSelect.value,
          completedDate:
            statusSelect.value === 'completed'
              ? new Date().toISOString().slice(0, 10)
              : updated[stepIdx].completedDate
        };
        cases[idx] = { ...cases[idx], journey: updated, updatedAt: new Date().toISOString() };
        saveAll(cases);
        renderAll();
      });
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary small';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        const cases = loadAll();
        const idx = cases.findIndex((item) => item.id === c.id);
        if (idx === -1) return;
        cases[idx] = removeJourneyStep(cases[idx], s.id);
        saveAll(cases);
        renderAll();
        document.querySelector('#status-msg').textContent = 'Journey step removed.';
      });
      actions.append(statusSelect, removeBtn);
      item.append(actions);
      list.append(item);
    }
  }
  section.append(heading, list);

  const form = document.createElement('form');
  form.className = 'inline-form';
  const toolLabel = document.createElement('label');
  toolLabel.textContent = 'Tool';
  const toolSelect = document.createElement('select');
  toolSelect.name = 'tool';
  populateSelect(toolSelect, Object.entries(JOURNEY_TOOLS), (t) => t.label);
  toolLabel.append(toolSelect);
  const noteLabel = document.createElement('label');
  noteLabel.textContent = 'Note';
  const noteInput = document.createElement('input');
  noteInput.name = 'note';
  noteInput.placeholder = 'e.g. Draft the initial request';
  noteLabel.append(noteInput);
  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Add step';
  form.append(toolLabel, noteLabel, addBtn);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const cases = loadAll();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx === -1) return;
    cases[idx] = addJourneyStep(cases[idx], data);
    saveAll(cases);
    form.reset();
    populateSelect(toolSelect, Object.entries(JOURNEY_TOOLS), (t) => t.label);
    renderAll();
    document.querySelector('#status-msg').textContent = 'Journey step added.';
  });
  section.append(form);

  const suggestBtn = document.createElement('button');
  suggestBtn.type = 'button';
  suggestBtn.className = 'secondary';
  suggestBtn.textContent = `Suggest journey for ${getIssueMeta(c.issueCategory).label}`;
  suggestBtn.addEventListener('click', () => {
    const cases = loadAll();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx === -1) return;
    const suggested = suggestJourney(c.issueCategory);
    cases[idx] = { ...cases[idx], journey: suggested, updatedAt: new Date().toISOString() };
    saveAll(cases);
    renderAll();
    document.querySelector('#status-msg').textContent =
      `Added ${suggested.length} suggested steps.`;
  });
  section.append(suggestBtn);

  return section;
}

function renderActionsSection(c) {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = 'Actions';
  const statusForm = document.createElement('div');
  statusForm.className = 'status-form';
  const statusLabel = document.createElement('label');
  statusLabel.htmlFor = 'detail-status';
  statusLabel.textContent = 'Update status';
  const statusSelect = document.createElement('select');
  statusSelect.id = 'detail-status';
  populateSelect(statusSelect, Object.entries(CASE_STATUS), (s) => s.label);
  statusSelect.value = c.status;
  statusSelect.addEventListener('change', () => {
    const cases = loadAll();
    const idx = cases.findIndex((item) => item.id === c.id);
    if (idx === -1) return;
    cases[idx] = { ...cases[idx], status: statusSelect.value, updatedAt: new Date().toISOString() };
    saveAll(cases);
    renderAll();
    document.querySelector('#status-msg').textContent =
      `Status updated to ${getStatusMeta(statusSelect.value).label}.`;
  });
  statusForm.append(statusLabel, statusSelect);

  const exportHub = document.createElement('div');
  exportHub.className = 'export-hub';
  const exportHeading = document.createElement('h4');
  exportHeading.textContent = 'Export hub';
  exportHub.append(exportHeading);
  const exports = buildExportList(c);
  const groups = groupByType(exports);
  for (const [type, items] of Object.entries(groups)) {
    const groupEl = document.createElement('div');
    groupEl.className = 'export-group';
    const groupLabel = document.createElement('p');
    groupLabel.className = 'export-group-label';
    groupLabel.textContent =
      type === 'markdown' ? 'Markdown' : type === 'json' ? 'JSON' : 'Plain text';
    groupEl.append(groupLabel);
    for (const exp of items) {
      const row = document.createElement('div');
      row.className = 'export-row';
      const info = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = exp.label;
      const desc = document.createElement('p');
      desc.className = 'meta';
      desc.textContent = exp.description;
      info.append(label, desc);
      const actions = document.createElement('div');
      actions.className = 'export-actions';
      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'secondary small';
      dlBtn.textContent = 'Download';
      dlBtn.addEventListener('click', () => downloadText(exp.content, exp.filename, exp.mimeType));
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'secondary small';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => copyText(exp.content, `Copied ${exp.label}.`));
      actions.append(dlBtn, copyBtn);
      row.append(info, actions);
      groupEl.append(row);
    }
    exportHub.append(groupEl);
  }
  const combinedBtn = document.createElement('button');
  combinedBtn.type = 'button';
  combinedBtn.className = 'secondary';
  combinedBtn.textContent = 'Download combined export';
  combinedBtn.addEventListener('click', () => {
    const combined = buildCombinedMarkdown(exports);
    downloadText(
      combined,
      `${(c.title || 'case').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-combined.md`,
      'text/markdown'
    );
  });
  exportHub.append(combinedBtn);

  section.append(statusForm, exportHub);
  return section;
}

function deleteCase(id) {
  const cases = loadAll();
  const remaining = cases.filter((c) => c.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    setActive(null);
    document.querySelector('#detail-panel').hidden = true;
  }
  document.querySelector('#status-msg').textContent = 'Case deleted.';
  renderAll();
}

function renderAll() {
  const cases = loadAll();
  renderSummary(cases);
  renderCaseList(cases);
  const a = getActive();
  if (a) {
    const c = cases.find((item) => item.id === a);
    if (c) {
      document.querySelector('#detail-panel').hidden = false;
      renderDetail(c);
    } else {
      document.querySelector('#detail-panel').hidden = true;
    }
  }
}

function values() {
  return Object.fromEntries(new FormData(document.querySelector('#case-form')).entries());
}

function saveFormDraft() {
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch {
    /* ignore */
  }
}

function restoreFormDraft() {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const form = document.querySelector('#case-form');
    for (const [name, value] of Object.entries(data)) {
      const field = form.elements.namedItem(name);
      if (field && value) field.value = value;
    }
  } catch {
    /* ignore */
  }
}

function clearFormDraft() {
  localStorage.removeItem(FORM_KEY);
}

function handleAddCase(event) {
  event.preventDefault();
  const data = values();
  if (!data.title?.trim()) {
    document.querySelector('#status-msg').textContent = 'Add a title for the case.';
    return;
  }
  const cases = loadAll();
  const now = new Date().toISOString();
  const c = createCase({ ...data, createdAt: now, updatedAt: now });
  cases.push(c);
  saveAll(cases);
  document.querySelector('#case-form').reset();
  populateSelect(
    document.querySelector('#issueCategory'),
    Object.entries(ISSUE_CATEGORIES),
    (c) => c.label
  );
  populateSelect(document.querySelector('#status'), Object.entries(CASE_STATUS), (s) => s.label);
  clearFormDraft();
  setActive(c.id);
  document.querySelector('#status-msg').textContent = `Case created: ${c.title}`;
  renderAll();
}

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    document.querySelector('#status-msg').textContent = message;
  } catch {
    document.querySelector('#status-msg').textContent =
      'Copy failed. You can still select and copy the text manually.';
  }
}

function downloadText(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  document.querySelector('#status-msg').textContent =
    `Downloaded ${filename}. Nothing was sent to a server.`;
}

function handleExportAll(format) {
  const cases = loadAll();
  if (cases.length === 0) {
    document.querySelector('#status-msg').textContent = 'No cases to export.';
    return;
  }
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cases-export.json';
    link.click();
    URL.revokeObjectURL(url);
    document.querySelector('#status-msg').textContent = 'Downloaded cases-export.json.';
  } else {
    const md = cases.map((c) => buildCaseMarkdown(c)).join('\n\n---\n\n');
    downloadText(md, 'cases-export.md', 'text/markdown');
  }
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      let casesToImport = [];
      if (Array.isArray(parsed)) {
        casesToImport = parsed;
      } else if (parsed && parsed.case) {
        const c = parseCaseFile(reader.result);
        if (c) casesToImport = [c];
      } else {
        throw new Error('unknown format');
      }
      const existing = loadAll();
      const merged = [...existing];
      let added = 0;
      for (const item of casesToImport) {
        const c = createCase(item);
        if (!merged.find((e) => e.id === c.id)) {
          merged.push(c);
          added += 1;
        }
      }
      saveAll(merged);
      document.querySelector('#status-msg').textContent = `Imported ${added} case(s).`;
      renderAll();
    } catch {
      document.querySelector('#status-msg').textContent =
        'Could not import file. Expected a JSON case file or list.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const cases = loadAll();
  if (cases.length === 0) {
    document.querySelector('#status-msg').textContent = 'No cases to clear.';
    return;
  }
  if (!confirm(`Delete all ${cases.length} case(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_KEY);
  activeId = null;
  document.querySelector('#detail-panel').hidden = true;
  document.querySelector('#status-msg').textContent = 'All cases cleared.';
  renderAll();
}

// Initialise
populateSelect(
  document.querySelector('#issueCategory'),
  Object.entries(ISSUE_CATEGORIES),
  (c) => c.label
);
populateSelect(document.querySelector('#status'), Object.entries(CASE_STATUS), (s) => s.label);
restoreFormDraft();

document.querySelector('#case-form').addEventListener('submit', handleAddCase);
document.querySelector('#case-form').addEventListener('input', saveFormDraft);

document.querySelector('#exportAllJson')?.addEventListener('click', () => handleExportAll('json'));
document
  .querySelector('#exportAllMarkdown')
  ?.addEventListener('click', () => handleExportAll('markdown'));
document.querySelector('#importJson')?.addEventListener('change', handleImport);
document.querySelector('#clearAll')?.addEventListener('click', handleClearAll);
document.querySelector('#loadSample')?.addEventListener('click', () => {
  const today = new Date().toISOString().slice(0, 10);
  const sample = [
    createCase({
      title: 'SEND tribunal waiting times',
      description:
        "Concerned about long waits for SEND tribunal hearings affecting my child's education.",
      issueCategory: 'education',
      status: 'planning',
      organisation: 'Department for Education',
      contactName: 'A. Parent',
      contactDetails: 'a.parent@example.com',
      journey: suggestJourney('education')
    }),
    createCase({
      title: 'Council complaint: missed bin collections',
      description:
        'Repeated missed bin collections over 3 months. Want to request an internal review and, if needed, escalate to the ombudsman.',
      issueCategory: 'complaint',
      status: 'drafting',
      organisation: 'Manchester City Council',
      contactName: 'A. Resident',
      contactDetails: 'a.resident@example.com',
      sentDate: today,
      journey: suggestJourney('complaint')
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.title === s.title)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  document.querySelector('#status-msg').textContent = 'Loaded sample cases.';
  renderAll();
});

const activeStored = getActive();
if (activeStored) activeId = activeStored;

renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
