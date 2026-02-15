# Automatrix — Onboarding & Client Portal: Data Flow Architecture

> Document generated: 2026-02-15
> Covers: Landing Page chat, N8N integration, database persistence, and Client Portal preview

---

## 1. HIGH-LEVEL ARCHITECTURE

```mermaid
graph TB
    subgraph "Browser (Client)"
        A[Landing Page<br/>landing-page.tsx] --> B[Landing Hero<br/>landing-hero.tsx]
        A --> C[Landing Chat<br/>landing-chat.tsx]
        C --> D[Auth Panel<br/>auth-panel.tsx]
        C --> E[Client Portal Preview<br/>client-portal-preview.tsx]
    end

    subgraph "Next.js Server (API Routes)"
        F["/api/chat/onboard<br/>route.ts"]
        G["/api/onboarding/complete-client<br/>route.ts"]
        H["/api/auth/callback<br/>route.ts"]
    end

    subgraph "External Services"
        I[N8N Webhook<br/>n8n.automatrix.site/webhook/onboardf]
    end

    subgraph "Supabase Cloud (kbzlfsxckdespwkejzmh)"
        J[(auth.users)]
        K[(profiles)]
        L[(agency_clients)]
        M[(project_build_timeline)]
        N[(onboarding_sessions)]
        O[(client_login_creds)]
    end

    C -->|"POST /api/chat/onboard"| F
    F -->|"POST (proxy)"| I
    I -->|"JSON response"| F
    F -->|"{ response, options,<br/>projectScope, complete }"| C

    C -->|"POST /api/onboarding/complete-client"| G
    G -->|"UPDATE profiles"| K
    G -->|"INSERT agency_clients"| L
    L -->|"TRIGGER auto-creates<br/>7 phases"| M

    D -->|"signUp / signIn"| J
    J -->|"TRIGGER handle_new_user()"| K
    H -->|"exchangeCodeForSession"| J

    style E fill:#064e3b,stroke:#10b981,color:#fff
    style I fill:#7c3aed,stroke:#a78bfa,color:#fff
    style L fill:#1e40af,stroke:#60a5fa,color:#fff
```

---

## 2. COMPLETE USER JOURNEY (Visitor → Client with Portal)

