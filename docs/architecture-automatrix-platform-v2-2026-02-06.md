# System Architecture: Automatrix Platform v2

**Date:** 2026-02-06
**Architect:** lucasautomatrix
**Version:** 1.0
**Project Type:** AI Automation Hub & Marketplace
**Project Level:** Level 4 (Complex Platform)
**Status:** Draft

---

## Document Overview

This document defines the system architecture for Automatrix Platform v2. It provides the technical blueprint for implementation, addressing all 32 functional and 12 non-functional requirements from the PRD.

**Related Documents:**
- Product Requirements Document: `docs/prd-automatrix-platform-v2-2026-02-06.md`
- Product Definition Record: `../../AUTOMATRIX_PDR.md`

---

## Executive Summary

Automatrix Platform v2 is architected as a **modular monolith** running on Next.js 14+ (App Router) with Payload CMS embedded, backed by self-hosted Supabase (PostgreSQL + Auth + Realtime + Storage), N8N for workflow automation and AI agents, and Stripe for payments. All services are containerized with Docker Compose on a single VPS (Hostinger KVM4). The architecture prioritizes simplicity of deployment, developer productivity, and a clear path to scaling from 500 to 5,000 users without re-architecture.

---

## Architectural Drivers

These NFRs heavily influence architectural decisions:

| # | Driver | NFR | Impact |
|---|--------|-----|--------|
| 1 | **Self-hosted single VPS** | NFR-012 | All services must fit in ~4 vCPU / 8GB RAM. Docker Compose orchestration. No cloud-managed services. |
| 2 | **Page load < 2.5s** | NFR-001 | Requires SSG/ISR for public pages (blog, workflows). Next.js App Router with server components. |
| 3 | **500 concurrent users** | NFR-002 | Database connection pooling (Supavisor), efficient queries, pagination. No loading 4,000+ records. |
| 4 | **Real-time DMs** | FR-021 | Supabase Realtime (WebSocket) requires persistent connections. Memory consideration for VPS. |
| 5 | **Stripe payment security** | NFR-004 | Zero credit card data on platform. Stripe Checkout + webhooks only. |
| 6 | **Role-based access** | NFR-003 | Supabase RLS at database level. JWT-based auth. Subscription tier gating. |
| 7 | **AI agent communication** | FR-022 | N8N webhook endpoints called from frontend. Async response handling. |
| 8 | **4,343+ workflow catalog** | FR-006 | Full-text search with PostgreSQL `tsvector`. Pagination mandatory. |

---

## System Overview

### High-Level Architecture

The system follows a **modular monolith with sidecar services** pattern:

1. **Next.js Application** (monolith) — Handles all web requests: SSR/SSG pages, API routes, Payload CMS admin, and client-side React
2. **Supabase Stack** (sidecar) — PostgreSQL database, GoTrue auth, Realtime WebSocket server, Storage (S3-compatible), and PostgREST
3. **N8N** (sidecar) — Workflow automation engine, AI agent backends, email notifications, background jobs
4. **Caddy** (reverse proxy) — HTTPS termination, routing, automatic Let's Encrypt certificates

