// professional-complaints/src/app.js — generated bundle (all shared modules inlined)
// Do not edit directly. Edit shared/ modules and re-run: node scripts/bundle-tool.mjs professional-complaints

// ===== ../../shared/professional-complaints/index.mjs =====
const REGULATORS = [
  {
    id: 'GMC',
    name: 'General Medical Council',
    profession: 'Doctors',
    source: 'gmc-complaints',
    website: 'https://www.gmc-uk.org',
    fitnessToPractise: true,
    deadlineNote: 'No statutory time limit but prompt action recommended'
  },
  {
    id: 'SRA',
    name: 'Solicitors Regulation Authority',
    profession: 'Solicitors',
    source: 'sra-complaints',
    website: 'https://www.sra.org.uk',
    fitnessToPractise: true,
    deadlineNote: 'Within 6 years of the issue'
  },
  {
    id: 'LeO',
    name: 'Legal Ombudsman',
    profession: 'Legal Services',
    source: 'leo-complaints',
    website: 'https://www.legalombudsman.org.uk',
    fitnessToPractise: false,
    deadlineNote: 'Within 6 months of final response from service provider'
  },
  {
    id: 'ACCA',
    name: 'Association of Chartered Certified Accountants',
    profession: 'Accountants',
    source: 'acca-complaints',
    website: 'https://www.accaglobal.com',
    fitnessToPractise: true,
    deadlineNote: 'Within 5 years'
  },
  {
    id: 'RICS',
    name: 'Royal Institution of Chartered Surveyors',
    profession: 'Surveyors',
    source: 'rics-complaints',
    website: 'https://www.rics.org',
    fitnessToPractise: true,
    deadlineNote: 'Within 6 years'
  },
  {
    id: 'NMC',
    name: 'Nursing and Midwifery Council',
    profession: 'Nurses and Midwives',
    source: 'nmc-complaints',
    website: 'https://www.nmc.org.uk',
    fitnessToPractise: true,
    deadlineNote: 'No statutory time limit'
  },
  {
    id: 'GPhC',
    name: 'General Pharmaceutical Council',
    profession: 'Pharmacists',
    source: 'gphc-complaints',
    website: 'https://www.pharmacyregulation.org',
    fitnessToPractise: true,
    deadlineNote: 'No statutory time limit'
  },
  {
    id: 'BPS',
    name: 'British Psychological Society',
    profession: 'Psychologists',
    source: 'bps-complaints',
    website: 'https://www.bps.org.uk',
    fitnessToPractise: true,
    deadlineNote: 'Within 5 years'
  }
];

