# Open Access UK

[![CI](https://github.com/tarunag10/open-access-uk/actions/workflows/ci.yml/badge.svg)](https://github.com/tarunag10/open-access-uk/actions/workflows/ci.yml)
[![wcag](https://img.shields.io/badge/WCAG-2.2%20AA-blue)](https://www.w3.org/TR/WCAG22/)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Free, browser-based tools for when a UK public service, landlord, or employer gets it wrong.** Draft the letter, know the deadline, keep the evidence — all in your browser, nothing leaves your device.

The suite is deliberately static and browser-only. Open any `index.html`, fill in the form, and everything stays on your computer. No accounts, no tracking, no backend. These tools provide information and drafting support, not legal advice.

## What you can do

- **Draft a letter** — FOI requests, SARs, reasonable adjustments, eviction challenges, complaint letters, pre-action protocols
- **Check a deadline** — Employment tribunal "3 months less one day", FOI 20 working days, NHS complaint stages, benefit appeal windows
- **Track a case** — FOI requests, NHS complaints, eviction notices, UC sanctions challenges, benefit appeals, ombudsman complaints
- **Find the right route** — Ombudsman, regulator, or tribunal for your issue type and location

## Quickstart by persona

**I need a letter right now** → Open [letter-generator](./letter-generator/index.html) and choose a template.

**I got an eviction notice** → Open [eviction-notice-validator](./eviction-notice-validator/index.html). Note: Section 21 was abolished in England on 1 May 2026 — the law-change banner explains what changed.

**I want to check a public-service deadline** → Open [deadline-cascade](./deadline-cascade/index.html) or [employment-tribunal](./employment-tribunal/index.html).

**I want to contribute (code)** → See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, tests, and PR workflow.

**I want to review legal content** → Pick a high-risk tool (eviction, employment tribunal, UC sanctions), open `data/sources.yml`, check one source against the live page, and file an issue if it's stale. See the non-code playbooks in [CONTRIBUTING.md](./CONTRIBUTING.md).

**I want to test accessibility** → See [docs/accessibility-testing.md](./docs/accessibility-testing.md).

## Status and limits

- **Housing tools** are England-only. Eviction law differs fundamentally in Wales, Scotland, and Northern Ireland.
- **Eviction tool** is under reconstruction for the Renters' Rights Act 2025. Section 21 was abolished on 1 May 2026; the current tool shows a law-change banner and blocks post-abolition Section 21 validation.
- **Employment tribunal** deadlines assume Great Britain (England, Wales, Scotland). Northern Ireland has separate industrial tribunals.
- **NHS complaints** routes are for England (PHSO). Scotland has SPSO, Wales has PSOW, Northern Ireland has NIPSO.
- **Content is reviewed against official sources** but may become stale between reviews. Every tool displays a "not legal advice" notice. If something looks wrong, file an issue using the `content_source.yml` template.

## Governance and trust

- [Contributing](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Support](./SUPPORT.md)
- [Maintainers](./MAINTAINERS.md)
- [Governance](./GOVERNANCE.md)
- [Roadmap](./ROADMAP.md)
- [Changelog](./CHANGELOG.md)
- [Notice](./NOTICE)
- [Architecture](./docs/architecture.md)
- [Product map](./docs/product-map.md)
- [Repository map](./docs/repo-map.md)
- [Data provenance](./docs/data-provenance.md)
- [Accessibility testing](./docs/accessibility-testing.md)
- [CSS architecture](./docs/css-architecture.md)
- [Analytics plan](./docs/analytics.md)
- [Release process](./docs/release.md)

## Toolkit

| Tool                           | Launch                                                | GitHub                                                          | Local path                     | Jurisdiction    | Risk   |
| ------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------- | ------------------------------ | --------------- | ------ |
| Letter Generator               | [demo](https://letter-generator-psi.vercel.app)       | [repo](https://github.com/tarunag10/letter-generator)           | `./letter-generator`           | UK-wide         | high   |
| Accessible Forms               | [demo](https://accessible-forms-two.vercel.app)       | [repo](https://github.com/tarunag10/accessible-forms)           | `./accessible-forms`           | UK-wide         | medium |
| Public Service Directory       | [demo](https://public-service-directory.vercel.app)   | [repo](https://github.com/tarunag10/public-service-directory)   | `./public-service-directory`   | UK-wide         | high   |
| Legal Templates                | [demo](https://legal-templates-seven.vercel.app)      | [repo](https://github.com/tarunag10/legal-templates)            | `./legal-templates`            | UK-wide         | high   |
| Design System                  | [demo](https://design-system-two-delta.vercel.app)    | [repo](https://github.com/tarunag10/design-system)              | `./design-system`              | UK-wide         | low    |
| FOI Response Tracker           | [demo](https://foi-tracker.vercel.app)                | [repo](https://github.com/tarunag10/foi-tracker)                | `./foi-tracker`                | UK-wide         | high   |
| Case Builder                   | [demo](https://case-builder.vercel.app)               | [repo](https://github.com/tarunag10/case-builder)               | `./case-builder`               | UK-wide         | medium |
| Employment Tribunal            | [demo](https://employment-tribunal.vercel.app)        | [repo](https://github.com/tarunag10/employment-tribunal)        | `./employment-tribunal`        | GB              | high   |
| Eviction Notice Validator      | [demo](https://eviction-notice-validator.vercel.app)  | [repo](https://github.com/tarunag10/eviction-notice-validator)  | `./eviction-notice-validator`  | England only    | high   |
| UC Sanctions Challenge         | [demo](https://uc-sanctions.vercel.app)               | [repo](https://github.com/tarunag10/uc-sanctions)               | `./uc-sanctions`               | GB              | high   |
| Benefits Appeals Helper        | [demo](https://benefits-appeals.vercel.app)           | [repo](https://github.com/tarunag10/benefits-appeals)           | `./benefits-appeals`           | GB              | high   |
| Immigration Complaint Tool     | [demo](https://immigration-complaints.vercel.app)     | [repo](https://github.com/tarunag10/immigration-complaints)     | `./immigration-complaints`     | UK-wide         | high   |
| NHS Complaints Tracker         | [demo](https://nhs-complaints-tracker.vercel.app)     | [repo](https://github.com/tarunag10/nhs-complaints-tracker)     | `./nhs-complaints-tracker`     | England         | high   |
| Professional Complaints Router | [demo](https://professional-complaints.vercel.app)    | [repo](https://github.com/tarunag10/professional-complaints)    | `./professional-complaints`    | UK-wide         | high   |
| Ombudsman Outcomes Database    | [demo](https://ombudsman-outcomes.vercel.app)         | [repo](https://github.com/tarunag10/ombudsman-outcomes)         | `./ombudsman-outcomes`         | UK-wide         | medium |
| Batch FOI Tool                 | [demo](https://batch-foi.vercel.app)                  | [repo](https://github.com/tarunag10/batch-foi)                  | `./batch-foi`                  | UK-wide         | medium |
| Deadline Cascade Visualizer    | [demo](https://deadline-cascade.vercel.app)           | [repo](https://github.com/tarunag10/deadline-cascade)           | `./deadline-cascade`           | UK-wide         | medium |
| Fee Calculator                 | [demo](https://fee-calculator.vercel.app)             | [repo](https://github.com/tarunag10/fee-calculator)             | `./fee-calculator`             | England & Wales | medium |
| Evidence Checker               | [demo](https://evidence-checker.vercel.app)           | [repo](https://github.com/tarunag10/evidence-checker)           | `./evidence-checker`           | UK-wide         | medium |
| SEND Helper                    | [demo](https://send-helper.vercel.app)                | [repo](https://github.com/tarunag10/send-helper)                | `./send-helper`                | England         | high   |
| Accessible Formats Request     | [demo](https://accessible-formats-request.vercel.app) | [repo](https://github.com/tarunag10/accessible-formats-request) | `./accessible-formats-request` | UK-wide         | medium |
| Case Aggregator                | [demo](./case-aggregator/index.html)                  | (in parent repo)                                                | `./case-aggregator`            | UK-wide         | low    |

## Shared principles

- **No backend by default**: keep tools inspectable, forkable, and runnable from static files.
- **Privacy-first by default**: no accounts, analytics, or telemetry. User data stays in `localStorage` and can be cleared per-tool.
- **Accessibility-first by default**: WCAG 2.2 AA with semantic HTML, visible focus styles, labelled controls, high contrast colours, and keyboard testing.
- **Plain English by default**: explain public-service steps clearly without pretending a tool can decide legal rights, deadlines, or outcomes.
- **Open contribution by default**: every tool includes a README, `CONTRIBUTING.md`, `ACCESSIBILITY.md`, licence, and test/build scripts.
