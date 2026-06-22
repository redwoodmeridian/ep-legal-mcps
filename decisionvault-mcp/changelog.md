# Changelog

## [0.1.0] — 2026-06-19

Initial release. MCP server for DecisionVault — the client-intake source of truth.

### Added
- API-key client (`Authorization: Token`), base `https://api.decisionvault.com`, Django-REST pagination (`count/next/results`, `?page`/`?page_size` max 200), 429 backoff.
- **18 tools**: matters (list/get/create) and their structured sub-resources (clients, contacts-by-role, assets, documents, financial-documents); questionnaires; financial categories; events; users; documents; webhook subscribe/delete (incl. the `intakeform.submitted` trigger); plus a generic `decisionvault_request` escape hatch.
- One-command `setup.sh`, repo `CLAUDE.md`, README, `.env.example`.

### Notes
- API surface confirmed against DecisionVault's published docs (llms.txt + per-endpoint OpenAPI).
- **Live-verified against Meier Law Firm (2026-06-19):** connected (2,557 matters), listed questionnaires (6) and matters, and pulled a real matter's full structured intake — clients (full person records), contacts (8, each with a structured `relationship`/role object), and assets (15, each with category, owner, net value, and per-asset beneficiaries). Confirms DecisionVault carries drafting-grade data: people-by-role + full asset schedule with beneficiary designations.
- DecisionVault is read-focused: the only writes are pre-creating a matter (returns invite link) and managing webhook subscriptions. Document generation happens downstream (own engine or WealthCounsel), triggered by the `intakeform.submitted` webhook.
