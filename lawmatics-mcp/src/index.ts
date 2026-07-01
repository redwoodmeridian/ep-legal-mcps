#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { Tool } from "./tools/shared.js";
import { contactTools } from "./tools/contacts.js";
import { matterTools } from "./tools/matters.js";
import { structureTools } from "./tools/structure.js";
import { workTools } from "./tools/work.js";
import { extraTools } from "./tools/extras.js";
import { requestTools } from "./tools/request.js";

const allTools: Tool[] = [
  ...contactTools,
  ...matterTools,
  ...structureTools,
  ...workTools,
  ...extraTools,
  ...requestTools,
];

function buildServer(): McpServer {
  const server = new McpServer({ name: "lawmatics-mcp", version: "0.2.0" });
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

  // CLI helpers — handy for setup and verification outside an MCP host.
  if (subcommand === "auth") {
    const { runAuth } = await import("./auth.js");
    await runAuth();
    return;
  }
  if (subcommand === "whoami") {
    const { request, render } = await import("./client.js");
    console.log(render(await request("/v1/users/me")));
    return;
  }

  if (subcommand === "set-token") {
    const token = process.argv[3];
    if (!token) {
      console.error("Usage: lawmatics-mcp set-token <access_token>");
      process.exit(1);
    }
    const { saveToken } = await import("./config.js");
    const path = await saveToken(token.trim());
    console.error(`✓ Token saved to ${path}`);
    return;
  }

  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Lawmatics MCP server running on stdio — ${allTools.length} tools registered`);
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
