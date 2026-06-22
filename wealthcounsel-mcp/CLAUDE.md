# WealthCounsel MCP — for Claude Code

MCP server for the WealthCounsel API. **Scope: contacts + matters only.** There is no document-drafting API in WealthCounsel — do not promise document generation through this server.

## Setup

API access needs an app registered in the WealthCounsel member portal — the website login alone does not grant API access. See the credential walkthrough below.

## Getting your credential — guide the user through this

Heads up first: this one is **more involved and may need vendor approval**, and it only covers contacts/matters (no drafting). If the user only wants document help, tell them WealthCounsel's API can't do that and steer them to DecisionVault + a drafting pipeline instead. If they do want the contacts/matters sync:

1. **Register an app.** On `member.wealthcounsel.com`: **My Practice → Practice Admin → Integrations**. Add/register an application. You may need to email `api.partnerships@wealthcounsel.com` first for approval — if so, tell them to do that and come back when approved.
2. **Get the app credentials.** Open the app's **View Details** to copy the **Client ID** and **Client Secret**.
3. **Collect the four values** from them: Client ID, Client Secret, and their WealthCounsel **username** + **password** (this uses the "password grant").
4. **You mint the token:** set them and run the helper:
   ```bash
   WEALTHCOUNSEL_CLIENT_ID=<id> WEALTHCOUNSEL_CLIENT_SECRET=<secret> \
   WEALTHCOUNSEL_USERNAME=<user> WEALTHCOUNSEL_PASSWORD=<pass> npm run auth
   ```
   This saves a token to `~/.config/wealthcounsel-mcp/config.json`. **Tokens expire** — re-run `auth` to refresh.

If this is blocked on vendor approval, tell them to contact `api.partnerships@wealthcounsel.com` (or Irfad) — don't try to work around it.

## Tools

- Contacts: `wc_list_contacts`, `wc_get_contact`, `wc_create_contact`, `wc_update_contact`, `wc_delete_contact`.
- Matters: `wc_list_matters`, `wc_get_matter`, `wc_create_matter`, `wc_update_matter`, `wc_delete_matter`.
- `wealthcounsel_request` for anything else (but only contacts/matters exist).

## Important facts

- Base `https://api.wealthcounsel.com/v1`; bearer auth; tokens **expire** (re-run auth).
- Matter types: estate-planning, business-planning, administration-death, medicaid-planning, veterans-benefits-planning.
- Use `externalId` to associate WealthCounsel records with a source system (DecisionVault / Lawmatics).
- For document drafting, the data flows from DecisionVault intake → a drafting engine; WealthCounsel's drafting is UI-only and not reachable here.
