# Case Builder

Browser-only case management tool for UK public-service cases. Combine letters, evidence, deadlines, and journeys into one portable case file. Import from other tools, export to share with an adviser. Everything runs locally in your browser.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser. There is no tracking, account, API call, or form submission.

## Features

- Create and manage cases with title, issue category, organisation, contact details, and key dates.
- Track case status: planning, drafting, sent, awaiting, overdue, escalated, resolved, closed.
- Attach evidence items (documents, emails, letters, photos, screenshots, call logs, forms, invoices) with type, date, and reference.
- Attach letters you drafted in other tools (letter generator, FOI tracker, legal templates) by pasting the body.
- Plan a journey through the Open Access UK suite with suggested steps for common issue categories.
- Mark journey steps as pending, in-progress, completed, or skipped.
- Export hub with multiple output formats:
  - Case summary (Markdown)
  - Evidence manifest (Markdown table)
  - Timeline (Markdown)
  - Handoff pack (combined Markdown)
  - Case file (portable JSON)
  - Letter files (plain text)
  - Evidence list (JSON)
- Import cases from JSON to restore or merge case data.
- Browser-local autosave of form draft and saved cases.
- Light/dark theme toggle.
- Summary dashboard with totals, active count, overdue count, escalated count, and resolved count.
- Status breakdown showing how many cases are in each stage.

## Issue categories

The Case Builder includes suggested journeys for these categories:

- Access or reasonable adjustment
- Complaint or service failure
- Freedom of Information
- Subject access request
- Housing or disrepair
- Consumer or financial
- Travel or transport
- Employment or workplace
- Education or SEND
- Health or social care
- Other

## Portable case file format

Cases can be exported as a JSON file with the schema `open-access-uk:case:v1`. The file includes the full case with evidence, letters, and journey steps. It can be imported back into the Case Builder or read by another tool that supports the schema.

## Source checks

The Case Builder does not generate legal or regulatory content. It is a case management aid. Deadline rules and source framing are informed by GOV.UK, the Information Commissioner's Office, and other public-interest sources used elsewhere in the Open Access UK suite.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides case management support, not legal advice. Verify deadlines, routes, and exemptions against current GOV.UK and specialist guidance. Avoid entering full account numbers, medical records, or other unnecessary sensitive detail into examples you share publicly.
