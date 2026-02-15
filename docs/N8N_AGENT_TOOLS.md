# N8N Agent Tools — Automatrix Agency OS

> Document for: Claude Code N8N specialist
> Purpose: Import these tools into the N8N AI Agent workflow so the agent can manipulate all client data
> Supabase Credential ID: `CP6meo41LS9WqXio` (name: "Supabase account")
> Database: Supabase Cloud project `kbzlfsxckdespwkejzmh` (Virginia)

---

## 1. OVERVIEW

The N8N onboarding agent needs **15 tools** to fully manage client data during and after the chat:

| # | Tool Name | Operation | Table | Purpose |
|---|-----------|-----------|-------|---------|
| 1 | Get Client by Profile ID | getAll + filter | `agency_clients` | Find client record by auth user ID |
| 2 | Update Client | update | `agency_clients` | Update project_scope, status, notes, etc. |
| 3 | Get Timeline Phases | getAll + filter | `project_build_timeline` | Read the 7 project phases |
| 4 | Update Timeline Phase | update | `project_build_timeline` | Change phase status, notes, due_date |
| 5 | Create Login Credential | insert | `client_login_creds` | Add software access entry |
| 6 | Get Login Credentials | getAll + filter | `client_login_creds` | Read software credentials for a client |
| 7 | Delete Login Credential | delete | `client_login_creds` | Remove a credential |
| 8 | Create Task | insert | `agency_tasks` | Create task for client |
| 9 | Update Task | update | `agency_tasks` | Change task status, notes |
| 10 | Get Tasks by Client | getAll + filter | `agency_tasks` | Read tasks for a client |
| 11 | Create Meeting | insert | `agency_meetings` | Schedule a meeting |
| 12 | Create Contact | insert | `agency_contacts` | Add a contact person |
| 13 | Link Contact to Client | insert | `agency_client_contacts` | Associate contact with client |
| 14 | Create Audience | insert | `audiences` | Add audience segment |
| 15 | Complete Client Onboarding | HTTP POST | App API | Mark onboarding done + create agency_client |

---

## 2. DATABASE SCHEMA REFERENCE

### agency_clients (main client record)

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key (auto-generated) |
| `profile_id` | UUID | yes | Links to auth user (profiles.id) |
| `name` | TEXT | yes | Company or person name |
| `client_status` | ENUM | yes | One of: `Pre-Onboarding`, `Onboarding Call`, `Onboarding Email`, `Audit Process`, `Kick Off Call`, `Start Implementation`, `End Implementation`, `Train Team`, `Optimisation`, `Full Launch`, `Monthly Optimisation` |
| `plan` | TEXT[] | yes | Array of plan names |
| `assigned_to` | UUID | yes | Staff user assigned to this client |
| `country` | TEXT[] | yes | Array of countries |
| `industry` | TEXT[] | yes | Array of industries |
| `website` | TEXT | yes | Client website URL |
| `linkedin_page` | TEXT | yes | LinkedIn page URL |
| `address` | TEXT | yes | Physical address |
| `notes` | TEXT | yes | Free-form notes |
| `contract_signed` | DATE | yes | Date contract was signed |
| `onboarding_checklist_email` | DATE | yes | Date checklist email was sent |
| `invoice_sent` | DATE | yes | Date invoice was sent |
| `monthly_retainer` | NUMERIC | yes | Monthly retainer amount |
| `average_check_size` | NUMERIC | yes | Average check size |
| `comms_channel` | TEXT[] | yes | Array: email, slack, whatsapp, etc. |
| `poc_id` | UUID | yes | Point of contact (agency_contacts.id) |
| `project_scope` | JSONB | yes | **ProjectScope object** (see below) |

### project_scope JSONB structure

```json
{
  "project_name": "string",
  "description": "string",
  "app_level": "lv1 | lv2 | lv3",
  "frontend": "string",
  "backend": "string",
  "database": "string",
  "llms": ["string array"],
  "integrations": ["string array"],
  "platform": "string",
  "timeline": "string",
  "budget": "string"
}
```

