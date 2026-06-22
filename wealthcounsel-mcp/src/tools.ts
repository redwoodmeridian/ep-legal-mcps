import { z, type ZodRawShape } from "zod";
import { request, render } from "./client.js";

export interface Tool {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  handler: (args: any) => Promise<string>;
}

const objectArg = z.record(z.string(), z.any());

// ── Contacts ───────────────────────────────────────────────────────────────

const listContacts: Tool = {
  name: "wc_list_contacts",
  description: "List WealthCounsel contacts. Filter by name (≥3 chars) or externalId (id from a linked system).",
  inputSchema: {
    name: z.string().optional().describe("Full or partial name (min 3 chars)."),
    externalId: z.string().optional().describe("Value associating the contact with a 3rd-party system."),
    sort: z.string().optional(),
  },
  handler: async (a) => render(await request("/v1/contacts", { query: { name: a.name, externalId: a.externalId, sort: a.sort } })),
};

const getContact: Tool = {
  name: "wc_get_contact",
  description: "Get a WealthCounsel contact by id.",
  inputSchema: { id: z.string().describe("Contact id.") },
  handler: async (a) => render(await request(`/v1/contacts/${a.id}`)),
};

const createContact: Tool = {
  name: "wc_create_contact",
  description:
    "Create a WealthCounsel contact. Pass the full contact object (individual/entity/trust/charity, addresses, " +
    "phones, spouse relationships, externalId to link a source system).",
  inputSchema: { contact: objectArg.describe("Contact object per the WealthCounsel schema.") },
  handler: async (a) => render(await request("/v1/contacts", { method: "POST", body: a.contact })),
};

const updateContact: Tool = {
  name: "wc_update_contact",
  description: "Update a contact by id. You may submit a full contact object; read-only fields keep their values.",
  inputSchema: { id: z.string().describe("Contact id."), contact: objectArg.describe("Fields to update.") },
  handler: async (a) => render(await request(`/v1/contacts/${a.id}`, { method: "PUT", body: a.contact })),
};

const deleteContact: Tool = {
  name: "wc_delete_contact",
  description: "Delete a contact by id.",
  inputSchema: { id: z.string().describe("Contact id.") },
  handler: async (a) => render(await request(`/v1/contacts/${a.id}`, { method: "DELETE" })),
};

// ── Matters ──────────────────────────────────────────────────────────────────

const listMatters: Tool = {
  name: "wc_list_matters",
  description: "List WealthCounsel matters.",
  inputSchema: {
    name: z.string().optional().describe("Name search."),
    externalId: z.string().optional().describe("Linked 3rd-party id."),
  },
  handler: async (a) => render(await request("/v1/matters", { query: { name: a.name, externalId: a.externalId } })),
};

const getMatter: Tool = {
  name: "wc_get_matter",
  description: "Get a WealthCounsel matter by id.",
  inputSchema: { id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.id}`)),
};

const createMatter: Tool = {
  name: "wc_create_matter",
  description:
    "Create a WealthCounsel matter. matter type is one of: estate-planning, business-planning, " +
    "administration-death, medicaid-planning, veterans-benefits-planning. Pass the full matter object.",
  inputSchema: { matter: objectArg.describe("Matter object per the WealthCounsel schema.") },
  handler: async (a) => render(await request("/v1/matters", { method: "POST", body: a.matter })),
};

const updateMatter: Tool = {
  name: "wc_update_matter",
  description: "Update a matter by id. You may submit a full matter object; read-only fields keep their values.",
  inputSchema: { id: z.string().describe("Matter id."), matter: objectArg.describe("Fields to update.") },
  handler: async (a) => render(await request(`/v1/matters/${a.id}`, { method: "PUT", body: a.matter })),
};

const deleteMatter: Tool = {
  name: "wc_delete_matter",
  description: "Delete a matter by id.",
  inputSchema: { id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.id}`, { method: "DELETE" })),
};

// ── Escape hatch ──────────────────────────────────────────────────────────────

const requestTool: Tool = {
  name: "wealthcounsel_request",
  description: "Escape hatch for any WealthCounsel v1 endpoint. NOTE: only contacts + matters exist — there is no drafting/document API.",
  inputSchema: {
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
    path: z.string().describe("Endpoint path, e.g. '/v1/contacts'."),
    query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    body: objectArg.optional(),
  },
  handler: async (a) => render(await request(a.path, { method: a.method, query: a.query, body: a.body })),
};

export const allTools: Tool[] = [
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listMatters,
  getMatter,
  createMatter,
  updateMatter,
  deleteMatter,
  requestTool,
];