const FITNESS_TO_PRACTISE_PROCESSES = {
  GMC: [
    {
      name: 'Initial assessment',
      description:
        'The GMC assesses whether the concern raises a real possibility of a finding of impaired fitness to practise.'
    },
    {
      name: 'Investigation',
      description:
        'A thorough investigation is carried out, which may include gathering evidence, interviewing witnesses, and commissioning expert reports.'
    },
    {
      name: 'Medical Practitioners Tribunal Service (MPTS) hearing',
      description:
        'If the case proceeds, it is heard by an MPTS tribunal which determines whether fitness to practise is impaired.'
    },
    {
      name: 'Sanction',
      description:
        'The tribunal may impose sanctions ranging from no action through to erasure from the medical register.'
    }
  ],
  SRA: [
    {
      name: 'Initial assessment',
      description:
        'The SRA assesses the information received to determine whether a formal investigation is required.'
    },
    {
      name: 'Investigation',
      description:
        'The SRA investigates the matter, which may include obtaining documents, instructing experts, and taking witness statements.'
    },
    {
      name: 'Decision',
      description:
        'The authorisation to practise committee decides whether to refer the matter to the Solicitors Disciplinary Tribunal (SDT).'
    },
    {
      name: 'SDT hearing',
      description:
        "The SDT hears the case and determines whether there is misconduct and whether the solicitor's fitness to practise is impaired."
    },
    {
      name: 'Sanction',
      description:
        'The SDT may impose sanctions ranging from a rebuke through to striking off the roll.'
    }
  ],
  LeO: [],
  ACCA: [
    {
      name: 'Preliminary review',
      description:
        'ACCA reviews the complaint to determine whether it falls within the conduct regulations and warrants investigation.'
    },
    {
      name: 'Investigation',
      description:
        'A formal investigation is conducted, which may involve gathering evidence and commissioning expert opinions.'
    },
    {
      name: 'Disciplinary Committee hearing',
      description:
        "If the case proceeds, it is heard by ACCA's Disciplinary Committee which determines whether the member's conduct was in breach of the regulations."
    },
    {
      name: 'Sanction',
      description:
        'The Committee may impose sanctions ranging from a warning through to expulsion from membership.'
    }
  ],
  RICS: [
    {
      name: 'Preliminary assessment',
      description:
        'RICS assesses whether the complaint warrants a formal investigation under its disciplinary regulations.'
    },
    {
      name: 'Investigation',
      description:
        'A formal investigation is carried out, which may include obtaining evidence and taking witness statements.'
    },
    {
      name: 'Disciplinary Board hearing',
      description:
        'If the case proceeds, it is heard by a Disciplinary Board panel which determines whether there is a breach of the rules of conduct.'
    },
    {
      name: 'Sanction',
      description:
        'The Board may impose sanctions ranging from a reprimand through to expulsion from membership.'
    }
  ],
  NMC: [
    {
      name: 'Initial assessment',
      description:
        'The NMC assesses whether the concern is serious enough to warrant a fitness to practise investigation.'
    },
    {
      name: 'Investigation',
      description:
        'A thorough investigation is carried out, which may include gathering evidence, interviewing witnesses, and commissioning expert reports.'
    },
    {
      name: 'Fitness to practise panel hearing',
      description:
        "If the case proceeds, it is heard by an NMC fitness to practise panel which determines whether the registrant's fitness to practise is impaired."
    },
    {
      name: 'Sanction',
      description:
        'The panel may impose sanctions ranging from no action through to removal from the register.'
    }
  ],
  GPhC: [
    {
      name: 'Initial assessment',
      description:
        "The GPhC assesses whether the concern raises a question about a registrant's fitness to practise."
    },
    {
      name: 'Investigation',
      description:
        'A formal investigation is carried out, which may include gathering evidence and commissioning expert reports.'
    },
    {
      name: 'Fitness to practise committee hearing',
      description:
        "If the case proceeds, it is heard by a fitness to practise committee which determines whether the registrant's fitness to practise is impaired."
    },
    {
      name: 'Sanction',
      description:
        'The committee may impose sanctions ranging from no action through to removal from the register.'
    }
  ],
  BPS: [
    {
      name: 'Preliminary assessment',
      description:
        'BPS assesses whether the complaint falls within the conduct regulations and warrants a formal investigation.'
    },
    {
      name: 'Investigation',
      description:
        'A formal investigation is carried out, which may include obtaining evidence and taking witness statements.'
    },
    {
      name: 'Professional Conduct Committee hearing',
      description:
        'If the case proceeds, it is heard by the Professional Conduct Committee which determines whether there is a breach of the code of conduct.'
    },
    {
      name: 'Sanction',
      description:
        'The Committee may impose sanctions ranging from a reprimand through to expulsion from membership.'
    }
  ]
};

const COMPLAINT_CATEGORIES = {
  GMC: ['conduct', 'performance', 'health', 'dishonesty'],
  SRA: ['conduct', 'performance', 'health', 'dishonesty'],
  LeO: ['service', 'delay', 'poor communication', 'billing'],
  ACCA: ['conduct', 'performance', 'health', 'dishonesty'],
  RICS: ['conduct', 'performance', 'health', 'dishonesty'],
  NMC: ['conduct', 'performance', 'health', 'dishonesty'],
  GPhC: ['conduct', 'performance', 'health', 'dishonesty'],
  BPS: ['conduct', 'performance', 'health', 'dishonesty']
};

