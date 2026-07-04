# Contributing

Thank you for helping make public services easier to understand, use, and improve in public.

## Project Structure

This root repository coordinates the Open Access UK toolkit — 23 browser-based tools for UK public-service problems. Tools live either as git submodules (6 repos) or directly in the parent repo (17 tools under `shared/` governance).

**Submodules:** `open-access-uk-site`, `letter-generator`, `accessible-forms`, `public-service-directory`, `legal-templates`, `design-system`

**Parent-tracked tools:** `case-aggregator`, `foi-tracker`, `case-builder`, `uc-sanctions`, `immigration-complaints`, `benefits-appeals`, `eviction-notice-validator`, `send-helper`, `batch-foi`, `deadline-cascade`, `fee-calculator`, `evidence-checker`, `nhs-complaints-tracker`, `ombudsman-outcomes`, `professional-complaints`, `employment-tribunal`, `accessible-formats-request`

**Shared code:** `shared/` contains 30+ domain modules (eviction, employment, deadlines, complaints, appeals, welsh, privacy, exports, case, calendar, readability, search, evidence, collections, dom) and the Claude design language CSS in `shared/claude/`.

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

Validate storage keys are all registered in the privacy registry:

```sh
node scripts/validate-storage-keys.mjs
```

Check for shared-module divergence in inlined tool bundles:

```sh
node scripts/bundle-tool.mjs --all --check
```

## Non-code Contribution Playbooks

This project's biggest need is **domain expertise**, not just code. Here are three ways to contribute without writing JavaScript:

### Review legal content

1. Pick a tool from the [Public repositories table](#public-repositories) (high-risk tools: eviction, employment tribunal, UC sanctions, benefits appeals, immigration complaints)
2. Open `data/sources.yml` and find the source records for that tool
3. Pick one source — check the URL still works, the legislation hasn't changed, and the tool's description matches the source
4. If something is wrong or stale, file an issue using the `content_source.yml` template
5. If everything checks out, add a note with your name and date to the source record (or file a PR)

Good first sources to review: `shared/eviction/index.mjs` (RRA 2025 accuracy), `shared/employment/index.mjs` (ERA 2025 deadlines), `shared/uc-sanctions/index.mjs` (DWP sanction levels)

### Test with a screen reader

1. Open any tool's `index.html` in a browser (Chrome + VoiceOver on Mac, NVDA on Windows)
2. Tab through the full flow: skip link → nav → form fields → submit → results
3. Check: does the skip link work? Are all form labels announced? Are error messages read out? Does the results region get focus?
4. File issues for anything that's confusing, silent, or broken with the label `accessibility`

### Improve wording

1. Read a generated letter or tool guidance section
2. Check: is it in plain English? Would someone in a crisis understand the next step? Does it use "must", "should", "may" correctly?
3. Aim for a reading age of 9–11 (the `shared/readability/` module can score text)
4. File a PR with wording improvements or open an issue with the `content-design` label

## CSS Architecture

The suite uses shared CSS custom properties and components defined in `shared/claude/`. See [docs/css-architecture.md](./docs/css-architecture.md) for the full guide.

Key points:
- Design tokens live in `shared/claude/tokens.css` — colours, spacing, fonts, radii
- Shared components in `shared/claude/components.css` — buttons, cards, forms, header, footer
- Each tool inlines the full shared CSS stack into its `styles.css` then adds tool-specific overrides
- Always use `var(--token-name)` from tokens rather than hard-coded values
- Test both light and dark themes

## Contribution Expectations

- Keep tools static and browser-only by default.
- Do not add accounts, analytics, hidden tracking, or backend dependencies without a separate privacy review.
- Keep generated letters, templates, forms, and case notes local to the browser.
- Target WCAG 2.2 AA with semantic HTML, visible labels, keyboard support, visible focus, responsive layouts, and high contrast.
- Use plain English.
- Add or update tests for behaviour changes.
- Add source provenance for legal, public-service, accessibility, complaint, ombudsman, or deadline-related content.

## High-Risk Content

Treat legal and public-service guidance as high risk. Do not imply the project gives legal advice. Changes to templates, complaint routes, rights, deadlines, or source-backed public guidance need careful review and source notes.

**Bus-factor note:** This is a solo-maintainer project. If the maintainer disappears, deployed tools will continue running (static hosting, no backend), but content will not be reviewed or updated. The `data/sources.yml` freshness workflow will automatically flag stale content after the review-due date passes. If you rely on these tools, consider forking, contributing domain reviews, or helping recruit additional maintainers.

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