### project_build_timeline (7 phases per client, auto-created)

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `client_id` | UUID | read-only | References agency_clients.id |
| `name` | TEXT | yes | Phase name |
| `status` | ENUM | yes | `Blocked`, `Not Started`, `In Progress`, `Complete` |
| `assigned_to` | UUID | yes | Staff user assigned |
| `description` | TEXT | yes | Phase description |
| `due_date` | DATE | yes | Due date (YYYY-MM-DD) |
| `notes` | TEXT | yes | Phase notes |
| `sort_order` | INT | yes | Display order (1-7) |

### client_login_creds (software access)

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `client_id` | UUID | yes | References agency_clients.id |
| `software_name` | TEXT | yes | e.g. "GoHighLevel", "Supabase", "Vercel" |
| `email` | TEXT | yes | Login email |
| `password_encrypted` | TEXT | yes | Password (stored as-is, encrypt before if needed) |

### agency_tasks

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `name` | TEXT | yes | Task title |
| `status` | ENUM | yes | `BLOCKED`, `Not Started`, `In Progress`, `Complete` |
| `type` | ENUM | yes | `Internal`, `Client Action`, `Automation` |
| `due_date` | DATE | yes | Due date (YYYY-MM-DD) |
| `notes` | TEXT | yes | Task notes |
| `person_id` | UUID | yes | Assigned staff user |
| `client_id` | UUID | yes | References agency_clients.id |

### agency_meetings

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `name` | TEXT | yes | Meeting title |
| `type` | ENUM | yes | `Sales`, `Onboarding`, `Kickoff`, `Progress`, `Team Sync`, `Client Meeting`, `Planning`, `Retrospective` |
| `date` | TIMESTAMPTZ | yes | Meeting date/time (ISO 8601) |
| `notes` | TEXT | yes | Meeting notes |
| `recording_url` | TEXT | yes | Recording link |
| `client_id` | UUID | yes | References agency_clients.id |

### agency_contacts

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `name` | TEXT | yes | Contact name |
| `type` | TEXT[] | yes | Array: e.g. ["Decision Maker", "Technical"] |
| `email` | TEXT | yes | Contact email |
| `phone` | TEXT | yes | Phone number |
| `role_title` | TEXT | yes | Job title |
| `time_zone` | TEXT | yes | Timezone string |

### audiences

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Primary key |
| `audience_name` | TEXT | yes | Audience segment name |
| `date` | DATE | yes | Date created |
| `geo` | TEXT | yes | Geographic targeting |
| `company_keywords_broad` | TEXT | yes | Broad company keywords |
| `company_keywords_specific` | TEXT | yes | Specific company keywords |
| `titles_broad` | TEXT | yes | Broad job titles |
| `titles_specific` | TEXT | yes | Specific job titles |
| `links` | TEXT | yes | Reference links |
| `gpt_url` | TEXT | yes | GPT/AI tool URL |
| `client_id` | UUID | yes | References agency_clients.id |

---

## 3. IMPORTANT CONTEXT FOR THE N8N AGENT

### How the flow works:
1. The **webapp** creates the `agency_clients` row when the user clicks "Ir para Dashboard" (via `/api/onboarding/complete-client`)
2. The webapp also sends `projectScope` to the API, which stores it in `agency_clients.project_scope`
3. A **DB trigger** auto-creates 7 `project_build_timeline` rows when the `agency_clients` row is created
4. After that, the N8N agent can freely **read and update** all client data

### RLS (Row Level Security):
- The Supabase credential in N8N should use the **service_role key** (bypasses RLS)
- If using the anon key, only staff (admin/vibecoder) can do full CRUD
- Clients can only SELECT their own data

### Key UUIDs the agent will need:
- `profile_id`: The user's auth UUID (passed as `userEmail` or from session)
- `client_id`: The `agency_clients.id` — agent should GET this first using profile_id

---

## 4. COMPLETE N8N TOOLS JSON