```mermaid
sequenceDiagram
    participant V as Visitor (Browser)
    participant LP as LandingPage
    participant LH as LandingHero
    participant LC as LandingChat
    participant AP as AuthPanel
    participant CPP as ClientPortalPreview
    participant API as /api/chat/onboard
    participant N8N as N8N Webhook
    participant CAPI as /api/onboarding/complete-client
    participant SB as Supabase
    participant MW as Middleware
    participant DB as Dashboard

    V->>LP: Acessa localhost:3333
    LP->>LH: Renderiza Landing Hero

    Note over LH: Visitor escolhe role "Cliente"<br/>e digita primeira mensagem

    LH->>LP: onSubmit(message, role)
    LP->>LC: Renderiza LandingChat<br/>initialMessage + initialRole

    Note over LC: Estado: view="chat"<br/>rightPanel="idle"

    LC->>LC: useEffect: checa auth (getUser)
    Note over LC: User = null → mostra chat normalmente

    V->>LC: Digita mensagem e envia
    LC->>LC: Sem user → setPendingMessage<br/>showInlineAuth = true

    LC->>AP: Renderiza AuthPanel inline no chat
    V->>AP: Preenche email/senha e registra

    AP->>SB: supabase.auth.signUp({<br/>email, password,<br/>options: { data: { full_name, role } }<br/>})

    Note over SB: TRIGGER handle_new_user():<br/>1. INSERT profiles (role=client,<br/>   onboarding_completed=false)<br/>2. INSERT user_subscriptions (free)

    SB-->>AP: User object
    AP->>LC: onAuthComplete(user)

    Note over LC: user = set, showInlineAuth = false<br/>pendingMessage triggers sendToAgent()

    LC->>API: POST /api/chat/onboard<br/>{ message, sessionId, role,<br/>userName, userEmail }
    API->>N8N: POST webhook/onboardf<br/>(same payload, proxied)

    Note over N8N: AI Agent processes message<br/>Extracts project scope fields

    N8N-->>API: { response, options,<br/>projectScope: { project_name, platform },<br/>complete: false }
    API-->>LC: Forward JSON response

    Note over LC: 1. Add assistant message to chat<br/>2. Show quick options buttons<br/>3. MERGE projectScope into state<br/>4. rightPanel = "chatting"

    LC->>CPP: Render ClientPortalPreview<br/>scope = { project_name, platform }

    Note over CPP: Shows Stack Tecnologica<br/>with filled fields + skeletons<br/>Architecture diagram updates<br/>Software Access = skeleton<br/>Timeline = 7 phases placeholder

    V->>LC: Responde outra mensagem
    LC->>API: POST /api/chat/onboard
    API->>N8N: Proxy to webhook
    N8N-->>API: { response,<br/>projectScope: { frontend, backend,<br/>database, llms: [...] } }
    API-->>LC: Forward response

    Note over LC: MERGE: state now has<br/>project_name + platform + frontend +<br/>backend + database + llms

    LC->>CPP: Re-render with more fields
    Note over CPP: Architecture diagram now shows<br/>frontend → backend → database<br/>+ LLMs row below

    V->>LC: Ultima mensagem
    LC->>API: POST /api/chat/onboard
    API->>N8N: Proxy
    N8N-->>API: { response,<br/>projectScope: { timeline, budget,<br/>app_level, integrations: [...] },<br/>complete: true }
    API-->>LC: Forward response

    Note over LC: complete=true →<br/>rightPanel = "complete"

    LC->>CPP: Render complete mode
    Note over CPP: All fields filled<br/>+ "Escopo definido — Portal pronto"<br/>+ "Ir para o Dashboard" button

    V->>LC: Click "Ir para o Dashboard"
    LC->>LC: handleGoToDashboard()

    LC->>CAPI: POST /api/onboarding/complete-client<br/>{ projectScope: { ...all fields } }

    Note over CAPI: 1. UPDATE profiles<br/>   SET onboarding_completed = true<br/>2. Check: agency_clients exists?<br/>3. INSERT agency_clients:<br/>   name, client_status="Pre-Onboarding",<br/>   project_scope = JSONB,<br/>   comms_channel = ["email"]

    CAPI->>SB: UPDATE profiles
    CAPI->>SB: INSERT agency_clients

    Note over SB: TRIGGER create_client_portal_template():<br/>Auto-creates 7 project_build_timeline rows:<br/>1. Software Access<br/>2. Database Building<br/>3. Auditing System<br/>4. Theme & Aesthetics<br/>5. Automations<br/>6. Training & Handover<br/>7. Feedback

    CAPI-->>LC: { success: true, clientId }
    LC->>V: router.push("/dashboard")

    V->>MW: GET /dashboard
    MW->>SB: Check onboarding_completed
    Note over MW: onboarding_completed = true ✓<br/>Allow through

    MW->>DB: Redirect to /dashboard
    Note over DB: role="client" →<br/>Shows client dashboard
```

---

## 3. DATA STORAGE ARCHITECTURE

### 3.1 Where Data Lives at Each Stage

