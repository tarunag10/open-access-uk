# Contributing

Thank you for helping make public services easier to understand, use, and
improve in public.

## Project Structure

This root repository coordinates the public Open Access UK tools through Git
submodules:

- `open-access-uk-site`
- `letter-generator`
- `accessible-forms`
- `public-service-directory`
- `legal-templates`
- `design-system`

Contributor tooling lives in the parent repo at
`contributor-tools/maintainer-helper`.

Clone with submodules:

```sh
git clone --recurse-submodules https://github.com/tarunag10/open-access-uk.git
```

If you already cloned the repo:

```sh
git submodule update --init --recursive
```

## Local Checks

Run the suite verifier from the root:

```sh
node scripts/verify-suite.mjs
```

Run checks in an individual package:

```sh
npm test
npm run build
node --check src/app.js
```

## Contribution Expectations

- Keep tools static and browser-only by default.
- Do not add accounts, analytics, hidden tracking, or backend dependencies
  without a separate privacy review.
- Keep generated letters, templates, forms, and case notes local to the browser.
- Target WCAG 2.2 AA with semantic HTML, visible labels, keyboard support,
  visible focus, responsive layouts, and high contrast.
- Use plain English.
- Add or update tests for behaviour changes.
- Add source provenance for legal, public-service, accessibility, complaint,
  ombudsman, or deadline-related content.

## High-Risk Content

Treat legal and public-service guidance as high risk. Do not imply the project
gives legal advice. Changes to templates, complaint routes, rights, deadlines,
or source-backed public guidance need careful review and source notes.

## Pull Requests

PRs should include:

- Summary
- Why it changed
- Files changed
- Automated test output
- Manual test notes
- Accessibility impact
- Privacy impact
- Screenshots for UI changes
- Source/provenance notes for content changes
