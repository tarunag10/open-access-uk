import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMarkdownDocument,
  createPrintDocument,
  createTextExport,
  safeFilename
} from './index.mjs';

test('creates safe filenames and text exports', () => {
  assert.equal(
    safeFilename('FOI request: Council / Housing', 'md'),
    'foi-request-council-housing.md'
  );
  const exported = createTextExport('Complaint follow up', 'Hello', { extension: 'md' });
  assert.equal(exported.filename, 'complaint-follow-up.md');
  assert.equal(exported.mimeType, 'text/markdown;charset=utf-8');
  assert.equal(exported.content, 'Hello\n');
});

test('creates markdown and print documents', () => {
  const markdown = createMarkdownDocument('Evidence pack', [
    { heading: 'Evidence', items: ['Photo', 'Email'] }
  ]);
  assert.match(markdown, /^# Evidence pack/);
  assert.match(markdown, /- Photo/);

  const printDoc = createPrintDocument('Pack', markdown);
  assert.equal(printDoc.generatedLocally, true);
  assert.match(printDoc.privacyNote, /Nothing was sent/);
});
