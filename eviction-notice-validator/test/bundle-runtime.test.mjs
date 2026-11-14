import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the generated delivery, not just the source modules: stripped nested
// imports previously left missing date and theme functions invisible to unit tests.
function boot() {
  const elements = new Map();
  function element() {
    return {
      value: '',
      hidden: false,
      textContent: '',
      innerHTML: '',
      dataset: {},
      elements: { namedItem: () => null },
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener() {},
      setAttribute() {},
      getAttribute() {
        return null;
      },
      append() {},
      appendChild() {},
      replaceChildren() {},
      focus() {}
    };
  }
  const context = vm.createContext({
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, element());
        return elements.get(selector);
      },
      createElement: element,
      documentElement: element(),
      body: element()
    },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { matchMedia: () => ({ matches: false }), addEventListener() {} },
    console,
    queueMicrotask,
    setTimeout,
    clearTimeout
  });
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  // app.js is a browser ES module; export declarations do not affect execution.
  vm.runInContext(source.replace(/^export\s*\{[^}]+\};?/gm, ''), context);
  return context;
}
test('generated browser bundle starts and validates Ground 14 without missing globals', () => {
  const context = boot();
  const result = vm.runInContext(
    `validateSection8({ ground: 'ground14', tenancyType: 'private-assured', noticeServedDate: '2026-05-01', noticeForm: 'form3a', serviceMethod: 'personal', nuisanceDescription: 'Reported nuisance' })`,
    context
  );
  assert.equal(result.valid, true);
  assert.equal(result.earliestOrderDate, '2026-05-15');
});
test('generated bundle uses the same fortnightly Ground 8 monetary rule', () => {
  const context = boot();
  assert.equal(
    vm.runInContext(
      `validateSection8({ ground: 'ground8', tenancyType: 'private-assured', noticeServedDate: '2026-05-01', possessionDate: '2026-05-29', noticeForm: 'form3a', serviceMethod: 'personal', rentFrequency: 'fortnightly', rentAmount: 200, arrearsAmountAtNotice: 1300, arrearsAmountAtHearing: 1300, qualifyingUcArrearsAtNotice: 0, qualifyingUcArrearsAtHearing: 0 }).valid`,
      context
    ),
    true
  );
});
