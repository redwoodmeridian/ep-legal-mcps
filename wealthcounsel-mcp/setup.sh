#!/usr/bin/env bash
#
# WealthCounsel MCP — one-command setup.
# NOTE: WealthCounsel's API covers contacts + matters only (no document drafting),
# and API access requires an app registered in the WC member portal.
set -euo pipefail
cd "$(dirname "$0")"

echo "──────────────────────────────────────────"
echo "  WealthCounsel MCP — setup"
echo "  (contacts + matters sync only — no drafting API)"
echo "──────────────────────────────────────────"

command -v node >/dev/null 2>&1 || { echo "✗ Node.js 18+ required: https://nodejs.org"; exit 1; }

echo "→ Installing dependencies…"; npm install --silent
echo "→ Building…"; npm run build --silent; echo "✓ Built."

CONFIG="$HOME/.config/wealthcounsel-mcp/config.json"
if [ -n "${WEALTHCOUNSEL_ACCESS_TOKEN:-}" ] || [ -f "$CONFIG" ]; then
  echo "✓ Token already configured."
else
  echo
  echo "Connect WealthCounsel. Two options:"
  echo "  • Paste an access token and press Enter, OR"
  echo "  • press Enter on an empty line to mint one via password grant"
  echo "    (needs WEALTHCOUNSEL_CLIENT_ID/SECRET/USERNAME/PASSWORD set — see CLAUDE.md)."
  printf "WealthCounsel access token (hidden): "
  read -r -s TOKEN; echo
  if [ -n "$TOKEN" ]; then
    node -e 'import("./dist/config.js").then(m=>m.saveToken(process.argv[1]).then(p=>console.error("✓ saved to "+p)))' "$TOKEN"
  else
    node dist/index.js auth
  fi
fi

echo "→ Verifying connection…"
node dist/index.js whoami || { echo "✗ Could not connect — check credentials and re-run."; exit 1; }

echo "→ Registering with Claude Code…"
if command -v claude >/dev/null 2>&1; then
  claude mcp add wealthcounsel -- node "$PWD/dist/index.js" >/dev/null 2>&1 \
    && echo "✓ Registered 'wealthcounsel' with Claude Code." \
    || echo "ℹ Already registered, or run: claude mcp add wealthcounsel -- node \"$PWD/dist/index.js\""
else
  echo "ℹ Claude Code CLI not found. Add manually — command: node, args: [\"$PWD/dist/index.js\"]"
fi

echo
echo "✓ Ready. Restart Claude Code. (Remember: contacts + matters only.)"