function getRegulators() {
  return [...REGULATORS];
}

function getRegulatorDetails(regulatorId) {
  const regulator = REGULATORS.find((r) => r.id === regulatorId);
  return regulator ? { ...regulator } : null;
}

function generateComplaintText(data) {
  if (!data || !data.complainantName) throw new Error('complainantName is required');
  if (!data.professionalName) throw new Error('professionalName is required');

  const regulator = getRegulatorDetails(data.regulator);
  const regulatorName = regulator ? regulator.name : 'Not specified';
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const lines = [
    `Date: ${date}`,
    '',
    `To: ${regulatorName}`,
    '',
    `Re: Complaint against ${data.professionalName}`,
    '',
    `Dear Sir/Madam,`,
    '',
    `I wish to make a formal complaint against ${data.professionalName} regarding ${data.complaintType || 'professional misconduct'}.`,
    '',
    `Professional Details:`,
    `Name: ${data.professionalName}`,
    `Address: ${data.professionalAddress || 'Not provided'}`,
    '',
    `Description of Concern:`,
    `${data.descriptionOfConcern || 'Not provided'}`,
    '',
    `Desired Outcome:`,
    `${data.desiredOutcome || 'Investigation and appropriate action'}`,
    '',
    `I look forward to your response.`,
    '',
    `Yours faithfully,`,
    `${data.complainantName}`
  ];

  return lines.join('\n');
}

function getComplaintDeadlines(regulatorId) {
  const regulator = REGULATORS.find((r) => r.id === regulatorId);
  if (!regulator) return null;
  return {
    regulatorId: regulator.id,
    regulatorName: regulator.name,
    note: regulator.deadlineNote
  };
}

function getFitnessToPractiseProcess(regulatorId) {
  return [...(FITNESS_TO_PRACTISE_PROCESSES[regulatorId] || [])];
}

function getComplaintCategories(regulatorId) {
  return [...(COMPLAINT_CATEGORIES[regulatorId] || [])];
}

function serializeProfessionalComplaints(value) {
  return JSON.stringify(value);
}

function parseProfessionalComplaints(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ===== ../../shared/theme/index.mjs =====
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

// ===== src/tracker.js (imports resolved) =====

export {
  getRegulators,
  getRegulatorDetails,
  generateComplaintText,
  getComplaintDeadlines,
  getFitnessToPractiseProcess,
  getComplaintCategories,
  serializeProfessionalComplaints,
  parseProfessionalComplaints
};

// ===== Theme init =====
function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let stored;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
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
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  });
}

// ===== App logic =====
const STORAGE_KEY = 'open-access-uk:professional-complaints:complaints';
const FORM_KEY = 'open-access-uk:professional-complaints:form-draft';

const form = document.querySelector('#complaint-form');
const list = document.querySelector('#complaint-list');
const summary = document.querySelector('#summary');
const statusEl = document.querySelector('#form-status');
const detailPanel = document.querySelector('#detail-panel');
const detailContent = document.querySelector('#detail-content');
let activeId = null;

function loadAll() {
  return parseProfessionalComplaints(localStorage.getItem(STORAGE_KEY));
}

