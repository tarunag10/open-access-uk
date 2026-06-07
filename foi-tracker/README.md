# FOI Response Tracker

Browser-only Freedom of Information request tracker for UK public authorities. Add requests, see 20-working-day deadlines, generate internal review and ICO complaint letters, and export your case data. Everything runs locally in your browser.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser. There is no tracking, account, API call, or form submission.

## Features

- Track FOI requests across central government, local councils, NHS bodies, police, education, housing, and other public bodies.
- Status tracking: drafting, sent, acknowledged, partial, responded, refused, overdue, escalated, closed.
- Automatic 20-working-day deadline calculation with overdue detection.
- Summary dashboard with totals, active count, overdue count, escalated count, and responded count.
- Status breakdown showing how many requests are in each stage.
- Mid-window reminder (14 working days) and deadline reminder (20 working days) calendar events as `.ics` downloads.
- Internal review letter generator (request to the authority).
- ICO complaint letter generator (complaint to the Information Commissioner's Office).
- Handoff pack (Markdown) with request summary, response notes, escalation notes, and suggested next steps.
- Local action pack (Markdown) with evidence to keep, safety checks, and action checklist.
- Export to CSV or JSON for case management and adviser handoff.
- Import from JSON to restore or merge case data.
- Browser-local autosave of form draft and saved requests.
- Light/dark theme toggle.

## Source checks

Deadline rules and source framing are informed by:

- GOV.UK Freedom of Information request guidance
- Information Commissioner's Office (ICO) guidance on FOI complaints
- Working-day calculations follow UK public-sector convention (excluding weekends; bank holidays are not currently modelled in this MVP)

Contributors should link to an official or specialist public-interest source when adding new authority types or escalation routes.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides drafting and tracking support, not legal advice. Verify deadlines, exemption claims, and escalation routes against the current GOV.UK and ICO guidance. Avoid entering full account numbers, medical records, or other unnecessary sensitive detail into examples you share publicly.
