# Release Process

Release notes should group changes into:

- Product
- Accessibility
- Security
- Data/source updates
- Documentation
- Community
- Maintenance

Before a coordinated release:

1. Run `node scripts/verify-suite.mjs`.
2. Run `node scripts/validate-sources.mjs`.
3. Run `node scripts/validate-repositories.mjs`.
4. Check public links and changed Vercel deployments.
5. Update `CHANGELOG.md`.
6. Tag the release when all public tools and contributor tooling are green.
