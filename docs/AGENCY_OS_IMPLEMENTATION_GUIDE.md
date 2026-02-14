# Agency OS Implementation Guide - Automatrix WebApp

> Documento de instrucoes completo para implementar o sistema Agency OS como dashboard
> da plataforma Automatrix. Este documento contem TODO o contexto necessario para
> restartar uma sessao do Claude Code e continuar a implementacao.

---

## 1. CONTEXTO DO PROJETO

### 1.1 O que e a Automatrix
Plataforma SaaS que conecta **clientes** que precisam de automacao com **desenvolvedores** (vibecoders). Funciona como marketplace + gestao de projetos + portal do cliente.

### 1.2 Stack Atual
| Tecnologia | Detalhes |
|------------|----------|
| **Frontend** | Next.js 16 + Turbopack + Tailwind CSS + shadcn/ui |
| **Backend** | Supabase Cloud (Postgres + Auth + Storage + RLS + Realtime) |
| **Supabase Project** | `autoapp` (kbzlfsxckdespwkejzmh) - Virginia |
| **Auth** | Supabase Auth (email/password + Google/GitHub OAuth), email confirm DISABLED |
| **AI SDK** | v4.3 (`ai` + `@ai-sdk/openai` + `zod`) — v6 NOT compatible |
| **AI Chat** | N8N webhook at `https://n8n.automatrix.site/webhook/onboardf` |
| **Port** | 3333 (NOT 3000!) |
| **Domain** | `www.automatrix-ia.com` |
| **Build** | Clean - 31 routes, zero TS errors, zero ESLint errors |

### 1.3 Estado Atual do Git
- **Branch**: `feat/landing-page-redesign` (2 commits ahead of `main`)
- **Main**: 10+ commits ahead of origin (not pushed)
- **Commits**:
  - `0c25f55` feat: Role-based registration flow with landing page cards
  - `11df81e` refactor: Rename "Vibecoder" to "Desenvolvedor" in all user-facing text

### 1.4 Unstaged Changes (to be committed as part of Agency OS work)
```
M src/app/api/auth/callback/route.ts
M src/app/page.tsx
?? docs/N8N_ONBOARDING_WORKFLOW.md
?? onboarding/
?? src/app/api/chat/onboard/
?? src/app/auth-panel.tsx
?? src/app/landing-chat.tsx
?? src/app/landing-hero.tsx
?? src/app/landing-page.tsx
```

### 1.5 Usuario Existente
- `lucas@automatrix-ia.com` (role: admin, id: `3a595669-f082-45ec-9e76-81e6409ee9c0`)
- Unico usuario no sistema

### 1.6 Convencoes Importantes
- **Idioma UI**: Portugues (BR)
- **Idioma Codigo**: Ingles
- **Termo**: "Vibecoder" no DB → "Desenvolvedor" na UI
- **Plano DB**: `business` → UI exibe "Max"
- **Notificacoes**: Coluna `body` (NAO `message`)
- **useSearchParams**: Requer `<Suspense>` wrapper na page pai
- **AI SDK**: NUNCA usar v6, somente v4

---

## 2. O QUE IMPLEMENTAR - AGENCY OS

### 2.1 Visao Geral
O **Agency OS** e um sistema de gestao para agencias de automacao. Sera implementado como o **dashboard principal** da Automatrix, substituindo o dashboard atual simples por um sistema completo com 11 paginas.

### 2.2 Decisoes Arquiteturais (JA DEFINIDAS)

| Decisao | Escolha |
|---------|---------|
| **Painel direito do chat** | Client Portal completo (como CPV2.png) |
| **Escopo** | Agency OS completo (todas as 11 paginas) |
| **Database** | Adaptar tabelas do Agency OS as existentes |
| **Pos-onboarding** | Dashboard diferente por role |

### 2.3 Roles e Visibilidade

**Admin/Vibecoder (agency staff):**
- Ve TUDO: Home, Tasks, Clients Kanban, Contacts, Meetings, Audiences, Employees, Training, Analytics, Daily Report
- CRUD completo em todas as entidades

**Cliente:**
- Ve APENAS:
  - **Client Detail** (sua pagina com 4 tabs: Company, Tasks, Contacts, Meetings)
  - **Client Portal** (recursos, credenciais, timeline do projeto)
  - Area de marketplace existente (workflows, projetos, mensagens)
- NAO ve: Home, Analytics, Employees, Audiences, Training, outros clientes

### 2.4 Referencia Visual
- **CPV2.png** (`/Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/CPV2.png`): Layout do Client Portal com Stack Tecnologica (top-left), System Architecture diagram (top-right), Software Access table (bottom-left), Project Launch Timeline kanban (bottom)
- **Spec completo**: `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-specification.md`
- **User flows**: `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-userflow.md`
- **Builder instructions**: `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-builder-instructions-complementar.md`