function saveAll(complaints) {
  localStorage.setItem(STORAGE_KEY, serializeProfessionalComplaints(complaints));
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderSummary(complaints) {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'open').length;

  const regulatorCounts = REGULATORS.map((r) => ({
    label: r.id,
    value: complaints.filter((c) => c.regulator === r.id).length
  }));

  const cards = [
    { label: 'Total complaints', value: total, tone: 'default' },
    { label: 'Open', value: open, tone: 'default' },
    ...regulatorCounts
      .filter((r) => r.value > 0)
      .map((r) => ({
        label: r.label,
        value: r.value,
        tone: 'default'
      }))
  ];

  summary.replaceChildren(
    ...cards.map((c) => {
      const card = document.createElement('article');
      card.className = 'summary-card';
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
}

function renderList(complaints) {
  renderComplaints(complaints, list);
  list.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', () => selectComplaint(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteComplaint(btn.dataset.id));
  });
}

function selectComplaint(id) {
  activeId = id;
  const complaints = loadAll();
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) {
    detailPanel.hidden = true;
    return;
  }
  detailPanel.hidden = false;
  renderDetail(complaint);
  renderList(complaints);
}

function renderDetail(complaint) {
  detailContent.replaceChildren();
  const regulator = getRegulatorDetails(complaint.regulator);
  const deadlines = getComplaintDeadlines(complaint.regulator);
  const ftpProcess = getFitnessToPractiseProcess(complaint.regulator);

  const header = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = complaint.professionalName || 'Untitled complaint';
  const status = document.createElement('span');
  status.className = `status-pill regulator-${complaint.regulator}`;
  status.textContent = regulator ? regulator.profession : complaint.regulator;
  header.append(title, status);

  const grid = document.createElement('dl');
  grid.className = 'detail-grid';
  const fields = [
    [
      'Regulator',
      regulator ? `${regulator.name} (${regulator.id})` : complaint.regulator || 'Not specified'
    ],
    ['Complainant', complaint.complainantName || 'Not provided'],
    ['Practice', complaint.practiceName || 'Not provided'],
    ['Address', complaint.practiceAddress || 'Not provided'],
    ['Category', complaint.complaintType || 'Not specified'],
    ['Description', complaint.descriptionOfConcern || 'Not specified'],
    ['Desired outcome', complaint.desiredOutcome || 'Not specified'],
    ['Deadline', deadlines ? deadlines.note : 'No deadline data'],
    ['Created', new Date(complaint.createdAt).toLocaleString()]
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.append(dt, dd);
  }

  const complaintLetterSection = document.createElement('section');
  const complaintLetterHeading = document.createElement('h3');
  complaintLetterHeading.textContent = 'Generated complaint letter';
  const complaintLetterPre = document.createElement('pre');
  complaintLetterPre.className = 'code-window';
  complaintLetterPre.textContent = generateComplaintText(complaint);
  complaintLetterSection.append(complaintLetterHeading, complaintLetterPre);

  let ftpSection = null;
  if (ftpProcess.length > 0) {
    ftpSection = document.createElement('section');
    const ftpHeading = document.createElement('h3');
    ftpHeading.textContent = `Fitness to practise process (${regulator ? regulator.id : ''})`;
    ftpSection.append(ftpHeading);

    const ftpList = document.createElement('ol');
    ftpList.className = 'timeline';
    for (const step of ftpProcess) {
      const li = document.createElement('li');
      li.className = 'timeline-future';
      const stepTitle = document.createElement('strong');
      stepTitle.textContent = step.name;
      const stepDesc = document.createElement('span');
      stepDesc.textContent = step.description;
      li.append(stepTitle, stepDesc);
      ftpList.append(li);
    }
    ftpSection.append(ftpList);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const copyLetter = document.createElement('button');
  copyLetter.type = 'button';
  copyLetter.textContent = 'Copy complaint letter';
  copyLetter.addEventListener('click', () =>
    copyText(generateComplaintText(complaint), 'Complaint letter copied locally.')
  );

  const copySummary = document.createElement('button');
  copySummary.type = 'button';
  copySummary.className = 'secondary';
  copySummary.textContent = 'Copy summary';
  copySummary.addEventListener('click', () =>
    copyText(buildComplaintSummary(complaint), 'Summary copied locally.')
  );

  actions.append(copyLetter, copySummary);
  detailContent.append(header, grid, complaintLetterSection);
  if (ftpSection) detailContent.append(ftpSection);
  detailContent.append(actions);
}

function buildComplaintSummary(complaint) {
  const regulator = getRegulatorDetails(complaint.regulator);
  const lines = [];
  lines.push(`Complaint: ${complaint.professionalName}`);
  lines.push(`Regulator: ${regulator ? regulator.name : complaint.regulator}`);
  if (complaint.practiceName) lines.push(`Practice: ${complaint.practiceName}`);
  if (complaint.complaintType) lines.push(`Category: ${complaint.complaintType}`);
  if (complaint.descriptionOfConcern) lines.push(`Description: ${complaint.descriptionOfConcern}`);
  if (complaint.desiredOutcome) lines.push(`Desired outcome: ${complaint.desiredOutcome}`);
  return lines.join('\n');
}

function generateComplaintId() {
  return 'pc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function createComplaintRecord(data) {
  if (!data || !data.professionalName) {
    throw new Error('professionalName is required');
  }
  return {
    id: generateComplaintId(),
    createdAt: new Date().toISOString(),
    status: 'open',
    regulator: data.regulator || '',
    professionalName: data.professionalName,
    practiceName: data.practiceName || '',
    practiceAddress: data.practiceAddress || '',
    complaintType: data.complaintType || '',
    descriptionOfConcern: data.descriptionOfConcern || '',
    desiredOutcome: data.desiredOutcome || '',
    complainantName: data.complainantName || '',
    ...data
  };
}

function deleteComplaint(id) {
  const complaints = loadAll();
  const remaining = complaints.filter((c) => c.id !== id);
  saveAll(remaining);
  if (activeId === id) {
    activeId = null;
    detailPanel.hidden = true;
  }
  statusEl.textContent = 'Complaint deleted locally.';
  renderAll();
}

function renderAll() {
  const complaints = loadAll();
  renderSummary(complaints);
  renderList(complaints);
  if (activeId) {
    const complaint = complaints.find((c) => c.id === activeId);
    if (complaint) renderDetail(complaint);
  }
}

function saveFormDraft() {
  if (!form) return;
  try {
    localStorage.setItem(FORM_KEY, JSON.stringify(values()));
  } catch {
    /* ignore */
  }
}

function restoreFormDraft() {
  if (!form) return;
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
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

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    statusEl.textContent = message;
  } catch {
    statusEl.textContent = 'Copy failed. You can still select and copy the text manually.';
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
  statusEl.textContent = `Downloaded ${filename}. Nothing was sent to a server.`;
}

function handleAdd(event) {
  event.preventDefault();
  const data = values();
  if (!data.professionalName?.trim()) {
    statusEl.textContent = 'Add a professional name before saving.';
    return;
  }
  if (!data.complainantName?.trim()) {
    statusEl.textContent = 'Add your name (complainant) before saving.';
    return;
  }
  const complaints = loadAll();
  const now = new Date().toISOString();
  const newComplaint = createComplaintRecord({
    regulator: data.regulator,
    professionalName: data.professionalName,
    practiceName: data.practiceName,
    practiceAddress: data.practiceAddress,
    complaintType: data.complaintType,
    descriptionOfConcern: data.descriptionOfConcern,
    desiredOutcome: data.desiredOutcome,
    complainantName: data.complainantName,
    createdAt: now,
    updatedAt: now
  });
  complaints.push(newComplaint);
  saveAll(complaints);
  form.reset();
  clearFormDraft();
  activeId = newComplaint.id;
  statusEl.textContent = `Saved complaint for ${newComplaint.professionalName}.`;
  renderAll();
}

function handleExport(format) {
  const complaints = loadAll();
  if (complaints.length === 0) {
    statusEl.textContent = 'No complaints to export.';
    return;
  }
  if (format === 'csv') {
    const headers = [
      'id',
      'regulator',
      'professionalName',
      'practiceName',
      'complaintType',
      'status',
      'createdAt'
    ];
    const rows = complaints.map((c) => [
      c.id,
      c.regulator || '',
      csvField(c.professionalName),
      csvField(c.practiceName),
      c.complaintType || '',
      c.status,
      c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadText(csv, 'professional-complaints.csv', 'text/csv');
  } else {
    downloadText(
      serializeProfessionalComplaints(complaints),
      'professional-complaints.json',
      'application/json'
    );
  }
}

function csvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('not a list');
      const existing = loadAll();
      const merged = [...existing];
      for (const item of parsed) {
        const c = createComplaintRecord(item);
        if (!merged.find((e) => e.id === c.id)) merged.push(c);
      }
      saveAll(merged);
      statusEl.textContent = `Imported ${parsed.length} complaint(s) locally.`;
      renderAll();
    } catch {
      statusEl.textContent = 'Could not import file. Expected a JSON list of complaints.';
    }
  };
  reader.readAsText(file);
}

