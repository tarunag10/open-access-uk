# Contributing

Thanks for helping make public-service tools easier to use.

## Good contributions

- Add tested authority types with official sources.
- Improve escalation letter wording with links to GOV.UK and ICO guidance.
- Add bank holiday awareness to the working-day calculator.
- Add CSV import from common case-management exports.
- Fix accessibility issues with keyboard, screen reader, colour contrast, or layout.
- Keep tools no-backend unless a separate privacy review is opened.
- Add examples that work without sending personal data to a server.
- Use cautious wording for legal rights: say when something "may" apply if it depends on facts, contracts, territory, or deadlines.

## Pull request checklist

- Run `npm test`.
- Run `npm run build`.
- Check keyboard-only navigation.
- Avoid collecting personal data.
- Include or update tests for every new authority type, status, or generated-letter section.
