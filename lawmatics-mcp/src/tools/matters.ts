import { z } from "zod";
import { request, render } from "../client.js";
import {
  buildBody,
  buildListQuery,
  customFieldsParam,
  extraAttributes,
  listParams,
  withCustomFields,
  type Tool,
} from "./shared.js";

// NOTE: In the Lawmatics API a "matter" is the `prospect` resource. The whole
// lifecycle (lead → sales → production → post-signing) lives on a prospect.

const searchMatters: Tool = {
  name: "lawmatics_search_matters",
  description:
    "List/search matters (the Lawmatics API calls these 'prospects' — they cover leads and active matters alike). " +
    "Use email/phone/name for exact lookups, or filter_by/filter_on (e.g. filter_by='stage_id'). " +
    "Examples: filter_by='status', filter_on='pnc'; or filter_by='practice_area_id', filter_on='3'.",
  inputSchema: {
    email: z.string().optional().describe("Exact email lookup (find_by_email)."),
    phone: z.string().optional().describe("Exact phone lookup (find_by_phone)."),
    name: z.string().optional().describe("Name lookup (find_by_name)."),
    ...listParams,
  },
  handler: async (a) => {
    if (a.email) return render(await request(`/v1/prospects/find_by_email/${encodeURIComponent(a.email)}`));
    if (a.phone) return render(await request(`/v1/prospects/find_by_phone/${encodeURIComponent(a.phone)}`));
    if (a.name) return render(await request(`/v1/prospects/find_by_name/${encodeURIComponent(a.name)}`));
    return render(await request("/v1/prospects", { query: buildListQuery(a) }));
  },
};

const getMatter: Tool = {
  name: "lawmatics_get_matter",
  description: "Get a single matter (prospect) by id. Defaults to fields='all' for the full record.",
  inputSchema: {
    matter_id: z.union([z.string(), z.number()]).describe("Matter (prospect) id."),
    fields: z.string().optional().describe("Comma-separated fields or 'all'. Defaults to 'all'."),
  },
  handler: async (a) =>
    render(await request(`/v1/prospects/${a.matter_id}`, { query: { fields: a.fields ?? "all" } })),
};

const createMatter: Tool = {
  name: "lawmatics_create_matter",
  description:
    "Create a matter (prospect). Link to an existing contact via contact_id, or set match_contact_by='email' " +
    "to dedupe. Set the pipeline position with extra_attributes (e.g. {\"stage_id\": 12}).",
  inputSchema: {
    case_title: z.string().optional().describe("Matter / case title."),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    practice_area_id: z.union([z.string(), z.number()]).optional(),
    sub_status_id: z.union([z.string(), z.number()]).optional(),
    contact_id: z.union([z.string(), z.number()]).optional().describe("Attach to an existing contact."),
    company_id: z.union([z.string(), z.number()]).optional(),
    match_contact_by: z.enum(["email", "phone"]).optional().describe("Dedupe against an existing contact."),
    tags: z.array(z.string()).optional().describe("Tag names to apply (created if missing)."),
    custom_fields: customFieldsParam,
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request("/v1/prospects", {
        method: "POST",
        body: withCustomFields(
          buildBody(
            {
              case_title: a.case_title,
              first_name: a.first_name,
              last_name: a.last_name,
              email: a.email,
              phone: a.phone,
              practice_area_id: a.practice_area_id,
              sub_status_id: a.sub_status_id,
              contact_id: a.contact_id,
              company_id: a.company_id,
              match_contact_by: a.match_contact_by,
              tags: a.tags,
            },
            a.extra_attributes,
          ),
          a.custom_fields,
        ),
      }),
    ),
};

const updateMatter: Tool = {
  name: "lawmatics_update_matter",
  description:
    "Update a matter (prospect). Move it through the pipeline by setting stage_id; change status with " +
    "sub_status_id; reassign with assigned_staff_ids — all via extra_attributes or the named params.",
  inputSchema: {
    matter_id: z.union([z.string(), z.number()]).describe("Matter (prospect) id."),
    case_title: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    stage_id: z.union([z.string(), z.number()]).optional().describe("Move the matter to this pipeline stage."),
    sub_status_id: z.union([z.string(), z.number()]).optional(),
    custom_fields: customFieldsParam,
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request(`/v1/prospects/${a.matter_id}`, {
        method: "PUT",
        body: withCustomFields(
          buildBody(
            {
              case_title: a.case_title,
              first_name: a.first_name,
              last_name: a.last_name,
              email: a.email,
              phone: a.phone,
              stage_id: a.stage_id,
              sub_status_id: a.sub_status_id,
            },
            a.extra_attributes,
          ),
          a.custom_fields,
        ),
      }),
    ),
};

const setCustomFields: Tool = {
  name: "lawmatics_set_custom_fields",
  description:
    "Set one or more custom field values on a matter, contact, or company — the reliable way to write the " +
    "custom-field nuances Zapier can't. Get field ids from lawmatics_list_custom_fields.",
  inputSchema: {
    record_type: z
      .enum(["Prospect", "Contact", "Company"])
      .describe("Record type. 'Prospect' = a matter."),
    record_id: z.union([z.string(), z.number()]).describe("Id of the matter/contact/company."),
    custom_fields: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]).describe("Custom field id."),
          value: z.any().describe("Value to set."),
        }),
      )
      .describe("Custom field values as [{id, value}]."),
  },
  handler: async (a) => {
    const resource = a.record_type === "Contact" ? "contacts" : a.record_type === "Company" ? "companies" : "prospects";
    return render(
      await request(`/v1/${resource}/${a.record_id}`, {
        method: "PUT",
        body: { custom_fields: a.custom_fields },
        query: { fields: "custom_fields" },
      }),
    );
  },
};

const matterTimeline: Tool = {
  name: "lawmatics_get_matter_timeline",
  description: "Get the timeline activity feed for a matter (prospect).",
  inputSchema: {
    matter_id: z.union([z.string(), z.number()]).describe("Matter (prospect) id."),
    page: z.number().int().positive().optional(),
  },
  handler: async (a) =>
    render(
      await request("/v1/activities", {
        query: { filter_by: "matter_id", filter_on: a.matter_id, page: a.page },
      }),
    ),
};

export const matterTools: Tool[] = [
  searchMatters,
  getMatter,
  createMatter,
  updateMatter,
  setCustomFields,
  matterTimeline,
];
