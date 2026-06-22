# DecisionVault MCP — for Claude Code

This repo is an MCP server that reads a firm's **DecisionVault** client-intake data — the source of truth that feeds document drafting.

## First-time setup

If asked to set up / install / connect, run `./setup.sh`. It builds, asks for the DecisionVault API key, verifies the connection, and registers the `decisionvault` MCP server. Tell the user to restart Claude Code afterward.

## Getting your credential — guide the user through this

DecisionVault uses a simple **API key** (the easiest of the three). The user must be a **firm admin**:

1. **Open integration settings.** Go to `app.decisionvault.com/settings/integrations` (Settings → Integrations).
2. **Turn on the Developer API** if it isn't already, then under **Developer API** click to **create / add an API key**.
3. **Copy the key** and paste it to you.
4. **You save it and connect:** run `./setup.sh` and enter the key when prompted (or `node dist/index.js set-key <key>`), which saves it to `~/.config/decisionvault-mcp/config.json` and verifies the connection.

If they're not an admin, tell them to ask their firm admin to create the key — only admins can.

## What you can do

- **Matters** (`dv_list_matters`, `dv_get_matter`): each matter is one intake engagement. Filter by name/date.
- **The structured intake** — the part that matters for drafting:
  - `dv_get_matter_clients` — the people being planned for.
  - `dv_get_matter_contacts` — people tagged **by role** (beneficiary, child, trustee/fiduciary). No prose parsing.
  - `dv_get_matter_assets` — asset records.
  - `dv_get_matter_documents` / `dv_get_matter_financial_documents` — client uploads.
- **Questionnaires** (`dv_list_questionnaires`) and **financial categories**.
- **Create matter** (`dv_create_matter`) — pre-create + get an invite link; attach a `context` (e.g. a Lawmatics matter id) to link systems.
- **Webhooks** (`dv_create_webhook_subscription`) — subscribe to `intakeform.submitted` to trigger downstream document automation the moment a client finishes intake.
- **`decisionvault_request`** — escape hatch for any other endpoint.

## Key facts

- Auth is a firm API key (`Authorization: Token <key>`). Read-focused API; the writable bits are create-matter and webhook subscriptions.
- IDs are prefixed: `matter_…`, `quest_…`, `user_…`. Webhook payloads omit PII — resolve people via `dv_get_user`.
- This is **the intake source of truth.** Pattern: client submits intake → `intakeform.submitted` webhook → pull `clients`/`contacts`/`assets` → drive document generation (own engine, or WealthCounsel).
