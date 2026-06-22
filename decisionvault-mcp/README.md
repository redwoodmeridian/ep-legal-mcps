# DecisionVault MCP

An [MCP](https://modelcontextprotocol.io) server that reads a law firm's [DecisionVault](https://decisionvault.com) client-intake data from Claude Code — matters, clients, contacts-by-role, assets, documents — plus matter pre-creation and webhook subscriptions.

DecisionVault is the **intake source of truth**: clients fill a questionnaire, and the structured answers (beneficiaries, fiduciaries, assets) are exactly what document drafting needs. This server exposes that data to Claude so it can drive downstream document generation.

## Quick start

```bash
git clone https://github.com/redwoodmeridian/ep-legal-mcps.git
cd ep-legal-mcps/decisionvault-mcp
./setup.sh
```

`setup.sh` installs, builds, asks for your DecisionVault API key (hidden input), verifies the connection, and registers the server with Claude Code. **Restart Claude Code**, then ask: *"List my DecisionVault matters."*

Inside Claude Code you can also just open the folder and say **"set this up."**

> Get an API key: a **firm admin** opens DecisionVault → **Settings → Integrations → Developer API** and creates a key. Auth is `Authorization: Token <key>`.

## Tools (17)

| Group | Tools |
|---|---|
| **Matters** | `dv_list_matters` (search/date filters), `dv_get_matter`, `dv_create_matter` (returns invite link) |
| **Structured intake** | `dv_get_matter_clients`, `dv_get_matter_contacts` (by role), `dv_get_matter_assets`, `dv_get_matter_documents`, `dv_get_matter_financial_documents` |
| **Reference** | `dv_list_questionnaires`, `dv_get_questionnaire`, `dv_list_financial_categories`, `dv_list_events`, `dv_get_event`, `dv_get_user`, `dv_get_document` |
| **Webhooks** | `dv_create_webhook_subscription` (e.g. `intakeform.submitted`), `dv_delete_webhook_subscription` |
| **Escape hatch** | `decisionvault_request` |

## The document-automation pattern

1. Client submits intake → DecisionVault fires **`intakeform.submitted`**.
2. Your handler pulls `clients` + `contacts` (by role) + `assets` for that matter.
3. Claude drives document generation from that structured data — into your own template engine, or WealthCounsel.

Link systems by passing a `context` (e.g. a Lawmatics matter id) when pre-creating a matter.

## Notes

- Read-focused API. The only writes are pre-creating a matter and managing webhook subscriptions.
- IDs are prefixed (`matter_…`, `quest_…`, `user_…`). Webhook payloads omit PII — resolve people via `dv_get_user`.
