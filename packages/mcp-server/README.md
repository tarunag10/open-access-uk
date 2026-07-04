# Open Access UK MCP Server

An MCP (Model Context Protocol) server that exposes the suite's verified UK legal rules as tools for AI assistants.

## Tools

- **calculate_deadline** — Calculate FOI, SAR, complaint, and tribunal deadlines (bank holiday aware)
- **list_deadline_rules** — List available deadline rules with descriptions
- **get_escalation_route** — Find the correct ombudsman for an issue type
- **get_possession_grounds** — List RRA 2025 possession grounds
- **get_glossary_term** — Plain-English definitions of legal terms
- **get_jurisdiction_info** — Jurisdiction metadata per tool

## Usage

```sh
npx @open-access-uk/mcp-server
```

The server reads from the same `shared/` modules and `data/` files as the web tools — one source of truth.

## Design

- No tool accepts or stores personal data beyond render fields
- Every response embeds `{ last_reviewed, sources[], not_legal_advice: true }`
- All data is build-time ingested, static, and version-controlled
