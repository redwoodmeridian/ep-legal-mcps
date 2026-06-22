import { z } from "zod";
import { request, render } from "../client.js";
import type { Tool } from "./shared.js";

const requestTool: Tool = {
  name: "lawmatics_request",
  description:
    "Escape hatch: make an arbitrary authenticated call to any Lawmatics v1 endpoint not covered by a dedicated " +
    "tool — e.g. companies, tags (incl. /tags/attach), files, folders, invoices, expenses, time_entries, " +
    "transactions, relationships, collections, custom_forms, event_types, email_campaigns. " +
    "Paths are relative to the API root and should start with /v1/. Reads are flattened from JSON:API.",
  inputSchema: {
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method."),
    path: z.string().describe("Endpoint path, e.g. '/v1/tags' or '/v1/companies/123'."),
    query: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional()
      .describe("Query params, e.g. { fields: 'all', page: 2 }."),
    body: z.record(z.string(), z.any()).optional().describe("JSON body for POST/PUT (flat attributes)."),
  },
  handler: async (a) =>
    render(await request(a.path, { method: a.method, query: a.query, body: a.body })),
};

export const requestTools: Tool[] = [requestTool];