Copy the entire JSON below and paste it into the N8N workflow editor (Import from JSON or paste into existing workflow).

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "agency_clients",
        "filterType": "manual",
        "matchType": "equal",
        "filters": {
          "conditions": [
            {
              "keyName": "profile_id",
              "condition": "eq",
              "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('profile_id', 'The user profile UUID from auth. Use this to find the client record.', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 0],
      "id": "tool-01-get-client",
      "name": "Get Client by Profile ID",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "agency_clients",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('id', 'The agency_client UUID to update. Get this from Get Client by Profile ID first.', 'string') }}"
            },
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Client company or person name', 'string') }}"
            },
            {
              "fieldId": "client_status",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_status', 'One of: Pre-Onboarding, Onboarding Call, Onboarding Email, Audit Process, Kick Off Call, Start Implementation, End Implementation, Train Team, Optimisation, Full Launch, Monthly Optimisation', 'string') }}"
            },
            {
              "fieldId": "website",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('website', 'Client website URL', 'string') }}"
            },
            {
              "fieldId": "linkedin_page",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('linkedin_page', 'Client LinkedIn page URL', 'string') }}"
            },
            {
              "fieldId": "address",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('address', 'Client physical address', 'string') }}"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('notes', 'Free-form notes about the client', 'string') }}"
            },
            {
              "fieldId": "monthly_retainer",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('monthly_retainer', 'Monthly retainer amount as number e.g. 5000.00', 'number') }}"
            },
            {
              "fieldId": "project_scope",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('project_scope', 'JSONB object with keys: project_name, description, app_level (lv1/lv2/lv3), frontend, backend, database, llms (array), integrations (array), platform, timeline, budget. Send as JSON string.', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [600, 0],
      "id": "tool-02-update-client",
      "name": "Update Client",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "project_build_timeline",
        "filterType": "manual",
        "matchType": "equal",
        "filters": {
          "conditions": [
            {
              "keyName": "client_id",
              "condition": "eq",
              "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID. Get this from Get Client by Profile ID first.', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 200],
      "id": "tool-03-get-timeline",
      "name": "Get Timeline Phases",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "project_build_timeline",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('id', 'The timeline phase UUID to update. Get this from Get Timeline Phases first.', 'string') }}"
            },
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Phase name e.g. Software Access, Database Building, etc.', 'string') }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('status', 'One of: Blocked, Not Started, In Progress, Complete', 'string') }}"
            },
            {
              "fieldId": "description",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('description', 'Description of what this phase involves', 'string') }}"
            },
            {
              "fieldId": "due_date",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('due_date', 'Due date in YYYY-MM-DD format', 'string') }}"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('notes', 'Notes for this phase', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [600, 200],
      "id": "tool-04-update-timeline",
      "name": "Update Timeline Phase",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "client_login_creds",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "client_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID this credential belongs to', 'string') }}"
            },
            {
              "fieldId": "software_name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('software_name', 'Name of the software e.g. GoHighLevel, Supabase, Vercel, GitHub', 'string') }}"
            },
            {
              "fieldId": "email",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('email', 'Login email for this software', 'string') }}"
            },
            {
              "fieldId": "password_encrypted",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('password_encrypted', 'Password for this software', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 400],
      "id": "tool-05-create-cred",
      "name": "Create Login Credential",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "client_login_creds",
        "filterType": "manual",
        "matchType": "equal",
        "filters": {
          "conditions": [
            {
              "keyName": "client_id",
              "condition": "eq",
              "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID to get credentials for', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [600, 400],
      "id": "tool-06-get-creds",
      "name": "Get Login Credentials",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "delete",
        "tableId": "client_login_creds",
        "filterType": "manual",
        "matchType": "equal",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('id', 'The UUID of the login credential to delete', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [800, 400],
      "id": "tool-07-delete-cred",
      "name": "Delete Login Credential",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "agency_tasks",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Task title describing what needs to be done', 'string') }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('status', 'One of: BLOCKED, Not Started, In Progress, Complete. Default: Not Started', 'string') }}"
            },
            {
              "fieldId": "type",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('type', 'One of: Internal, Client Action, Automation', 'string') }}"
            },
            {
              "fieldId": "due_date",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('due_date', 'Due date in YYYY-MM-DD format', 'string') }}"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('notes', 'Additional details or instructions for the task', 'string') }}"
            },
            {
              "fieldId": "client_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID this task belongs to', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 600],
      "id": "tool-08-create-task",
      "name": "Create Task",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "agency_tasks",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('id', 'The task UUID to update', 'string') }}"
            },
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Updated task title', 'string') }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('status', 'One of: BLOCKED, Not Started, In Progress, Complete', 'string') }}"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('notes', 'Updated task notes', 'string') }}"
            },
            {
              "fieldId": "due_date",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('due_date', 'Updated due date in YYYY-MM-DD format', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [600, 600],
      "id": "tool-09-update-task",
      "name": "Update Task",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "agency_tasks",
        "filterType": "manual",
        "matchType": "equal",
        "filters": {
          "conditions": [
            {
              "keyName": "client_id",
              "condition": "eq",
              "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID to get tasks for', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [800, 600],
      "id": "tool-10-get-tasks",
      "name": "Get Tasks by Client",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "agency_meetings",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Meeting title e.g. Onboarding Call, Kick Off, Weekly Sync', 'string') }}"
            },
            {
              "fieldId": "type",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('type', 'One of: Sales, Onboarding, Kickoff, Progress, Team Sync, Client Meeting, Planning, Retrospective', 'string') }}"
            },
            {
              "fieldId": "date",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('date', 'Meeting date and time in ISO 8601 format e.g. 2026-02-20T14:00:00Z', 'string') }}"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('notes', 'Meeting agenda or notes', 'string') }}"
            },
            {
              "fieldId": "client_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID this meeting is for', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 800],
      "id": "tool-11-create-meeting",
      "name": "Create Meeting",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "agency_contacts",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('name', 'Contact person full name', 'string') }}"
            },
            {
              "fieldId": "email",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('email', 'Contact email address', 'string') }}"
            },
            {
              "fieldId": "phone",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('phone', 'Contact phone number', 'string') }}"
            },
            {
              "fieldId": "role_title",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('role_title', 'Job title e.g. CEO, CTO, Marketing Director', 'string') }}"
            },
            {
              "fieldId": "time_zone",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('time_zone', 'Timezone e.g. America/Sao_Paulo, UTC', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [600, 800],
      "id": "tool-12-create-contact",
      "name": "Create Contact",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "agency_client_contacts",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "client_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID', 'string') }}"
            },
            {
              "fieldId": "contact_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('contact_id', 'The agency_contacts UUID to link. Get this from the Create Contact result.', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [800, 800],
      "id": "tool-13-link-contact",
      "name": "Link Contact to Client",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "tableId": "audiences",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "audience_name",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('audience_name', 'Name for this audience segment e.g. Tech Decision Makers, HR Managers Brazil', 'string') }}"
            },
            {
              "fieldId": "geo",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('geo', 'Geographic targeting e.g. Brazil, LATAM, US', 'string') }}"
            },
            {
              "fieldId": "company_keywords_broad",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('company_keywords_broad', 'Broad company keywords for targeting', 'string') }}"
            },
            {
              "fieldId": "company_keywords_specific",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('company_keywords_specific', 'Specific company keywords for targeting', 'string') }}"
            },
            {
              "fieldId": "titles_broad",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('titles_broad', 'Broad job titles to target', 'string') }}"
            },
            {
              "fieldId": "titles_specific",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('titles_specific', 'Specific job titles to target', 'string') }}"
            },
            {
              "fieldId": "gpt_url",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('gpt_url', 'URL to a GPT or AI tool used for this audience', 'string') }}"
            },
            {
              "fieldId": "client_id",
              "fieldValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('client_id', 'The agency_client UUID this audience belongs to', 'string') }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [400, 1000],
      "id": "tool-14-create-audience",
      "name": "Create Audience",
      "credentials": {
        "supabaseApi": {
          "id": "CP6meo41LS9WqXio",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('url', 'Full URL of the Automatrix API endpoint. For completing onboarding: https://www.automatrix-ia.com/api/onboarding/complete-client', 'string') }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('body', 'JSON body to send. For complete-client: {\"projectScope\": {...}}', 'string') }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.4,
      "position": [600, 1000],
      "id": "tool-15-http-request",
      "name": "HTTP Request to App API"
    }
  ],
  "connections": {
    "Get Client by Profile ID": {
      "ai_tool": [[]]
    },
    "Update Client": {
      "ai_tool": [[]]
    },
    "Get Timeline Phases": {
      "ai_tool": [[]]
    },
    "Update Timeline Phase": {
      "ai_tool": [[]]
    },
    "Create Login Credential": {
      "ai_tool": [[]]
    },
    "Get Login Credentials": {
      "ai_tool": [[]]
    },
    "Delete Login Credential": {
      "ai_tool": [[]]
    },
    "Create Task": {
      "ai_tool": [[]]
    },
    "Update Task": {
      "ai_tool": [[]]
    },
    "Get Tasks by Client": {
      "ai_tool": [[]]
    },
    "Create Meeting": {
      "ai_tool": [[]]
    },
    "Create Contact": {
      "ai_tool": [[]]
    },
    "Link Contact to Client": {
      "ai_tool": [[]]
    },
    "Create Audience": {
      "ai_tool": [[]]
    },
    "HTTP Request to App API": {
      "ai_tool": [[]]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "83f8e8e97a7899cad39ae6827b540590d0375e0f8350c526c114b430bb333643"
  }
}
```

---

## 5. TOOL USAGE GUIDE FOR THE AI AGENT

### Typical Onboarding Flow

The AI agent should follow this sequence during a client onboarding chat:

```
1. CHAT starts → Agent collects project info via conversation
2. Agent returns projectScope fields progressively in each response
3. When chat is complete (complete: true):
   → App calls /api/onboarding/complete-client (creates agency_clients row + 7 timeline phases)
