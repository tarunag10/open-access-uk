# Data Provenance

Open Access UK tracks source-backed public-service, accessibility, legal-template,
and contribution guidance in `data/sources.yml`.

High-risk records include rights, deadlines, complaint routes, ombudsman routing,
formal letter wording, or anything a user may rely on when taking action.

Each high-risk source needs:

- source id
- publisher
- URL
- tools that use it
- last checked date
- review due date
- reviewer
- plain-English notes

Run:

```sh
node scripts/validate-sources.mjs
```

This is a freshness and provenance gate, not a legal review. Templates and public
guidance remain informational and are not legal advice.