---

## 3. DATABASE - MAPEAMENTO E MIGRACAO

### 3.1 Tabelas Existentes (17 tabelas - NAO ALTERAR)
```
profiles, user_subscriptions, vibecoders, workflows, workflow_downloads,
projects, milestones, bids, conversations, conversation_participants,
messages, agent_chat_sessions, onboarding_sessions, notifications,
payments, vibecoder_payouts, blog_posts
```

### 3.2 Coluna ja adicionada (migration pendente de aplicacao)
```sql
-- File: supabase/migrations/20260213120000_add_project_scope.sql
ALTER TABLE onboarding_sessions ADD COLUMN project_scope JSONB DEFAULT '{}';
```
**STATUS**: Migration criada mas NAO aplicada ao Supabase Cloud. Aplicar com:
```bash
npx supabase db push --linked
```

### 3.3 NOVAS Tabelas Agency OS (criar migration)

#### Enums novos
```sql
CREATE TYPE agency_client_status AS ENUM (
  'Pre-Onboarding', 'Onboarding Call', 'Onboarding Email', 'Audit Process',
  'Kick Off Call', 'Start Implementation', 'End Implementation',
  'Train Team', 'Optimisation', 'Full Launch', 'Monthly Optimisation'
);

CREATE TYPE agency_task_status AS ENUM ('BLOCKED', 'Not Started', 'In Progress', 'Complete');
CREATE TYPE agency_task_type AS ENUM ('Internal', 'Client Action', 'Automation');

CREATE TYPE agency_meeting_type AS ENUM (
  'Sales', 'Onboarding', 'Kickoff', 'Progress',
  'Team Sync', 'Client Meeting', 'Planning', 'Retrospective'
);

CREATE TYPE employee_department AS ENUM (
  'Campaign Management', 'Account Management', 'Marketing', 'Sales', 'Operations'
);

CREATE TYPE project_phase_status AS ENUM ('Blocked', 'Not Started', 'In Progress', 'Complete');
```

#### Tabelas principais

```sql
-- 1. AGENCY CLIENTS (separada de profiles - 1:1 opcional)
CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,  -- nullable, 1:1
  name TEXT NOT NULL,
  client_status agency_client_status DEFAULT 'Pre-Onboarding',
  plan TEXT[] DEFAULT '{}',           -- multi_select: Scaler, MoonShot
  assigned_to UUID REFERENCES auth.users(id),
  country TEXT[] DEFAULT '{}',
  industry TEXT[] DEFAULT '{}',
  website TEXT,
  linkedin_page TEXT,
  address TEXT,
  notes TEXT,
  contract_signed DATE,
  onboarding_checklist_email DATE,
  invoice_sent DATE,
  monthly_retainer NUMERIC(10,2),
  average_check_size NUMERIC(10,2),
  comms_channel TEXT[] DEFAULT '{}',  -- Slack, Whatsapp, Telegram, etc
  poc_id UUID,                         -- FK para agency_contacts
  project_scope JSONB DEFAULT '{}',    -- from onboarding chat
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AGENCY TASKS
CREATE TABLE agency_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status agency_task_status DEFAULT 'Not Started',
  type agency_task_type,
  due_date DATE,
  notes TEXT,
  person_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,
  daily_report_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AGENCY CONTACTS
CREATE TABLE agency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT[] DEFAULT '{}',  -- COO, Decision Maker, Call Host, Sales, Founder, etc
  email TEXT,
  phone TEXT,
  role_title TEXT,
  time_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AGENCY MEETINGS
CREATE TABLE agency_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type agency_meeting_type,
  date TIMESTAMPTZ,
  notes TEXT,
  recording_url TEXT,
  client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,
  daily_report_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AUDIENCES
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_name TEXT NOT NULL,
  date DATE,
  geo TEXT,
  company_keywords_broad TEXT,
  company_keywords_specific TEXT,
  titles_broad TEXT,
  titles_specific TEXT,
  links TEXT,
  gpt_url TEXT,
  client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. EMPLOYEES (reuse profiles for auth users, this is for extra employee metadata)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT,
  department employee_department,
  location TEXT,
  start_date DATE,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TRAINING RESOURCES
CREATE TABLE training_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  video_url TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DAILY REPORTS
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  report_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PROJECT BUILD TIMELINE (per-client, 7 phases)
CREATE TABLE project_build_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status project_phase_status DEFAULT 'Not Started',
  assigned_to UUID REFERENCES auth.users(id),
  description TEXT,
  due_date DATE,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CLIENT LOGIN CREDS (software access per-client)
CREATE TABLE client_login_creds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  software_name TEXT NOT NULL,
  email TEXT,
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Tabelas de juncao (many-to-many)

```sql
-- Clients <-> Contacts
CREATE TABLE agency_client_contacts (
  client_id UUID REFERENCES agency_clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES agency_contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, contact_id)
);

