import { z } from "zod";
import { request, render } from "../client.js";
import { buildPageQuery, pageParams, type Tool } from "./shared.js";

// A "matter" in DecisionVault is one intake engagement. Its structured answers
// live in typed sub-resources: clients (the people being planned for),
// contacts (people tagged by ROLE — beneficiary, child, fiduciary, etc.),
// and assets. This is the source of truth that feeds document drafting.

const listMatters: Tool = {
  name: "dv_list_matters",
  description:
    "List intake matters under the firm. Filter with search (name contains), from/until (creation date, YYYY-MM-DD). " +
    "Each matter carries clients, contacts (by role), and assets via the dv_get_matter_* tools.",
  inputSchema: {
    search: z.string().optional().describe("Only matters whose name contains this (case-insensitive)."),
    from: z.string().optional().describe("Created on/after this date, e.g. 2026-06-01."),
    until: z.string().optional().describe("Created on/before this date, e.g. 2026-06-19."),
    ...pageParams,
  },
  handler: async (a) =>
    render(
      await request("/v1/matters", {
        query: { search: a.search, from: a.from, until: a.until, ...buildPageQuery(a) },
      }),
    ),
};

const getMatter: Tool = {
  name: "dv_get_matter",
  description: "Get one matter's detail (status, questionnaire type, submission state, etc.).",
  inputSchema: { matter_id: z.string().describe("Matter id, e.g. matter_AABB….") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}`)),
};

const getClients: Tool = {
  name: "dv_get_matter_clients",
  description: "Get the client(s) (the people being planned for) on a matter — the core intake answers.",
  inputSchema: { matter_id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}/clients`)),
};

const getContacts: Tool = {
  name: "dv_get_matter_contacts",
  description:
    "Get the contacts on a matter, each tagged by ROLE (beneficiary, child, trustee/fiduciary, party, etc.). " +
    "This is the structured beneficiary/fiduciary data document drafting needs — no prose parsing required.",
  inputSchema: { matter_id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}/contacts`)),
};

const getAssets: Tool = {
  name: "dv_get_matter_assets",
  description: "Get the asset records on a matter (for funding instructions, schedules, asset protection planning).",
  inputSchema: { matter_id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}/assets`)),
};

const getDocuments: Tool = {
  name: "dv_get_matter_documents",
  description: "List documents the client uploaded under the questionnaire's Documents section.",
  inputSchema: { matter_id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}/documents`)),
};

const getFinancialDocuments: Tool = {
  name: "dv_get_matter_financial_documents",
  description: "List financial documents the client uploaded under the Asset Intake section.",
  inputSchema: { matter_id: z.string().describe("Matter id.") },
  handler: async (a) => render(await request(`/v1/matters/${a.matter_id}/financial-documents`)),
};

const createMatter: Tool = {
  name: "dv_create_matter",
  description:
    "Pre-create a matter and get back an invite_key + invite_url to send the client. " +
    "Optionally attach a context object (up to 5 string/int key-value pairs) to carry external ids (e.g. a Lawmatics matter id).",
  inputSchema: {
    questionnaire_id: z.string().describe("Questionnaire to use (from dv_list_questionnaires)."),
    matter_name: z.string().describe("Name for the new matter."),
    context: z
      .record(z.string(), z.union([z.string(), z.number()]))
      .optional()
      .describe("Up to 5 key/value pairs (string or int) — e.g. { lawmatics_id: '17744034' }."),
  },
  handler: async (a) =>
    render(
      await request("/v1/matters/create", {
        method: "POST",
        body: { questionnaire_id: a.questionnaire_id, matter_name: a.matter_name, context: a.context },
      }),
    ),
};

export const matterTools: Tool[] = [
  listMatters,
  getMatter,
  getClients,
  getContacts,
  getAssets,
  getDocuments,
  getFinancialDocuments,
  createMatter,
];