```mermaid
graph LR
    subgraph "DURING CHAT (transient)"
        A["React State<br/>useState&lt;ProjectScope&gt;"]
        B["React State<br/>useState&lt;ChatMessage[]&gt;"]
    end

    subgraph "ON COMPLETION (persistent)"
        C["profiles<br/>.onboarding_completed = true"]
        D["agency_clients<br/>.project_scope = JSONB"]
        E["project_build_timeline<br/>7 rows auto-created"]
    end

    subgraph "NEVER SAVED"
        F["Chat messages<br/>(lost on page refresh)"]
        G["Quick options<br/>(ephemeral UI)"]
    end

    A -->|"handleGoToDashboard()"| D
    B -.->|"NOT persisted"| F

    style A fill:#854d0e,stroke:#fbbf24,color:#fff
    style B fill:#854d0e,stroke:#fbbf24,color:#fff
    style D fill:#166534,stroke:#4ade80,color:#fff
    style E fill:#166534,stroke:#4ade80,color:#fff
    style F fill:#7f1d1d,stroke:#f87171,color:#fff
    style G fill:#7f1d1d,stroke:#f87171,color:#fff
```

### 3.2 ProjectScope Fields (JSONB on agency_clients)

```mermaid
classDiagram
    class ProjectScope {
        +string project_name
        +string description
        +AppLevel app_level
        +string frontend
        +string backend
        +string database
        +string[] llms
        +string[] integrations
        +string platform
        +string timeline
        +string budget
    }

    class AppLevel {
        <<enumeration>>
        lv1 : Simples
        lv2 : Medio
        lv3 : Complexo
    }

    class ClientPortalPreview {
        +StackTecnologica : project_name, frontend, backend, database, platform, timeline, budget, llms, integrations
        +Arquitetura : frontend → backend → database + llms + integrations (auto-diagram)
        +AcessoSoftwares : skeleton placeholders (filled later by admin)
        +TimelineProjeto : 7 default phases (filled from project_build_timeline after creation)
    }

    ProjectScope --> AppLevel
    ProjectScope --> ClientPortalPreview : "renders in"
```

---

## 4. DATABASE TABLES — COMPLETE RELATIONSHIP MAP

```mermaid
erDiagram
    auth_users ||--|| profiles : "handle_new_user() trigger"
    profiles ||--o| agency_clients : "profile_id (optional 1:1)"
    profiles ||--o| user_subscriptions : "user_id"

    agency_clients ||--o{ project_build_timeline : "client_id (7 auto-created)"
    agency_clients ||--o{ client_login_creds : "client_id"
    agency_clients ||--o{ agency_tasks : "client_id"
    agency_clients ||--o{ agency_meetings : "client_id"
    agency_clients ||--o{ audiences : "client_id"

    agency_clients }o--o{ agency_contacts : "agency_client_contacts (junction)"
    agency_clients }o--o{ daily_reports : "agency_client_daily_reports (junction)"

    agency_meetings }o--o{ agency_contacts : "agency_meeting_participants (junction)"
    agency_meetings }o--o{ auth_users : "agency_meeting_internals (junction)"

    agency_tasks }o--o| daily_reports : "daily_report_id"
    agency_meetings }o--o| daily_reports : "daily_report_id"

    profiles {
        uuid id PK
        text email
        text full_name
        user_role role "client | vibecoder | learner | admin"
        boolean onboarding_completed "default false"
        text company
        text industry
        text website
    }

    agency_clients {
        uuid id PK
        uuid profile_id FK "UNIQUE, nullable"
        text name "company or full_name"
        agency_client_status client_status "11 values"
        jsonb project_scope "ProjectScope from chat"
        text[] plan
        text[] country
        text[] industry
        text website
        text linkedin_page
        text address
        text notes
        numeric monthly_retainer
        numeric average_check_size
        text[] comms_channel
        uuid poc_id FK "→ agency_contacts"
        uuid assigned_to FK "→ auth.users"
        date contract_signed
        date onboarding_checklist_email
        date invoice_sent
    }

    project_build_timeline {
        uuid id PK
        uuid client_id FK
        text name
        project_phase_status status "4 values"
        uuid assigned_to FK
        text description
        date due_date
        text notes
        int sort_order "1-7"
    }

    client_login_creds {
        uuid id PK
        uuid client_id FK
        text software_name
        text email
        text password_encrypted
    }

    agency_tasks {
        uuid id PK
        text name
        agency_task_status status "4 values"
        agency_task_type type "3 values"
        date due_date
        text notes
        uuid person_id FK
        uuid client_id FK
    }

    agency_meetings {
        uuid id PK
        text name
        agency_meeting_type type "8 values"
        timestamptz date
        text notes
        text recording_url
        uuid client_id FK
    }

    agency_contacts {
        uuid id PK
        text name
        text[] type
        text email
        text phone
        text role_title
        text time_zone
    }
```

