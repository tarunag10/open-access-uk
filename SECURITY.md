# Security Policy

Open Access UK is static and browser-only by default. Security work focuses on
protecting users from privacy leaks, unsafe generated content, XSS, supply-chain
risk, misleading high-risk guidance, and accidental data collection.

## Reporting

Please report security or privacy issues privately to the maintainer:

- GitHub: `@tarunag10`

Do not open a public issue if the report includes an exploit path, private data,
or a vulnerability that could put users at risk.

## What To Report

- Cross-site scripting or HTML injection.
- Generated legal/public-service content that could mislead users into missing
  important deadlines or routes.
- Any feature that sends user-generated letters, templates, forms, evidence, or
  notes to a server without explicit review.
- Accidental analytics, tracking, telemetry, cookies, or hidden collection.
- Dependency or supply-chain risks.
- Broken security headers on deployed static sites.

## Scope

The root suite, public tool submodules, and parent contributor tooling are in
scope. Third-party official sources and external services are not controlled by
this project, but reports about unsafe linking or attribution are welcome.

## Response

Maintainers aim to acknowledge reports promptly, assess risk, and coordinate a
fix. High-risk privacy, security, and misleading-guidance issues may be fixed
outside the normal release cadence.
