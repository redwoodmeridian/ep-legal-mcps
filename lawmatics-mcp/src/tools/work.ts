import { z } from "zod";
import { request, render } from "../client.js";
import { buildBody, buildListQuery, extraAttributes, listParams, type Tool } from "./shared.js";

// Day-to-day work items attached to a matter/contact: tasks, notes, appointments.
// Lawmatics polymorphic associations use a *_type + *_id pair, where type is
// usually "Prospect" (a matter) or "Contact".

const polymorphicType = z
  .enum(["Prospect", "Contact", "Company"])
  .describe("Record type the item attaches to. 'Prospect' = a matter.");

const listTasks: Tool = {
  name: "lawmatics_list_tasks",
  description: "List tasks. Filter to one matter with filter_by='taskable_id', filter_on=<matter id>.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/tasks", { query: buildListQuery(a) })),
};

const createTask: Tool = {
  name: "lawmatics_create_task",
  description: "Create a task, optionally attached to a matter (taskable_type='Prospect', taskable_id=<id>).",
  inputSchema: {
    name: z.string().describe("Task title."),
    description: z.string().optional(),
    due_date: z.string().optional().describe("Due date, e.g. '07/30/2026'."),
    priority: z.enum(["low", "medium", "high"]).optional(),
    user_ids: z.array(z.union([z.string(), z.number()])).optional().describe("Assignee user ids."),
    taskable_type: polymorphicType.optional(),
    taskable_id: z.union([z.string(), z.number()]).optional().describe("Id of the matter/contact to attach to."),
    done: z.boolean().optional(),
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request("/v1/tasks", {
        method: "POST",
        body: buildBody(
          {
            name: a.name,
            description: a.description,
            due_date: a.due_date,
            priority: a.priority,
            user_ids: a.user_ids,
            taskable_type: a.taskable_type,
            taskable_id: a.taskable_id,
            done: a.done,
          },
          a.extra_attributes,
        ),
      }),
    ),
};

const updateTask: Tool = {
  name: "lawmatics_update_task",
  description: "Update a task by id — e.g. mark done:true, change priority or due_date.",
  inputSchema: {
    task_id: z.union([z.string(), z.number()]).describe("Task id."),
    name: z.string().optional(),
    description: z.string().optional(),
    due_date: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    done: z.boolean().optional(),
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request(`/v1/tasks/${a.task_id}`, {
        method: "PUT",
        body: buildBody(
          {
            name: a.name,
            description: a.description,
            due_date: a.due_date,
            priority: a.priority,
            done: a.done,
          },
          a.extra_attributes,
        ),
      }),
    ),
};

const listNotes: Tool = {
  name: "lawmatics_list_notes",
  description: "List notes. Filter to a matter with filter_by='notable_id', filter_on=<matter id>.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/notes", { query: buildListQuery(a) })),
};

const createNote: Tool = {
  name: "lawmatics_create_note",
  description: "Create a note attached to a matter/contact (notable_type='Prospect', notable_id=<id>).",
  inputSchema: {
    name: z.string().optional().describe("Note title."),
    body: z.string().describe("Note body."),
    notable_type: polymorphicType.describe("Record type the note attaches to."),
    notable_id: z.union([z.string(), z.number()]).describe("Id of the matter/contact."),
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request("/v1/notes", {
        method: "POST",
        body: buildBody(
          { name: a.name, body: a.body, notable_type: a.notable_type, notable_id: a.notable_id },
          a.extra_attributes,
        ),
      }),
    ),
};

const listEvents: Tool = {
  name: "lawmatics_list_events",
  description: "List events / appointments. Filter to a matter with filter_by='eventable_id', filter_on=<matter id>.",
  inputSchema: { ...listParams },
  handler: async (a) => render(await request("/v1/events", { query: buildListQuery(a) })),
};

const createEvent: Tool = {
  name: "lawmatics_create_event",
  description: "Create an event / appointment, optionally attached to a matter (eventable_type='Prospect').",
  inputSchema: {
    name: z.string().describe("Appointment name."),
    description: z.string().optional(),
    start_date: z.string().describe("ISO8601 start, e.g. '2026-06-28T15:00:00-07:00'."),
    end_date: z.string().describe("ISO8601 end."),
    user_ids: z.array(z.union([z.string(), z.number()])).optional().describe("Attendee user ids."),
    eventable_type: polymorphicType.optional(),
    eventable_id: z.union([z.string(), z.number()]).optional(),
    event_type_id: z.union([z.string(), z.number()]).optional(),
    all_day: z.boolean().optional(),
    time_zone: z.string().optional().describe("IANA tz, e.g. 'America/Los_Angeles'."),
    send_invites: z.boolean().optional(),
    extra_attributes: extraAttributes,
  },
  handler: async (a) =>
    render(
      await request("/v1/events", {
        method: "POST",
        body: buildBody(
          {
            name: a.name,
            description: a.description,
            start_date: a.start_date,
            end_date: a.end_date,
            user_ids: a.user_ids,
            eventable_type: a.eventable_type,
            eventable_id: a.eventable_id,
            event_type_id: a.event_type_id,
            all_day: a.all_day,
            time_zone: a.time_zone,
            send_invites: a.send_invites,
          },
          a.extra_attributes,
        ),
      }),
    ),
};

export const workTools: Tool[] = [
  listTasks,
  createTask,
  updateTask,
  listNotes,
  createNote,
  listEvents,
  createEvent,
];
