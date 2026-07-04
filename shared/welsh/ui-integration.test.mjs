import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  initLanguageToggle,
  applyTranslations,
  createLanguageBanner,
  getTranslations
} from './ui-integration.js';

function createMockDocument() {
  const elements = [];
  let htmlLang = '';
  const doc = {
    documentElement: { lang: '' },
    querySelectorAll: (selector) => {
      if (selector === '[data-i18n]') return elements;
      return [];
    },
    querySelector: (selector) => {
      if (selector === '#toggle-container') return containerEl;
      return null;
    },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      style: { cssText: '' },
      _listeners: {},
      addEventListener: (ev, fn) => {
        mockBtn._listeners[ev] = fn;
      },
      setAttribute: () => {},
      getAttribute: () => null
    })
  };
  let containerEl = {
    appendChild: (child) => {
      containerEl._child = child;
    },
    _child: null
  };
  doc._container = containerEl;
  doc._elements = elements;
  const mockBtn = doc.createElement('button');
  doc._mockBtn = mockBtn;
  doc.createElement = () => ({ ...mockBtn, _listeners: {} });
  return doc;
}

let store;
let originalDocument;
let originalLocalStorage;

function setupMocks() {
  store = {};
  originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    }
  };

  globalThis.document = {
    documentElement: { lang: '' },
    querySelectorAll: (selector) => {
      if (selector === '[data-i18n]') {
        return globalThis._mockElements || [];
      }
      return [];
    },
    querySelector: (selector) => {
      if (selector === '#toggle-container') return globalThis._mockContainer;
      return null;
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        style: {},
        _listeners: {},
        addEventListener: (ev, fn) => {
          el._listeners[ev] = fn;
        },
        setAttribute: () => {},
        getAttribute: () => null
      };
      return el;
    }
  };
  globalThis._mockContainer = {
    appendChild: (child) => {
      globalThis._mockContainer._child = child;
    },
    _child: null
  };
  globalThis._mockElements = [];
}

function teardownMocks() {
  if (originalLocalStorage) {
    globalThis.localStorage = originalLocalStorage;
  } else {
    delete globalThis.localStorage;
  }
  delete globalThis.document;
  delete globalThis._mockContainer;
  delete globalThis._mockElements;
}

describe('Welsh UI integration', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('getTranslations', () => {
    it('returns an object with expected keys', () => {
      const t = getTranslations();
      assert.equal(typeof t, 'object');
      assert.equal(t['app.title'], 'Open Access UK');
      assert.equal(t['save'], 'Save');
      assert.equal(t['language.select'], 'Choose language');
    });
  });

  describe('createLanguageBanner', () => {
    it('returns HTML string for English', () => {
      const html = createLanguageBanner();
      assert.equal(typeof html, 'string');
      assert.ok(html.includes('This website is available in Welsh and English.'));
      assert.ok(html.includes('oa-banner'));
    });

    it('returns Welsh text when preference is cy', () => {
      store['open-access-uk:language'] = 'cy';
      const html = createLanguageBanner();
      assert.ok(html.includes("Mae'r wefan hon ar gael yn y Gymraeg a'r Saesneg."));
    });
  });

  describe('applyTranslations', () => {
    it('sets documentElement.lang', () => {
      applyTranslations('en');
      assert.equal(document.documentElement.lang, 'en-GB');
    });

    it('sets Welsh html lang', () => {
      applyTranslations('cy');
      assert.equal(document.documentElement.lang, 'cy');
    });

    it('updates textContent of data-i18n elements', () => {
      const mockEl = {
        getAttribute: (attr) => (attr === 'data-i18n' ? 'save' : null),
        textContent: ''
      };
      globalThis._mockElements = [mockEl];
      applyTranslations('cy');
      assert.equal(mockEl.textContent, 'Cadw');
    });

    it('leaves key as textContent for unknown keys', () => {
      const mockEl = {
        getAttribute: (attr) => (attr === 'data-i18n' ? 'nonexistent.key' : null),
        textContent: ''
      };
      globalThis._mockElements = [mockEl];
      applyTranslations('en');
      assert.equal(mockEl.textContent, 'nonexistent.key');
    });
  });

  describe('initLanguageToggle', () => {
    it('returns null if container not found', () => {
      delete globalThis.document;
      globalThis.document = {
        querySelector: () => null,
        createElement: () => ({ textContent: '', style: {} })
      };
      const result = initLanguageToggle('#nonexistent');
      assert.equal(result, null);
    });

    it('creates a button and appends to container', () => {
      const btn = initLanguageToggle('#toggle-container');
      assert.ok(btn);
      assert.equal(btn.className, 'oa-language-toggle');
      assert.ok(btn.textContent === 'EN' || btn.textContent === 'CY');
    });

    it('defaults to EN text when no preference set', () => {
      const btn = initLanguageToggle('#toggle-container');
      assert.equal(btn.textContent, 'EN');
    });

    it('shows CY when Welsh preference is set', () => {
      store['open-access-uk:language'] = 'cy';
      const btn = initLanguageToggle('#toggle-container');
      assert.equal(btn.textContent, 'CY');
    });

    it('toggles language on click', () => {
      const btn = initLanguageToggle('#toggle-container');
      assert.equal(btn.textContent, 'EN');
      btn._listeners.click();
      assert.equal(btn.textContent, 'CY');
      assert.equal(store['open-access-uk:language'], 'cy');
    });

    it('toggles back to EN on second click', () => {
      const btn = initLanguageToggle('#toggle-container');
      btn._listeners.click();
      btn._listeners.click();
      assert.equal(btn.textContent, 'EN');
      assert.equal(store['open-access-uk:language'], 'en');
    });
  });
});