4. AFTER onboarding is done, agent can use tools to:
   a. Get Client by Profile ID → get the client_id
   b. Update Client → update project_scope, status, notes
   c. Get Timeline Phases → see the 7 auto-created phases
   d. Update Timeline Phase → set due dates, change status
   e. Create Login Credential → add software access entries
   f. Create Task → create onboarding tasks
   g. Create Meeting → schedule kickoff meeting
   h. Create Contact → add client contacts
   i. Link Contact to Client → associate them
   j. Create Audience → define target audience
```

### Example: Agent updates project_scope after chat

```
Tool: Update Client
Input:
  id: "abc-123-uuid"
  project_scope: '{"project_name":"Assessment System","frontend":"Next.js","backend":"Supabase","database":"PostgreSQL","llms":["GPT-4o"],"integrations":["GoHighLevel","Stripe"],"platform":"automacao","timeline":"3 meses","budget":"R$ 15.000","app_level":"lv2"}'
```

### Example: Agent creates initial tasks after onboarding

```
Tool: Create Task
Input:
  name: "Configurar acesso GoHighLevel"
  status: "Not Started"
  type: "Internal"
  due_date: "2026-02-20"
  notes: "Criar conta e configurar pipeline para o cliente"
  client_id: "abc-123-uuid"
```

### Example: Agent updates a timeline phase

```
Tool: Update Timeline Phase
Input:
  id: "phase-uuid-from-get"
  status: "In Progress"
  due_date: "2026-03-01"
  notes: "Configurando acesso a GoHighLevel, Supabase, Vercel"
