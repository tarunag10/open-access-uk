// Core logic for Case Aggregator tool.
// Re-exports and extends shared/case for this UI. Provides example packs from the suite.

import {
  buildCaseFile,
  composeFromPacks
} from '../../shared/case/index.mjs';

export { buildCaseFile, composeFromPacks };

export const examplePacks = [
  {
    id: 'letter-example',
    title: 'Letter: Reasonable adjustment (university)',
    source: 'letter-generator',
    content: `# Local action pack

Context: University or college - Exams
Issue: exam arrangements
Target follow-up date: 10 June 2026

## Evidence to keep
- [ ] A copy of the sent request...
- [ ] Exam timetable and previous evidence

## Safety checks
- [ ] Check evidence deadlines...

## Next steps
- [ ] Send or save the request...

## Escalation notes
- [ ] Ask for the review or appeal route...`
  },
  {
    id: 'directory-example',
    title: 'Directory: University complaints plan',
    source: 'public-service-directory',
    content: `# University complaints and OIA readiness report

Sector: Education
Readiness: 80%

## Evidence checklist
- [x] Completion of procedures letter
- [ ] Student handbook
- [ ] Timeline

## Blockers
- No obvious blockers...

## Next actions
- Use the university complaints process...
- Official route: https://www.oiahe.org.uk/...`
  },
  {
    id: 'forms-example',
    title: 'Form: Exam adjustment remediation',
    source: 'accessible-forms',
    content: `# Exam adjustment request remediation report

Readiness score: 100% (Ready to reuse)

## Critical
- No issues.

## Warning
- None.

Keep test evidence with the reused form.`
  },
  {
    id: 'template-example',
    title: 'Template pack: University + SAR',
    source: 'legal-templates',
    content: `# Open Access UK template pack

Templates: 2

## University adjustment request
... (full rendered letter with safety)

## Subject access request
... (full rendered)

## Safety notes
- ...`
  }
];

export function getExampleById(id) {
  return examplePacks.find(p => p.id === id);
}

export function buildAggregatorPack(selectedIds = [], customPacks = [], options = {}) {
  const selectedExamples = selectedIds
    .map(id => getExampleById(id))
    .filter(Boolean)
    .map(p => ({ title: p.title, markdown: p.content }));

  const allPacks = [...selectedExamples, ...customPacks.filter(p => p && p.content).map(p => ({ title: p.title, markdown: p.content }))];

  if (allPacks.length === 0) {
    return buildCaseFile({
      title: 'Empty case file',
      context: 'No packs selected. Add examples or paste your own.',
      sections: [],
      sources: [],
      safetyNotes: ['Select or paste at least one pack.']
    });
  }

  return composeFromPacks(allPacks, {
    title: options.title || 'Combined local case file',
    context: options.context || 'Aggregated from letter-generator, public-service-directory, accessible-forms, legal-templates and design-system exports.',
    sources: options.sources || [
      { title: 'Open Access UK shared case foundations', detail: 'Pure browser composition of local packs.', url: 'https://github.com/tarunag10/open-access-uk' }
    ]
  });
}

export function safeCaseFilename(title = 'case-file') {
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug || 'case-file'}.md`;
}
