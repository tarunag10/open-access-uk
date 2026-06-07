// ===== src/app.js =====
// ===== src/app.js =====



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


// ===== src/theme.js =====
const __m1__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_case_builder_src_theme_js = (() => {
// <app>/src/theme.js

function readStored() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* private mode: theme still applies for this session */
  }
}

function apply(theme, toggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }
}

function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let theme = resolveInitialTheme({ stored: readStored(), prefersDark });
  apply(theme, toggle);

  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    apply(theme, toggle);
    writeStored(theme);
  });
}

return { initTheme };
})();

// ===== ../shared/theme/index.mjs =====
const __m2__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_theme_index_mjs = (() => {
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

return { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme };
})();

// ===== src/builder.js =====
const __m3__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_case_builder_src_builder_js = (() => {
// Case Builder - core case management logic
// Combines letters, evidence, deadlines, and escalation into portable case files.

const ISSUE_CATEGORIES = [
  {
    value: 'access',
    label: 'Access or reasonable adjustment',
    description: 'Barriers in services, employment, education, or premises.'
  },
  {
    value: 'complaint',
    label: 'Complaint or service failure',
    description: 'Service has failed or treated you unfairly.'
  },
  {
    value: 'foi',
    label: 'Freedom of Information',
    description: 'Request information from a public authority.'
  },
  {
    value: 'sar',
    label: 'Subject access request',
    description: 'Request your personal data from an organisation.'
  },
  {
    value: 'housing',
    label: 'Housing or disrepair',
    description: 'Repairs, landlord issues, council housing.'
  },
  {
    value: 'consumer',
    label: 'Consumer or financial',
    description: 'Refunds, chargebacks, banking, utilities.'
  },
  {
    value: 'travel',
    label: 'Travel or transport',
    description: 'Rail, airline, bus, or other transport issues.'
  },
  {
    value: 'employment',
    label: 'Employment or workplace',
    description: 'Workplace issues, grievance, dismissal.'
  },
  {
    value: 'education',
    label: 'Education or SEND',
    description: 'School, university, SEND, exams.'
  },
  {
    value: 'health',
    label: 'Health or social care',
    description: 'NHS, social care, accessibility.'
  },
  { value: 'other', label: 'Other', description: 'Something not covered above.' }
];

const CASE_STATUS = [
  { value: 'planning', label: 'Planning', description: 'Gathering facts and deciding next steps.' },
  { value: 'drafting', label: 'Drafting', description: 'Writing the request or complaint.' },
  { value: 'sent', label: 'Sent', description: 'Initial request or complaint sent.' },
  {
    value: 'awaiting',
    label: 'Awaiting response',
    description: 'Waiting for a reply within the response window.'
  },
  { value: 'overdue', label: 'Overdue', description: 'Response deadline has passed.' },
  {
    value: 'escalated',
    label: 'Escalated',
    description: 'Internal review or ombudsman route started.'
  },
  { value: 'resolved', label: 'Resolved', description: 'Issue resolved to your satisfaction.' },
  { value: 'closed', label: 'Closed', description: 'No further action planned.' }
];

const EVIDENCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'letter', label: 'Letter' },
  { value: 'photo', label: 'Photo' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'call-log', label: 'Phone call log' },
  { value: 'form', label: 'Form or application' },
  { value: 'invoice', label: 'Invoice or receipt' },
  { value: 'other', label: 'Other' }
];

const JOURNEY_TOOLS = [
  {
    id: 'letter-generator',
    label: 'Public-Service Letter Generator',
    url: 'https://letter-generator-psi.vercel.app/',
    category: 'letters',
    description: 'Draft reasonable adjustments, FOI, SAR, and complaint follow-ups.'
  },
  {
    id: 'accessible-forms',
    label: 'Accessible Public Forms',
    url: 'https://accessible-forms-two.vercel.app/',
    category: 'forms',
    description: 'Audit and fix inaccessible public-service forms.'
  },
  {
    id: 'public-service-directory',
    label: 'Public Service Directory',
    url: 'https://public-service-directory.vercel.app/',
    category: 'directory',
    description: 'Find escalation routes and ombudsmen.'
  },
  {
    id: 'legal-templates',
    label: 'Legal Templates UK',
    url: 'https://legal-templates-seven.vercel.app/',
    category: 'templates',
    description: 'Plain-English legal templates for everyday issues.'
  },
  {
    id: 'design-system',
    label: 'Open Access Design System',
    url: 'https://design-system-two-delta.vercel.app/',
    category: 'design-system',
    description: 'Accessible design tokens and component patterns.'
  },
  {
    id: 'foi-tracker',
    label: 'FOI Response Tracker',
    url: 'https://foi-tracker.vercel.app/',
    category: 'foi',
    description: 'Track FOI requests, deadlines, and escalations.'
  }
];

