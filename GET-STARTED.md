# Legal MCPs — connect Claude to your firm's software

These tools let **Claude work directly inside the software your firm already uses** — reading and updating your CRM, intake, and matters by just asking, right inside Claude Code or Claude Cowork.

You don't need to be technical. **The easiest way to set up is to let Claude do it for you** (see below).

## What's in here

| Tool | What it connects to | Who needs it |
|---|---|---|
| **lawmatics-mcp** | [Lawmatics](https://www.lawmatics.com) — your CRM & case management | Firms running on Lawmatics |
| **decisionvault-mcp** | [DecisionVault](https://decisionvault.com) — client intake questionnaires | Firms using DecisionVault for intake |
| **wealthcounsel-mcp** | [WealthCounsel](https://www.wealthcounsel.com) — contacts & matters | Estate-planning firms on WealthCounsel |

You only set up the one(s) your firm uses. Estate-planning firms often use all three.

## The easy way to get started (recommended)

1. Make sure you have [Claude Code](https://claude.com/claude-code) and [Node.js](https://nodejs.org) installed.
2. Clone this repo and open it in Claude Code:
   ```bash
   git clone https://github.com/redwoodmeridian/ep-legal-mcps.git
   cd ep-legal-mcps
   claude
   ```
3. Then just tell Claude, in plain English:
   > **"Help me set up the Lawmatics tool."**

   Claude will walk you through everything — including **exactly how to get the access key from Lawmatics** (it knows the steps), where to click, and it'll test the connection and turn the tool on for you. Do the same for DecisionVault or WealthCounsel.

That's it. After Claude says it's connected, **restart Claude Code** and you can start asking things like *"List my Lawmatics pipelines"* or *"Show me the intake for the Smith matter."*

## The manual way (if you prefer)

Each tool has its own folder with a `setup.sh` and a README. From inside a tool's folder:
```bash
cd lawmatics-mcp
./setup.sh
```
It installs everything, asks for your access key, tests it, and registers the tool with Claude Code.

## Where to get each access key (short version)

Claude will guide you through these in detail — but here's the gist:

- **Lawmatics:** Settings → **Developers** → create an application, then Claude runs a quick browser sign-in to get your token. (If you don't see "Developers," ask Lawmatics support to turn on Developer Settings.)
- **DecisionVault:** a firm admin opens Settings → **Integrations → Developer API** → create a key, and pastes it in.
- **WealthCounsel:** My Practice → Practice Admin → **Integrations** → register an app for a Client ID/Secret. (This one is more involved and only covers contacts/matters — ask Irfad if you need it.)

## Claude Code vs. Claude Cowork — which works today

- **Claude Code (recommended, works now).** These run as small servers **on your own computer**. `setup.sh` installs and turns them on; restart Claude Code and you're set. Your firm's keys and client data stay on your machine and go straight to your software — nothing routes through anyone else's servers. This is the best fit for privileged client data.
- **Claude Cowork / claude.ai — not yet.** Cowork connects to tools from Anthropic's cloud, so it only works with *remote* connectors that have a public web address — it can't run a local tool on your computer. These tools are local-only for now (built for Claude Code). A hosted version for Cowork is on the roadmap; until then, use Claude Code. If you only have Cowork, reach out to Irfad.

## Need help?
Ask Claude in this repo, or reach Irfad. Your access keys stay **on your own computer** (in `~/.config/...`, never in this repo) — they're never shared with other firms.
