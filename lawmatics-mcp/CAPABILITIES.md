# What the MCP can drive vs. what stays UI-only

Mapped against the live Lawmatics v1 API (Postman collection v1.22.0). The goal is to drive everything from Claude; this documents where the API lets us and where it doesn't.

## Fully drivable via API (the data + operations layer)

Read **and** write, all verified live against a real account:

- **Contacts** — full CRUD, plus find_by_email/phone/name, custom contact types.
- **Matters** (the `prospect` resource) — full CRUD, finders, interactions, relationships.
- **Custom field VALUES** — read (`fields=custom_fields`) and write (`custom_fields:[{id,value}]`). The Zapier gap.
- **Tasks** — CRUD, subtasks, comments. **Notes** — CRUD. **Events/appointments** — CRUD.
- **Tags** — CRUD + attach/detach to matters.
- **Files & Folders** — upload, download, organize.
- **Companies, Addresses, Email addresses, Phone numbers** — CRUD.
- **Reference data you CAN create:** practice areas, sub-statuses, relationship types, task statuses, event types, custom-field *definitions*.
- **Money (partial):** record transactions, expenses, time entries.
- **Webhooks** — subscribe to events (currently `matter.converted`).

This covers essentially all day-to-day operational work: intake, contact/matter management, moving matters through stages, assigning staff, tasks, notes, scheduling, file handling, and the full custom-field nuance.

## UI-only — no write API exists

These have **no** create/update endpoint (most are read-only or absent). They must be built in the Lawmatics UI:

| Area | API status | Why it matters |
|---|---|---|
| **Automations / workflows** | none | The engine behind milestone emails, intake sequences, staff-assignment logic. Cannot be built or edited via API. |
| **Email & SMS content / sending** | Email Campaigns + Custom Emails are **GET-only**; no send endpoint; SMS absent | Can't compose/send campaigns, newsletters, or one-off emails/texts via API. |
| **Form building** | Custom Forms are GET + *submit* only | Can read a form and submit entries, but can't create/edit form structure. |
| **Pipeline & stage structure** | Pipelines + Stages are **GET-only** | Can list them and move a matter to a stage, but can't create/rename/reorder pipelines or stages. |
| **Document generation / templates / e-sign** | none | No doc assembly, templates, or e-signature endpoints. (Handle docs via DecisionVault→HotDocs/Gavel or a custom engine.) |
| **Invoices / LMPay** | Invoices GET-only | Can record transactions, but can't create/send invoices or configure payments. |
| **Reports & dashboards** | none | No reporting endpoint (you can compute your own from raw data). |
| **Marketing sources & campaigns** | GET-only | Can't create campaigns/sources. |
| **Settings & integrations** | mostly none (Users is CRUD) | Email domain, calendar/mail sync, tracking, QualifyAI, app/Zapier connections — UI. |

## How we still "drive everything" in practice

Two patterns close most of the gap without UI hand-work:

1. **Trigger UI-built automations via their triggers.** Lawmatics automations fire on events the API *can* produce: tag added, stage changed, matter created, form submitted, sub-status changed, custom-field changed. So you build an automation **once** in the UI, then Claude activates it by — e.g. — attaching a tag or moving a stage. The firm's milestone emails and intake sequences become Claude-drivable this way, even though the automation itself was authored in the UI.

2. **Browser automation as the last resort.** For genuinely UI-only authoring (building a new automation, designing a form, generating a document), Claude can drive the Lawmatics web UI via a browser agent. Fragile and slower than the API — reserve it for setup tasks, not high-volume operations.

## Bottom line

- **Operations: 100% API-drivable** (and verified).
- **Configuration/content authoring: UI**, but most of it only needs to be set up *once*, after which Claude triggers and operates it via the API.
- The few high-value UI-only items for an estate-planning firm — automations, email/SMS content, document drafting — are either trigger-able via side effects (automations, email-via-automation) or belong to a separate document pipeline (drafting).