function generateCaseId() {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `case-${stamp}-${random}`;
}

function createCase(data = {}) {
  return {
    id: data.id || generateCaseId(),
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim(),
    issueCategory: data.issueCategory || 'other',
    status: data.status || 'planning',
    organisation: String(data.organisation || '').trim(),
    contactName: String(data.contactName || '').trim(),
    contactDetails: String(data.contactDetails || '').trim(),
    sentDate: data.sentDate || '',
    responseDate: data.responseDate || '',
    deadline: data.deadline || '',
    notes: String(data.notes || '').trim(),
    evidence: Array.isArray(data.evidence) ? data.evidence.map(normaliseEvidence) : [],
    letters: Array.isArray(data.letters) ? data.letters.map(normaliseLetter) : [],
    journey: Array.isArray(data.journey) ? data.journey.map(normaliseJourneyStep) : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function normaliseEvidence(item) {
  if (!item) return null;
  return {
    id: item.id || `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: item.type || 'document',
    title: String(item.title || '').trim(),
    description: String(item.description || '').trim(),
    date: item.date || '',
    reference: String(item.reference || '').trim()
  };
}

function normaliseLetter(item) {
  if (!item) return null;
  return {
    id: item.id || `let-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type: item.type || 'custom',
    subject: String(item.subject || '').trim(),
    recipient: String(item.recipient || '').trim(),
    body: String(item.body || '').trim(),
    sentDate: item.sentDate || '',
    reference: String(item.reference || '').trim()
  };
}

function normaliseJourneyStep(item) {
  if (!item) return null;
  return {
    id: item.id || `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    tool: item.tool || 'letter-generator',
    note: String(item.note || '').trim(),
    status: item.status || 'pending',
    completedDate: item.completedDate || ''
  };
}

function cleanEvidence(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseEvidence).filter(Boolean);
}

function cleanLetters(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseLetter).filter(Boolean);
}

function cleanJourney(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normaliseJourneyStep).filter(Boolean);
}

function parseCase(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return createCase(parsed);
  } catch {
    return null;
  }
}

function serializeCase(c) {
  return JSON.stringify(createCase(c));
}

function parseCaseList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => createCase(item));
  } catch {
    return [];
  }
}

function serializeCaseList(list) {
  return JSON.stringify(list.map((item) => createCase(item)));
}

function getStatusMeta(status) {
  return CASE_STATUS.find((s) => s.value === status) || CASE_STATUS[0];
}

function getIssueMeta(category) {
  return (
    ISSUE_CATEGORIES.find((c) => c.value === category) ||
    ISSUE_CATEGORIES.find((c) => c.value === 'other') ||
    ISSUE_CATEGORIES[0]
  );
}

function getEvidenceTypeMeta(type) {
  return EVIDENCE_TYPES.find((t) => t.value === type) || EVIDENCE_TYPES[0];
}

function getJourneyToolMeta(id) {
  return JOURNEY_TOOLS.find((t) => t.id === id) || JOURNEY_TOOLS[0];
}

function buildSummary(cases) {
  const total = cases.length;
  const active = cases.filter((c) => !['resolved', 'closed'].includes(c.status)).length;
  const overdue = cases.filter((c) => c.status === 'overdue').length;
  const escalated = cases.filter((c) => c.status === 'escalated').length;
  const resolved = cases.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
  return { total, active, overdue, escalated, resolved };
}

function buildStatusBreakdown(cases) {
  const breakdown = {};
  for (const option of CASE_STATUS) {
    breakdown[option.value] = cases.filter((c) => c.status === option.value).length;
  }
  return breakdown;
}

function addEvidence(caseObj, evidence) {
  const c = createCase(caseObj);
  const item = normaliseEvidence(evidence);
  if (!item) return c;
  c.evidence.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

function removeEvidence(caseObj, evidenceId) {
  const c = createCase(caseObj);
  c.evidence = c.evidence.filter((e) => e.id !== evidenceId);
  c.updatedAt = new Date().toISOString();
  return c;
}

function addLetter(caseObj, letter) {
  const c = createCase(caseObj);
  const item = normaliseLetter(letter);
  if (!item) return c;
  c.letters.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

function removeLetter(caseObj, letterId) {
  const c = createCase(caseObj);
  c.letters = c.letters.filter((l) => l.id !== letterId);
  c.updatedAt = new Date().toISOString();
  return c;
}

function addJourneyStep(caseObj, step) {
  const c = createCase(caseObj);
  const item = normaliseJourneyStep(step);
  if (!item) return c;
  c.journey.push(item);
  c.updatedAt = new Date().toISOString();
  return c;
}

function removeJourneyStep(caseObj, stepId) {
  const c = createCase(caseObj);
  c.journey = c.journey.filter((s) => s.id !== stepId);
  c.updatedAt = new Date().toISOString();
  return c;
}

function suggestJourney(issueCategory) {
  const journeys = {
    access: ['letter-generator', 'public-service-directory', 'legal-templates'],
    complaint: ['letter-generator', 'public-service-directory', 'legal-templates'],
    foi: ['letter-generator', 'foi-tracker', 'public-service-directory'],
    sar: ['letter-generator', 'public-service-directory'],
    housing: ['letter-generator', 'public-service-directory', 'legal-templates'],
    consumer: ['legal-templates', 'public-service-directory', 'letter-generator'],
    travel: ['letter-generator', 'public-service-directory'],
    employment: ['letter-generator', 'public-service-directory', 'legal-templates'],
    education: ['letter-generator', 'public-service-directory'],
    health: ['letter-generator', 'public-service-directory'],
    other: ['letter-generator', 'public-service-directory']
  };
  const steps = journeys[issueCategory] || journeys.other;
  return steps.map((tool, i) => ({
    id: `step-${Date.now().toString(36)}-${i}`,
    tool,
    note: '',
    status: 'pending',
    completedDate: ''
  }));
}

function buildCaseFile(c) {
  return {
    schema: 'open-access-uk:case:v1',
    case: createCase(c)
  };
}

function parseCaseFile(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.schema === 'open-access-uk:case:v1' && parsed.case) {
      return createCase(parsed.case);
    }
    if (parsed && parsed.id && parsed.title !== undefined) {
      return createCase(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

function buildCaseMarkdown(c) {
  const statusMeta = getStatusMeta(c.status);
  const issueMeta = getIssueMeta(c.issueCategory);
  const sections = [
    `# Case: ${c.title || 'Untitled'}`,
    '',
    `## Summary`,
    `- Status: ${statusMeta.label}`,
    `- Issue category: ${issueMeta.label}`,
    `- Organisation: ${c.organisation || 'Not specified'}`,
    `- Contact: ${c.contactName || 'Not specified'}`,
    `- Created: ${new Date(c.createdAt).toLocaleDateString()}`,
    `- Updated: ${new Date(c.updatedAt).toLocaleDateString()}`,
    '',
    `## Description`,
    c.description || 'No description recorded.',
    '',
    `## Key dates`,
    `- Sent: ${c.sentDate || 'Not sent yet'}`,
    `- Response received: ${c.responseDate || 'Not received yet'}`,
    `- Deadline: ${c.deadline || 'Not set'}`,
    '',
    `## Evidence (${c.evidence.length})`,
    ...(c.evidence.length === 0
      ? ['- No evidence recorded yet.']
      : c.evidence.map(
          (e) =>
            `- [${getEvidenceTypeMeta(e.type).label}] ${e.title}${e.date ? ` (${e.date})` : ''}${e.description ? `: ${e.description}` : ''}`
        )),
    '',
    `## Letters (${c.letters.length})`,
    ...(c.letters.length === 0
      ? ['- No letters recorded yet.']
      : c.letters
          .flatMap((l) => [
            `### ${l.subject || l.type}`,
            `- Recipient: ${l.recipient || 'Not specified'}`,
            l.sentDate ? `- Sent: ${l.sentDate}` : '',
            l.reference ? `- Reference: ${l.reference}` : '',
            '',
            l.body || '(no body recorded)',
            ''
          ])
          .filter(Boolean)),
    `## Journey (${c.journey.length} steps)`,
    ...(c.journey.length === 0
      ? ['- No journey steps recorded yet.']
      : c.journey.map((s, i) => {
          const tool = getJourneyToolMeta(s.tool);
          const status = s.status === 'completed' ? '✓' : s.status === 'in-progress' ? '…' : '○';
          return `${i + 1}. ${status} [${tool.label}](${tool.url})${s.note ? ` — ${s.note}` : ''}`;
        })),
    '',
    `## Notes`,
    c.notes || 'No additional notes.',
    '',
    '> This case file is a drafting aid, not legal advice. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance.'
  ];
  return sections.filter(Boolean).join('\n');
}

function buildEvidenceManifest(c) {
  const lines = [
    `# Evidence manifest: ${c.title || 'Untitled'}`,
    '',
    `Total items: ${c.evidence.length}`,
    '',
    '| # | Type | Title | Date | Reference | Description |',
    '|---|------|-------|------|-----------|-------------|'
  ];
  c.evidence.forEach((e, i) => {
    const type = getEvidenceTypeMeta(e.type).label;
    const title = (e.title || '').replace(/\|/g, '\\|');
    const date = e.date || '';
    const reference = (e.reference || '').replace(/\|/g, '\\|');
    const description = (e.description || '').replace(/\|/g, '\\|');
    lines.push(`| ${i + 1} | ${type} | ${title} | ${date} | ${reference} | ${description} |`);
  });
  return lines.join('\n');
}

function buildTimelineMarkdown(c) {
  const events = [];
  if (c.sentDate) {
    events.push({
      date: c.sentDate,
      label: 'Request sent',
      detail: `Sent to ${c.organisation || 'organisation'}`
    });
  }
  for (const letter of c.letters) {
    if (letter.sentDate) {
      events.push({
        date: letter.sentDate,
        label: `Letter sent: ${letter.subject || letter.type}`,
        detail: `To ${letter.recipient || 'recipient'}`
      });
    }
  }
  for (const step of c.journey) {
    if (step.completedDate) {
      const tool = getJourneyToolMeta(step.tool);
      events.push({
        date: step.completedDate,
        label: `Journey step: ${tool.label}`,
        detail: step.note || ''
      });
    }
  }
  if (c.responseDate) {
    events.push({ date: c.responseDate, label: 'Response received', detail: '' });
  }
  events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const lines = [
    `# Timeline: ${c.title || 'Untitled'}`,
    '',
    events.length === 0 ? 'No timeline events recorded.' : '',
    ...events.map((e) => `- **${e.date}** — ${e.label}${e.detail ? `: ${e.detail}` : ''}`)
  ].filter(Boolean);
  return lines.join('\n');
}

function buildCaseJsonExport(c) {
  return JSON.stringify(buildCaseFile(c), null, 2);
}

function buildHandoffPack(c) {
  return [
    `# Case pack: ${c.title || 'Untitled'}`,
    '',
    '## Summary',
    buildCaseMarkdown(c),
    '',
    '## Evidence manifest',
    buildEvidenceManifest(c),
    '',
    '## Timeline',
    buildTimelineMarkdown(c),
    '',
    '---',
    '',
    '> Drafting aid only. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance.'
  ].join('\n');
}

return { ISSUE_CATEGORIES, CASE_STATUS, EVIDENCE_TYPES, JOURNEY_TOOLS, generateCaseId, createCase, cleanEvidence, cleanLetters, cleanJourney, parseCase, serializeCase, parseCaseList, serializeCaseList, getStatusMeta, getIssueMeta, getEvidenceTypeMeta, getJourneyToolMeta, buildSummary, buildStatusBreakdown, addEvidence, removeEvidence, addLetter, removeLetter, addJourneyStep, removeJourneyStep, suggestJourney, buildCaseFile, parseCaseFile, buildCaseMarkdown, buildEvidenceManifest, buildTimelineMarkdown, buildCaseJsonExport, buildHandoffPack };
})();

