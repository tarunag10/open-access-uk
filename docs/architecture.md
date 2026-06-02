# Architecture

Open Access UK is static and local-first by default.

## Shape

- Root repo coordinates public tool submodules and parent contributor tooling.
- Public tools are static HTML, CSS, and JavaScript.
- Demos run from `index.html` and can be hosted on static hosting.
- User-generated letters, templates, form notes, and action plans stay in the browser.

## Why Static

Static tools are easier to inspect, fork, archive, and run without accounts. This
is important for civic and public-service tooling where users may be dealing with
sensitive situations.

## Deployments

Each public tool can deploy independently to Vercel or another static host. The
umbrella site links to stable public URLs.

## Data Provenance

Source-backed public-service information is tracked in `data/sources.yml` and
validated by `scripts/validate-sources.mjs`.

## Privacy

The default architecture avoids accounts, server storage, analytics, telemetry,
and hidden collection. Any future backend or analytics work needs separate
privacy review.
