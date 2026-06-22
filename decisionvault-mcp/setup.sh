#!/usr/bin/env bash
#
# DecisionVault MCP — one-command setup.
set -euo pipefail
cd "$(dirname "$0")"

echo "──────────────────────────────────────────"
echo "  DecisionVault MCP — setup"
echo "──────────────────────────────────────────"

command -v node >/dev/null 2>&1 || { echo "✗ Node.js 18+ required: https://nodejs.org"; exit 1; }

echo "→ Installing dependencies…"; npm install --silent
echo "→ Building…"; npm run build --silent; echo "✓ Built."

CONFIG="$HOME/.config/decisionvault-mcp/config.json"
if [ -n "${DECISIONVAULT_API_KEY:-}" ] || [ -f "$CONFIG" ]; then
  echo "✓ API key already configured."
else
  echo
  echo "Paste your DecisionVault API key and press Enter."
  echo "  (Firm admin: app.decisionvault.com/settings/integrations → Developer API → create key.)"
  printf "DecisionVault API key (hidden): "
  read -r -s KEY; echo
  [ -n "$KEY" ] && node dist/index.js set-key "$KEY" || { echo "✗ No key entered."; exit 1; }
fi

echo "→ Verifying connection…"
if node dist/index.js whoami; then :; else
  echo "✗ Could not connect — check the key and re-run ./setup.sh"; exit 1
fi

echo "→ Registering with Claude Code…"
if command -v claude >/dev/null 2>&1; then
  claude mcp add decisionvault -- node "$PWD/dist/index.js" >/dev/null 2>&1 \
    && echo "✓ Registered 'decisionvault' with Claude Code." \
    || echo "ℹ Already registered, or add manually: claude mcp add decisionvault -- node \"$PWD/dist/index.js\""
else
  echo "ℹ Claude Code CLI not found. Add manually — command: node, args: [\"$PWD/dist/index.js\"]"
fi

echo
echo "✓ Ready. Restart Claude Code, then try: \"List my DecisionVault matters\""
