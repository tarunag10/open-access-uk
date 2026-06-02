# ADR 0002: Submodules Versus Workspace

## Decision

Keep the existing submodule structure for the public tools while the project is
early-stage. Parent-only contributor tooling can live directly in the root repo.

## Rationale

The public tools already have independent remotes and deployments. Submodules
allow each product surface to remain independently publishable while the root
repo coordinates checks, governance, and documentation.

## When To Revisit

Consider a monorepo/workspace if shared packages, dependency coordination, or
cross-tool releases become a real blocker.
