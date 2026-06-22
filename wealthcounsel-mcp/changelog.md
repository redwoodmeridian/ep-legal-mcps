# Changelog

## [0.1.0] — 2026-06-19

Initial skeleton. MCP server for the WealthCounsel API.

### Added
- Bearer-auth client (base `https://api.wealthcounsel.com/v1`) + password-grant `auth` helper (`/oauth2/token`).
- **11 tools**: contacts CRUD, matters CRUD, and a generic `wealthcounsel_request` escape hatch.
- README/CLAUDE.md documenting the hard scope limit.

### Notes — important
- API surface confirmed from WealthCounsel's OpenAPI spec (v0.1.0): **contacts + matters only. No document-drafting/assembly/template API exists.** This is CRM sync, not document automation.
- API access requires an app registered in the WC member portal (My Practice → Practice Admin → Integrations) for a client id/secret — the website login does not grant API access. 3rd-party multi-firm use also requires emailing api.partnerships@wealthcounsel.com for approval.
- Tokens expire (re-run `auth`). **Pending live verification** — needs API credentials, which are gated on the portal/partner step above.
- The document-drafting automation (the real WealthCounsel value) is a SEPARATE track: it is UI-only and would require browser automation, not this API.