-- Clients <-> Daily Reports
CREATE TABLE agency_client_daily_reports (
  client_id UUID REFERENCES agency_clients(id) ON DELETE CASCADE,
  daily_report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, daily_report_id)
);

-- Meetings <-> Contacts (external participants)
CREATE TABLE agency_meeting_participants (
  meeting_id UUID REFERENCES agency_meetings(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES agency_contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, contact_id)
);

-- Meetings <-> Users (internal participants)
CREATE TABLE agency_meeting_internals (
  meeting_id UUID REFERENCES agency_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, user_id)
);
```

#### Foreign Keys adicionais
```sql
ALTER TABLE agency_tasks ADD CONSTRAINT fk_agency_tasks_daily_report
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE SET NULL;

ALTER TABLE agency_meetings ADD CONSTRAINT fk_agency_meetings_daily_report
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE SET NULL;

ALTER TABLE agency_clients ADD CONSTRAINT fk_agency_clients_poc
  FOREIGN KEY (poc_id) REFERENCES agency_contacts(id) ON DELETE SET NULL;
```

#### Indexes
```sql
CREATE INDEX idx_agency_clients_status ON agency_clients(client_status);
CREATE INDEX idx_agency_clients_profile ON agency_clients(profile_id);
CREATE INDEX idx_agency_tasks_status ON agency_tasks(status);
CREATE INDEX idx_agency_tasks_due ON agency_tasks(due_date);
CREATE INDEX idx_agency_tasks_client ON agency_tasks(client_id);
CREATE INDEX idx_agency_meetings_date ON agency_meetings(date);
CREATE INDEX idx_agency_meetings_client ON agency_meetings(client_id);
CREATE INDEX idx_audiences_client ON audiences(client_id);
CREATE INDEX idx_timeline_client ON project_build_timeline(client_id);
CREATE INDEX idx_login_creds_client ON client_login_creds(client_id);
CREATE INDEX idx_employees_profile ON employees(profile_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
```

#### RLS Policies
```sql
-- Enable RLS on all new tables
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_build_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_login_creds ENABLE ROW LEVEL SECURITY;

-- Staff (admin/vibecoder) can see everything
-- Clients can only see their own data

-- Example for agency_clients:
CREATE POLICY "staff_full_access" ON agency_clients
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'vibecoder'))
  );

CREATE POLICY "client_own_data" ON agency_clients
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Repeat similar pattern for all tables, adjusting the filter column:
-- agency_tasks: client sees where client_id matches their agency_client
-- agency_contacts: client sees contacts linked to their client via junction
-- agency_meetings: client sees where client_id matches their agency_client
-- project_build_timeline: client sees where client_id matches their agency_client
-- client_login_creds: client sees where client_id matches their agency_client
```

#### Triggers
```sql
-- Auto-update updated_at on all tables with that column
CREATE OR REPLACE FUNCTION agency_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_agency_clients_updated BEFORE UPDATE ON agency_clients
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_agency_tasks_updated BEFORE UPDATE ON agency_tasks
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_agency_contacts_updated BEFORE UPDATE ON agency_contacts
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_agency_meetings_updated BEFORE UPDATE ON agency_meetings
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_employees_updated BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_timeline_updated BEFORE UPDATE ON project_build_timeline
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();
CREATE TRIGGER tr_login_creds_updated BEFORE UPDATE ON client_login_creds
  FOR EACH ROW EXECUTE FUNCTION agency_update_updated_at();

-- Auto-create 7 Project Build Timeline phases when new client is created
CREATE OR REPLACE FUNCTION create_client_portal_template()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_build_timeline (client_id, name, description, sort_order) VALUES
    (NEW.id, 'Software Access', 'Get access to all softwares needed for the onboarding system', 1),
    (NEW.id, 'Database Building', 'Develop the infrastructure for the system', 2),
    (NEW.id, 'Auditing System', 'Develop the full scope', 3),
    (NEW.id, 'Theme & Aesthetics', 'Make sure the dashboard looks clean and easy to use', 4),
    (NEW.id, 'Automations', 'Hook up all automations to make the system rounded', 5),
    (NEW.id, 'Training & Handover', 'Full Custom Dashboard ready to Launch', 6),
    (NEW.id, 'Feedback', 'Get initial Feedback and start iteration process', 7);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_client_create_portal
  AFTER INSERT ON agency_clients
  FOR EACH ROW EXECUTE FUNCTION create_client_portal_template();
