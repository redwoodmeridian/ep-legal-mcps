import { z } from "zod";
import { request, render } from "../client.js";
import { buildListQuery, listParams, type Tool } from "./shared.js";

// Firm "structure" lookups: pipelines, stages, practice areas, statuses,
// custom-field definitions, and users. Mostly read-only reference data.

const listPipelines: Tool = {
  name: "lawmatics_list_pipelines",
  description: "List the firm's matter pipelines. Combine with lawmatics_list_stages to see each pipeline's stages.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/pipelines", { query: buildListQuery(a) })),
};

const listStages: Tool = {
  name: "lawmatics_list_stages",
  description: "List pipeline stages (the columns a matter moves through). Filter by pipeline with filter_by='pipeline_id'.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/stages", { query: buildListQuery(a) })),
};

const listPracticeAreas: Tool = {
  name: "lawmatics_list_practice_areas",
  description: "List the firm's practice areas (e.g. Estate Planning, Probate).",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/practice_areas", { query: buildListQuery(a) })),
};

const listSubStatuses: Tool = {
  name: "lawmatics_list_sub_statuses",
  description: "List matter sub-statuses (e.g. 'Deal Closed', 'Hired').",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/sub_statuses", { query: buildListQuery(a) })),
};

const listCustomFields: Tool = {
  name: "lawmatics_list_custom_fields",
  description:
    "List custom field definitions (id, name, type, list options). Use the returned ids with " +
    "lawmatics_set_custom_fields (or the custom_fields param on create/update) to write values. " +
    "Read current values on a record via lawmatics_get_matter with fields='custom_fields'.",
  inputSchema: { ...listParams },
  handler: async (a) =>
    render(await request("/v1/custom_fields", { query: { fields: "all", ...buildListQuery(a) } })),
};

const listUsers: Tool = {
  name: "lawmatics_list_users",
  description: "List staff users in the Lawmatics account (ids for assignment, attendees, etc.).",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/users", { query: buildListQuery(a) })),
};

const whoami: Tool = {
  name: "lawmatics_whoami",
  description: "Return the authenticated user (users/me) — quick check that the token works.",
  inputSchema: {},
  handler: async () => render(await request("/v1/users/me")),
};

export const structureTools: Tool[] = [
  listPipelines,
  listStages,
  listPracticeAreas,
  listSubStatuses,
  listCustomFields,
  listUsers,
  whoami,
];
