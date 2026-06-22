#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { allTools } from "./tools.js";

function buildServer(): McpServer {
  const server = new McpServer({ name: "wealthcounsel-mcp", version: "0.1.0" });
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

  if (subcommand === "auth") {
    const { runAuth } = await import("./auth.js");
    await runAuth();
    return;
  }
  if (subcommand === "whoami") {
    const { request } = await import("./client.js");
    const res = await request("/v1/contacts", { query: { name: "" } });
    const count = Array.isArray(res) ? res.length : Array.isArray(res?.data) ? res.data.length : "?";
    console.log(`✓ WealthCounsel connected — contacts endpoint reachable (sample size: ${count}).`);
    return;
  }

  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`WealthCounsel MCP server running on stdio — ${allTools.length} tools registered`);
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
