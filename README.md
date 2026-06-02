# Open Access UK

[![CI](https://github.com/tarunag10/open-access-uk/actions/workflows/ci.yml/badge.svg)](https://github.com/tarunag10/open-access-uk/actions/workflows/ci.yml)

Open Access UK is a parent suite for open-source tools that make public services fairer, easier to navigate, and easier to improve in public.

The suite is deliberately static and browser-only. Public demos should work by opening `index.html`, keep user input local to the browser, avoid analytics and hidden data collection, and stay honest about their limits. These projects provide information, drafting support, and source-backed patterns; they are not legal advice.

Open [open-access-uk-site/index.html](./open-access-uk-site/index.html) to browse the organisation-style umbrella site.

## Governance And Trust

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
- [Analytics plan](./docs/analytics.md)
- [Release process](./docs/release.md)

## Public Repositories

| Repo                                                                   | GitHub                                                    | Local path                   | Purpose                                                                                                                                  | Demo                                               | Accessibility                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| [Open Access UK site](./open-access-uk-site/README.md)                 | https://github.com/tarunag10/open-access-uk-site.git      | `./open-access-uk-site`      | Umbrella site, positioning, suite navigation, contribution routes, and privacy-first commitments.                                        | [Open demo](./open-access-uk-site/index.html)      | [Statement](./open-access-uk-site/ACCESSIBILITY.md)      |
| [Reasonable Adjustment Letter Generator](./letter-generator/README.md) | https://github.com/tarunag10/letter-generator.git         | `./letter-generator`         | Browser-only UK reasonable-adjustment request drafting for work, education, services, transport, banks, councils, airlines, and exams.   | [Open demo](./letter-generator/index.html)         | [Statement](./letter-generator/ACCESSIBILITY.md)         |
| [Accessible Public Forms](./accessible-forms/README.md)                | https://github.com/tarunag10/accessible-forms.git         | `./accessible-forms`         | GOV.UK-style public-service form examples with visible labels, clear errors, keyboard-friendly controls, and no forced account creation. | [Open demo](./accessible-forms/index.html)         | [Statement](./accessible-forms/ACCESSIBILITY.md)         |
| [Public Service Directory](./public-service-directory/README.md)       | https://github.com/tarunag10/public-service-directory.git | `./public-service-directory` | Sourceable escalation routes and support directory patterns for public-service issues.                                                   | [Open demo](./public-service-directory/index.html) | [Statement](./public-service-directory/ACCESSIBILITY.md) |
| [Legal Templates UK](./legal-templates/README.md)                      | https://github.com/tarunag10/legal-templates.git          | `./legal-templates`          | Plain-English civic and legal letter templates for drafting support and community review.                                                | [Open demo](./legal-templates/index.html)          | [Statement](./legal-templates/ACCESSIBILITY.md)          |
| [Open Access Design System](./design-system/README.md)                 | https://github.com/tarunag10/design-system.git            | `./design-system`            | Accessible tokens, components, copy patterns, and high-contrast public-service UI foundations.                                           | [Open demo](./design-system/index.html)            | [Statement](./design-system/ACCESSIBILITY.md)            |

## Parent Contributor Tooling

The maintainer helper now lives inside this parent repo at [contributor-tools/maintainer-helper](./contributor-tools/maintainer-helper/README.md). It is useful for contributors and maintainers, but it is not part of the public product toolkit.

Run it locally when improving the suite:

```sh
cd contributor-tools/maintainer-helper
npm test
npm run build
node --check src/app.js
```

## Suite metadata

This table summarises the public tools and the parent contributor helper so maintainers can verify, publish, and support the suite consistently.

| Repo                                    | Verification command                                   | Publish workflow                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./open-access-uk-site`                 | `npm test && npm run build && node --check src/app.js` | Run checks, commit site changes, push to `https://github.com/tarunag10/open-access-uk-site.git`, then enable or refresh static hosting from `index.html`. |
| `./letter-generator`                    | `npm test && npm run build && node --check src/app.js` | Run checks, commit generator changes, push to `https://github.com/tarunag10/letter-generator.git`, then publish the static demo.                          |
| `./accessible-forms`                    | `npm test && npm run build && node --check src/app.js` | Run checks, commit form-pattern changes, push to `https://github.com/tarunag10/accessible-forms.git`, then publish the static demo.                       |
| `./public-service-directory`            | `npm test && npm run build && node --check src/app.js` | Run checks, commit directory-data changes, push to `https://github.com/tarunag10/public-service-directory.git`, then publish the static demo.             |
| `./legal-templates`                     | `npm test && npm run build && node --check src/app.js` | Run checks, commit template changes, push to `https://github.com/tarunag10/legal-templates.git`, then publish the static demo.                            |
| `./design-system`                       | `npm test && npm run build && node --check src/app.js` | Run checks, commit token/component changes, push to `https://github.com/tarunag10/design-system.git`, then publish the static demo.                       |
| `./contributor-tools/maintainer-helper` | `npm test && npm run build && node --check src/app.js` | Run checks and commit changes in this parent repo. This is contributor infrastructure, not a separate public mini-app deployment.                         |

Run the full-suite verifier from this directory before publishing a coordinated release:

```sh
node scripts/verify-suite.mjs
```

Validate source and repository metadata:

```sh
node scripts/validate-sources.mjs
node scripts/validate-repositories.mjs
npm run validate:features
npm run validate:deadlines
npm run validate:shared
npm run quality:static
npm run lighthouse
```

Publish workflow for a coordinated suite release:

1. Run `node scripts/verify-suite.mjs` from `outputs/open-access-uk`.
2. Review each nested repo with `git -C <repo> status --short`.
3. Commit and push each repo independently to its GitHub remote.
4. Refresh static hosting for changed demos and check the umbrella site links.
5. Tag or note the suite release in the umbrella site README once all public repos and parent contributor tooling are green.

## Shared principles

- No backend by default: keep demos inspectable, forkable, and runnable from static files.
- Privacy-first by default: avoid collecting personal data, accounts, analytics, or telemetry unless a future repo has a separate public privacy review.
- Accessibility-first by default: target WCAG 2.2 AA with semantic HTML, visible focus styles, labelled controls, high contrast colours, responsive layouts, and keyboard testing.
- Plain English by default: explain public-service steps clearly and avoid pretending a template or tool can decide legal rights, deadlines, or outcomes.
- Open contribution by default: every public repo includes a README, `CONTRIBUTING.md`, `ACCESSIBILITY.md`, licence, and test/build scripts. Parent contributor tooling helps maintainers keep issues, onboarding, and repository health clear.

## Contribution paths

- Law and advice-sector contributors can review wording, source notes, template limits, and safety language in `legal-templates` and `letter-generator`.
- Service designers can improve public-service journeys, form structure, plain-English labels, and reusable patterns in `accessible-forms` and `design-system`.
- Accessibility contributors can test keyboard flows, screen-reader names, focus order, colour contrast, and responsive behaviour across all public tools.
- Civic technologists can improve static JavaScript helpers, directory data, source-backed routing, and no-backend demos without adding personal-data collection.
- Maintainers can improve issue templates, onboarding, project readiness checks, contribution docs, and repo health through `contributor-tools/maintainer-helper`.

## Local checks

Run checks inside an individual repo:

```sh
npm test
npm run build
node --check src/app.js
```

Verify the umbrella site directly:

```sh
cd open-access-uk-site
npm test
npm run build
node --check src/app.js
```

Or verify every repo in the suite:

```sh
node scripts/verify-suite.mjs
```
