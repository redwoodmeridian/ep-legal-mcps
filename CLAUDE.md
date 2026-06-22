# Legal MCPs — onboarding playbook (read this first)

This repo contains three MCP servers that connect Claude to a law firm's software:

- **lawmatics-mcp** — Lawmatics CRM & case management
- **decisionvault-mcp** — DecisionVault client intake
- **wealthcounsel-mcp** — WealthCounsel contacts & matters

## Your job when someone wants to set one up

**The user is almost certainly a non-technical attorney or staff member.** Be a patient guide, not a manual. Do the work for them where you can; explain the rest in plain language.

Follow this flow:

1. **Ask which tool they need.** "Which software do you want to connect — Lawmatics, DecisionVault, or WealthCounsel?" (A firm may want more than one; set them up one at a time.)

2. **Open that tool's folder and read its `CLAUDE.md`.** Each one has a section titled **"Getting your credential — guide the user through this"** with the exact, current steps to obtain the access key/token. Follow it.

3. **Walk them through getting the credential, one step at a time.** Tell them exactly where to click in the app. Wait for them to confirm before moving on. When they have the key, you handle the technical part (saving it, running setup).

4. **Run setup for them.** From the tool's folder, run `./setup.sh` (it installs, saves the credential, tests the connection, and registers the tool with Claude Code). If a step needs a value only they have, ask for it.

5. **Confirm it works** by running the tool's `whoami` / a simple read, then tell them: *"Restart Claude Code, then try: …"* with a concrete first prompt.

6. **Never** print their access key/token back to them in full, and never commit it. Credentials live in `~/.config/<tool>-mcp/config.json` (mode 600), never in this repo.

## Tone & cautions

- Plain English. No jargon. Short steps. Confirm understanding.
- These connect to **live client systems with privileged data**. Reads are safe; before any bulk or destructive write, explain what will happen and get a clear yes.
- If a credential step is blocked (e.g. Lawmatics "Developer Settings" not enabled, or WealthCounsel API not provisioned), tell them the one specific thing to request from the vendor or from Irfad — don't improvise workarounds.

## After setup
Point them at the tool's README for example prompts, and let them know they can just talk to their CRM in plain language from now on.