---

## 5. N8N AGENT RESPONSE CONTRACT

The N8N webhook at `https://n8n.automatrix.site/webhook/onboardf` receives and returns:

### Request (from /api/chat/onboard)

```json
{
  "message": "Quero criar um sistema de avaliacoes psicologicas",
  "sessionId": "uuid-v4",
  "role": "client",
  "userName": "Lucas Silva",
  "userEmail": "lucas@automatrix-ia.com"
}
```

### Response (from N8N)

```json
{
  "response": "Texto da resposta do agente para o chat",
  "options": ["Opcao 1", "Opcao 2", "Opcao 3"],
  "projectScope": {
    "project_name": "Automated Assessment System",
    "frontend": "Next.js",
    "backend": "Supabase",
    "database": "PostgreSQL",
    "platform": "automacao",
    "llms": ["GPT-4o", "Claude"],
    "integrations": ["GoHighLevel", "Stripe"],
    "timeline": "3 meses",
    "budget": "R$ 15.000",
    "app_level": "lv2"
  },
  "complete": false
}
```

### Progressive Accumulation

```mermaid
sequenceDiagram
    participant Chat as Landing Chat State
    participant N8N as N8N Agent

    Note over Chat: state = {}

    N8N-->>Chat: projectScope: { project_name: "X", platform: "Y" }
    Note over Chat: state = { project_name: "X", platform: "Y" }

    N8N-->>Chat: projectScope: { frontend: "Next.js", backend: "Supabase" }
    Note over Chat: state = { project_name: "X", platform: "Y",<br/>frontend: "Next.js", backend: "Supabase" }

    N8N-->>Chat: projectScope: { llms: ["GPT-4o"], integrations: ["Stripe"] }
    Note over Chat: state = { project_name: "X", platform: "Y",<br/>frontend: "Next.js", backend: "Supabase",<br/>llms: ["GPT-4o"], integrations: ["Stripe"] }

    N8N-->>Chat: projectScope: { budget: "R$ 15k", timeline: "3m" }, complete: true
    Note over Chat: FINAL state = all fields merged<br/>rightPanel = "complete"
```

### Merge Logic (landing-chat.tsx:164-171)

```typescript
if (data.projectScope) {
  setProjectScope((prev) => ({
    ...prev,                                    // Keep all existing fields
    ...data.projectScope,                       // Overwrite with new fields
    llms: data.projectScope?.llms ?? prev.llms, // Arrays: only replace if new
    integrations: data.projectScope?.integrations ?? prev.integrations,
  }))
}
```

**Key behavior**: Simple fields are overwritten, arrays (llms, integrations) are only replaced if the agent sends new values — they are NOT merged/appended.

---

## 6. WHAT THE PORTAL PREVIEW SHOWS (CLIENT-PORTAL-PREVIEW.TSX)

