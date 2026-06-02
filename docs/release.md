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
4. Run `npm run quality:static`.
5. Run `npm run test:e2e`.
6. Run `npm run test:a11y`.
7. Run `npm run lighthouse`.
8. Check public links and changed Vercel deployments.
9. Update `CHANGELOG.md`.
10. Tag the release when all public tools and contributor tooling are green.
