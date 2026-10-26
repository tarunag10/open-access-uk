# Employment Tribunal Case Builder

Browser-only employment tribunal case builder. Draft an ET1 claim form, organise evidence chronologically, track early conciliation dates, and prepare for preliminary hearings.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser. There is no tracking, account, API call, or form submission.

## Features

- Browser-only employment tribunal case builder. Draft an ET1 claim form, organise evidence chronologically, track early conciliation dates, and prepare for preliminary hearings.
- Browser-local persistence: your data stays on your device in `localStorage`.
- Share and export: copy or download a summary of your work for case records and adviser handoff.
- Light/dark theme toggle.
- Displays calculated deadline dates in a readable form and adjusts the ordinary deadline period for the 1 October 2026 transition.
- Shows a qualified basic award estimate for unfair dismissal claims when the required inputs are present. It applies the age bands, 20-year limit, and applicable weekly-pay cap; it does not estimate compensatory loss or a total remedy.

## Source checks

Starter content is informed by publicly available UK government guidance, legislation, and ombudsman or regulator publications. Contributors should link to an official or specialist public-interest source when adding new routes, grounds, or body types.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides information and drafting support, not legal advice. Verify deadlines, grounds, and procedures against current official guidance. Avoid entering full account numbers, medical records, or other unnecessary sensitive detail into examples you share publicly.

## Legal calculation references

- [ACAS: Employment tribunal time limits](https://www.acas.org.uk/employment-tribunal-time-limits) explains the 1 October 2026 transition and the usual “months less one day” calculation, including pre-existing claim-specific limits.
- [Employment Rights Act 1996, sections 119–124](https://www.legislation.gov.uk/ukpga/1996/18/part/X/chapter/II) sets the basic award age bands and related provisions.
- [Employment Rights (Increase of Limits) Order 2026](https://www.legislation.gov.uk/uksi/2026/310/made) sets the £751 weekly-pay limit from 6 April 2026. The prior limit used here is £719 for dates from 6 April 2025 to 5 April 2026.
- [GOV.UK: Statutory redundancy pay](https://www.gov.uk/redundancy-your-rights/redundancy-pay) describes the age multipliers and 20-year service cap. The tribunal basic-award estimate uses the same statutory multipliers but does not establish entitlement or account for case-specific adjustments.
