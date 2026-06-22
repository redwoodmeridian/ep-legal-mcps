# Lawmatics MCP — for Claude Code

This repo is an MCP server that lets you drive a law firm's **Lawmatics** CRM directly from Claude Code.

## First-time setup (run this once)

If the user asks to set up / install / connect this, run:

```bash
./setup.sh
```

It installs dependencies, builds, asks for the firm's Lawmatics access token (or runs browser sign-in), verifies the connection, and registers the `lawmatics` MCP server with Claude Code. After it finishes, tell the user to **restart Claude Code** so the new MCP server loads, then they can talk to their CRM in plain language.

## Getting your credential — guide the user through this

Lawmatics needs a **bearer token** (non-expiring). Walk the user through it, one step at a time:

1. **Open Developer settings.** In Lawmatics: **Settings → Developers** (`app.lawmatics.com/settings/developers`). If they don't see "Developers," they need Developer Settings turned on — tell them to message Lawmatics support/chat to enable it (quick), then come back.
2. **Create an application.** Click **Create New Application**. Name it `Claude`. For **Callback / Redirect URL** enter exactly: `http://localhost:53682/callback`. Save.
3. **Copy the credentials.** Open the new app's details and copy the **Client ID** and **Client Secret**. Ask them to paste both to you.
4. **You run the sign-in for them.** With those values, run the browser OAuth flow:
   ```bash
   LAWMATICS_CLIENT_ID=<id> LAWMATICS_CLIENT_SECRET=<secret> npm run auth
   ```
   Their browser opens → they log into Lawmatics and click **Authorize/Grant** → the token saves automatically to `~/.config/lawmatics-mcp/config.json`. The app's redirect URL must match `http://localhost:53682/callback` exactly (or set `LAWMATICS_REDIRECT_URI` to whatever they used).
5. **Shortcut:** if their firm already has a developer app with a token (e.g. a Postman/Zapier app), they can just paste that token when `./setup.sh` asks — no new app needed.

Tokens are non-expiring, so this is a one-time step.

## What you can do once it's running

The `lawmatics_*` tools cover the full data layer of Lawmatics:

- **Matters** (the API calls these "prospects"): search, read, create, update, move pipeline stages, read the timeline.
- **Contacts**: search (incl. by email/phone/name), read, create, update.
- **Custom fields**: read values on any record (`get_matter` with `fields=custom_fields`) and **write** them with `lawmatics_set_custom_fields` or the `custom_fields` param. This is the part Zapier can't do — use field ids from `lawmatics_list_custom_fields`.
- **Tasks, notes, events/appointments**: list and create.
- **Reference data**: pipelines, stages, practice areas, sub-statuses, users.
- **`lawmatics_request`**: escape hatch for any other endpoint (companies, tags, files, invoices, forms…).

## Key facts to remember

- A **matter** = the `prospect` resource. A **contact** = a person.
- **Custom fields must be written as `custom_fields: [{id, value}]`** — the `custom_field_<id>` key form is silently ignored.
- Rate limit is **50 requests/min** per firm; the client backs off automatically on 429.
- The token has **full CRUD, no scopes**. Treat writes carefully — this is a live CRM. Confirm before bulk or destructive operations.

## What's NOT possible via this MCP (UI-only)

Authoring automations/workflows, email & SMS content, form structure, pipeline/stage structure, document generation, and invoices live in the Lawmatics UI — no API. But you can **trigger** existing automations by their events (adding a tag, moving a stage, changing a custom field). See `CAPABILITIES.md` for the full map.
