# Case Aggregator

Browser-only tool to compose local "case files" and action packs by combining outputs from letter generator, legal templates, public service directory, accessible forms, and design system. Keeps everything in the browser with no backend.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser.

Paste or select example packs from other Open Access UK tools (or your own exported text/Markdown), then generate a unified case file with:

- Combined evidence checklist
- Timeline / next steps
- Safety notes
- Current source notes
- Downloadable Markdown or text pack

The core composer is exported as `buildCaseFile(options)` and `composeFromPacks(packs, options)` from `src/aggregator.js` (re-exports and extends `shared/case`).

## Features

- Pre-loaded example packs from the suite (letter, directory plan, form remediation, template bundle, design handoff).
- Paste custom pack text (Markdown or plain) from any tool.
- Compose into single case file with deduped sections, privacy header, and provenance.
- Local copy, .md / .txt download with safe filename.
- Browser print.
- Reusable helpers for future surfaces or integration.

## Shared foundations

Uses and demonstrates `shared/case/index.mjs` for composition, plus `shared/exports`, privacy registry, etc. This makes the aggregator a reference implementation for combining local artifacts across the suite.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides information and drafting support, not legal advice. Users should check deadlines, local rules, and professional advice where needed. Only combine packs you have reviewed for sensitive content.
