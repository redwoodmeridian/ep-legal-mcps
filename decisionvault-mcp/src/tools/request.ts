import { z } from "zod";
import { request, render } from "../client.js";
import type { Tool } from "./shared.js";

const requestTool: Tool = {
  name: "decisionvault_request",
  description:
    "Escape hatch: call any DecisionVault v1 endpoint not covered by a dedicated tool. " +
    "Paths start with /v1/. Reads return the raw JSON ({ count, next, results } for lists).",
  inputSchema: {
    method: z.enum(["GET", "POST", "DELETE"]).default("GET").describe("HTTP method."),
    path: z.string().describe("Endpoint path, e.g. '/v1/matters' or '/v1/matters/{id}/clients'."),
    query: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional()
      .describe("Query params, e.g. { page_size: 100, search: 'Smith' }."),
    body: z.record(z.string(), z.any()).optional().describe("JSON body for POST."),
  },
  handler: async (a) => render(await request(a.path, { method: a.method, query: a.query, body: a.body })),
};

export const requestTools: Tool[] = [requestTool];
