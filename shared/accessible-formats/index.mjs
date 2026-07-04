const FORMATS = [
  {
    id: 'braille',
    name: 'Braille',
    description: 'Grade 2 (Contracted) Braille',
    supplier: 'RNIB',
    source: 'rnib-braille-standards',
    minLeadTime: '2 weeks'
  },
  {
    id: 'large-print',
    name: 'Large Print',
    description: 'Minimum 16pt font, sans-serif, high contrast',
    supplier: 'RNIB',
    source: 'rnib-large-print',
    minLeadTime: '1 week'
  },
  {
    id: 'audio',
    name: 'Audio Format',
    description: 'MP3 or DAISY format with clear narration',
    supplier: 'RNIB',
    source: 'rnib-audio',
    minLeadTime: '1 week'
  },
  {
    id: 'easy-read',
    name: 'Easy Read',
    description: 'Simplified language, images, Mencap standards',
    supplier: 'Mencap',
    source: 'mencap-easy-read',
    minLeadTime: '2 weeks'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Electronic format via email',
    supplier: 'Self',
    source: 'accessibility-act',
    minLeadTime: 'Immediate'
  },
  {
    id: 'telephone',
    name: 'Telephone',
    description: 'Information provided over the phone',
    supplier: 'Self',
    source: 'accessibility-act',
    minLeadTime: 'Immediate'
  },
  {
    id: 'bsl',
    name: 'British Sign Language',
    description: 'BSL interpreter or video relay',
    supplier: 'RNID',
    source: 'rnid-bsl',
    minLeadTime: '1 week'
  },
  {
    id: 'welsh',
    name: 'Welsh Language',
    description: 'Cymraeg / Welsh language format',
    supplier: 'Welsh Language Commissioner',
    source: 'welsh-language-standards',
    minLeadTime: '1 week'
  }
];

const FORMAT_REQUIREMENTS = {
  braille: [
    'Grade 2 (Contracted) Braille',
    'Nemeth code for mathematics',
    'Proper formatting with line spacing',
    'Cover sheet with print and Braille'
  ],
  'large-print': [
    'Minimum 16pt sans-serif font (Arial or Verdana)',
    'High contrast black on white or yellow',
    'Left-aligned text, no justified alignment',
    'Minimum 1.5 line spacing'
  ],
  audio: [
    'MP3 or DAISY format',
    'Clear, slow narration',
    'Consistent volume levels',
    'Track markers for navigation'
  ],
  'easy-read': [
    'Simplified language at reading age 8-9',
    'One idea per sentence',
    'Supporting images on each page',
    'Mencap Easy Read standards',
    'Clear layout with white space'
  ],
  email: [
    'Accessible HTML or plain text',
    'Descriptive subject line',
    'Structured headings',
    'Alt text for images'
  ],
  telephone: [
    'Dedicated phone line or callback',
    'Clear, slow speech',
    'Written summary available on request'
  ],
  bsl: [
    'Qualified BSL interpreter',
    'Video relay service available',
    'British Sign Language video recording'
  ],
  welsh: [
    'Translated by certified Welsh translator',
    'Cymraeg formatting standards',
    'Welsh Language Commissioner compliance'
  ]
};

const ORGANISATION_ROUTES = {
  braille: {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for transcription'
  },
  'large-print': {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for large print conversion'
  },
  audio: {
    name: 'RNIB (Royal National Institute of Blind People)',
    website: 'https://www.rnib.org.uk',
    process: 'Submit document for audio recording'
  },
  'easy-read': {
    name: 'Mencap',
    website: 'https://www.mencap.org.uk',
    process: 'Submit document for Easy Read adaptation'
  },
  email: {
    name: 'Self (organisations own email)',
    website: null,
    process: 'Request electronic copy via email'
  },
  telephone: {
    name: 'Self (organisations phone line)',
    website: null,
    process: 'Request telephone information directly'
  },
  bsl: {
    name: 'RNID (Royal National Institute for Deaf People)',
    website: 'https://rnid.org.uk',
    process: 'Arrange BSL interpreter or video relay'
  },
  welsh: {
    name: 'Welsh Language Commissioner',
    website: 'https://www.welshlanguagecommissioner.wales',
    process: 'Request Welsh language format'
  }
};

export function getFormats() {
  return [...FORMATS];
}

export function getFormatDetails(formatId) {
  const format = FORMATS.find((f) => f.id === formatId);
  return format ? { ...format } : null;
}

export function generateRequestText(data) {
  const lines = [];
  lines.push('Accessible Format Request');
  lines.push('');
  lines.push(`To: ${data.organisationName}`);
  lines.push('');
  lines.push(`From: ${data.requestorName}`);
  lines.push(`Address: ${data.requestorAddress}`);
  lines.push('');
  lines.push(`Requested Format: ${data.format}`);
  lines.push(
    `Documents: ${Array.isArray(data.documents) ? data.documents.join(', ') : data.documents}`
  );
  lines.push(`Deadline: ${data.deadline}`);
  lines.push('');
  if (data.reason) {
    lines.push(`Reason: ${data.reason}`);
  }
  lines.push('');
  lines.push('This request is made under the Equality Act 2010, which requires public');
  lines.push(
    'authorities to provide information in accessible formats as a reasonable adjustment.'
  );
  lines.push('');
  lines.push('Please confirm receipt of this request and provide a timeline for delivery.');
  return lines.join('\n');
}

export function getFormatRequirements(formatId) {
  const reqs = FORMAT_REQUIREMENTS[formatId];
  return reqs ? [...reqs] : [];
}

export function getOrganisationRoutes(formatId) {
  const route = ORGANISATION_ROUTES[formatId];
  return route ? { ...route } : null;
}

export function getEqualityActRights() {
  return {
    title: 'Equality Act 2010 - Reasonable Adjustments',
    description:
      'Under the Equality Act 2010, public authorities must make reasonable adjustments to ensure disabled people are not placed at a substantial disadvantage.',
    rights: [
      'Right to request information in an accessible format',
      'Right to reasonable adjustments without charge',
      'Right to receive information within a reasonable timeframe',
      'Right to complain to the Equality and Human Rights Commission if rights are not upheld'
    ]
  };
}

export function getMonitoringInfo() {
  return {
    name: 'Equality and Human Rights Commission',
    description:
      'The Equality and Human Rights Commission (EHRC) monitors and enforces equality legislation in England, Scotland and Wales.',
    website: 'https://www.equalityhumanrights.com',
    complaintProcess:
      'You can contact the EHRC if your reasonable adjustment rights under the Equality Act 2010 are not being met.'
  };
}

export function serializeAccessibleFormats(value) {
  return JSON.stringify(value);
}

export function parseAccessibleFormats(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
