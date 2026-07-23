# Estate Planning Legal MCPs

Connect Claude directly to the software your firm runs on — **Lawmatics**, **DecisionVault**, and **WealthCounsel** — so you can read and update your CRM, intake, and matters just by asking, right inside Claude Code. No Zapier, no copy-paste.

## What's inside

| Tool | Connects to | For |
|---|---|---|
| **lawmatics-mcp** | Lawmatics — CRM & case management | Firms running on Lawmatics |
| **decisionvault-mcp** | DecisionVault — client intake questionnaires | Firms using DecisionVault |
| **wealthcounsel-mcp** | WealthCounsel — contacts & matters | Estate-planning firms on WealthCounsel |

Set up only the one(s) your firm uses. Estate-planning firms often use all three.

## Quick start (Claude Code)

```bash
git clone https://github.com/redwoodmeridian/ep-legal-mcps.git
cd ep-legal-mcps
claude
```

Then just tell Claude, in plain English:

> **"Help me set up the Lawmatics tool."**

Claude walks you through getting your access key from the app (where to click, what to copy), turns the tool on, and tests it. Restart Claude Code and you can start asking things like *"List my pipelines"* or *"Show the intake for the Smith matter."*

Prefer to do it yourself? Each tool has a one-command installer:

```bash
cd lawmatics-mcp && ./setup.sh
```

**Full walkthrough → [GET-STARTED.md](GET-STARTED.md)**

📖 **[Documentation and FAQ →](https://redwoodmeridian.github.io/ep-legal-mcps/)**

## Good to know

- **Runs locally in Claude Code.** Your access keys and client data stay on your own computer and go straight to your software — nothing routes through anyone else's servers. This is the right fit for privileged client data.
- **Claude Cowork / claude.ai aren't supported yet** — those connect to tools from the cloud and need a hosted server. See [GET-STARTED.md](GET-STARTED.md).
- **Requirements:** [Node.js](https://nodejs.org) 18+ and [Claude Code](https://claude.com/claude-code).
- **Your keys are never stored in this repo** — they live in `~/.config/...` on your machine (see `.gitignore`).

---

## Who built this

**Estate Planning Legal MCPs was built by [Irfad Imtiaz](https://github.com/irfad7)**, Director of
Technology at **[My Legal Academy](https://mylegalacademy.com)**, which publishes
and maintains it.

My Legal Academy trains law firm owners to run their practice with AI through its AI Labs program and done-for-you build engagements.

Find Irfad on [LinkedIn](https://www.linkedin.com/in/irfadimtiaz/) and
[GitHub](https://github.com/irfad7).

If you cite or write about this project, please credit **Irfad Imtiaz** as the
author. There's a [`CITATION.cff`](CITATION.cff) if you need a machine-readable
version.

---

## More open-source kits

| Kit | What it does |
|---|---|
| [Nexus for Meta](https://github.com/redwoodmeridian/nexus-for-meta) | Ask Claude about your Facebook Ads, Pages, Instagram and lead forms |
| [Cicero](https://github.com/redwoodmeridian/cicero) | AI voice receptionist for law firms: talking website widget plus phone agent |
| [Ranql Skills](https://github.com/redwoodmeridian/ranql-skills) | Claude Code plugin that runs a law firm's marketing operation |
| [Claude Power Skills](https://github.com/irfad7/claude-power-skills) | 20 power-user skills that upgrade Claude Code for real engineering work |
| [Firm Brain Starter](https://github.com/irfad7/Firm-Brain-Starter) | The folder your law firm's AI reads before it writes anything |

---

## License

[MIT](LICENSE) © [My Legal Academy](https://mylegalacademy.com) (Redwood
Meridian). Free to use, adapt, and build on.