```mermaid
graph TB
    subgraph "ClientPortalPreview (right panel)"
        direction TB
        subgraph "Top Row (grid 2-col)"
            ST["STACK TECNOLOGICA<br/>────────────────<br/>Projeto: {project_name}<br/>Frontend: {frontend}<br/>Backend: {backend}<br/>Database: {database}<br/>Plataforma: {platform}<br/>Prazo: {timeline}<br/>Orcamento: {budget}<br/>LLMs: badges<br/>Integracoes: badges<br/>────────────────<br/>Skeleton loaders for empty fields"]
            AR["ARQUITETURA<br/>────────────────<br/>Auto-generated diagram:<br/>[frontend] ─ [backend] ─ [database]<br/>          │<br/>     [llms row]<br/>          │<br/>[integrations row]<br/>────────────────<br/>Empty state if no fields yet"]
        end
        subgraph "Middle"
            SA["ACESSO A SOFTWARES<br/>────────────────<br/>Preview: 3 skeleton rows<br/>Complete: 'Credenciais serao<br/>adicionadas apos ativacao'"]
        end
        subgraph "Bottom"
            TL["TIMELINE DO PROJETO<br/>────────────────<br/>7 horizontal cards:<br/>Descoberta → Planejamento →<br/>Design → Desenvolvimento →<br/>Integracao → Testes → Lancamento<br/>+ Progress bar (0%)"]
        end
    end

    style ST fill:#064e3b,stroke:#10b981,color:#fff
    style AR fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style SA fill:#78350f,stroke:#f59e0b,color:#fff
    style TL fill:#312e81,stroke:#818cf8,color:#fff
```

---

## 7. RLS (Row Level Security) — WHO CAN DO WHAT

```mermaid
graph TB
    subgraph "Staff (admin / vibecoder)"
        S1[SELECT all agency_clients] --> OK1[✓]
        S2[INSERT agency_clients] --> OK2[✓]
        S3[UPDATE agency_clients] --> OK3[✓]
        S4[DELETE agency_clients] --> OK4[✓]
        S5[CRUD all tables] --> OK5[✓]
    end

    subgraph "Client (role=client)"
        C1[SELECT own agency_client<br/>WHERE profile_id = auth.uid] --> OK6[✓]
        C2[SELECT own tasks<br/>WHERE client_id = my_client_id] --> OK7[✓]
        C3[INSERT/UPDATE/DELETE] --> NO1[✗ Denied]
    end

    subgraph "API Route (service role)"
        A1[/api/onboarding/complete-client<br/>uses server client with<br/>service_role via RLS bypass] --> OK8[✓ Can INSERT]
    end

    style OK1 fill:#166534,color:#fff
    style OK2 fill:#166534,color:#fff
    style OK3 fill:#166534,color:#fff
    style OK4 fill:#166534,color:#fff
    style OK5 fill:#166534,color:#fff
    style OK6 fill:#166534,color:#fff
    style OK7 fill:#166534,color:#fff
    style OK8 fill:#166534,color:#fff
    style NO1 fill:#7f1d1d,color:#fff
```

**Note**: The `createClient()` from `@/lib/supabase/server.ts` uses the user's session cookies, so it respects RLS. The `/api/onboarding/complete-client` route runs as the authenticated user (client), but the RLS policy `staff_full_access` only allows staff. **This means the client INSERT will fail under current RLS.**

**Fix needed**: Either add an RLS policy allowing `INSERT` for clients on their own row, or use a service-role client for this operation.

---

## 8. TRIGGERS — AUTOMATED DATABASE ACTIONS

```mermaid
flowchart LR
    subgraph "On auth.users INSERT"
        T1[handle_new_user] -->|Creates| P1[profiles row<br/>role from metadata<br/>onboarding_completed=false]
        T1 -->|Creates| S1[user_subscriptions row<br/>tier=free, status=active]
    end

    subgraph "On agency_clients INSERT"
        T2[create_client_portal_template] -->|Creates 7 rows| PBT[project_build_timeline<br/>1. Software Access<br/>2. Database Building<br/>3. Auditing System<br/>4. Theme & Aesthetics<br/>5. Automations<br/>6. Training & Handover<br/>7. Feedback]
    end

    subgraph "On ANY table UPDATE"
        T3[agency_update_updated_at] -->|Sets| TS[updated_at = now]
    end

    style T1 fill:#7c3aed,stroke:#a78bfa,color:#fff
    style T2 fill:#7c3aed,stroke:#a78bfa,color:#fff
    style T3 fill:#7c3aed,stroke:#a78bfa,color:#fff
```

---

