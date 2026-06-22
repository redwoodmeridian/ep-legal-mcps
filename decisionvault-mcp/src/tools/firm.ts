import { z } from "zod";
import { request, render } from "../client.js";
import { buildPageQuery, pageParams, type Tool } from "./shared.js";

// Firm-level reference + lookups: questionnaires, financial categories, events,
// users, documents, and webhook subscriptions.

const listQuestionnaires: Tool = {
  name: "dv_list_questionnaires",
  description:
    "List the firm's questionnaires (intake templates). Use a questionnaire id when pre-creating matters. " +
    "Types include planning, business, rep-living, rep-deceased.",
  inputSchema: { ...pageParams },
  handler: async (a) => render(await request("/v1/questionnaires", { query: buildPageQuery(a) })),
};

const getQuestionnaire: Tool = {
  name: "dv_get_questionnaire",
  description: "Get a single questionnaire's detail.",
  inputSchema: { questionnaire_id: z.string().describe("Questionnaire id, e.g. quest_AABB….") },
  handler: async (a) => render(await request(`/v1/questionnaires/${a.questionnaire_id}`)),
};

const listFinancialCategories: Tool = {
  name: "dv_list_financial_categories",
  description: "List the financial categories used in asset intake across the firm's questionnaires.",
  inputSchema: { ...pageParams },
  handler: async (a) => render(await request("/v1/financial-categories", { query: buildPageQuery(a) })),
};

const listEvents: Tool = {
  name: "dv_list_events",
  description: "List events under the firm (intake lifecycle activity).",
  inputSchema: { ...pageParams },
  handler: async (a) => render(await request("/v1/events", { query: buildPageQuery(a) })),
};

const getEvent: Tool = {
  name: "dv_get_event",
  description: "Get a single event.",
  inputSchema: { event_id: z.string().describe("Event id.") },
  handler: async (a) => render(await request(`/v1/events/${a.event_id}`)),
};

const getUser: Tool = {
  name: "dv_get_user",
  description: "Look up a user by id (e.g. the user_id from a webhook payload, to resolve their details/email).",
  inputSchema: { user_id: z.string().describe("User id, e.g. user_AABB….") },
  handler: async (a) => render(await request(`/v1/users/${a.user_id}`)),
};

const getDocument: Tool = {
  name: "dv_get_document",
  description: "Get a single document's metadata by id (use dv_get_matter_documents to list a matter's documents).",
  inputSchema: { document_id: z.string().describe("Document id.") },
  handler: async (a) => render(await request(`/v1/documents/${a.document_id}`)),
};

const createSubscription: Tool = {
  name: "dv_create_webhook_subscription",
  description:
    "Subscribe a URL to a DecisionVault webhook event. The key trigger for document automation is " +
    "'intakeform.submitted' (intake completed by the client). Other events: intakeform.created/started/" +
    "resubmitted/completed, meetingtemplate.completed.",
  inputSchema: {
    url: z.string().describe("HTTPS endpoint to receive the webhook POST."),
    event_type: z
      .enum([
        "intakeform.created",
        "intakeform.started",
        "intakeform.submitted",
        "intakeform.resubmitted",
        "intakeform.completed",
        "meetingtemplate.completed",
      ])
      .describe("Event to subscribe to."),
  },
  handler: async (a) =>
    render(await request("/v1/subscriptions", { method: "POST", body: { url: a.url, event_type: a.event_type } })),
};

const deleteSubscription: Tool = {
  name: "dv_delete_webhook_subscription",
  description: "Delete a webhook subscription by id.",
  inputSchema: { subscription_id: z.string().describe("Subscription id.") },
  handler: async (a) => render(await request(`/v1/subscriptions/${a.subscription_id}`, { method: "DELETE" })),
};

export const firmTools: Tool[] = [
  listQuestionnaires,
  getQuestionnaire,
  listFinancialCategories,
  listEvents,
  getEvent,
  getUser,
  getDocument,
  createSubscription,
  deleteSubscription,
];
