#!/usr/bin/env bash
#
# Lawmatics MCP — one-command setup.
# Installs deps, builds, captures your Lawmatics token, verifies the connection,
# and registers the server with Claude Code. Safe to re-run.
#
set -euo pipefail
cd "$(dirname "$0")"

echo "──────────────────────────────────────────"
echo "  Lawmatics MCP — setup"
echo "──────────────────────────────────────────"

# 1. Prerequisites
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js is required (18+). Install it from https://nodejs.org and re-run."
  exit 1
fi

# 2. Install + build
echo "→ Installing dependencies…"
npm install --silent
echo "→ Building…"
npm run build --silent
echo "✓ Built."

CONFIG="$HOME/.config/lawmatics-mcp/config.json"

# 3. Token
if [ -n "${LAWMATICS_ACCESS_TOKEN:-}" ] || [ -f "$CONFIG" ]; then
  echo "✓ Token already configured."
else
  echo
  echo "Connect your Lawmatics account."
  echo "  • Paste an access token and press Enter, OR"
  echo "  • press Enter on an empty line to sign in via the browser"
  echo "    (browser sign-in needs LAWMATICS_CLIENT_ID/SECRET set for a developer app)."
  echo
  printf "Lawmatics access token (input hidden): "
  read -r -s TOKEN
  echo
  if [ -n "$TOKEN" ]; then
    node dist/index.js set-token "$TOKEN"
  else
    node dist/index.js auth
  fi
fi

# 4. Verify
echo "→ Verifying connection…"
if node dist/index.js whoami >/dev/null 2>&1; then
  WHO=$(node dist/index.js whoami 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(`${j.first_name} ${j.last_name} <${j.email}>`)}catch{console.log("connected")}})')
  echo "✓ Connected to Lawmatics as: $WHO"
else
  echo "✗ Could not connect. Double-check the token (Lawmatics → Settings → Developers) and re-run ./setup.sh"
  exit 1
fi

# 5. Register with Claude Code
echo "→ Registering with Claude Code…"
if command -v claude >/dev/null 2>&1; then
  if claude mcp add lawmatics -- node "$PWD/dist/index.js" >/dev/null 2>&1; then
    echo "✓ Registered 'lawmatics' with Claude Code."
  else
    echo "ℹ 'lawmatics' looks already registered (or run the command below manually)."
    echo "    claude mcp add lawmatics -- node \"$PWD/dist/index.js\""
  fi
else
  echo "ℹ Claude Code CLI not found. Add this server to your MCP config manually:"
  echo "    command: node"
  echo "    args:    [\"$PWD/dist/index.js\"]"
fi

echo
echo "──────────────────────────────────────────"
echo "  ✓ Ready. Open Claude Code and try:"
echo "      \"List my Lawmatics pipelines\""
echo "      \"Find the matter for <client name>\""
echo "      \"Show the custom fields on matter <id>\""
echo "──────────────────────────────────────────"
