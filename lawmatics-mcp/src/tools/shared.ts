import { z, type ZodRawShape } from "zod";

export interface Tool {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  handler: (args: any) => Promise<string>;
}

/**
 * Standard list/query params shared by every Lawmatics list endpoint.
 * - fields: comma-separated attribute/relationship names, or "all"
 * - page: 1-based page number
 * - filter_by/on/with: single-field filter (one filter at a time)
 * - sort_by/sort_order: ordering
 */
export const listParams: ZodRawShape = {
  fields: z
    .string()
    .optional()
    .describe("Comma-separated fields to return (e.g. 'first_name,email,stage'), or 'all'. Omit for defaults."),
  page: z.number().int().positive().optional().describe("1-based page number for pagination."),
  filter_by: z
    .string()
    .optional()
    .describe("Field to filter on. Association fields need an _id suffix, e.g. 'practice_area_id', 'stage_id'."),
  filter_on: z
    .string()
    .optional()
    .describe("Value to filter on. Required when filter_by is set (except null/not_null operators)."),
  filter_with: z
    .string()
    .optional()
    .describe("Operator: =, !=, <=, <, >=, >, like, ilike, null, not_null. Defaults to '=' (ilike for strings)."),
  sort_by: z.string().optional().describe("Field to sort by."),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction. Default asc."),
};

const LIST_KEYS = ["fields", "page", "filter_by", "filter_on", "filter_with", "sort_by", "sort_order"] as const;

/** Pull the recognized list params out of an args object into a query map. */
export function buildListQuery(args: Record<string, any>): Record<string, any> {
  const q: Record<string, any> = {};
  for (const k of LIST_KEYS) {
    if (args[k] !== undefined && args[k] !== null && args[k] !== "") q[k] = args[k];
  }
  return q;
}

/** Merge named fields + an open `extra_attributes` map into a flat write body. */
export function buildBody(
  named: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(named)) {
    if (v !== undefined) body[k] = v;
  }
  if (extra && typeof extra === "object") Object.assign(body, extra);
  return body;
}

export const extraAttributes = z
  .record(z.string(), z.any())
  .optional()
  .describe(
    "Any additional Lawmatics attributes not covered by the named params above " +
      "(e.g. stage_id, sub_status_id, assigned_staff_ids). Passed through verbatim. " +
      "NOTE: custom fields do NOT work here — use the dedicated custom_fields param.",
  );

/**
 * Custom field values. Lawmatics ONLY accepts these as an array of {id, value}
 * objects under the `custom_fields` key — the `custom_field_<id>` form is
 * silently ignored. Get ids/types from lawmatics_list_custom_fields.
 */
export const customFieldsParam = z
  .array(
    z.object({
      id: z.union([z.string(), z.number()]).describe("Custom field id (from lawmatics_list_custom_fields)."),
      value: z.any().describe("Value to set. Booleans true/false, ISO datetimes, ids for lookup fields."),
    }),
  )
  .optional()
  .describe("Custom field values to set, as [{id, value}]. The reliable way to write custom fields.");

/** Attach a custom_fields array to a write body when present. */
export function withCustomFields(
  body: Record<string, unknown>,
  customFields?: { id: string | number; value: unknown }[],
): Record<string, unknown> {
  if (customFields && customFields.length) body.custom_fields = customFields;
  return body;
}
