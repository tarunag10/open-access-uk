# Open Source Maintainer Helper

Checks project readiness and generates contributor-friendly issue ideas for civic and open-source maintainers.

## Demo

Open `index.html` in a browser. This parent-repo contributor tool is intentionally no-backend and keeps user data local to the browser.

Paste repository file names, labels, or visible README signals into the textarea. The helper checks for:

- README
- CONTRIBUTING
- LICENSE
- SECURITY
- CODE_OF_CONDUCT
- accessibility statement
- issue templates
- good-first-issue labels
- roadmap
- screenshots or demo link
- beginner-friendly docs

The browser-only demo returns a readiness score, concrete policy/documentation TODOs, and starter issue suggestions with labels and acceptance-oriented descriptions.

## Roadmap Checklist

The maintainer helper now generates a grouped roadmap checklist while keeping the existing readiness score. Recommendations are grouped by:

- documentation
- accessibility
- security
- community
- demo quality

The grouped helper is exported as `buildMaintainerRoadmap(files)` from `src/helper.js` and returns status, labels, rationale, and acceptance criteria for each maintainer signal.

## Issue And Preset Workflow

The browser UI now supports maintainer export tasks:

- copy GitHub issue markdown for each roadmap recommendation
- copy grouped GitHub issue markdown for a whole roadmap category
- load starter file-list presets for common repo states
- save the current repository file list locally and reload it later
- generate a contributor onboarding pack with a suggested first issue, issue sequence, labels, acceptance criteria, and copyable Markdown
- copy a maintainer action plan that orders the next small repository-health tasks for the current file list
- review a local source freshness dashboard for high-risk, overdue, and due-soon source records

Reusable helpers are exported from `src/helper.js`:

- `buildIssueMarkdown(item)`
- `buildCategoryIssueMarkdown(group)`
- `buildContributorOnboardingPack(files, options)`
- `fileListPresets`
- `buildMaintainerActionPlan(files, options)`
- `analyzeSourceFreshness(records, options)`

## Maintainer use cases

- audit a civic tech repository before inviting new contributors
- create a small backlog of `good first issue` tasks
- spot missing governance and safety files
- make static demos easier for beginners to understand

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides information and drafting support, not legal advice. Users should check deadlines, local rules, and professional advice where needed.