function handleClearAll() {
  const complaints = loadAll();
  if (complaints.length === 0) {
    statusEl.textContent = 'No complaints to clear.';
    return;
  }
  if (!confirm(`Delete all ${complaints.length} complaint(s) from this browser?`)) return;
  localStorage.removeItem(STORAGE_KEY);
  activeId = null;
  detailPanel.hidden = true;
  statusEl.textContent = 'All complaints cleared from this browser.';
  renderAll();
}

// ===== Initialise =====
restoreFormDraft();

form.addEventListener('submit', handleAdd);
form.addEventListener('input', saveFormDraft);

// Update categories when regulator changes
const regulatorSelect = form?.querySelector('#regulator');
const categorySelect = form?.querySelector('#complaintType');
regulatorSelect?.addEventListener('change', () => {
  if (categorySelect) {
    categorySelect.innerHTML =
      '<option value="">Select category</option>' +
      renderComplaintCategories(regulatorSelect.value);
  }
});

const exportCsvBtn = document.querySelector('#exportCsv');
const exportJsonBtn = document.querySelector('#exportJson');
const importInput = document.querySelector('#importJson');
const clearAllBtn = document.querySelector('#clearAll');
const loadSampleBtn = document.querySelector('#loadSample');

exportCsvBtn?.addEventListener('click', () => handleExport('csv'));
exportJsonBtn?.addEventListener('click', () => handleExport('json'));
importInput?.addEventListener('change', handleImport);
clearAllBtn?.addEventListener('click', handleClearAll);
loadSampleBtn?.addEventListener('click', () => {
  const sample = [
    createComplaintRecord({
      regulator: 'GMC',
      professionalName: 'Dr John Smith',
      practiceName: 'City Medical Practice',
      practiceAddress: '45 Harley Street, London, W1G 8BT',
      complaintType: 'conduct',
      descriptionOfConcern: 'Misdiagnosis leading to delayed treatment and unnecessary procedures.',
      desiredOutcome: 'Investigation and formal apology',
      complainantName: 'Jane Doe'
    }),
    createComplaintRecord({
      regulator: 'SRA',
      professionalName: 'Ms Sarah Williams',
      practiceName: 'Williams & Co Solicitors',
      practiceAddress: '12 High Street, Manchester, M1 1AE',
      complaintType: 'conduct',
      descriptionOfConcern: 'Failure to communicate and missing critical filing deadlines.',
      desiredOutcome: 'Compensation and disciplinary review',
      complainantName: 'John Smith'
    })
  ];
  const existing = loadAll();
  const merged = [...existing];
  for (const s of sample) {
    if (!merged.find((e) => e.professionalName === s.professionalName)) {
      merged.push(s);
    }
  }
  saveAll(merged);
  statusEl.textContent = 'Loaded sample complaints.';
  renderAll();
});

renderAll();
initTheme('#theme-toggle');

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
