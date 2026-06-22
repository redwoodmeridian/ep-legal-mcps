# Changelog

All notable changes to `lawmatics-mcp`.

## [0.1.2] — 2026-06-19

### Added
- **One-command install** (`setup.sh`) — installs deps, builds, captures the firm's token (paste or browser OAuth), verifies the live connection, and registers the server with Claude Code. Safe to re-run.
- **`set-token` CLI subcommand** for saving a pasted token.
- **Repo `CLAUDE.md`** so a firm can open the folder in Claude Code, say "set this up," and have Claude run the installer and know how to drive the tools.
- **`CAPABILITIES.md`** — the API-vs-UI boundary map (what Claude can drive vs. what stays UI-only, and how to trigger UI-built automations via API side effects).
- Published to `github.com/meier-law-firm/lawmatics-mcp` (private). Verified clone → `./setup.sh` → live connection end-to-end.

## [0.1.0] — 2026-06-19

Initial release. MCP server for the Lawmatics legal CRM, built for MLA community firms.

### Added
- **HTTP client** (`src/client.ts`) — bearer auth, `?page`/`?fields`/`filter_by` query support, automatic 429 + `Retry-After` backoff (Lawmatics caps at 50 req/min), and JSON:API → flat-object response flattening.
- **Config** (`src/config.ts`) — env-first (`LAWMATICS_ACCESS_TOKEN`), falling back to `~/.config/lawmatics-mcp/config.json`.
- **OAuth helper** (`lawmatics-mcp auth`) — localhost authorization-code flow that captures and saves a firm's non-expiring token. Lets non-technical firms self-serve a token against one shared developer app.
- **24 tools** across contacts, matters (the API's `prospect` resource), pipelines/stages/practice-areas/sub-statuses, custom fields, users, tasks, notes, events/appointments, matter timeline, plus a generic `lawmatics_request` escape hatch for every other endpoint (companies, tags, files, invoices, forms, etc.).
- `lawmatics-mcp whoami` CLI for quick token verification.
- README with setup paths for both bring-your-own-token and the OAuth helper.

### Notes
- API facts verified against the live Lawmatics Postman collection (v1.22.0): base `https://api.lawmatics.com`, tokens are **non-expiring** (no refresh needed), no scopes (full CRUD once authorized), rate limit **50 req/min**.
- **Live-verified against Meier Law Firm (2026-06-19):** full read sweep passed — `whoami`, get/search matters (8,546), get/search contacts (25,796), matter timeline, tasks (23,820), notes (36,953), events (10,506), users, sub-statuses, pipelines (8), stages (62), practice areas (9), custom fields (1,162), plus generic-tool reads of companies/tags/files/event_types/invoices. Filtering + field selection confirmed. **Writes verified** via safe round-trips (tag create→delete; throwaway contact create→update→delete) — auth, pagination, JSON:API flattening, query building, and write bodies all confirmed end-to-end.

### Custom fields (the Zapier gap) — 0.1.1
- Reading per-record custom field **values** works via `fields=custom_fields` (returns id, name, field_type, value, formatted_value).
- Discovered writes must use a `custom_fields: [{id, value}]` array — the `custom_field_<id>` key form is silently ignored. Added a first-class `custom_fields` param to create/update contact & matter, a dedicated `lawmatics_set_custom_fields` tool (Prospect/Contact/Company), and corrected the misleading guidance. Live-verified value persistence on create and via the new tool. **25 tools total.**
