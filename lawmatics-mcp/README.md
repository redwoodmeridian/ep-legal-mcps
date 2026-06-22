# Lawmatics MCP

An [MCP](https://modelcontextprotocol.io) server that gives Claude (Code or Desktop) read/write access to a law firm's [Lawmatics](https://www.lawmatics.com) CRM — contacts, matters, pipelines, tasks, notes, appointments, and everything else in the v1 API.

Built for My Legal Academy member firms. Each firm runs it against **their own** Lawmatics account with their own token; nothing is shared between firms.

## What it can do

24 tools, grouped:

| Area | Tools |
|---|---|
| **Contacts** (people) | `search_contacts`, `get_contact`, `create_contact`, `update_contact` |
| **Matters** (the API calls these `prospects`) | `search_matters`, `get_matter`, `create_matter`, `update_matter`, `get_matter_timeline` |
| **Firm structure** | `list_pipelines`, `list_stages`, `list_practice_areas`, `list_sub_statuses`, `list_custom_fields`, `list_users`, `whoami` |
| **Work items** | `list_tasks`, `create_task`, `update_task`, `list_notes`, `create_note`, `list_events`, `create_event` |
| **Everything else** | `lawmatics_request` — arbitrary call to any `/v1/...` endpoint (companies, tags, files, invoices, forms, …) |

All tool names are prefixed `lawmatics_`.

> **Lawmatics vocabulary:** a **matter** is the `prospect` resource — it carries the whole lifecycle (lead → sales → production → post-signing). A **contact** is a person, who may be linked to one or more matters.

## Quick start (clone → one command)

```bash
git clone https://github.com/meier-law-firm/lawmatics-mcp.git
cd lawmatics-mcp
./setup.sh
```

`setup.sh` installs everything, asks for your Lawmatics token (paste it, input hidden), verifies the connection, and registers the server with Claude Code. **Restart Claude Code** afterward, then just ask: *"List my Lawmatics pipelines."*

Even easier inside Claude Code: open this folder and say **"set this up"** — it follows `CLAUDE.md` and runs the installer for you.

> Get a token: Lawmatics → **Settings → Developers** → create/refresh an app and copy the bearer token (non-expiring).

---

## Manual setup

### 1. Build

```bash
npm install
npm run build
```

### 2. Get a token

A token is a single **non-expiring** OAuth bearer token scoped to one firm's account. Two ways to get one:

**Option A — OAuth helper (recommended for firms).**
One developer app (MLA's) serves every firm; each firm just clicks "authorize".

1. An admin creates a developer app once at `https://app.lawmatics.com/settings/developers` (Lawmatics support must enable Developer Settings on the account first). Set the callback URL to `http://localhost:53682/callback`.
2. Put the app credentials in your env (or `~/.config/lawmatics-mcp/config.json`):
   ```bash
   export LAWMATICS_CLIENT_ID=...
   export LAWMATICS_CLIENT_SECRET=...
   export LAWMATICS_REDIRECT_URI=http://localhost:53682/callback
   ```
3. Run the flow — your browser opens, you log in and grant access:
   ```bash
   npm run auth      # or: npx lawmatics-mcp auth
   ```
   The token is saved to `~/.config/lawmatics-mcp/config.json` (mode 600).

**Option B — bring your own token.**
If you already have a token, just set it:
```bash
export LAWMATICS_ACCESS_TOKEN=your_token_here
```

Verify it works:
```bash
npm run whoami      # prints the authenticated Lawmatics user
```

### 3. Connect to Claude

**Claude Code:**
```bash
claude mcp add lawmatics -- node /absolute/path/to/lawmatics-mcp/dist/index.js
```
…with the token in the environment, or rely on the saved config file.

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "lawmatics": {
      "command": "node",
      "args": ["/absolute/path/to/lawmatics-mcp/dist/index.js"],
      "env": { "LAWMATICS_ACCESS_TOKEN": "your_token_here" }
    }
  }
}
```

## Querying — fields, filtering, sorting

Every list tool accepts the API's standard params:

- **`fields`** — comma-separated attributes/relationships, or `"all"`. Omit for a small default set. Example: `fields: "first_name,email,stage"`.
- **`page`** — 1-based pagination.
- **`filter_by` / `filter_on` / `filter_with`** — one filter at a time. Association fields take an `_id` suffix. Operators: `=, !=, <=, <, >=, >, like, ilike, null, not_null`.
  - Open matters in a stage: `filter_by: "stage_id", filter_on: "12"`
  - PNC leads: `filter_by: "status", filter_on: "pnc"`
- **`sort_by` / `sort_order`** (`asc`|`desc`).

### Custom fields
`list_custom_fields` returns each field's id and type. Set a value on a matter/contact by passing it through `extra_attributes`, e.g. `{ "custom_field_2263": "Estate Plan – Tier 2" }`.

## Notes & limits

- **Rate limit:** 50 requests/min per firm. The client honors `429 Retry-After` automatically.
- **No scopes:** once a user authorizes, the token has full CRUD on the account. Keep it private — the config file is written `0600` and `.gitignore`d.
- **Document generation is not in the Lawmatics API** — it has no doc-assembly endpoints. Use a document tool (DecisionVault → HotDocs/Gavel, or a custom engine) for that; this MCP covers the CRM.

## Project layout

```
src/
  config.ts        env + config-file resolution, token persistence
  client.ts        HTTP client, JSON:API flattening, 429 backoff
  auth.ts          OAuth localhost helper (`lawmatics-mcp auth`)
  index.ts         MCP server + CLI subcommands
  tools/
    shared.ts      Tool type, shared list params, body builders
    contacts.ts    contact tools
    matters.ts     matter (prospect) tools
    structure.ts   pipelines, stages, practice areas, custom fields, users
    work.ts        tasks, notes, events
    request.ts     generic escape hatch
```
