import { z } from "zod";
import { request, render } from "../client.js";
import { buildListQuery, listParams, type Tool } from "./shared.js";

// Dedicated tools added from Meier Law Firm field testing (2026-06-23 feedback):
// files, invoices, time entries, tags, companies, relationships, and form entries.
// All were previously reachable only via the lawmatics_request escape hatch.

const listFiles: Tool = {
  name: "lawmatics_list_files",
  description:
    "List files. Filter to a matter with filter_by='fileable_id', filter_on=<matter id> (or use list params). " +
    "Returns name, file_url, file_size. Use lawmatics_download_file for contents.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/files", { query: buildListQuery(a) })),
};

const downloadFile: Tool = {
  name: "lawmatics_download_file",
  description: "Get a file's download payload/URL by id (GET /v1/files/download/{id}).",
  inputSchema: { file_id: z.union([z.string(), z.number()]).describe("File id.") },
  handler: async (a) => render(await request(`/v1/files/download/${a.file_id}`)),
};

const listInvoices: Tool = {
  name: "lawmatics_list_invoices",
  description: "List invoices (read-only in the Lawmatics API). Filter with filter_by/filter_on.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/invoices", { query: buildListQuery(a) })),
};

const listTimeEntries: Tool = {
  name: "lawmatics_list_time_entries",
  description: "List time entries. Filter with filter_by/filter_on (e.g. user_id or matter).",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/time_entries", { query: { fields: "all", ...buildListQuery(a) } })),
};

const listTags: Tool = {
  name: "lawmatics_list_tags",
  description: "List the firm's tags (id, name, color).",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/tags", { query: buildListQuery(a) })),
};

const attachTags: Tool = {
  name: "lawmatics_attach_tags",
  description:
    "Attach tags to a matter by NAME (creates missing tags). Attaching a tag is a common way to trigger " +
    "an existing Lawmatics automation.",
  inputSchema: {
    matter_id: z.union([z.string(), z.number()]).describe("Matter (prospect) id."),
    tags: z.array(z.string()).describe("Tag names to attach."),
  },
  handler: async (a) =>
    render(await request("/v1/tags/attach", { method: "POST", body: { matter_id: a.matter_id, tags: a.tags } })),
};

const detachTags: Tool = {
  name: "lawmatics_detach_tags",
  description: "Detach tags from a matter by name.",
  inputSchema: {
    matter_id: z.union([z.string(), z.number()]).describe("Matter (prospect) id."),
    tags: z.array(z.string()).describe("Tag names to detach."),
  },
  handler: async (a) =>
    render(await request("/v1/tags/detach", { method: "POST", body: { matter_id: a.matter_id, tags: a.tags } })),
};

const searchCompanies: Tool = {
  name: "lawmatics_search_companies",
  description: "List/search companies. Use email/phone/name for exact finders, or standard list params.",
  inputSchema: {
    email: z.string().optional().describe("Exact email lookup."),
    phone: z.string().optional().describe("Exact phone lookup."),
    name: z.string().optional().describe("Name lookup."),
    ...listParams,
  },
  handler: async (a) => {
    if (a.email) return render(await request(`/v1/companies/find_by_email/${encodeURIComponent(a.email)}`));
    if (a.phone) return render(await request(`/v1/companies/find_by_phone/${encodeURIComponent(a.phone)}`));
    if (a.name) return render(await request(`/v1/companies/find_by_name/${encodeURIComponent(a.name)}`));
    return render(await request("/v1/companies", { query: buildListQuery(a) }));
  },
};

const listRelationships: Tool = {
  name: "lawmatics_list_relationships",
  description:
    "List matter↔contact relationships. Filter to a matter with filter_by='prospect_id', filter_on=<matter id>. " +
    "See lawmatics_request for creating relationships (POST /v1/relationships).",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/relationships", { query: buildListQuery(a) })),
};

const listForms: Tool = {
  name: "lawmatics_list_forms",
  description: "List the firm's custom forms (uuid, name). Use lawmatics_get_form_entries for structured answers.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/forms", { query: buildListQuery(a) })),
};

const getFormEntries: Tool = {
  name: "lawmatics_get_form_entries",
  description:
    "Get a custom form's submitted ENTRIES — the structured answers (not just the PDF). " +
    "GET /v1/forms/{uuid}/entries.",
  inputSchema: {
    form_uuid: z.string().describe("Custom form uuid (from lawmatics_list_forms)."),
    page: z.number().int().positive().optional(),
  },
  handler: async (a) =>
    render(await request(`/v1/forms/${a.form_uuid}/entries`, { query: a.page ? { page: a.page } : undefined })),
};

export const extraTools: Tool[] = [
  listFiles,
  downloadFile,
  listInvoices,
  listTimeEntries,
  listTags,
  attachTags,
  detachTags,
  searchCompanies,
  listRelationships,
  listForms,
  getFormEntries,
];
