# ADR 0001: Static Local-First By Default

## Decision

Open Access UK tools are static and browser-only by default.

## Rationale

Users may draft sensitive letters, templates, complaint notes, and accessibility
requests. Keeping tools local-first reduces privacy risk and keeps demos easy to
inspect, fork, and run.

## Consequences

- No backend by default.
- No analytics by default.
- No server storage for generated content.
- Static hosting is the default deployment path.
- Future backend work needs explicit privacy, security, and accessibility review.