```

#### Views
```sql
-- Tasks with overdue flag
CREATE VIEW agency_tasks_with_overdue AS
SELECT t.*, c.name AS client_name,
  CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Complete' THEN true ELSE false END AS is_overdue
FROM agency_tasks t
LEFT JOIN agency_clients c ON t.client_id = c.id;

-- Clients with task progress
CREATE VIEW agency_clients_with_progress AS
SELECT c.*,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'Complete') AS completed_tasks,
  CASE WHEN COUNT(t.id) > 0
    THEN ROUND(100.0 * COUNT(t.id) FILTER (WHERE t.status = 'Complete') / COUNT(t.id))
    ELSE 0 END AS task_progress_pct
FROM agency_clients c
LEFT JOIN agency_tasks t ON t.client_id = c.id
GROUP BY c.id;
```

### 3.4 Onboarding -> Agency Client Mapping
Quando o onboarding do cliente termina (via chat com agente IA), os dados do `projectScope` devem ser mapeados para um registro em `agency_clients`:

| Campo do ProjectScope | Campo do agency_clients |
|----------------------|------------------------|
| project_name | name (se nao tiver outro nome) |
| description | notes |
| platform | industry (array) |
| integrations | comms_channel ou campo custom |
| timeline | project_build_timeline > due_dates |
| budget | monthly_retainer |
| frontend/backend/database | project_scope JSONB (mantido como referencia) |
| llms | project_scope JSONB |

---

## 4. DESIGN SYSTEM

### 4.1 Cores (Dark Theme - Agency OS)
```css
:root {
  --bg-page: #191919;
  --bg-surface: #252525;
  --bg-card: #2F2F2F;
  --accent-blue: #2383E2;
  --text-primary: rgba(255, 255, 255, 0.92);   /* #FFFFFFEB */
  --text-secondary: rgba(255, 255, 255, 0.50); /* #FFFFFF80 */
  --text-muted: rgba(255, 255, 255, 0.30);     /* #FFFFFF4D */
  --border: rgba(255, 255, 255, 0.08);          /* #FFFFFF14 */
}
```

### 4.2 Cores de Status
| Status | Cor | Hex | Tailwind |
|--------|-----|-----|----------|
| Complete / Active | Verde | #4DAB6B | `text-green-500 bg-green-500/10` |
| In Progress / Warning | Amarelo | #D9A74A | `text-yellow-500 bg-yellow-500/10` |
| BLOCKED / Error | Vermelho | #E16259 | `text-red-500 bg-red-500/10` |
| Default / Info | Roxo | #6940A5 | `text-purple-500 bg-purple-500/10` |
| Accent / Link | Azul | #2383E2 | `text-blue-500 bg-blue-500/10` |

### 4.3 Tipografia
- **Font**: Inter (ja configurada no projeto)
- **Headings**: font-weight 600-700
- **Body**: font-weight 400
- **Labels**: font-weight 500, text-xs (12px)

### 4.4 Componentes UI
O projeto ja usa **shadcn/ui**. Os componentes instalados podem ser verificados em `src/components/ui/`. Usar o dark theme mapeando as cores do Agency OS para as CSS variables do Tailwind/shadcn.

---

## 5. ESTRUTURA DE ARQUIVOS - PLANO

### 5.1 Novas rotas a criar

```
src/app/(dashboard)/
├── dashboard/
│   ├── page.tsx                    # EXISTENTE - adaptar com role-based redirect
│   ├── dashboard-client.tsx        # EXISTENTE - manter para compatibilidade
│   │
│   ├── agency/                     # NOVO - Agency OS Home (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── agency-home-client.tsx
│   │
│   ├── tasks/                      # NOVO - Tasks global (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── tasks-client.tsx
│   │
│   ├── clients/                    # NOVO - Clients Kanban (admin/vibecoder)
│   │   ├── page.tsx
│   │   ├── clients-kanban.tsx
│   │   ├── [id]/                   # Client Detail
│   │   │   ├── page.tsx
│   │   │   └── client-detail.tsx
│   │   └── [id]/portal/            # Client Portal
│   │       ├── page.tsx
│   │       └── client-portal.tsx
│   │
│   ├── contacts/                   # NOVO - Contacts (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── contacts-client.tsx
│   │
│   ├── meetings/                   # NOVO - Meetings (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── meetings-client.tsx
│   │
│   ├── audiences/                  # NOVO - Audiences (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── audiences-client.tsx
│   │
│   ├── employees/                  # NOVO - Employees (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── employees-client.tsx
│   │
│   ├── training/                   # NOVO - Training (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── training-client.tsx
│   │
│   ├── analytics/                  # NOVO - Analytics (admin/vibecoder)
│   │   ├── page.tsx
│   │   └── analytics-client.tsx
│   │
│   └── daily-report/               # NOVO - Daily Report
│       ├── page.tsx
│       └── daily-report-client.tsx
```

### 5.2 Novos componentes compartilhados

```
src/components/agency/
├── kanban-board.tsx        # Reusable Kanban (clients by status, tasks by status)
├── data-table.tsx          # Reusable sortable/filterable table
├── calendar-view.tsx       # Calendar view for tasks/meetings
├── status-badge.tsx        # Status badge with correct colors
├── client-portal-card.tsx  # Client Portal right-panel (replaces ProjectScopeCard)
├── project-timeline.tsx    # 7-phase timeline component
├── software-access.tsx     # Client login creds table
├── quick-actions.tsx       # Home page quick action buttons
└── directory-grid.tsx      # Navigation card grid for Home
```

### 5.3 Types a adicionar em `src/types/index.ts`

```typescript
// Agency OS Enums
export type AgencyClientStatus =
  | 'Pre-Onboarding' | 'Onboarding Call' | 'Onboarding Email'
  | 'Audit Process' | 'Kick Off Call' | 'Start Implementation'
  | 'End Implementation' | 'Train Team' | 'Optimisation'
  | 'Full Launch' | 'Monthly Optimisation'

