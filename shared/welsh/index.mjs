// shared/welsh/index.mjs

const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', htmlLang: 'en-GB' },
  cy: { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', dir: 'ltr', htmlLang: 'cy' }
};

const UI_STRINGS = {
  en: {
    'app.title': 'Open Access UK',
    'complaint.new': 'New Complaint',
    'complaint.track': 'Track Complaint',
    'letter.generate': 'Generate Letter',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'export': 'Export',
    'language.select': 'Choose language'
  },
  cy: {
    'app.title': 'Open Access UK',
    'complaint.new': 'CWYN Newydd',
    'complaint.track': 'Tracio CWYN',
    'letter.generate': 'Cynhyffyrddu Llythyr',
    'form.submit': 'Cyflwyno',
    'form.cancel': 'Canslo',
    'save': 'Cadw',
    'delete': 'Dileu',
    'export': 'Allforio',
    'language.select': 'Dewiswch iaith'
  }
};

const TEMPLATE_TRANSLATIONS = {
  'complaint-intro': {
    en: {
      greeting: 'Dear Sir/Madam,',
      subject: 'Complaint regarding access to information',
      body: 'I am writing to make a formal complaint about the failure to provide access to information under the Freedom of Information Act 2000.',
      closing: 'Yours faithfully,'
    },
    cy: {
      greeting: 'Annwyl Syr/Foneddiges,',
      subject: 'Cwyn ynghylch mynediad at wybodaeth',
      body: 'Rwy\'n ysgrifennu i wneud cynswm ffurfiol am y methiant i ddarparu mynediad at wybodaeth dan Ddeddf Rhyddid Gwybodaeth 2000.',
      closing: 'Yn gywir,'
    }
  }
};

const WELSH_AUTHORITIES = [
  { id: 'welsh-government', name: 'Llywodraeth Cymru / Welsh Government', type: 'government', subjectToWelshStandards: true },
  { id: 'nhs-wales', name: 'GIG Cymru / NHS Wales', type: 'health', subjectToWelshStandards: true },
  { id: 'nrw', name: 'Cyfoeth Naturiol Cymru / Natural Resources Wales', type: 'environment', subjectToWelshStandards: true },
  { id: 'heddlu-cymru', name: 'Heddlu Cymru / Wales Police', type: 'police', subjectToWelshStandards: true },
  { id: 'swalec', name: 'SWALEC (Welsh water)', type: 'utility', subjectToWelshStandards: true },
  { id: 'welsh-local-authorities', name: 'Cymunedau Lleol Cymru / Welsh Local Authorities', type: 'council', subjectToWelshStandards: true }
];

const LANGUAGE_PREF_KEY = 'open-access-uk:language';

export function getSupportedLanguages() {
  return Object.keys(LANGUAGES);
}

export function getLanguageConfig(lang) {
  return LANGUAGES[lang];
}

export function getUITranslations(lang) {
  return UI_STRINGS[lang] ?? {};
}

export function translate(key, lang) {
  const strings = UI_STRINGS[lang];
  if (!strings) return key;
  return strings[key] ?? key;
}

export function getTemplateTranslations(templateId, lang) {
  const template = TEMPLATE_TRANSLATIONS[templateId];
  if (!template) return {};
  return template[lang] ?? {};
}

export function detectBrowserLanguage() {
  if (typeof globalThis.navigator === 'undefined') return 'en';
  const lang = globalThis.navigator.language ?? '';
  if (lang.startsWith('cy')) return 'cy';
  return 'en';
}

export function getLanguagePreference() {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage.getItem(LANGUAGE_PREF_KEY);
}

export function setLanguagePreference(lang) {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(LANGUAGE_PREF_KEY, lang);
}

export function getWelshAuthorities() {
  return WELSH_AUTHORITIES;
}