## 9. CURRENT LIMITATIONS & GAPS

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | **No progressive save** — projectScope only saved on completion | Data lost if user closes tab during chat | Save to `onboarding_sessions.project_scope` after each N8N response |
| 2 | **No Supabase Realtime** — portal preview reads from React state only | If agent writes to DB directly, UI won't update | Add `supabase.channel().on('postgres_changes')` subscription |
| 3 | **Chat messages not persisted** — only in React state | Can't resume conversation after page refresh | Save to `onboarding_sessions.conversation` progressively |
| 4 | **RLS blocks client INSERT on agency_clients** | `/api/onboarding/complete-client` may fail if using user session | Add INSERT policy for own profile_id, or use service-role client |
| 5 | **N8N must return exact JSON format** — no validation | If N8N returns wrong format, fields silently ignored | Add Zod validation on API route response |
| 6 | **client_login_creds / project_build_timeline** — only admin can fill | Client portal shows empty until admin populates | Consider CRUD UI for admin in client detail page |
| 7 | **No offline/error recovery** — if N8N is down, chat breaks | User sees "Agente indisponivel" error | Add retry logic or fallback static questionnaire |

---

## 10. PROPOSED REALTIME ARCHITECTURE (Future)

```mermaid
sequenceDiagram
    participant Browser as Browser (LandingChat)
    participant API as /api/chat/onboard
    participant N8N as N8N Agent
    participant SB as Supabase DB
    participant RT as Supabase Realtime

    Note over Browser: On first message:<br/>Create agency_clients row early<br/>with empty project_scope

    Browser->>API: POST message
    API->>SB: INSERT agency_clients (if not exists)
    API->>N8N: Forward message + clientId

    Browser->>RT: SUBSCRIBE to agency_clients<br/>WHERE id = clientId

    N8N->>SB: UPDATE agency_clients<br/>SET project_scope = jsonb_set(...)
    Note over N8N: Agent writes directly to DB<br/>via Supabase API/service key

    SB->>RT: Broadcast change event
    RT->>Browser: postgres_changes payload

    Note over Browser: ClientPortalPreview<br/>auto-updates from DB data<br/>(no React state needed)

    N8N->>SB: UPDATE project_scope (more fields)
    SB->>RT: Broadcast change
    RT->>Browser: Auto-update UI

    N8N->>API: { complete: true }
    API->>Browser: Show completion CTA
```

In this model:
1. **N8N writes directly** to `agency_clients.project_scope` via Supabase REST API (using service key)
2. **Browser subscribes** to changes on the `agency_clients` row
3. **UI updates automatically** when the JSONB column changes
4. **No React state** needed for projectScope — it's always from the DB
5. **Survives page refresh** — data is in DB, just resubscribe

---

## 11. FILE REFERENCE

| File | Role |
|------|------|
| `src/app/landing-page.tsx` | Router: landing vs chat view |
| `src/app/landing-hero.tsx` | Hero with role cards + first message input |
| `src/app/landing-chat.tsx` | Main chat component + right panel orchestrator |
| `src/app/auth-panel.tsx` | Inline auth (register/login) in chat flow |
| `src/app/client-portal-preview.tsx` | Right panel: 4-section portal preview |
| `src/app/project-scope-card.tsx` | Old component (replaced by client-portal-preview) |
| `src/app/api/chat/onboard/route.ts` | Proxy: Next.js → N8N webhook |
| `src/app/api/onboarding/complete-client/route.ts` | Marks complete + creates agency_client |
| `src/app/(onboarding)/onboarding/actions.ts` | Server actions for /onboarding page flow |
| `src/app/(onboarding)/onboarding/client-onboarding.tsx` | Alternative onboarding (form + AI chat) |
| `src/lib/supabase/middleware.ts` | Onboarding gate + auth redirect |
| `src/types/index.ts` | ProjectScope interface + all enums |
| `supabase/migrations/20260214120000_agency_os_schema.sql` | Agency OS tables, triggers, RLS |