export type AgencyTaskStatus = 'BLOCKED' | 'Not Started' | 'In Progress' | 'Complete'
export type AgencyTaskType = 'Internal' | 'Client Action' | 'Automation'

export type AgencyMeetingType =
  | 'Sales' | 'Onboarding' | 'Kickoff' | 'Progress'
  | 'Team Sync' | 'Client Meeting' | 'Planning' | 'Retrospective'

export type EmployeeDepartment =
  | 'Campaign Management' | 'Account Management'
  | 'Marketing' | 'Sales' | 'Operations'

export type ProjectPhaseStatus = 'Blocked' | 'Not Started' | 'In Progress' | 'Complete'

// Agency OS Interfaces
export interface AgencyClient {
  id: string
  profile_id: string | null
  name: string
  client_status: AgencyClientStatus
  plan: string[]
  assigned_to: string | null
  country: string[]
  industry: string[]
  website: string | null
  linkedin_page: string | null
  address: string | null
  notes: string | null
  contract_signed: string | null
  onboarding_checklist_email: string | null
  invoice_sent: string | null
  monthly_retainer: number | null
  average_check_size: number | null
  comms_channel: string[]
  poc_id: string | null
  project_scope: ProjectScope
  created_at: string
  updated_at: string
  // Computed
  total_tasks?: number
  completed_tasks?: number
  task_progress_pct?: number
}

export interface AgencyTask {
  id: string
  name: string
  status: AgencyTaskStatus
  type: AgencyTaskType | null
  due_date: string | null
  notes: string | null
  person_id: string | null
  client_id: string | null
  daily_report_id: string | null
  created_at: string
  updated_at: string
  // Computed
  is_overdue?: boolean
  client_name?: string
}

export interface AgencyContact {
  id: string
  name: string
  type: string[]
  email: string | null
  phone: string | null
  role_title: string | null
  time_zone: string | null
  created_at: string
  updated_at: string
}

export interface AgencyMeeting {
  id: string
  name: string
  type: AgencyMeetingType | null
  date: string | null
  notes: string | null
  recording_url: string | null
  client_id: string | null
  daily_report_id: string | null
  created_at: string
  updated_at: string
}

export interface Audience {
  id: string
  audience_name: string
  date: string | null
  geo: string | null
  company_keywords_broad: string | null
  company_keywords_specific: string | null
  titles_broad: string | null
  titles_specific: string | null
  links: string | null
  gpt_url: string | null
  client_id: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  profile_id: string
  job_title: string | null
  department: EmployeeDepartment | null
  location: string | null
  start_date: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
  // Joined from profiles
  full_name?: string
  email?: string
  avatar_url?: string | null
}

export interface TrainingResource {
  id: string
  name: string
  video_url: string | null
  description: string | null
  category: string | null
  created_at: string
}

export interface DailyReport {
  id: string
  name: string
  tags: string[]
  report_date: string
  created_by: string | null
  created_at: string
  // Computed
  task_count?: number
  meeting_count?: number
  client_count?: number
}

