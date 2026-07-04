/**
 * backfill-governance.mjs
 *
 * Stamps README.md, ACCESSIBILITY.md, LICENSE, and updated package.json
 * onto every unregistered tool directory that is missing them.
 *
 * Run:  node scripts/backfill-governance.mjs
 * Dry run:  DRY_RUN=1 node scripts/backfill-governance.mjs
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Tools to register
// ---------------------------------------------------------------------------

const tools = [
  {
    dir: 'uc-sanctions',
    title: 'UC Sanctions Challenge',
    description:
      'Browser-only tool to challenge Universal Credit sanctions. Generate representations, track mandatory reconsideration windows, and prepare for tribunal appeals.',
  },
  {
    dir: 'immigration-complaints',
    title: 'Immigration Complaint Tool',
    description:
      'Browser-only immigration complaint drafting tool. Structure complaints about UKVI, Home Office case handling, detention conditions, and legal representative conduct.',
  },
  {
    dir: 'benefits-appeals',
    title: 'Benefits Appeals Helper',
    description:
      'Browser-only preparation tool for benefit appeal hearings. Track mandatory reconsideration deadlines, organise grounds of appeal, and build submission packs for tribunals.',
  },
  {
    dir: 'eviction-notice-validator',
    title: 'Eviction Notice Validator',
    description:
      'Browser-only eviction notice checker for private renters in England. Validate section 21 and section 8 notice forms, dates, and deposit protection requirements.',
  },
  {
    dir: 'send-helper',
    title: 'School SEND Helper',
    description:
      'Browser-only tool for parents and advocates navigating the Special Educational Needs and Disabilities (SEND) system. Draft EHCNA requests, track deadlines, and prepare for annual reviews.',
  },
  {
    dir: 'batch-foi',
    title: 'Multi-Authority FOI Batch Tool',
    description:
      'Browser-only batch Freedom of Information request tool. Send the same request template to multiple public authorities and track responses in one place.',
  },
  {
    dir: 'deadline-cascade',
    title: 'Deadline Cascade Visualizer',
    description:
      'Browser-only deadline cascade visualizer for UK public-law challenges and complaints. Map statutory, ombudsman, and judicial review time limits across connected routes.',
  },
  {
    dir: 'fee-calculator',
    title: 'Court and Tribunal Fee Calculator',
    description:
      'Browser-only fee calculator for UK courts and tribunals. Lookup fees for employment tribunal, immigration, property chamber, and general civil claims.',
  },
  {
    dir: 'evidence-checker',
    title: 'Evidence Upload Readiness Checker',
    description:
      'Browser-only evidence readiness checker. Verify that documents are complete, labelled, formatted, and admissible before uploading to a tribunal or ombudsman portal.',
  },
  {
    dir: 'nhs-complaints-tracker',
    title: 'NHS Complaints Tracker',
    description:
      'Browser-only NHS complaints tracking tool. Log complaints with GP surgeries, hospital trusts, and ICBs. Track stages from local resolution to the Parliamentary and Health Service Ombudsman.',
  },
  {
    dir: 'ombudsman-outcomes',
    title: 'Ombudsman Outcomes Database',
    description:
      'Browser-only reference tool for UK ombudsman decisions. Browse and search outcome summaries from the Parliamentary and Health Service Ombudsman, Local Government and Social Care Ombudsman, and others.',
  },
  {
    dir: 'professional-complaints',
    title: 'Professional Complaints Router',
    description:
      'Browser-only router for professional regulation complaints. Identify the correct regulator for solicitors, doctors, nurses, teachers, surveyors, and other regulated professionals in the UK.',
  },
  {
    dir: 'employment-tribunal',
    title: 'Employment Tribunal Case Builder',
    description:
      'Browser-only employment tribunal case builder. Draft an ET1 claim form, organise evidence chronologically, track early conciliation dates, and prepare for preliminary hearings.',
  },
  {
    dir: 'accessible-formats-request',
    title: 'Accessible Formats Request Generator',
    description:
      'Browser-only generator for accessible-format requests under the Equality Act 2010. Draft letters asking for Braille, large print, easy read, BSL, audio, or accessible PDFs from public bodies and service providers.',
  },
];

// ---------------------------------------------------------------------------
// Template factories
// ---------------------------------------------------------------------------

function readmeTemplate({ dir, title, description }) {
  const displayName = title;
  return `# ${displayName}

${description}

## Demo

Open \`index.html\` in a browser. This repository is intentionally no-backend and keeps user data local to the browser. There is no tracking, account, API call, or form submission.

## Features

- ${description.replace(/\.$/, '')}.
- Browser-local persistence: your data stays on your device in \`localStorage\`.
- Share and export: copy or download a summary of your work for case records and adviser handoff.
- Light/dark theme toggle.

## Source checks

Starter content is informed by publicly available UK government guidance, legislation, and ombudsman or regulator publications. Contributors should link to an official or specialist public-interest source when adding new routes, grounds, or body types.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled \`good first issue\`

## Safety note

This project provides information and drafting support, not legal advice. Verify deadlines, grounds, and procedures against current official guidance. Avoid entering full account numbers, medical records, or other unnecessary sensitive detail into examples you share publicly.
`;
}

function accessibilityTemplate() {
  return `# Accessibility Statement

This project aims to meet WCAG 2.2 AA. The current build uses semantic HTML, visible focus styles, labelled controls, high contrast colours, and responsive layouts.

Known gaps should be filed as issues with the label \`accessibility\`.
`;
}

function licenseTemplate() {
  return `MIT License

Copyright (c) 2026 Open Access UK contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function packageJsonTemplate(dir, existing) {
  return {
    ...existing,
    name: existing.name || dir,
    version: '0.1.0',
    private: false,
    license: 'MIT',
    scripts: {
      ...(existing.scripts || {}),
      test: 'node --test',
      build: 'echo \'Static site — no build step required\'',
    },
  };
}

// ---------------------------------------------------------------------------
// Script
// ---------------------------------------------------------------------------

const isDryRun = process.env.DRY_RUN === '1';

let changed = 0;

for (const tool of tools) {
  const toolDir = join(root, tool.dir);
  const readmePath = join(toolDir, 'README.md');
  const accessibilityPath = join(toolDir, 'ACCESSIBILITY.md');
  const licensePath = join(toolDir, 'LICENSE');
  const packagePath = join(toolDir, 'package.json');

  if (!existsSync(toolDir)) {
    console.log(`  SKIP  ${tool.dir}  (directory not found)`);
    continue;
  }

  const actions = [];

  // ---- README.md ----
  if (!existsSync(readmePath)) {
    actions.push('README.md');
    if (!isDryRun) {
      writeFileSync(readmePath, readmeTemplate(tool), 'utf8');
    }
  }

  // ---- ACCESSIBILITY.md ----
  if (!existsSync(accessibilityPath)) {
    actions.push('ACCESSIBILITY.md');
    if (!isDryRun) {
      writeFileSync(accessibilityPath, accessibilityTemplate(), 'utf8');
    }
  }

  // ---- LICENSE ----
  if (!existsSync(licensePath)) {
    actions.push('LICENSE');
    if (!isDryRun) {
      writeFileSync(licensePath, licenseTemplate(), 'utf8');
    }
  }

  // ---- package.json ----
  const existingPkg = existsSync(packagePath)
    ? JSON.parse(readFileSync(packagePath, 'utf8'))
    : { type: 'module' };

  const updatedPkg = packageJsonTemplate(tool.dir, existingPkg);

  // Detect whether the file would actually change
  const currentRaw = existsSync(packagePath) ? readFileSync(packagePath, 'utf8') : '';
  const updatedRaw = JSON.stringify(updatedPkg, null, 2) + '\n';

  if (currentRaw !== updatedRaw) {
    actions.push(`package.json (${Object.keys(updatedPkg).length} keys)`);
    if (!isDryRun) {
      writeFileSync(packagePath, updatedRaw, 'utf8');
    }
  }

  if (actions.length > 0) {
    console.log(`  ${isDryRun ? 'WOULD' : '  OK'}  ${tool.dir}  —  ${actions.join(', ')}`);
    changed++;
  } else {
    console.log(`  ---  ${tool.dir}  (already complete)`);
  }
}

console.log(`\n${isDryRun ? 'Would touch' : 'Touched'} ${changed} of ${tools.length} tool directories.`);

if (isDryRun) {
  console.log('Run without DRY_RUN to apply changes.');
}