```

---

## 6. NOTES FOR THE N8N SPECIALIST

1. **Credential**: All Supabase tools use credential `CP6meo41LS9WqXio`. Make sure it uses the **service_role key** (not anon key) to bypass RLS.

2. **project_scope field**: This is JSONB in Postgres. When updating via the Supabase tool, send it as a **JSON string**. N8N should handle the parsing.

3. **Arrays (plan, country, industry, comms_channel, type)**: These are `TEXT[]` in Postgres. Send as JSON arrays in string form: `'["email","slack"]'`.

4. **The 7 timeline phases are auto-created** when `agency_clients` is inserted. The agent should NOT create them manually — just read and update.

5. **Junction tables** (`agency_client_contacts`, etc.): Both columns form a composite primary key. Insert only, no update needed.

6. **HTTP Request tool**: This is for calling the webapp's own API. For Supabase operations, always prefer the Supabase tools. Use HTTP only for app-specific endpoints like `/api/onboarding/complete-client`.

7. **The `profile_id`** is the most important field. The webhook payload now includes `userId` which IS the `profile_id`. The agent can use this directly in the "Get Client by Profile ID" tool.

8. **Webhook payload** (already implemented in `/api/chat/onboard/route.ts`):
   ```json
   {
     "message": "user message",
     "sessionId": "uuid-v4",
     "role": "client",
     "userName": "Lucas Silva",
     "userEmail": "lucas@automatrix-ia.com",
     "userId": "3a595669-f082-45ec-9e76-81e6409ee9c0"
   }
   ```
   The `userId` field equals `profile_id` in the database. Use it directly in Supabase tool filters.