All four run as Docker services on the same VPS, communicating via Docker internal network.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS (Hostinger KVM4)                     │
│                     4 vCPU / 8GB RAM / Docker                   │
│                                                                 │
│  ┌──────────────┐                                               │
│  │    Caddy      │ ← HTTPS :443 (automatrix.com.br)             │
│  │ Reverse Proxy │ ← Auto Let's Encrypt                        │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ├─── /api/*, /admin, /* ──→ ┌───────────────────────┐   │
│         │                           │   Next.js 14+ App     │   │
│         │                           │   (App Router)        │   │
│         │                           │                       │   │
│         │                           │  ┌─────────────────┐  │   │
│         │                           │  │  Payload CMS    │  │   │
│         │                           │  │  3.x (embedded) │  │   │
│         │                           │  └─────────────────┘  │   │
│         │                           │                       │   │
│         │                           │  ┌─────────────────┐  │   │
│         │                           │  │  API Routes     │  │   │
│         │                           │  │  (Next.js)      │  │   │
│         │                           │  └─────────────────┘  │   │
│         │                           │                       │   │
│         │                           │  ┌─────────────────┐  │   │
│         │                           │  │  React SSR/CSR  │  │   │
│         │                           │  │  (shadcn/ui)    │  │   │
│         │                           │  └─────────────────┘  │   │
│         │                           └───────────┬───────────┘   │
│         │                                       │               │
│         │                          ┌────────────┼────────────┐  │
│         │                          │            │            │  │
│         │                          ▼            ▼            ▼  │
│         │              ┌──────────────┐ ┌────────────┐ ┌─────┐ │
│         │              │  PostgreSQL  │ │  Supabase  │ │ S3  │ │
│         │              │  (Supabase)  │ │  Realtime  │ │Store│ │
│         │              │  + GoTrue    │ │ (WebSocket)│ │     │ │
│         │              │  + PostgREST │ │            │ │     │ │
│         │              └──────────────┘ └────────────┘ └─────┘ │
│         │                          ▲                            │
│         │                          │                            │
│         ├─── /n8n/* ──→ ┌──────────┴───────────┐               │
│         │               │        N8N           │               │
│         │               │  Workflow Engine      │               │
│         │               │  + AI Agents          │               │
│         │               │  + Webhooks           │               │
│         │               │  + Background Jobs    │               │
│         │               └──────────────────────┘               │
│         │                                                       │
│         └─── External APIs:                                     │
│              • Stripe (payments)                                │
│              • Google Calendar                                  │
│              • Gmail (via N8N)                                   │
│              • Claude API (via N8N)                              │
└─────────────────────────────────────────────────────────────────┘
```

### Architectural Pattern

**Pattern:** Modular Monolith with Sidecar Services

**Rationale:**
- **Single VPS constraint** — Microservices would be wasteful on a 4 vCPU / 8GB machine. A monolith minimizes overhead.
- **Next.js + Payload CMS** — Payload 3.x runs natively inside Next.js, sharing the same process and database. This eliminates a separate CMS service.
- **Supabase as sidecar** — Supabase provides database, auth, realtime, and storage as a pre-packaged Docker stack. Treating it as a sidecar keeps the monolith lean.
- **N8N as sidecar** — N8N handles all background automation, AI agents, and webhook-driven workflows. It communicates with the monolith via webhooks and database.
- **Modular boundaries** — Inside the Next.js monolith, code is organized by feature modules (auth, blog, workflows, projects, chat, payments) with clear interfaces between them.

---

## Technology Stack

### Frontend

**Choice:** Next.js 14+ (App Router) with React 18, TypeScript, Tailwind CSS, shadcn/ui

**Rationale:**
- **App Router** provides React Server Components (RSC) for reduced client bundle, streaming SSR, and built-in layouts/loading states
- **SSG/ISR** for blog and workflow pages delivers < 2.5s LCP (NFR-001) and SEO benefits
- **Server Actions** eliminate the need for separate API routes for mutations
- **shadcn/ui** provides accessible, customizable components that match the existing design system
- **Tailwind CSS** is already used in the prototype — preserves existing styles

**Trade-offs:**
- Gain: SSR/SSG, API routes, RSC, single deployment
- Lose: Slightly heavier than pure SPA; learning curve for App Router patterns

**Key Libraries:**
| Library | Purpose |
|---------|---------|
| `next` 14+ | Framework (App Router) |
| `react` 18 | UI library |
| `typescript` 5+ | Type safety |
| `tailwindcss` 3 | Utility CSS |
| `shadcn/ui` | Component library |
| `@supabase/ssr` | Supabase client for Next.js SSR |
| `@supabase/supabase-js` | Supabase client |
| `stripe` | Stripe Node.js SDK |
| `@payloadcms/next` | Payload CMS integration |
| `lucide-react` | Icons |
| `zod` | Schema validation |
| `react-hook-form` | Form management |
| `nuqs` | URL query state management |

---

### Backend

**Choice:** Next.js API Routes + Payload CMS 3.x (embedded) + Supabase Edge Functions

**Rationale:**
- **Next.js API routes** handle all custom endpoints (Stripe webhooks, N8N callbacks, search)
- **Payload CMS 3.x** runs inside the same Next.js process — no separate CMS server. Admin panel at `/admin`. Manages blog posts, workflow metadata, and CMS content.
- **Supabase PostgREST** auto-generates REST APIs for all tables — reduces custom CRUD code
- **Supabase Edge Functions** handle Stripe webhook processing for subscription sync

**Trade-offs:**
- Gain: Single process, shared database, no inter-service latency
- Lose: Cannot scale CMS independently; Payload and app compete for memory

---

### Database

**Choice:** PostgreSQL 15+ (via self-hosted Supabase)

**Rationale:**
- **Single database** shared by Next.js app, Payload CMS, and N8N
- **Supabase Auth (GoTrue)** handles user auth with JWT tokens, OAuth, and email verification
- **Row Level Security (RLS)** enforces access control at the database level (NFR-003)
- **Supabase Realtime** provides WebSocket channels for DMs (FR-021) via Postgres changes
- **Full-text search** using `tsvector` / `tsquery` for workflow catalog (FR-006) — no separate search engine needed
- **JSONB columns** for flexible schema (workflow metadata, skills matrix, chatbot conversation history)
- **Supavisor** connection pooling handles 500 concurrent connections (NFR-002)

**Trade-offs:**
- Gain: Single database, no operational complexity of separate search/cache/queue services
- Lose: PostgreSQL FTS is less sophisticated than Elasticsearch; acceptable for 4,343 workflows

---

### Infrastructure

**Choice:** Docker Compose on Hostinger KVM4 VPS, Caddy reverse proxy

**Rationale:**
- **Docker Compose** — Single `docker-compose.yml` manages all services (NFR-012)
- **Caddy** — Automatic HTTPS with Let's Encrypt, simple configuration, low memory footprint
- **Hostinger KVM4** — ~$10/month, 4 vCPU, 8GB RAM, sufficient for initial scale

**Resource Allocation (estimated):**
| Service | CPU | RAM | Disk |
|---------|-----|-----|------|
| Next.js + Payload | 1.5 vCPU | 2 GB | 2 GB |
| PostgreSQL | 1 vCPU | 2 GB | 20 GB |
| Supabase (GoTrue, Realtime, Storage, PostgREST) | 0.5 vCPU | 1.5 GB | 5 GB |
| N8N | 0.5 vCPU | 1.5 GB | 5 GB |
| Caddy | 0.1 vCPU | 128 MB | 100 MB |
| OS + buffer | 0.4 vCPU | 872 MB | — |
| **Total** | **4 vCPU** | **8 GB** | **~32 GB** |

---

### Third-Party Services

| Service | Purpose | Integration Method | Cost |
|---------|---------|-------------------|------|
| **Stripe** | Payments, subscriptions, payouts | Stripe SDK + Webhooks | % per transaction |
| **Google Calendar API** | Meeting scheduling | N8N Google Calendar node | Free (already configured) |
| **Gmail API** | Transactional emails | N8N Gmail node | Free (already configured) |
| **Claude API** (Anthropic) | AI agent responses | N8N HTTP node → Claude API | Per token |
| **GitHub** (Zie619/n8n-workflows) | Workflow source | Static files (already cloned) | Free (MIT) |

---

### Development & Deployment

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Version Control** | Git + GitHub | Standard, team familiar |
| **Package Manager** | pnpm | Fast, disk-efficient, workspaces |
| **Linting** | ESLint + Prettier | NFR-010 code quality |
| **Pre-commit** | Husky + lint-staged | Catch issues before commit |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **CI/CD** | GitHub Actions | Build, test, deploy on push to main |
| **Deployment** | SSH + Docker Compose | `docker compose pull && docker compose up -d` |
| **Monitoring** | Uptime Kuma (self-hosted) | Health checks, uptime monitoring |
| **Logging** | Docker logs + Loki (optional) | Structured logging, log aggregation |

---

## System Components

### Component 1: Authentication & Authorization Module

**Purpose:** Handle all user registration, login, session management, and role-based access control.

**Responsibilities:**
- User registration with role selection (Client/Vibecoder/Learner)
- Email/password and OAuth (Google, GitHub) authentication
- Session management via Supabase Auth cookies
- JWT token validation in API routes and server components
- Role and subscription tier enforcement

**Interfaces:**
- Supabase Auth client (`@supabase/ssr`) for SSR-compatible auth
- Next.js middleware for route protection
- RLS policies for database-level enforcement

**Dependencies:**
- Supabase Auth (GoTrue)
- Stripe Billing (subscription tier sync)

**FRs Addressed:** FR-001, FR-002, FR-003

---

### Component 2: Content Management (Payload CMS)

**Purpose:** Manage blog posts, static pages, and CMS content with a visual admin interface.

**Responsibilities:**
- Blog post CRUD with rich text editor (Lexical)
- Media management (images via Supabase Storage adapter)
- Category and tag taxonomy
- SEO fields (meta title, description, OpenGraph)
- Draft, scheduled, and published states
- Admin panel at `/admin`

**Interfaces:**
- Payload Local API (server-side, no HTTP overhead)
- Payload REST API (for external tools if needed)
- Admin UI at `/admin` (auto-generated by Payload)

**Dependencies:**
- PostgreSQL (shared with Supabase)
- Supabase Storage (media uploads)

**FRs Addressed:** FR-004, FR-005

**Payload Collections:**
```typescript
// collections/Posts.ts
{
  slug: 'posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },  // Lexical editor
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'status', type: 'select', options: ['draft', 'scheduled', 'published'] },
    { name: 'publishedAt', type: 'date' },
    { name: 'seo', type: 'group', fields: [
      { name: 'metaTitle', type: 'text' },
      { name: 'metaDescription', type: 'textarea' },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
    ]},
  ],
}
```

---

### Component 3: Workflow Catalog Engine

**Purpose:** Index, search, filter, and serve 4,343+ N8N workflow templates.

**Responsibilities:**
- Import and index workflow JSON files into PostgreSQL with FTS
- Full-text search across name, description, integrations, tags
- Filtering by category, trigger type, complexity, node count
- Pagination (20 items per page)
- Download tracking (count per workflow, per user)
- Requirements extraction from workflow JSON (node types → API names)

**Interfaces:**
- Next.js API routes: `/api/workflows/search`, `/api/workflows/[id]`, `/api/workflows/[id]/download`
- Server components for SSG workflow pages

**Dependencies:**
- PostgreSQL (FTS indexes)
- Supabase Storage (workflow JSON files)

**FRs Addressed:** FR-006, FR-007, FR-008, FR-009, FR-010

**Database Schema:**
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  trigger_type TEXT,
  complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  node_count INTEGER,
  integrations TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  required_apis JSONB DEFAULT '[]',
  download_count INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflows_search ON workflows USING GIN(search_vector);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_complexity ON workflows(complexity);
CREATE INDEX idx_workflows_trigger ON workflows(trigger_type);
```

---

### Component 4: Hire Services & Checkout

**Purpose:** Manage the workflow installation service from selection through payment to project creation.

**Responsibilities:**
- Pricing overlay on workflow catalog (base price + bundle discounts)
- Cart management (selected workflows, quantities, discounts)
- Requirements detection: parse workflow JSON → extract node types → map to API names
- Client onboarding questionnaire (infrastructure readiness)
- Stripe Checkout session creation
- Post-payment: project creation, Vibecoder notification via N8N

**Interfaces:**
- Next.js pages: `/hire`, `/hire/cart`, `/hire/questionnaire`, `/hire/checkout`
- API routes: `/api/hire/cart`, `/api/hire/checkout`, `/api/hire/requirements`
- Stripe webhook: `/api/webhooks/stripe`

**Dependencies:**
- Workflow Catalog Engine (FR-006)
- Stripe SDK
- N8N (post-payment notifications)

**FRs Addressed:** FR-009, FR-010, FR-011, FR-012

---

### Component 5: AI Onboarding System

**Purpose:** Guide clients through AI-powered project scoping for custom app development.

**Responsibilities:**
- Chat interface connected to N8N webhook (Claude API backend)
- Structured conversation flow: platform → features → APIs → infrastructure → app level
- Conversation storage in database
- Automated deliverable generation: PRD, architecture diagram, API list, cost estimate
- Trigger meeting scheduling after deliverables are ready
- Anti-abuse: input validation, turn limit (30 max), trolling detection

**Interfaces:**
- Next.js page: `/app-personalized`
- API routes: `/api/onboarding/chat`, `/api/onboarding/deliverables`
- N8N webhook: receives chat messages, returns AI responses

**Dependencies:**
- N8N (AI agent workflow)
- Claude API (via N8N)
- Google Calendar (meeting scheduling)

**FRs Addressed:** FR-013, FR-014, FR-015

**Data Flow:**
```
User Message → Next.js API → N8N Webhook → Claude API
                                           ↓
Claude Response → N8N → Next.js API → User
                                           ↓
Conversation Complete → N8N generates deliverables
                     → Stores in Supabase Storage
                     → Notifies client via email
```

---

### Component 6: Developer Marketplace (Mission Board)

**Purpose:** Vibecoder onboarding, project feed, bidding, and AI-powered matching.

**Responsibilities:**
- Multi-step Vibecoder onboarding form (skills, portfolio, video, resume)
- File uploads to Supabase Storage (video ≤ 100MB, PDF ≤ 10MB)
- Mission board: project cards with filters (skills, budget, complexity)
- Match percentage calculation (project requirements vs Vibecoder skills)
- Bid submission (timeline, price, cover message)
- Admin approval workflow for Vibecoder applications and project assignments

**Interfaces:**
- Next.js pages: `/work`, `/work/onboarding`, `/work/missions`, `/work/missions/[id]`
- API routes: `/api/vibecoders`, `/api/missions`, `/api/missions/[id]/bid`
- Admin pages: `/admin/vibecoders`, `/admin/missions`

**Dependencies:**
- Supabase Storage (file uploads)
- Supabase Auth (Vibecoder role)
- N8N (matching algorithm, notifications)

**FRs Addressed:** FR-016, FR-017, FR-018

**Matching Algorithm:**
```
match_score = (matched_skills / required_skills) * 100

-- Example SQL
SELECT v.id, v.name,
  ROUND(
    (SELECT COUNT(*) FROM unnest(v.skills) s WHERE s = ANY(p.required_skills))::NUMERIC
    / GREATEST(array_length(p.required_skills, 1), 1) * 100
  ) AS match_percentage
FROM vibecoders v, projects p
WHERE p.id = $1 AND v.status = 'approved'
ORDER BY match_percentage DESC;
```

---

### Component 7: Client Project Management

**Purpose:** Client dashboard for tracking project status, deliverables, and milestones.

**Responsibilities:**
- Project list with status badges (Draft → Matching → In Progress → Review → Completed)
- Project detail view: assigned Vibecoder, deliverables, timeline, milestones
- Milestone tracking with checkbox completion
- Status change notifications (via N8N → email)

**Interfaces:**
- Next.js pages: `/dashboard`, `/dashboard/projects/[id]`
- API routes: `/api/projects`, `/api/projects/[id]/milestones`

**Dependencies:**
- Supabase (project data, RLS)
- N8N (status change notifications)

**FRs Addressed:** FR-019, FR-020

---

### Component 8: Communication System

**Purpose:** Real-time DMs between members and AI agent chat interface.

**Responsibilities:**
- **DMs:** Real-time messaging via Supabase Realtime. Text, image, and file attachments. Typing indicators. Read receipts. Conversation list with unread counts.
- **AI Agent Chat:** Chat interface connected to N8N webhook endpoints. 10+ specialist agents (N8N Expert, Claude Assistant, Supabase Specialist, etc.). Persistent chat history per user per agent.
- **Notifications:** In-app bell with unread count. Email notifications via N8N.

**Interfaces:**
- Next.js pages: `/messages`, `/messages/[conversationId]`, `/agents`, `/agents/[agentId]`
- Supabase Realtime channels: `dm:{conversationId}`, `typing:{conversationId}`
- N8N webhooks: `/webhook/agent/{agentId}`
- API routes: `/api/messages`, `/api/agents/[id]/chat`

**Dependencies:**
- Supabase Realtime (WebSocket)
- Supabase Storage (file attachments)
- N8N (AI agent backends)

**FRs Addressed:** FR-021, FR-022, FR-023

**Realtime Architecture:**
```
-- DM messages table with Realtime enabled
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS: only conversation participants can read/write
CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE user_id = auth.uid()
  ));
```

---

### Component 9: Payment & Subscription Engine

**Purpose:** Manage subscriptions (Stripe Billing) and marketplace payments (Stripe Connect).

**Responsibilities:**
- Subscription tier management (Free / Pro / Business)
- Stripe Checkout for subscription purchase
- Stripe Customer Portal for subscription management
- Stripe Connect Express onboarding for Vibecoders
- Payment splitting: platform fee + Vibecoder payout
- Webhook processing: subscription status sync to Supabase
- Payment history and invoice generation

**Interfaces:**
- Next.js pages: `/pricing`, `/settings/billing`, `/settings/payouts`
- API routes: `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/connect`
- Webhook: `/api/webhooks/stripe`

**Dependencies:**
- Stripe SDK
- Supabase (subscription status storage)

**FRs Addressed:** FR-024, FR-025, FR-026

**Webhook Flow:**
```
Stripe Event → /api/webhooks/stripe → Validate signature
  ├── customer.subscription.created → Upsert user_subscriptions
  ├── customer.subscription.updated → Update tier in user_subscriptions
  ├── customer.subscription.deleted → Set tier to 'free'
  ├── checkout.session.completed → Create project, notify Vibecoders
  ├── account.updated → Update Vibecoder connect status
  └── transfer.paid → Log payout in vibecoder_payouts
```

---

### Component 10: Integration Hub (N8N Workflows)

**Purpose:** Centralize all background automation, AI agents, email notifications, and external API integrations.

**Responsibilities:**
- AI agent chat backends (10+ agents, each a separate N8N workflow)
- AI onboarding chatbot workflow (Claude API)
- Deliverable generation workflow (PRD, architecture, cost estimate)
- Email notifications (Gmail: welcome, verification, project updates, payment receipts)
- Google Calendar meeting creation
- Project matching notifications
- Status change notifications

**Interfaces:**
- N8N Webhook triggers (called by Next.js API routes)
- N8N Database nodes (read/write Supabase PostgreSQL directly)
- N8N HTTP nodes (Stripe, Google, Claude APIs)

**Dependencies:**
- PostgreSQL (shared with Supabase)
- Claude API (Anthropic)
- Google Calendar API
- Gmail API
- Stripe API

**FRs Addressed:** FR-013, FR-014, FR-015, FR-022, FR-023, FR-027, FR-028

---

### Component 11: Admin Dashboard

**Purpose:** Platform management interface for administrators.

**Responsibilities:**
- Platform metrics overview (users, revenue, projects, MRR, GMV)
- User management (list, filter, approve Vibecoders, suspend accounts)
- Project management (view all, assign Vibecoders, update status)
- Revenue overview (subscriptions, marketplace, payouts)
- Platform configuration (pricing, fees, discounts)
- Content moderation

**Interfaces:**
- Next.js pages: `/admin/*` (protected by admin role check)
- Payload CMS admin: `/admin` (blog content management)
- API routes: `/api/admin/*`

**Dependencies:**
- Supabase (admin RLS policies)
- Stripe API (revenue data)

**FRs Addressed:** FR-029, FR-030

---

## Data Architecture

### Data Model

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   auth.users │     │   profiles   │     │ user_subscriptions │
│   (Supabase) │────→│              │────→│                    │
│   id, email  │     │ role, avatar │     │ stripe_customer_id │
│   provider   │     │ company, bio │     │ tier, status       │
└─────────────┘     └──────────────┘     └───────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────┐ ┌──────────┐ ┌──────────────────┐
     │  vibecoders  │ │ projects │ │  conversations   │
     │              │ │          │ │                  │
     │ skills[]     │ │ status   │ │ participant_ids  │
     │ portfolio    │ │ budget   │ └──────┬───────────┘
     │ availability │ │ client_id│        │
     └──────┬───────┘ └────┬─────┘        ▼
            │              │       ┌──────────────┐
            ▼              ▼       │   messages   │
     ┌──────────────┐ ┌──────────┐│              │
     │    bids      │ │milestones││ content      │
     │              │ │          ││ sender_id    │
     │ vibecoder_id │ │ status   ││ attachments  │
     │ project_id   │ │ position ││ status       │
     └──────────────┘ └──────────┘└──────────────┘

     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  workflows   │ │    posts     │ │ agent_chats  │
     │              │ │  (Payload)   │ │              │
     │ name, desc   │ │              │ │ agent_id     │
     │ integrations │ │ title, slug  │ │ user_id      │
     │ complexity   │ │ content      │ │ messages[]   │
     │ search_vector│ │ category     │ │              │
     └──────────────┘ └──────────────┘ └──────────────┘
```

### Database Design

**Schema: `public` (application tables)**

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'vibecoder', 'learner', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT,
  industry TEXT,
  profile_complete_pct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription tracking
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibecoder extended profile
CREATE TABLE vibecoders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_url TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  resume_url TEXT,
  video_url TEXT,
  skills JSONB DEFAULT '{}',   -- { "n8n": 5, "supabase": 4, "claude": 5, ... }
  tools TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  hours_per_week INTEGER,
  timezone TEXT,
  communication_prefs TEXT[] DEFAULT '{}',
  stripe_connect_id TEXT,
  connect_status TEXT DEFAULT 'pending' CHECK (connect_status IN ('pending', 'active', 'disabled')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT CHECK (project_type IN ('workflow_install', 'custom_app')),
  app_level TEXT CHECK (app_level IN ('lv1', 'lv2', 'lv3')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'matching', 'assigned', 'in_progress', 'review', 'completed', 'cancelled')),
  required_skills TEXT[] DEFAULT '{}',
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  estimated_duration TEXT,
  assigned_vibecoder_id UUID REFERENCES vibecoders(id),
  stripe_payment_intent_id TEXT,
  deliverables JSONB DEFAULT '[]',
  questionnaire_responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project bids
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vibecoder_id UUID NOT NULL REFERENCES vibecoders(id),
  proposed_price DECIMAL(10,2),
  proposed_timeline TEXT,
  cover_message TEXT,
  match_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows catalog
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  trigger_type TEXT,
  complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  node_count INTEGER DEFAULT 0,
  integrations TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  required_apis JSONB DEFAULT '[]',
  install_price DECIMAL(10,2),
  download_count INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow downloads tracking
CREATE TABLE workflow_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- DM conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages (DMs)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI agent chat sessions
CREATE TABLE agent_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding conversations (custom app scoping)
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conversation JSONB DEFAULT '[]',
  extracted_requirements JSONB,
  app_level TEXT,
  deliverables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'brl',
  payment_type TEXT CHECK (payment_type IN ('subscription', 'service', 'mentorship')),
  status TEXT DEFAULT 'pending',
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibecoder payouts
CREATE TABLE vibecoder_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vibecoder_id UUID NOT NULL REFERENCES vibecoders(id),
  project_id UUID REFERENCES projects(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX idx_vibecoders_approval ON vibecoders(approval_status);
CREATE INDEX idx_vibecoders_skills ON vibecoders USING GIN(skills);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_skills ON projects USING GIN(required_skills);
CREATE INDEX idx_workflows_search ON workflows USING GIN(search_vector);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX idx_agent_chats_user_agent ON agent_chat_sessions(user_id, agent_id);
```

### Data Flow

```
[Browser] ──GET──→ [Next.js SSR/SSG] ──→ [Supabase PostgREST or Payload Local API]
                                          ──→ [PostgreSQL]

[Browser] ──POST──→ [Next.js API Route] ──→ [Supabase Client] ──→ [PostgreSQL]
                                          ──→ [Stripe SDK] ──→ [Stripe API]
                                          ──→ [N8N Webhook] ──→ [Claude API / Gmail / Calendar]

[Stripe] ──Webhook──→ [Next.js /api/webhooks/stripe] ──→ [Supabase] ──→ [PostgreSQL]

[N8N] ──Direct DB──→ [PostgreSQL] (for reading project data, writing deliverables)
[N8N] ──HTTP──→ [Claude API, Google APIs, Gmail]

[Supabase Realtime] ──WebSocket──→ [Browser] (DM messages, typing indicators, notifications)
```

---

## API Design

### API Architecture

**Approach:** Hybrid — Next.js API Routes for custom logic + Supabase PostgREST for standard CRUD + Payload REST API for CMS content.

- **Authentication:** Supabase Auth JWT tokens in cookies (SSR-compatible via `@supabase/ssr`)
- **Response Format:** JSON
- **Error Format:** `{ error: string, code: string, status: number }`
- **Pagination:** Cursor-based for feeds, offset-based for catalogs
- **Rate Limiting:** Middleware-level, 100 req/min per user, 5 req/min for auth endpoints

### Key Endpoints

```
## Auth (Supabase Auth — built-in, no custom routes needed)
POST   /auth/v1/signup          — Register
POST   /auth/v1/token           — Login (returns JWT)
POST   /auth/v1/recover         — Password reset
GET    /auth/v1/user            — Get current user

## Profiles
GET    /api/profiles/me         — Get current user profile
PATCH  /api/profiles/me         — Update profile
GET    /api/profiles/[id]       — Get public profile

## Blog (Payload CMS REST API)
GET    /api/posts               — List posts (paginated)
GET    /api/posts/[slug]        — Get post by slug

## Workflows
GET    /api/workflows           — Search/filter (q, category, trigger, complexity, page)
GET    /api/workflows/[id]      — Get workflow detail
POST   /api/workflows/[id]/download  — Download workflow JSON (tracked)
GET    /api/workflows/categories     — List all categories

## Hire Services
POST   /api/hire/cart           — Add/remove workflows to cart
GET    /api/hire/requirements   — Get requirements for selected workflows
POST   /api/hire/questionnaire  — Submit questionnaire responses
POST   /api/hire/checkout       — Create Stripe Checkout session

## AI Onboarding
POST   /api/onboarding/chat     — Send message to AI chatbot (proxies to N8N)
GET    /api/onboarding/sessions — List user's onboarding sessions
GET    /api/onboarding/sessions/[id]/deliverables — Get generated deliverables

## Projects
GET    /api/projects            — List user's projects
GET    /api/projects/[id]       — Get project detail
PATCH  /api/projects/[id]       — Update project (admin/vibecoder)
GET    /api/projects/[id]/milestones — Get milestones
PATCH  /api/projects/[id]/milestones/[mid] — Toggle milestone

## Mission Board
GET    /api/missions            — List open projects for Vibecoders (with match %)
POST   /api/missions/[id]/bid   — Submit bid on project

## Vibecoders
POST   /api/vibecoders/onboarding  — Submit onboarding data
GET    /api/vibecoders/me          — Get Vibecoder profile
PATCH  /api/vibecoders/me          — Update Vibecoder profile
POST   /api/vibecoders/connect     — Start Stripe Connect onboarding

## Messages (DMs)
GET    /api/messages/conversations     — List conversations with last message
GET    /api/messages/conversations/[id] — Get messages in conversation
POST   /api/messages                   — Send message

## AI Agents
GET    /api/agents               — List available agents
POST   /api/agents/[id]/chat     — Send message to agent (proxies to N8N)
GET    /api/agents/[id]/history  — Get chat history with agent

## Notifications
GET    /api/notifications        — List notifications (unread first)
PATCH  /api/notifications/read   — Mark all as read

## Payments
POST   /api/stripe/checkout      — Create subscription checkout session
POST   /api/stripe/portal        — Create customer portal session
GET    /api/payments/history      — Payment history
GET    /api/payments/earnings     — Vibecoder earnings

## Webhooks (not user-facing)
POST   /api/webhooks/stripe      — Stripe webhook handler

## Admin
GET    /api/admin/stats          — Platform metrics
GET    /api/admin/users          — List/filter users
PATCH  /api/admin/users/[id]     — Update user (approve, suspend)
GET    /api/admin/projects       — List all projects
PATCH  /api/admin/projects/[id]  — Admin project actions
GET    /api/admin/revenue        — Revenue summary

## Calendar
POST   /api/calendar/book        — Book consultation slot
GET    /api/calendar/availability — Get available slots
```

### Authentication & Authorization

**Flow:**
```
1. User signs in → Supabase Auth returns JWT + refresh token
2. @supabase/ssr stores tokens in httpOnly cookies
3. Next.js middleware reads cookie, validates JWT on every request
4. Server components/API routes create Supabase client with user's JWT
5. All database queries go through RLS — user can only access their data
6. Subscription tier checked via user_subscriptions table join
```

**RLS Policy Examples:**
```sql
-- Profiles: users can read all, update only own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Messages: only conversation participants
CREATE POLICY "Read messages in own conversations"
  ON messages FOR SELECT TO authenticated
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
  ));

-- Projects: clients see own, vibecoders see assigned, admins see all
CREATE POLICY "Clients see own projects"
  ON projects FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR assigned_vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Feature gating by subscription tier
CREATE POLICY "Pro users can send messages"
  ON messages FOR INSERT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = auth.uid() AND tier IN ('pro', 'business') AND status = 'active'
  ));
```

---

## Non-Functional Requirements Coverage

### NFR-001: Performance — Page Load

**Requirement:** LCP < 2.5s, FID < 100ms, CLS < 0.1, API < 500ms (p95)

**Architecture Solution:**
- Blog and workflow index pages use **Next.js SSG with ISR** (revalidate every 60s) — pre-rendered HTML
- React Server Components reduce client JavaScript bundle size
- PostgreSQL FTS with `tsvector` indexes for sub-second workflow search
- Pagination (20 items/page) prevents loading 4,000+ records
- Image optimization via `next/image` with Supabase Storage as source
- Tailwind CSS purging removes unused styles

**Validation:** Lighthouse CI in GitHub Actions, alert on LCP > 2.5s

---

### NFR-002: Performance — Concurrent Users

**Requirement:** 500 concurrent users with < 1s response time

**Architecture Solution:**
- Supavisor connection pooling (transaction mode, 200 max connections)
- Next.js server components reduce client-server round trips
- Static pages served directly from disk (no DB hit for blog/workflow pages)
- Supabase Realtime limits: max 200 concurrent WebSocket connections (sufficient for DM MVP)
- N8N webhook endpoints are stateless — scale with request count

**Validation:** Load testing with k6 (500 virtual users, 60s sustained)

---

### NFR-003: Security — Authentication & Authorization

**Requirement:** Supabase Auth + JWT + RLS + CSRF + rate limiting

**Architecture Solution:**
- Supabase Auth (GoTrue) handles all auth flows with JWT
- `@supabase/ssr` manages cookies for SSR compatibility
- RLS policies on ALL tables with user data (see examples above)
- Next.js middleware validates JWT on protected routes
- CSRF protection via SameSite cookie attribute + custom header check
- Rate limiting: 5 req/min on auth endpoints, 100 req/min general

**Validation:** Security audit checklist, penetration testing before launch

---

### NFR-004: Security — Payment Data

**Requirement:** Zero credit card data on platform

**Architecture Solution:**
- Stripe Checkout (hosted by Stripe) handles all payment form rendering
- Stripe Customer Portal handles subscription management
- Stripe Connect Express handles Vibecoder onboarding
- Webhook signatures validated with `stripe.webhooks.constructEvent()`
- Stripe API keys in environment variables only

**Validation:** No `<input type="credit-card">` elements in codebase, Stripe dashboard confirms no raw card data

---

### NFR-005: Security — Data Protection

**Requirement:** TLS, encryption at rest, file limits, RLS

**Architecture Solution:**
- Caddy provides automatic HTTPS with Let's Encrypt (TLS 1.3)
- PostgreSQL encryption at rest (Supabase default)
- Supabase Storage policies enforce file size limits (10MB general, 100MB video)
- RLS ensures data isolation
- Environment variables via `.env` (not committed to git, `.gitignore`)
- Structured logging with no PII in log messages

---

### NFR-006: Scalability — Horizontal Growth

**Requirement:** Scale from 500 to 5,000+ users without re-architecture

**Architecture Solution:**
- Stateless Next.js (can run multiple instances behind load balancer)
- Supabase Storage (S3-compatible, not local filesystem)
- N8N processes jobs asynchronously (webhook queue)
- Database indexes on all frequently queried columns
- Migration path: add second VPS with load balancer when needed

---

### NFR-007: Reliability — Uptime

**Requirement:** 99.5% uptime, health checks, automated restart, daily backups

**Architecture Solution:**
- Docker `restart: unless-stopped` on all services
- Caddy health check endpoints for each service
- Uptime Kuma (self-hosted) monitors all endpoints
- PostgreSQL: `pg_dump` daily cron job → compressed backup to separate storage
- N8N workflow error notifications to admin email
- Docker volume backups included in daily cron

---

### NFR-008: Usability — Responsive Design

**Requirement:** Responsive at 375px, 768px, 1366px, 1920px

**Architecture Solution:**
- Tailwind CSS responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- shadcn/ui components are responsive by default
- Mobile-first development approach
- Chat interface adapts: full sidebar on desktop, slide-over on mobile
- Touch targets enforced via Tailwind (`min-h-11 min-w-11` for 44px)

---

### NFR-009: Usability — Internationalization

**Requirement:** Portuguese (Brazil) primary, English planned

**Architecture Solution:**
- `next-intl` for UI string externalization (locale files: `pt-BR.json`, `en.json`)
- Payload CMS supports localized fields for blog posts
- Date formatting: `Intl.DateTimeFormat('pt-BR')`
- Currency: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- URL structure: `/pt/...`, `/en/...` (future)

---

### NFR-010: Maintainability — Code Quality

**Requirement:** ESLint, Prettier, TypeScript strict, env vars

**Architecture Solution:**
- ESLint + Prettier with Husky pre-commit hooks
- TypeScript `strict: true`
- `zod` for runtime validation of API inputs and env vars
- Consistent naming: `kebab-case` files, `PascalCase` components, `camelCase` functions
- `.env.example` with all required variables documented

---

### NFR-011: Compatibility — Browser Support

**Requirement:** Chrome, Firefox, Safari, Edge latest 2 versions

**Architecture Solution:**
- Next.js handles transpilation for target browsers
- Tailwind CSS uses standard CSS properties (no vendor prefixes needed)
- SSR provides fallback for JavaScript-disabled clients
- `browserslist` configured in `package.json`

---

### NFR-012: Infrastructure — Self-Hosted Docker

**Requirement:** Single docker-compose.yml, reverse proxy, HTTPS

**Architecture Solution:**
- See Infrastructure section above
- Single `docker-compose.yml` with all services
- Caddy for automatic HTTPS
- Persistent volumes for data durability
- `.env` file for all configuration

---

## Security Architecture

### Authentication

- **Method:** Supabase Auth (GoTrue) with JWT
- **Providers:** Email/password, Google OAuth, GitHub OAuth
- **Token Lifetime:** Access token: 1 hour. Refresh token: 7 days.
- **Cookie Storage:** `httpOnly`, `Secure`, `SameSite=Lax` via `@supabase/ssr`
- **Email Verification:** Required before full access
- **Password Reset:** Email-based with Supabase built-in flow

### Authorization

- **Model:** RBAC (Role-Based Access Control) + Subscription-Based Gating
- **Roles:** `admin`, `client`, `vibecoder`, `learner`
- **Enforcement Layers:**
  1. Next.js middleware (route-level protection)
  2. API route guards (role + subscription check)
  3. Supabase RLS (database-level, final enforcement)
- **Subscription Gating:** RLS policies join `user_subscriptions` table

### Data Encryption

- **In Transit:** TLS 1.3 via Caddy (all external traffic)
- **At Rest:** PostgreSQL transparent data encryption (Supabase default)
- **File Storage:** Supabase Storage with bucket-level access policies
- **Secrets:** All API keys, database credentials in `.env` file, never in code

### Security Best Practices

- Input validation with `zod` on all API inputs
- Parameterized queries via Supabase client (prevents SQL injection)
- React auto-escapes JSX (prevents XSS)
- `SameSite=Lax` cookies + custom header check (CSRF protection)
- Rate limiting on auth and payment endpoints
- Security headers via Caddy (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`)
- Dependency scanning via `npm audit` in CI

---

## Scalability & Performance

### Scaling Strategy

**Phase 1 (0-1,000 users): Single VPS**
- All services on one Hostinger KVM4
- Vertical scaling: upgrade to KVM8 (8 vCPU, 16GB) if needed

**Phase 2 (1,000-5,000 users): Optimized Single VPS**
- Add Redis for session caching and API response caching
- Move static assets to CDN (BunnyCDN or Cloudflare)
- Optimize PostgreSQL with pg_stat_statements analysis

**Phase 3 (5,000+ users): Multi-VPS**
- Separate database VPS (dedicated PostgreSQL)
- Load balancer (Caddy) in front of 2+ Next.js instances
- N8N on separate VPS if workflow volume grows

### Performance Optimization

- **SSG/ISR:** Blog posts and workflow pages pre-rendered at build time
- **Server Components:** Reduce client JS bundle by rendering on server
- **Database:** Proper indexes (see Database Indexes section), `EXPLAIN ANALYZE` on slow queries
- **Pagination:** All list endpoints paginated (20 items default)
- **Lazy Loading:** Images via `next/image`, components via `React.lazy()`
- **FTS:** PostgreSQL `tsvector` with `GIN` index for workflow search

### Caching Strategy

- **SSG/ISR:** Blog pages cached at build, revalidated every 60s (ISR)
- **Workflow catalog:** ISR with 300s revalidation
- **Static assets:** Long-lived `Cache-Control` headers via Caddy
- **API responses:** None for MVP (add Redis in Phase 2 if needed)
- **Supabase client:** Built-in connection pooling via Supavisor

### Load Balancing

- **Current:** Caddy as single reverse proxy (no load balancing needed for single VPS)
- **Future:** Caddy supports upstream load balancing — add `upstream` directive when scaling to multiple Next.js instances

---

## Reliability & Availability

### High Availability Design

- **Single VPS Limitation:** True HA requires multiple VPS — not in scope for MVP
- **Mitigation:** Docker `restart: unless-stopped` ensures auto-recovery from crashes
- **Target:** 99.5% uptime (~1.8 days downtime/year)

### Disaster Recovery

- **RPO (Recovery Point Objective):** 24 hours (daily backups)
- **RTO (Recovery Time Objective):** 2-4 hours (restore from backup, redeploy Docker)
- **Backup Process:** Daily cron: `pg_dump` → compress → upload to separate storage
- **Restore:** Download backup → `pg_restore` → `docker compose up`

### Backup Strategy

```bash
# Daily backup cron (runs at 3 AM UTC)
0 3 * * * /opt/scripts/backup.sh

# backup.sh
pg_dump -h localhost -U postgres automatrix | gzip > /backups/automatrix-$(date +%Y%m%d).sql.gz
# Retain 7 daily + 4 weekly backups
find /backups -name "*.sql.gz" -mtime +7 -delete
# Optional: upload to external storage
```

### Monitoring & Alerting

- **Uptime Kuma** (self-hosted): HTTP checks every 60s on all endpoints
  - `/api/health` (Next.js)
  - `/rest/v1/` (Supabase PostgREST)
  - N8N health endpoint
- **Docker Healthchecks:** Defined in `docker-compose.yml` for each service
- **N8N Error Workflow:** Catches failed workflows, sends email to admin
- **Alerts:** Uptime Kuma → Email/Telegram notifications on downtime

---

## Integration Architecture

### External Integrations

| Integration | Protocol | Auth | Module |
|-------------|----------|------|--------|
| Stripe Checkout/Billing | HTTPS REST | API Key (server) | Payment Engine |
| Stripe Connect | HTTPS REST | API Key (server) | Payment Engine |
| Stripe Webhooks | HTTPS POST | Webhook Signing Secret | Payment Engine |
| Google Calendar API | HTTPS REST | OAuth2 (via N8N) | Integration Hub |
| Gmail API | HTTPS REST | OAuth2 (via N8N) | Integration Hub |
| Claude API (Anthropic) | HTTPS REST | API Key (via N8N) | AI Onboarding, Agent Chat |

### Internal Integrations

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Next.js | Supabase | PostgREST + WebSocket | Database, Auth, Realtime, Storage |
| Next.js | N8N | HTTP Webhook | AI agents, notifications, automations |
| Next.js | Payload CMS | Local API (in-process) | Blog content |
| Next.js | Stripe | Stripe SDK (HTTPS) | Payments |
| N8N | PostgreSQL | Direct DB connection | Read/write data |
| N8N | External APIs | HTTPS | Claude, Google, Gmail |

### Message/Event Architecture

```
Event-driven via Supabase Realtime + N8N Webhooks:

1. User sends DM → INSERT into messages table
   → Supabase Realtime broadcasts to conversation channel
   → Recipient browser receives via WebSocket

2. Client completes payment → Stripe webhook → /api/webhooks/stripe
   → Create project record → Trigger N8N workflow (notify Vibecoders)
   → N8N sends emails + creates notifications in DB
   → Supabase Realtime broadcasts notification to recipient

3. Admin approves Vibecoder → UPDATE vibecoders.approval_status
   → Database trigger → N8N webhook → Send welcome email
   → Create notification in DB → Realtime broadcast

4. AI Agent chat → User message → /api/agents/[id]/chat
   → N8N webhook → Claude API → Response
   → Save to agent_chat_sessions → Return to user
```

---

## Development Architecture

### Code Organization

```
automatrix-webapp/
├── docker-compose.yml          # All services
├── Dockerfile                  # Next.js app
├── .env.example               # All env vars documented
├── next.config.ts              # Next.js configuration
├── payload.config.ts           # Payload CMS configuration
├── tailwind.config.ts          # Tailwind + shadcn theme
├── tsconfig.json
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes (no auth)
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── blog/           # Blog index + [slug]
│   │   │   ├── workflows/      # Workflow catalog + [id]
│   │   │   └── pricing/        # Pricing page
│   │   │
│   │   ├── (auth)/             # Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (dashboard)/        # Protected routes (requires auth)
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── dashboard/      # Client dashboard
│   │   │   ├── messages/       # DMs
│   │   │   ├── agents/         # AI agent chat
│   │   │   ├── hire/           # Hire flow
│   │   │   ├── app-personalized/ # AI onboarding
│   │   │   ├── work/           # Mission board (Vibecoders)
│   │   │   ├── settings/       # Profile, billing, notifications
│   │   │   └── admin/          # Admin dashboard
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── workflows/
│   │   │   ├── hire/
│   │   │   ├── onboarding/
│   │   │   ├── projects/
│   │   │   ├── missions/
│   │   │   ├── vibecoders/
│   │   │   ├── messages/
│   │   │   ├── agents/
│   │   │   ├── notifications/
│   │   │   ├── stripe/
│   │   │   ├── calendar/
│   │   │   ├── admin/
│   │   │   └── webhooks/
│   │   │
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer, Sidebar, etc.
│   │   ├── forms/              # Reusable form components
│   │   └── features/           # Feature-specific components
│   │       ├── workflows/
│   │       ├── chat/
│   │       ├── projects/
│   │       └── payments/
│   │
│   ├── lib/                    # Shared utilities
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client (cookies)
│   │   │   └── admin.ts        # Service role client
│   │   ├── stripe.ts           # Stripe client
│   │   ├── n8n.ts              # N8N webhook helpers
│   │   ├── utils.ts            # General utilities
│   │   └── constants.ts        # App constants
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-realtime.ts     # Supabase Realtime hook
│   │   ├── use-auth.ts         # Auth state hook
│   │   └── use-subscription.ts # Subscription tier hook
│   │
│   ├── types/                  # TypeScript types
│   │   ├── database.ts         # Generated from Supabase
│   │   ├── api.ts              # API request/response types
│   │   └── index.ts            # Shared types
│   │
│   └── payload/                # Payload CMS
│       ├── collections/
│       │   ├── Posts.ts
│       │   ├── Categories.ts
│       │   ├── Tags.ts
│       │   └── Media.ts
│       └── globals/
│           └── SiteSettings.ts
│
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── seed.sql                # Seed data (workflows, agents)
│   └── functions/              # Edge Functions (if needed)
│
├── public/
│   └── n8n-workflows/          # Static workflow JSON files
│
└── scripts/
    ├── import-workflows.ts     # Index workflows into PostgreSQL
    ├── backup.sh               # Database backup script
    └── seed-agents.ts          # Seed AI agent configurations
```

### Testing Strategy

| Type | Tool | Coverage Target | What to Test |
|------|------|-----------------|--------------|
| **Unit** | Vitest | 80% for lib/ | Utility functions, data transformations, validation |
| **Component** | Vitest + Testing Library | Key flows | Forms, cart logic, search filters |
| **Integration** | Vitest | API routes | Stripe webhooks, auth flows, CRUD operations |
| **E2E** | Playwright | Critical paths | Registration, checkout, DM sending, workflow download |

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/automatrix
            git pull origin main
            docker compose build --no-cache app
            docker compose up -d
```

---

## Deployment Architecture

### Environments

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| **Development** | Local development | `localhost:3000` | Local Docker PostgreSQL |
| **Production** | Live platform | `automatrix.com.br` | VPS PostgreSQL |

### Docker Compose

```yaml
# docker-compose.yml (simplified)
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    restart: unless-stopped

  app:
    build: .
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/automatrix
      - NEXT_PUBLIC_SUPABASE_URL=http://kong:8000
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: supabase/postgres:15.1.1.78
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

  auth:
    image: supabase/gotrue:v2.143.0
    depends_on:
      - db
    environment:
      - GOTRUE_JWT_SECRET=${JWT_SECRET}
      - GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
      - GOTRUE_EXTERNAL_GITHUB_ENABLED=true
    restart: unless-stopped

  realtime:
    image: supabase/realtime:v2.28.32
    depends_on:
      - db
    restart: unless-stopped

  storage:
    image: supabase/storage-api:v0.46.4
    depends_on:
      - db
    volumes:
      - storage_data:/var/lib/storage
    restart: unless-stopped

  rest:
    image: postgrest/postgrest:v12.0.1
    depends_on:
      - db
    restart: unless-stopped

  kong:
    image: kong:2.8.1
    depends_on:
      - auth
      - rest
      - realtime
      - storage
    restart: unless-stopped

  n8n:
    image: n8nio/n8n:latest
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_DATABASE=n8n
    restart: unless-stopped

volumes:
  caddy_data:
  db_data:
  storage_data:
  n8n_data:
```

---

## Requirements Traceability

### Functional Requirements Coverage

| FR ID | FR Name | Components | Status |
|-------|---------|------------|--------|
| FR-001 | User Registration & Auth | Auth Module, Supabase Auth | Covered |
| FR-002 | User Profiles | Auth Module, Supabase DB | Covered |
| FR-003 | Role-Based Access Control | Auth Module, RLS Policies | Covered |
| FR-004 | Blog Content Management | Payload CMS | Covered |
| FR-005 | Blog Content Display | Next.js SSG, Payload API | Covered |
| FR-006 | Workflow Catalog | Workflow Engine, PostgreSQL FTS | Covered |
| FR-007 | Workflow Download | Workflow Engine, Storage | Covered |
| FR-008 | Workflow Detail Page | Workflow Engine, Next.js SSG | Covered |
| FR-009 | Service Listing | Hire Services Component | Covered |
| FR-010 | Requirements Detection | Hire Services, JSON Parser | Covered |
| FR-011 | Client Questionnaire | Hire Services, Forms | Covered |
| FR-012 | Hire Service Checkout | Hire Services, Stripe | Covered |
| FR-013 | AI Onboarding Chatbot | AI Onboarding, N8N, Claude | Covered |
| FR-014 | Deliverable Generation | AI Onboarding, N8N | Covered |
| FR-015 | Meeting Scheduling | AI Onboarding, Google Calendar | Covered |
| FR-016 | Vibecoder Onboarding | Dev Marketplace, Supabase Storage | Covered |
| FR-017 | Mission Board | Dev Marketplace, PostgreSQL | Covered |
| FR-018 | Project Bidding & Matching | Dev Marketplace, N8N (AI matching) | Covered |
| FR-019 | Client Project Dashboard | Project Management | Covered |
| FR-020 | Project Status Tracking | Project Management, N8N (notifications) | Covered |
| FR-021 | Direct Messages | Communication, Supabase Realtime | Covered |
| FR-022 | AI Agent Chat | Communication, N8N Webhooks | Covered |
| FR-023 | Notification System | Communication, Supabase Realtime | Covered |
| FR-024 | Subscription Tiers | Payment Engine, Stripe Billing | Covered |
| FR-025 | Marketplace Payments | Payment Engine, Stripe Connect | Covered |
| FR-026 | Payment History | Payment Engine, Stripe API | Covered |
| FR-027 | Google Calendar | Integration Hub, N8N | Covered |
| FR-028 | Gmail Integration | Integration Hub, N8N | Covered |
| FR-029 | Admin Dashboard | Admin Module | Covered |
| FR-030 | Analytics & Reporting | Admin Module | Covered |
| FR-031 | Mentorship Booking | Additional Services | Covered |
| FR-032 | Local Agent Setup | Additional Services | Covered |

**Coverage: 32/32 FRs (100%)**

### Non-Functional Requirements Coverage

| NFR ID | NFR Name | Solution | Validation |
|--------|----------|----------|------------|
| NFR-001 | Page Load | SSG/ISR, RSC, FTS indexes | Lighthouse CI |
| NFR-002 | Concurrent Users | Supavisor pooling, pagination | k6 load test |
| NFR-003 | Security Auth | Supabase Auth, RLS, JWT | Security audit |
| NFR-004 | Payment Security | Stripe-only, no card data | Code review |
| NFR-005 | Data Protection | TLS, encryption at rest, RLS | Penetration test |
| NFR-006 | Scalability | Stateless, Docker, indexes | Architecture review |
| NFR-007 | Uptime | Docker restart, health checks, backups | Uptime Kuma |
| NFR-008 | Responsive | Tailwind, shadcn/ui, mobile-first | Visual testing |
| NFR-009 | i18n | next-intl, locale files | Manual testing |
| NFR-010 | Code Quality | ESLint, Prettier, TS strict | CI pipeline |
| NFR-011 | Browser Support | Next.js transpilation, SSR | Cross-browser test |
| NFR-012 | Docker Infra | docker-compose.yml, Caddy, .env | Deploy test |

**Coverage: 12/12 NFRs (100%)**

---

## Trade-offs & Decision Log

### Decision 1: Modular Monolith vs Microservices

**Choice:** Modular Monolith
**Gain:** Simple deployment, low memory overhead, no inter-service latency, single Docker build
**Lose:** Cannot scale individual modules independently; all share same process
**Rationale:** Single VPS with 8GB RAM cannot efficiently run separate containers for each module. A monolith uses ~2GB vs ~6-8GB for equivalent microservices.

### Decision 2: PostgreSQL FTS vs Elasticsearch

**Choice:** PostgreSQL FTS (`tsvector`)
**Gain:** No additional service, no extra memory, integrated with existing database
**Lose:** Less sophisticated ranking, no fuzzy matching, no faceted search
**Rationale:** 4,343 workflows is a small dataset. PostgreSQL FTS handles this easily. Adding Elasticsearch would consume ~1-2GB RAM on an already tight VPS.

### Decision 3: Supabase Realtime vs Socket.io vs Pusher

**Choice:** Supabase Realtime
**Gain:** Zero additional infrastructure (part of Supabase stack), database-driven (INSERT triggers broadcast), built-in auth integration
**Lose:** Less flexible than raw Socket.io, limited to PostgreSQL change events
**Rationale:** DMs are database-driven. Supabase Realtime broadcasts on table changes — perfect fit. No need for custom WebSocket server.

### Decision 4: Payload CMS Embedded vs Separate Headless CMS

**Choice:** Payload CMS 3.x embedded in Next.js
**Gain:** Single process, shared database, no API latency for content queries, Payload Local API is zero-overhead
**Lose:** CMS and app share memory; large media uploads could impact app performance
**Rationale:** Payload 3.x was designed to run inside Next.js. This eliminates a separate CMS container and reduces infrastructure complexity.

### Decision 5: N8N for Background Jobs vs Custom Queue

**Choice:** N8N
**Gain:** Visual workflow editor, 400+ integrations, already running on VPS, handles email/calendar/AI
**Lose:** N8N adds ~1.5GB RAM overhead, workflows are visual (not code-reviewable)
**Rationale:** N8N is already deployed and running AI agents. Using it for all background jobs (notifications, matching, deliverable generation) consolidates automation in one place.

---

## Open Issues & Risks

| # | Issue | Risk Level | Mitigation |
|---|-------|------------|------------|
| 1 | VPS memory pressure (8GB for all services) | Medium | Monitor with Docker stats. Upgrade to KVM8 if needed (~$20/month). |
| 2 | Supabase Realtime connection limits (200 concurrent) | Low | DM MVP only. Add Redis pub/sub if limits hit. |
| 3 | N8N workflow reliability for critical paths (payments, emails) | Medium | N8N error workflow catches failures. Manual fallback documented. |
| 4 | Claude API rate limits for AI agents | Low | Queue messages via N8N. Implement backoff. |
| 5 | Single point of failure (one VPS) | Medium | Daily backups. RTO 2-4h. Upgrade to multi-VPS in Phase 2. |
| 6 | Payload CMS + Next.js memory sharing | Low | Payload is lightweight. Monitor memory. Separate if needed. |

---

## Assumptions & Constraints

### Assumptions
1. Hostinger KVM4 provides stable 4 vCPU / 8GB RAM performance
2. N8N AI agent workflows are already functional and tested
3. Google Calendar and Gmail OAuth tokens are valid and refreshable
4. Stripe account is fully verified for Connect + Billing
5. 4,343+ workflow JSON files are valid and parseable
6. Users have modern browsers (no IE11 support needed)

### Constraints
1. **Budget:** Single VPS only (~$10-20/month infrastructure)
2. **Team:** Solo developer with AI assistance
3. **Timeline:** 15-21 weeks for full platform
4. **Memory:** 8GB RAM total for all services
5. **No CDN:** Direct VPS serving for MVP (add CDN in Phase 2)

---

## Future Considerations

1. **Chat Rooms (v3):** Extend Supabase Realtime channels from 1:1 to group. Add `channel_members` table. Minimal architecture change.
2. **CDN:** Add BunnyCDN or Cloudflare for static assets and images when traffic grows.
3. **Redis:** Add for API response caching, session storage, and rate limiting when hitting performance limits.
4. **Mobile App:** React Native or Expo, consuming the same API routes. Architecture supports this via REST API.
5. **Multi-VPS:** Separate database VPS, add load balancer. Next.js is stateless — horizontal scaling is straightforward.
6. **Advanced Search:** Migrate to Meilisearch or Typesense if PostgreSQL FTS becomes insufficient (fuzzy matching, typo tolerance).

---

## Approval & Sign-off

**Review Status:**
- [ ] Technical Lead
- [ ] Product Owner
- [ ] Security Review
- [ ] DevOps Review

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-06 | lucasautomatrix | Initial architecture |

---

## Next Steps

### Phase 4: Sprint Planning & Implementation

Run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation following this architectural blueprint

**Key Implementation Principles:**
1. Follow component boundaries defined in this document
2. Implement NFR solutions as specified
3. Use technology stack as defined
4. Follow API contracts exactly
5. Adhere to security and performance guidelines

---

**This document was created using BMAD Method v6 - Phase 3 (Solutioning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Resource Estimation

| Resource | Current (MVP) | Phase 2 (5,000 users) |
|----------|---------------|----------------------|
| VPS | KVM4 (4 vCPU, 8GB) | KVM8 (8 vCPU, 16GB) |
| Database | ~5GB | ~20GB |
| Storage (files) | ~10GB | ~100GB |
| Bandwidth | ~100GB/month | ~500GB/month |
| Monthly Cost | ~$10 | ~$30 |

## Appendix B: Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/automatrix
DB_PASSWORD=

# Payload CMS
PAYLOAD_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_CONNECT_CLIENT_ID=

# N8N
N8N_WEBHOOK_BASE_URL=http://n8n:5678

# Google (via N8N — configured in N8N UI)
# GOOGLE_CALENDAR_API_KEY=
# GMAIL_OAUTH_CLIENT_ID=

# App
NEXT_PUBLIC_APP_URL=https://automatrix.com.br
NODE_ENV=production
```
