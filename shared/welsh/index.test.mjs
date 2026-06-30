import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSupportedLanguages,
  getLanguageConfig,
  getUITranslations,
  translate,
  getTemplateTranslations,
  detectBrowserLanguage,
  getLanguagePreference,
  setLanguagePreference,
  getWelshAuthorities
} from './index.mjs';

describe('Welsh language support', () => {
  describe('getSupportedLanguages', () => {
    it('returns en and cy', () => {
      const langs = getSupportedLanguages();
      assert.deepEqual(langs, ['en', 'cy']);
    });
  });

  describe('getLanguageConfig', () => {
    it('returns English config', () => {
      const config = getLanguageConfig('en');
      assert.equal(config.code, 'en');
      assert.equal(config.name, 'English');
      assert.equal(config.nativeName, 'English');
      assert.equal(config.dir, 'ltr');
      assert.equal(config.htmlLang, 'en-GB');
    });

    it('returns Welsh config', () => {
      const config = getLanguageConfig('cy');
      assert.equal(config.code, 'cy');
      assert.equal(config.name, 'Welsh');
      assert.equal(config.nativeName, 'Cymraeg');
      assert.equal(config.dir, 'ltr');
      assert.equal(config.htmlLang, 'cy');
    });

    it('returns undefined for unsupported language', () => {
      const config = getLanguageConfig('fr');
      assert.equal(config, undefined);
    });
  });

  describe('getUITranslations', () => {
    it('returns English translations', () => {
      const t = getUITranslations('en');
      assert.equal(t['app.title'], 'Open Access UK');
      assert.equal(t['complaint.new'], 'New Complaint');
      assert.equal(t['form.submit'], 'Submit');
    });

    it('returns Welsh translations', () => {
      const t = getUITranslations('cy');
      assert.equal(t['app.title'], 'Open Access UK');
      assert.equal(t['complaint.new'], 'CWYN Newydd');
      assert.equal(t['form.submit'], 'Cyflwyno');
    });

    it('returns empty object for unknown language', () => {
      const t = getUITranslations('fr');
      assert.deepEqual(t, {});
    });
  });

  describe('translate', () => {
    it('translates a key to English', () => {
      assert.equal(translate('app.title', 'en'), 'Open Access UK');
      assert.equal(translate('save', 'en'), 'Save');
    });

    it('translates a key to Welsh', () => {
      assert.equal(translate('app.title', 'cy'), 'Open Access UK');
      assert.equal(translate('save', 'cy'), 'Cadw');
    });

    it('returns key itself for unknown key', () => {
      assert.equal(translate('unknown.key', 'en'), 'unknown.key');
    });

    it('returns key itself for unsupported language', () => {
      assert.equal(translate('save', 'fr'), 'save');
    });
  });

  describe('getTemplateTranslations', () => {
    it('returns template translations for a given template id and lang', () => {
      const result = getTemplateTranslations('complaint-intro', 'en');
      assert.equal(typeof result, 'object');
      assert.ok('greeting' in result || 'subject' in result || 'body' in result);
    });

    it('returns Welsh translations for template', () => {
      const result = getTemplateTranslations('complaint-intro', 'cy');
      assert.equal(typeof result, 'object');
    });

    it('returns empty object for unknown template', () => {
      const result = getTemplateTranslations('nonexistent', 'en');
      assert.deepEqual(result, {});
    });
  });

  describe('detectBrowserLanguage', () => {
    let originalNavigator;

    beforeEach(() => {
      originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    });

    afterEach(() => {
      if (originalNavigator) {
        Object.defineProperty(globalThis, 'navigator', originalNavigator);
      } else {
        try { delete globalThis.navigator; } catch {}
      }
    });

    it('returns cy when navigator.language starts with cy', () => {
      Object.defineProperty(globalThis, 'navigator', { value: { language: 'cy-GB' }, configurable: true });
      assert.equal(detectBrowserLanguage(), 'cy');
    });

    it('returns en when navigator.language starts with en', () => {
      Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US' }, configurable: true });
      assert.equal(detectBrowserLanguage(), 'en');
    });

    it('returns en as default fallback', () => {
      Object.defineProperty(globalThis, 'navigator', { value: { language: 'fr-FR' }, configurable: true });
      assert.equal(detectBrowserLanguage(), 'en');
    });

    it('returns en when navigator is undefined', () => {
      delete globalThis.navigator;
      assert.equal(detectBrowserLanguage(), 'en');
    });
  });

  describe('language preference persistence', () => {
    let store;

    beforeEach(() => {
      store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] ?? null,
        setItem: (key, val) => { store[key] = String(val); },
        removeItem: (key) => { delete store[key]; }
      };
    });

    afterEach(() => {
      delete globalThis.localStorage;
    });

    it('returns null when no preference is set', () => {
      assert.equal(getLanguagePreference(), null);
    });

    it('persists and retrieves a language preference', () => {
      setLanguagePreference('cy');
      assert.equal(getLanguagePreference(), 'cy');
    });

    it('persists English preference', () => {
      setLanguagePreference('en');
      assert.equal(getLanguagePreference(), 'en');
    });
  });

  describe('getWelshAuthorities', () => {
    it('returns a non-empty array', () => {
      const authorities = getWelshAuthorities();
      assert.ok(Array.isArray(authorities));
      assert.ok(authorities.length > 0);
    });

    it('includes Welsh Government', () => {
      const authorities = getWelshAuthorities();
      const wg = authorities.find(a => a.id === 'welsh-government');
      assert.ok(wg, 'should include welsh-government');
      assert.equal(wg.type, 'government');
      assert.equal(wg.subjectToWelshStandards, true);
    });

    it('includes NHS Wales', () => {
      const authorities = getWelshAuthorities();
      const nhs = authorities.find(a => a.id === 'nhs-wales');
      assert.ok(nhs, 'should include nhs-wales');
      assert.equal(nhs.type, 'health');
    });

    it('all authorities are subject to Welsh standards', () => {
      const authorities = getWelshAuthorities();
      for (const a of authorities) {
        assert.equal(a.subjectToWelshStandards, true, `${a.id} should be subject to Welsh standards`);
        assert.equal(typeof a.id, 'string');
        assert.equal(typeof a.name, 'string');
        assert.equal(typeof a.type, 'string');
      }
    });
  });
});
