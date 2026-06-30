import {
  getLanguagePreference,
  setLanguagePreference,
  detectBrowserLanguage,
  getUITranslations,
  getLanguageConfig,
  translate
} from './index.mjs';

const UI_STRINGS = getUITranslations('en');

function getResolvedLanguage() {
  return getLanguagePreference() || detectBrowserLanguage();
}

function applyTranslations(lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = getLanguageConfig(lang)?.htmlLang ?? lang;
  const strings = getUITranslations(lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translated = strings[key] ?? translate(key, lang);
    el.textContent = translated;
  });
}

function createLanguageBanner() {
  const lang = getResolvedLanguage();
  const isCy = lang === 'cy';
  const bannerText = isCy
    ? "Mae'r wefan hon ar gael yn y Gymraeg a'r Saesneg."
    : 'This website is available in Welsh and English.';
  return `<div class="oa-banner" role="banner" style="background:#1d4ed8;color:#fff;padding:8px 16px;font-size:14px;text-align:center;">${bannerText}</div>`;
}

function initLanguageToggle(containerSelector) {
  if (typeof document === 'undefined') return null;
  const container = document.querySelector(containerSelector);
  if (!container) return null;

  const currentLang = getResolvedLanguage();
  const btn = document.createElement('button');
  btn.className = 'oa-language-toggle';
  btn.setAttribute('aria-label', 'Toggle language');
  btn.textContent = currentLang === 'cy' ? 'CY' : 'EN';
  btn.style.cssText = 'background:#2563eb;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:600;font-size:14px;';

  btn.addEventListener('click', () => {
    const current = getResolvedLanguage();
    const next = current === 'en' ? 'cy' : 'en';
    setLanguagePreference(next);
    btn.textContent = next === 'cy' ? 'CY' : 'EN';
    applyTranslations(next);
  });

  container.appendChild(btn);
  return btn;
}

function getTranslations() {
  return UI_STRINGS;
}

export { initLanguageToggle, applyTranslations, createLanguageBanner, getTranslations };