// ===== src/export-hub.js =====
const __m4__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_case_builder_src_export_hub_js = (() => {
// Export hub - produces downloadable files for a case

function buildExportList(c) {
  return [
    {
      id: 'case-markdown',
      label: 'Case summary (Markdown)',
      description: 'Single Markdown file with the case summary, letters, evidence, and journey.',
      filename: safeFilename(c, 'case'),
      mimeType: 'text/markdown',
      content: buildCaseMarkdown(c)
    },
    {
      id: 'evidence-manifest',
      label: 'Evidence manifest (Markdown table)',
      description: 'Markdown table of all evidence items with type, date, and reference.',
      filename: safeFilename(c, 'evidence-manifest'),
      mimeType: 'text/markdown',
      content: buildEvidenceManifest(c)
    },
    {
      id: 'timeline',
      label: 'Timeline (Markdown)',
      description: 'Chronological list of events across the case.',
      filename: safeFilename(c, 'timeline'),
      mimeType: 'text/markdown',
      content: buildTimelineMarkdown(c)
    },
    {
      id: 'handoff-pack',
      label: 'Handoff pack (combined Markdown)',
      description: 'All of the above in one file, ready to share with an adviser.',
      filename: safeFilename(c, 'handoff-pack'),
      mimeType: 'text/markdown',
      content: buildHandoffPack(c)
    },
    {
      id: 'case-json',
      label: 'Case file (JSON, portable)',
      description:
        'Portable JSON case file that can be imported back into the Case Builder or another tool.',
      filename: safeFilename(c, 'case'),
      mimeType: 'application/json',
      content: buildCaseJsonExport(c)
    },
    ...buildLetterExports(c),
    ...buildJsonListExport(c)
  ];
}

function buildLetterExports(c) {
  return c.letters.map((letter, i) => ({
    id: `letter-${letter.id || i}`,
    label: `Letter: ${letter.subject || letter.type || 'Untitled'}`,
    description: `Letter to ${letter.recipient || 'recipient'}${letter.sentDate ? ` (sent ${letter.sentDate})` : ''}.`,
    filename: safeFilename(c, `letter-${i + 1}-${(letter.type || 'letter').toLowerCase()}`),
    mimeType: 'text/plain',
    content: letter.body || '(no body recorded)'
  }));
}

function buildJsonListExport(c) {
  return [
    {
      id: 'evidence-json',
      label: 'Evidence list (JSON)',
      description: 'Machine-readable list of evidence items.',
      filename: safeFilename(c, 'evidence'),
      mimeType: 'application/json',
      content: JSON.stringify({ caseId: c.id, evidence: c.evidence }, null, 2)
    }
  ];
}

function safeFilename(c, suffix) {
  const title = String(c.title || 'case')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const id = String(c.id || 'untitled').slice(0, 20);
  return `${title || 'case'}-${id}-${suffix}.md`.replace(/\.md\.md$/, '.md');
}

function groupByType(exports) {
  const groups = { markdown: [], json: [], text: [] };
  for (const exp of exports) {
    if (exp.mimeType.includes('markdown')) groups.markdown.push(exp);
    else if (exp.mimeType.includes('json')) groups.json.push(exp);
    else groups.text.push(exp);
  }
  return groups;
}

function buildCombinedMarkdown(exports) {
  const sections = [
    '# Combined case export',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This file combines the following exports:',
    ...exports.map((e) => `- ${e.label}`),
    '',
    '---',
    ''
  ];
  const body = exports
    .map((e) => [`## ${e.label}`, '', e.content, '', '---', ''].join('\n'))
    .join('\n');
  return sections.join('\n') + body;
}

return { buildExportList, groupByType, buildCombinedMarkdown };
})();

