# WealthCounsel MCP

An [MCP](https://modelcontextprotocol.io) server for the [WealthCounsel](https://www.wealthcounsel.com) API.

## ⚠️ Read this first — scope and limits

WealthCounsel's API covers **contacts and matters only**. There is **no document-drafting / assembly / template API** — the drafting that WealthCounsel is actually valued for happens only in its web UI. This server is therefore a **CRM-sync tool**, not a document-automation tool. (For document generation, drive it from DecisionVault intake into your own engine or via UI automation.)

Two more things to know:

1. **API access ≠ website login.** To call the API you need an app registered in the WealthCounsel **member portal** → *My Practice → Practice Admin → Integrations*, which gives you a **client id + client secret**. The normal login does not grant API access.
2. **Tokens may expire.** Unlike Lawmatics, WealthCounsel access tokens have a lifetime — re-run `auth` to refresh.

## Setup

```bash
npm install && npm run build
```

**Auth — two ways:**

- **Bring a token:** `export WEALTHCOUNSEL_ACCESS_TOKEN=...`
- **Password grant (firm-internal "Custom Integrations"):** set the four creds and run the helper:
  ```bash
  export WEALTHCOUNSEL_CLIENT_ID=...        # from Practice Admin → Integrations
  export WEALTHCOUNSEL_CLIENT_SECRET=...
  export WEALTHCOUNSEL_USERNAME=...         # your WealthCounsel login
  export WEALTHCOUNSEL_PASSWORD=...
  npm run auth     # saves a token to ~/.config/wealthcounsel-mcp/config.json
  ```

Verify: `npm run whoami`. Register with Claude Code: `claude mcp add wealthcounsel -- node "$PWD/dist/index.js"`.

## Tools (11)

- **Contacts:** `wc_list_contacts` (name / externalId), `wc_get_contact`, `wc_create_contact`, `wc_update_contact`, `wc_delete_contact`
- **Matters:** `wc_list_matters`, `wc_get_matter`, `wc_create_matter`, `wc_update_matter`, `wc_delete_matter`
  - Matter types: `estate-planning`, `business-planning`, `administration-death`, `medicaid-planning`, `veterans-benefits-planning`
- **Escape hatch:** `wealthcounsel_request`

Use `externalId` on contacts/matters to link records back to DecisionVault or Lawmatics.

## Where this fits

DecisionVault native sync already pushes contacts/matters into WealthCounsel. This MCP gives you the same sync **programmatically with full control** (e.g. set `externalId`, reconcile, backfill) — but it does **not** close the drafting gap. The drafting automation is a separate track.
