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

export function getRegulators() {
  return [...REGULATORS];
}

export function getRegulatorDetails(regulatorId) {
  const regulator = REGULATORS.find((r) => r.id === regulatorId);
  return regulator ? { ...regulator } : null;
}

export function generateComplaintText(data) {
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

export function getComplaintDeadlines(regulatorId) {
  const regulator = REGULATORS.find((r) => r.id === regulatorId);
  if (!regulator) return null;
  return {
    regulatorId: regulator.id,
    regulatorName: regulator.name,
    note: regulator.deadlineNote
  };
}

export function getFitnessToPractiseProcess(regulatorId) {
  return [...(FITNESS_TO_PRACTISE_PROCESSES[regulatorId] || [])];
}

export function getComplaintCategories(regulatorId) {
  return [...(COMPLAINT_CATEGORIES[regulatorId] || [])];
}

export function serializeProfessionalComplaints(value) {
  return JSON.stringify(value);
}

export function parseProfessionalComplaints(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