export interface ProjectBuildPhase {
  id: string
  client_id: string
  name: string
  status: ProjectPhaseStatus
  assigned_to: string | null
  description: string | null
  due_date: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ClientLoginCred {
  id: string
  client_id: string
  software_name: string
  email: string | null
  password_encrypted: string | null
  created_at: string
  updated_at: string
}
```

### 5.4 Sidebar Navigation Update

O sidebar em `src/app/(dashboard)/layout.tsx` precisa ser atualizado para mostrar links diferentes por role:

**Admin/Vibecoder sidebar:**
```
Dashboard (Agency Home)
Tasks
Clients (Kanban)
Contacts
Meetings
Audiences
Employees
Training
Analytics
---
Workflows (marketplace existente)
Mensagens
Assinatura
Perfil
Configuracoes
```

**Client sidebar:**
```
Meu Projeto (Client Detail)
Meu Portal (Client Portal)
---
Meus Projetos (marketplace existente)
Workflows
Mensagens
Assinatura
Perfil
Configuracoes
```

---

## 6. FLUXOS DE USUARIO

### 6.1 Fluxo Completo: Visitante -> Cliente com Portal

```
1. Visitante acessa www.automatrix-ia.com
2. LandingHero: escolhe role "Cliente" + digita primeira mensagem
3. LandingChat: chat com agente IA no painel esquerdo
4. Se nao logado: AuthPanel inline aparece no chat (login/register)
5. Apos auth: mensagem e enviada ao N8N via /api/chat/onboard
6. Painel direito: ProjectScopeCard → evolui para Client Portal preview
7. N8N retorna projectScope progressivamente (cada resposta adiciona campos)
8. Quando N8N envia complete:true: "Onboarding completo!" + "Ir para Dashboard"
9. Click "Ir para Dashboard" → /dashboard
10. Middleware: verifica onboarding_completed
11. Dashboard: cria agency_client com dados do projectScope
12. Cliente ve: Client Detail (4 tabs) + Client Portal (timeline, creds, recursos)
```

### 6.2 Fluxo Admin/Vibecoder

```
1. Login → /dashboard
2. Dashboard mostra Agency Home (banner, directory, tasks, calendar)
3. Navegacao via sidebar para qualquer modulo
4. Clients Kanban: arrastar cards entre colunas de status
5. Click em client card → Client Detail (Company/Tasks/Contacts/Meetings tabs)
6. Client Detail → link para Client Portal
```

---

## 7. PAINEL DIREITO DO CHAT - CLIENT PORTAL PREVIEW

### 7.1 Estado atual
O painel direito do `landing-chat.tsx` usa `ProjectScopeCard` (componente simples com campos de stack tecnologica).

### 7.2 Evolucao planejada
Substituir `ProjectScopeCard` pelo layout completo do Client Portal (como em CPV2.png):

1. **Stack Tecnologica** (top-left): Card com os campos do projectScope (manter estilo emerald/black)
2. **System Architecture** (top-right): Diagrama simplificado ou placeholder
3. **Software Access** (bottom-left): Tabela vazia ou com placeholders
4. **Project Launch Timeline** (bottom): 7 fases em kanban horizontal

O componente deve funcionar em dois modos:
- **Preview mode** (durante chat): mostra dados parciais, skeleton loaders
- **Complete mode** (apos onboarding): mostra tudo preenchido com link para dashboard

---

## 8. ORDEM DE IMPLEMENTACAO RECOMENDADA

### Sprint 1: Database + Types + Migration
1. Criar migration SQL com todas as tabelas novas
2. Aplicar migration ao Supabase Cloud
3. Adicionar types ao `src/types/index.ts`
4. Atualizar `src/types/supabase-generated.ts` (regenerar com Supabase CLI)
5. Criar seed data (training resources, directory entries)

### Sprint 2: Agency Home + Sidebar
1. Atualizar sidebar com links baseados em role
2. Criar Agency Home page (`/dashboard/agency`)
3. Atualizar `/dashboard/page.tsx` para redirecionar admin/vibecoder → agency home
4. Implementar Directory grid + Quick Actions
5. Implementar Tasks table + calendar na home

### Sprint 3: Clients Kanban + Client Detail
1. Criar Kanban board component reutilizavel
2. Implementar `/dashboard/clients` (Kanban por client_status)
3. Implementar `/dashboard/clients/[id]` (Client Detail com 4 tabs)
4. Tab Company: Onboarding Resources + Notes
5. Tab Tasks: Kanban filtrado por client_id
6. Tab Contacts: Tabela filtrada
7. Tab Meetings: Tabela filtrada

### Sprint 4: Client Portal
1. Implementar `/dashboard/clients/[id]/portal`
2. Resources section
3. Software Access (client_login_creds CRUD)
4. Project Build Timeline (7 phases com status)
5. Integrar dados do onboarding (projectScope → agency_client)

### Sprint 5: Tasks + Contacts + Meetings (global views)
1. `/dashboard/tasks` - Tabela + Kanban + Calendar views
2. `/dashboard/contacts` - Tabela com CRUD
3. `/dashboard/meetings` - Calendar + tabela
4. CRUD operations para todas as entidades

### Sprint 6: Remaining Pages
1. `/dashboard/audiences` - Tabela com CRUD
2. `/dashboard/employees` - Tabela com CRUD
3. `/dashboard/training` - Training Resources com video links
4. `/dashboard/analytics` - Views agregadas (Clients/Month, Tasks/Person)
5. `/dashboard/daily-report` - Gallery view + auto-aggregation

### Sprint 7: Client Portal Preview (Right Panel)
1. Substituir ProjectScopeCard por Client Portal preview completo
2. Implementar preview mode (durante chat) vs complete mode
3. Integrar com fluxo de onboarding existente
4. Testar fluxo end-to-end: visitante → registro → chat → portal

### Sprint 8: Polish + Integration
1. RLS policies finais e testes de seguranca
2. Onboarding → agency_client auto-creation
3. Realtime subscriptions para Kanban (Supabase Realtime)
4. Responsividade mobile
5. Testes end-to-end

---

## 9. ARQUIVOS-CHAVE EXISTENTES

### Frontend
| Arquivo | Descricao |
|---------|-----------|
| `src/app/page.tsx` | Root page - redirect if logged in + onboarding |
| `src/app/landing-page.tsx` | State orchestrator (hero ↔ chat) |
| `src/app/landing-hero.tsx` | Landing with textarea + role selector |
| `src/app/landing-chat.tsx` | Split-panel chat (left=chat, right=scope card) |
| `src/app/auth-panel.tsx` | Inline auth (login/register with OAuth) |
| `src/app/project-scope-card.tsx` | Current right-panel card |
| `src/app/(dashboard)/layout.tsx` | Dashboard sidebar layout |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard home (role-based) |
| `src/app/(dashboard)/dashboard/dashboard-client.tsx` | Dashboard client component |
| `src/middleware.ts` | Auth + onboarding gate + admin check |
| `src/lib/supabase/middleware.ts` | Supabase session management |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |

### API
| Arquivo | Descricao |
|---------|-----------|
| `src/app/api/chat/onboard/route.ts` | Proxy to N8N webhook |
| `src/app/api/auth/callback/route.ts` | OAuth callback handler |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook |

### Types
| Arquivo | Descricao |
|---------|-----------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/types/supabase-generated.ts` | Auto-generated Supabase types |

### Database
| Arquivo | Descricao |
|---------|-----------|
| `supabase/migrations/20260208120000_init_schema.sql` | Core schema (17 tables) |
| `supabase/migrations/20260213120000_add_project_scope.sql` | ProjectScope column (PENDING) |

### Docs
| Arquivo | Descricao |
|---------|-----------|
| `docs/N8N_ONBOARDING_WORKFLOW.md` | N8N workflow documentation |
| `docs/prd-automatrix-platform-v2-2026-02-06.md` | Product requirements |
| `docs/architecture-automatrix-platform-v2-2026-02-06.md` | System architecture |

---

## 10. API PROXY - N8N INTEGRATION

### 10.1 Como funciona
```
Frontend (landing-chat.tsx)
  → POST /api/chat/onboard
    → POST https://n8n.automatrix.site/webhook/onboardf
      → N8N AI Agent processes message
      → Returns { output: "{\"response\":\"...\",\"projectScope\":{...}}" }
    → API proxy parses stringified JSON
    → Returns { response: "...", projectScope: {...}, options: [...], complete: bool }
  → Frontend merges projectScope with previous state
  → Right panel updates
```

### 10.2 N8N Response Format
```json
{
  "response": "Mensagem do agente",
  "options": ["Opcao 1", "Opcao 2"],
  "projectScope": {
    "project_name": "...",
    "description": "...",
    "frontend": "Next.js",
    "backend": "Supabase",
    "database": "PostgreSQL",
    "llms": ["GPT-4", "Claude"],
    "integrations": ["Shopify", "WhatsApp"],
    "platform": "Web + Mobile",
    "timeline": "3 meses",
    "budget": "R$ 15.000"
  },
  "complete": false
}
```

### 10.3 Important: N8N output parsing
N8N returns `{ output: "{\"response\":\"...\"}"}` (JSON stringified inside a string field). The proxy route at `/api/chat/onboard/route.ts` already handles this with `JSON.parse(raw.output)`.

---

## 11. STRIPE CONFIGURATION

| Item | Valor |
|------|-------|
| Plans | Free, Pro ($99/mo), Max ($297/mo) - USD |
| Pro price ID | `price_1Syz39CSqil72U7WzS2atsqc` |
| Max price ID | `price_1Syz5GCSqil72U7W3EpsOTJZ` |
| DB enum | `business` → UI "Max" |
| Webhook | `we_1SyzCgCSqil72U7WN2QOBisH` |
| Webhook URL | `https://www.automatrix-ia.com/api/webhooks/stripe` |

---

## 12. EXTERNAL CONFIGURATION PENDING

1. **NEXT_PUBLIC_APP_URL** - Change to `https://www.automatrix-ia.com` for production
2. **Supabase site_url** - Change to production domain
3. **Old Stripe webhook** - Delete `we_1S4ED4CSqil72U7WFJr2y5ie`
4. **N8N webhook** - Already configured at `https://n8n.automatrix.site/webhook/onboardf`

---

## 13. RECOMMENDED TOOLS & PLUGINS FOR IMPLEMENTATION

### 13.1 Claude Code Skills (already installed)
- **supabase-expert**: Para queries, RLS policies, Edge Functions
- **stripe**: Para integracao de pagamentos
- **frontend-design**: Para criar interfaces de alta qualidade
- **commit-commands**: Para commits e PRs
- **n8n-workflow-patterns**: Para patterns de workflow N8N
- **vercel**: Para deploy (se necessario)

### 13.2 MCP Servers Available
- **Serena**: Semantic code tools (find_symbol, replace_symbol_body, etc.) - ideal para refactoring preciso
- **Pencil**: Design editor for .pen files - tem AgencyOS.pen (mas so com test card)
- **Chrome Extension**: Browser automation for testing

### 13.3 Useful Claude Code Features
- **Task tool with Explore agent**: Para explorar codebase
- **Task tool with Plan agent**: Para planejar implementacao
- **Parallel tool calls**: Para maximizar eficiencia
- **code-reviewer agent**: Para review pos-implementacao
- **code-simplifier agent**: Para simplificar codigo

### 13.4 Subagent Strategy for Implementation
Para a implementacao, recomenda-se:
1. **NAO usar subagentes** durante coding (manter contexto no primary)
2. **Usar subagentes** para:
   - Pesquisa de codebase (Explore agent)
   - Planejamento (Plan agent)
   - Review pos-implementacao (code-reviewer)
   - Testes (test-runner via Bash)

---

## 14. TESTING CHECKLIST

### 14.1 Database
- [ ] Migration aplicada sem erros
- [ ] Trigger create_client_portal_template funciona (7 phases auto-created)
- [ ] RLS policies: staff ve tudo, client ve so proprio
- [ ] Views (tasks_with_overdue, clients_with_progress) funcionam

### 14.2 Frontend
- [ ] Sidebar muda por role (admin vs client)
- [ ] Agency Home renderiza corretamente
- [ ] Clients Kanban drag-and-drop funciona
- [ ] Client Detail 4 tabs carregam dados filtrados
- [ ] Client Portal mostra timeline + creds + resources
- [ ] Analytics mostra views agregadas

### 14.3 End-to-End
- [ ] Visitante → registro via role card → chat → onboarding → dashboard
- [ ] Dados do projectScope aparecem no Client Portal
- [ ] Admin ve todos os clientes no Kanban
- [ ] Cliente ve apenas seus dados
- [ ] Build limpo (zero TS errors, zero ESLint errors)

### 14.4 Users para teste
- Admin: `lucas@automatrix-ia.com` (ja existe)
- Criar um cliente de teste via onboarding chat
- Criar um vibecoder de teste via onboarding

---

## 15. REFERENCE FILES (External)

Estes arquivos contem a especificacao completa do Agency OS extraida do Notion:

| Arquivo | Path | Conteudo |
|---------|------|----------|
| Spec Completo | `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-specification.md` | 1106 linhas - schema SQL, design system, page layouts, business rules |
| User Flows | `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-userflow.md` | 497 linhas - navigation flows, roles, page mapping |
| Builder Instructions | `/Users/lucasautomatrix/Projects/tools/agent-browser/agency-os-builder-instructions-complementar.md` | 54 linhas - onboarding → dashboard mapping |
| Design Reference | `/Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/CPV2.png` | Client Portal visual reference |

---

*Documento gerado em 2026-02-13. Usar como contexto completo para reiniciar sessoes de implementacao.*
