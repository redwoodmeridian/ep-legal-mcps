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

const searchContacts: Tool = {
  name: "lawmatics_search_contacts",
  description:
    "List/search contacts (people) in Lawmatics. A contact is a person, distinct from a matter. " +
    "Use the email/phone/name shortcuts for exact lookups, or filter_by/filter_on for field filters.",
  inputSchema: {
    email: z.string().optional().describe("Exact email lookup (find_by_email)."),
    phone: z.string().optional().describe("Exact phone lookup (find_by_phone)."),
    name: z.string().optional().describe("Name lookup (find_by_name)."),
    ...listParams,
  },
  handler: async (a) => {
    if (a.email) return render(await request(`/v1/contacts/find_by_email/${encodeURIComponent(a.email)}`));
    if (a.phone) return render(await request(`/v1/contacts/find_by_phone/${encodeURIComponent(a.phone)}`));
    if (a.name) return render(await request(`/v1/contacts/find_by_name/${encodeURIComponent(a.name)}`));
    return render(await request("/v1/contacts", { query: buildListQuery(a) }));
  },
};

const getContact: Tool = {
  name: "lawmatics_get_contact",
  description: "Get a single contact by id. Pass fields='all' for the full record.",
  inputSchema: {
    contact_id: z.union([z.string(), z.number()]).describe("Contact id."),
    fields: z.string().optional().describe("Comma-separated fields or 'all'."),
  },
  handler: async (a) =>
    render(await request(`/v1/contacts/${a.contact_id}`, { query: a.fields ? { fields: a.fields } : undefined })),
};

const createContact: Tool = {
  name: "lawmatics_create_contact",
  description: "Create a contact (person). Common fields are named; anything else goes in extra_attributes.",
  inputSchema: {
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    custom_fields: customFieldsParam,
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request("/v1/contacts", {
        method: "POST",
        body: withCustomFields(
          buildBody(
            { first_name: a.first_name, last_name: a.last_name, email: a.email, phone: a.phone },
            a.extra_attributes,
          ),
          a.custom_fields,
        ),
      }),
    ),
};

const updateContact: Tool = {
  name: "lawmatics_update_contact",
  description: "Update a contact by id. Only the fields you pass are changed.",
  inputSchema: {
    contact_id: z.union([z.string(), z.number()]).describe("Contact id."),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    custom_fields: customFieldsParam,
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request(`/v1/contacts/${a.contact_id}`, {
        method: "PUT",
        body: withCustomFields(
          buildBody(
            { first_name: a.first_name, last_name: a.last_name, email: a.email, phone: a.phone },
            a.extra_attributes,
          ),
          a.custom_fields,
        ),
      }),
    ),
};

export const contactTools: Tool[] = [searchContacts, getContact, createContact, updateContact];
