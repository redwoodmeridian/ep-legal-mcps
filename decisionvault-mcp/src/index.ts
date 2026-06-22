#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { Tool } from "./tools/shared.js";
import { matterTools } from "./tools/matters.js";
import { firmTools } from "./tools/firm.js";
import { requestTools } from "./tools/request.js";

const allTools: Tool[] = [...matterTools, ...firmTools, ...requestTools];

function buildServer(): McpServer {
  const server = new McpServer({ name: "decisionvault-mcp", version: "0.1.0" });
  for (const tool of allTools) {
    server.tool(tool.name, tool.description, tool.inputSchema, async (args: unknown) => {
      try {
        return { content: [{ type: "text", text: await tool.handler(args) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    });
  }
  return server;
}

async function main(): Promise<void> {
  const subcommand = process.argv[2];

  if (subcommand === "set-key") {
    const key = process.argv[3];
    if (!key) {
      console.error("Usage: decisionvault-mcp set-key <api_key>");
      process.exit(1);
    }
    const { saveKey } = await import("./config.js");
    console.error(`✓ API key saved to ${await saveKey(key)}`);
    return;
  }
  if (subcommand === "whoami") {
    // No identity endpoint; a cheap authenticated call proves the key works.
    const { request } = await import("./client.js");
    const res = await request("/v1/matters", { query: { page_size: 1 } });
    console.log(`✓ DecisionVault connected — firm has ${res?.count ?? "?"} matters.`);
    return;
  }

  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`DecisionVault MCP server running on stdio — ${allTools.length} tools registered`);
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
