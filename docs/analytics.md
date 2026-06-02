# Analytics Plan

Analytics are off by default.

If analytics are ever added, they must be optional, privacy-preserving, and
reviewed before release.

## Rules

- Do not capture generated letters, templates, forms, evidence, notes, or case
  details.
- Do not capture personal data.
- Do not use cookies unless explicitly reviewed.
- Do not make analytics required for tool operation.
- Publish the analytics implementation and event list.

## Candidate Providers

- Plausible Community Edition
- GoatCounter
- Umami

## Candidate Events

- `tool_card_opened`
- `workflow_selected`
- `template_copied`
- `source_link_opened`
- `contribution_path_selected`
