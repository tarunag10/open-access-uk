# Roadmap

## Shipped (Phase 1 UK Market Expansion)

- NHS Complaints Tracker — track complaints through PALS, formal, and PHSO stages with deadline management and escalation letters.
- Benefits Appeals Helper — generate mandatory reconsideration requests and tribunal appeals for PIP, Universal Credit, and ESA.
- Parking Appeal Generator — integrated into letter generator for council and private operator PCN appeals.
- School SEND Helper — challenge exclusions, SEND tribunal applications, and EHCP disputes.
- Right to Repair Tracker — integrated into case builder for social housing repair deadlines and Housing Ombudsman escalation.
- Shared engines: complaints, appeals, parking, send-appeals, repairs modules with 105+ tests.

## Shipped (Phase 2 UK Market Expansion)

- Employment Tribunal Case Builder — ET1 claim builder for unfair dismissal, discrimination, and unpaid wages with ACAS conciliation tracker and remedy calculator.
- Eviction Notice Validator — validate Section 21 and Section 8 eviction notices, check deposit protection, generate challenge letters.
- Pre-Action Protocol Generator — integrated into letter generator for housing disrepair, debt, personal injury, and professional negligence letter of claim.
- UC Sanctions Challenge — challenge Universal Credit sanctions, generate MR requests, check hardship payment eligibility.
- Welsh Language Integration — EN/CY language toggle, UI translations, Welsh authorities directory.
- Shared engines: employment, eviction, protocols, uc-sanctions, welsh modules with 145+ tests.

## Shipped (Phase 3 UK Market Expansion)

- Multi-Authority FOI Batch Tool — send identical FOI to multiple councils/NHS trusts with per-authority deadline tracking and CSV export.
- Deadline Cascade Visualizer — see multi-step processes as timelines (FOI, NHS, housing, benefits, parking) with status indicators and ICS export.
- Evidence Upload Readiness Checker — validate evidence files against tribunal requirements (size, format, redaction).
- Email-to-Case Parser — integrated into case builder for extracting reference numbers, deadlines, and authority info from emails.
- Shared engines: batch-foi, cascade, evidence-upload, email-parser modules with 98+ tests.

## Shipped (Phase 4 UK Market Expansion)

- Immigration Complaint Tool — complain about Home Office visa delays, BRP issues, and immigration matters with ICIBI escalation.
- Professional Complaints Router — complain about doctors (GMC), solicitors (SRA), accountants, and other regulated professionals.
- Court and Tribunal Fee Calculator — calculate county court, employment tribunal, and immigration tribunal fees with help-with-fees eligibility.
- Accessible Formats Request Generator — request braille, large print, audio, and Easy Read formats under Equality Act 2010.
- Ombudsman Outcomes Database — anonymized outcome data, compensation ranges, and decision timescales for 11 UK ombudsmen.
- Shared engines: immigration, professional-complaints, fees-calculator, accessible-formats, ombudsman-outcomes modules with 152+ tests.

## Now

- Keep the public toolkit static, privacy-first, and accessible.
- Strengthen governance, support, security, and contribution routes.
- Add CI and quality gates for the root suite.
- Improve metadata, security headers, SEO, and source provenance.
- Phase 5: Local Authority Performance Lookup, Community Contribution Platform, Advanced Search and Filtering.

## Later

- Evaluate shared metadata and design-token registries.
- Add release automation.
- Add optional privacy-preserving analytics only if reviewed and off by default.
- Consider workspace or monorepo changes only if submodule coordination becomes
  a real blocker.

## Non-Goals

- No backend by default.
- No analytics by default.
- No storing generated letters, templates, forms, evidence, or case notes on a
  server.
- No legal-advice claims.
