# Product Requirements Document: Automatrix Platform v2

**Date:** 2026-02-06
**Author:** lucasautomatrix
**Version:** 1.0
**Project Type:** AI Automation Hub & Marketplace
**Project Level:** Level 4 (Complex Platform)
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for the Automatrix Platform v2. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Definition Record: `../../AUTOMATRIX_PDR.md`
- Workflow Shop Integration: `workflow-shop-integration.md`
- User Flow (PT): `user-flow-pt.md`

---

## Executive Summary

Automatrix Platform v2 is a complete rebuild of the existing frontend prototype into a full-stack AI Automation Hub & Marketplace. The platform serves three primary audiences: **Clients** seeking AI automation solutions (from free workflow templates to custom SaaS applications), **Vibecoders** (AI developers/automators) who deliver those solutions through a managed marketplace, and **Learners** discovering automation through free content and templates.

The platform combines a content hub (blog/tutorials), a free N8N workflow bank (4,343+ templates), a managed services marketplace (hire workflow implementation or custom app development), an AI-powered client onboarding system that generates project scope documents, a developer mission board for project matching, and integrated communication tools (DMs, AI agent chats).

Revenue comes from marketplace transaction fees (Stripe Connect), subscription tiers (Stripe Billing), and premium services (mentorship, local agent setup). The platform is fully self-hosted on VPS using Docker, with Next.js 14+, Payload CMS 3.x, Supabase, N8N, and Stripe as the core stack.

---

## Product Goals

### Business Objectives

1. **BO-1: Establish a self-sustaining AI automation marketplace** — Connect clients needing automations with qualified Vibecoders, generating revenue through platform transaction fees
2. **BO-2: Build a lead funnel through free content** — Use 4,343+ free workflow templates and blog content as lead magnets to convert free users into paying clients
3. **BO-3: Automate the sales qualification process** — Use AI-powered onboarding to qualify clients, scope projects, and generate deliverables before human consultation
4. **BO-4: Create a recurring revenue base** — Establish subscription tiers that gate access to premium features (hiring, chat, project creation)
5. **BO-5: Reduce service delivery cost** — Use N8N automation and AI agents to minimize manual effort in project scoping, developer matching, and client communication

### Success Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Registered users | 500-1,000 | 2,000-5,000 |
| Monthly active users | 200-400 | 1,000-2,000 |
| Workflow downloads | 5,000 | 20,000 |
| Blog posts published | 30 | 100 |
| Projects created (clients) | 20 | 100 |
| Active Vibecoders | 10 | 50 |
| MRR (subscriptions) | $2,000 | $10,000 |
| Marketplace GMV | $10,000 | $50,000 |
| Client onboarding completion rate | 60% | 75% |
| Average project match time | < 48h | < 24h |

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:
- **ID**: Unique identifier (FR-001, FR-002, etc.)
- **Priority**: Must Have / Should Have / Could Have / Won't Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete

---

### Module 1: Authentication & User Management

### FR-001: User Registration & Authentication

**Priority:** Must Have

**Description:**
Users can register and authenticate using Supabase Auth. Support email/password, Google OAuth, and GitHub OAuth. On registration, user selects their primary role: Client, Vibecoder, or Learner.

**Acceptance Criteria:**
- [ ] User can register with email/password
- [ ] User can sign in with Google OAuth
- [ ] User can sign in with GitHub OAuth
- [ ] Role selection (Client/Vibecoder/Learner) is required during registration
- [ ] Email verification is sent and required
- [ ] Password reset flow works via email
- [ ] Session persists across page refreshes
- [ ] User is redirected to appropriate dashboard based on role

**Dependencies:** None

---

### FR-002: User Profiles

**Priority:** Must Have

**Description:**
Each user has a profile with role-specific fields. Clients have company info and project history. Vibecoders have skills, portfolio, and availability. All users have avatar, bio, and contact preferences.

**Acceptance Criteria:**
- [ ] User can edit profile name, avatar (Supabase Storage), and bio
- [ ] Client profile includes: company name, industry, project count
- [ ] Vibecoder profile includes: skills matrix, portfolio links, GitHub, hourly rate, availability (hours/week), timezone
- [ ] Profile is viewable by other authenticated users
- [ ] Profile completeness indicator (percentage)

**Dependencies:** FR-001

---

### FR-003: Role-Based Access Control (RBAC)

**Priority:** Must Have

**Description:**
Supabase RLS enforces role-based access. Admin role has full access. Subscription tier gates specific features. Free users can browse and download workflows. Pro users can access DMs, hiring, and project creation.

**Acceptance Criteria:**
- [ ] RLS policies enforce role-based data access at database level
- [ ] Admin can access admin dashboard and manage all entities
- [ ] Free tier users can browse content, download workflows, view blog
- [ ] Pro tier users can access DMs, create projects, hire Vibecoders
- [ ] Vibecoder tier users can view mission board, bid on projects
- [ ] Subscription tier changes take effect immediately via Stripe webhook sync

**Dependencies:** FR-001, FR-029

---

### Module 2: Blog & Content Management

### FR-004: Blog Content Management (Payload CMS)

**Priority:** Must Have

**Description:**
Payload CMS 3.x provides a full blog system running inside the Next.js application. Admin users can create, edit, publish, and schedule blog posts with rich text, images, embedded videos, and code blocks. Posts are organized by categories and tags.

**Acceptance Criteria:**
- [ ] Admin can create blog posts with rich text editor (Lexical)
- [ ] Posts support images (Supabase Storage), embedded YouTube videos, and code blocks
- [ ] Posts have title, slug, excerpt, featured image, category, tags, author
- [ ] Posts can be saved as draft, scheduled, or published immediately
- [ ] Posts are SEO-optimized with meta title, description, and OpenGraph tags
- [ ] Blog index page with pagination, category filtering, and search
- [ ] Individual post pages with SSG for fast load and SEO

**Dependencies:** None

---

### FR-005: Blog Content Display

**Priority:** Must Have

**Description:**
Public-facing blog with server-rendered pages for SEO. Supports category browsing, tag filtering, search, and related posts. Posts display author info, publish date, estimated read time, and share buttons.

**Acceptance Criteria:**
- [ ] Blog index page loads in < 2 seconds (SSG/ISR)
- [ ] Category and tag filter pages work with clean URLs
- [ ] Search returns results from post titles, excerpts, and body
- [ ] Related posts section shows 3 posts from same category
- [ ] Social share buttons for Twitter/X, LinkedIn, WhatsApp
- [ ] Responsive layout matching Automatrix green/white design system

**Dependencies:** FR-004

---

### Module 3: N8N Workflow Bank

### FR-006: Workflow Catalog with Search & Filters

**Priority:** Must Have

**Description:**
Browse the complete collection of 4,343+ N8N workflow templates. Users can search by name, integration, or tag. Filter by category (188 categories), trigger type, complexity level, and node count. Switch between grid and list views. Sort by name, node count, popularity, or complexity.

**Acceptance Criteria:**
- [ ] All 4,343+ workflows are indexed and searchable
- [ ] Full-text search across workflow name, description, integrations, and tags
- [ ] Filter by: category, trigger type (webhook/schedule/manual/etc), complexity (beginner/intermediate/advanced)
- [ ] Sort by: name, node count, popularity (download count), complexity
- [ ] Grid and list view toggle
- [ ] Pagination with 20 items per page
- [ ] Search and filter state persisted in URL query parameters

**Dependencies:** None

---

### FR-007: Workflow Download

**Priority:** Must Have

**Description:**
Authenticated users can download workflow JSON files for free. Download requires registration (lead magnet). Each download is tracked for analytics and popularity ranking.

**Acceptance Criteria:**
- [ ] Download button on each workflow card
- [ ] Unauthenticated users are prompted to register/login before download
- [ ] Workflow JSON file is downloaded with original filename
- [ ] Download count is tracked per workflow and per user
- [ ] Download event triggers analytics event

**Dependencies:** FR-001, FR-006

---

### FR-008: Workflow Detail Page

**Priority:** Should Have

**Description:**
Individual workflow page showing full metadata: name, description, node list, integrations, trigger type, complexity, tags, download count, and a visual preview of the workflow structure.

**Acceptance Criteria:**
- [ ] Dedicated page at `/workflows/[slug]`
- [ ] Displays full workflow metadata (name, description, nodes, integrations, etc.)
- [ ] Shows list of required integrations/APIs with icons
- [ ] "Download" CTA button prominently displayed
- [ ] "Hire Installation" CTA links to hiring flow (FR-012)
- [ ] Related workflows from same category shown at bottom

**Dependencies:** FR-006

---

### Module 4: Hire Services (Managed Implementation)

### FR-009: Workflow Installation Service Listing

**Priority:** Must Have

**Description:**
Same workflow catalog as FR-006 but with pricing overlay. Each workflow shows base installation price. Users can select multiple workflows for bundle pricing. Clear distinction between free download and paid installation.

**Acceptance Criteria:**
- [ ] Workflow cards show installation price alongside free download option
- [ ] Users can select multiple workflows for a bundle
- [ ] Bundle discount is calculated and displayed (e.g., 10% off 3+, 20% off 5+)
- [ ] "Add to Cart" functionality for selected workflows
- [ ] Cart summary showing selected workflows, individual prices, discounts, and total

**Dependencies:** FR-006

---

### FR-010: Requirements Detection

**Priority:** Must Have

**Description:**
System analyzes selected workflow JSON files to extract required APIs, credentials, and infrastructure. Generates a clear checklist of what the client needs to provide before implementation can begin.

**Acceptance Criteria:**
- [ ] System parses workflow JSON to extract node types and required credentials
- [ ] Maps node types to human-readable API/service names (e.g., "n8n-nodes-base.slack" → "Slack API")
- [ ] Generates requirements checklist: API keys, developer accounts, infrastructure
- [ ] Identifies if N8N, VPS, or specific services are required
- [ ] Requirements are displayed before checkout

**Dependencies:** FR-009

---

### FR-011: Client Onboarding Questionnaire (Hire Flow)

**Priority:** Must Have

**Description:**
After selecting workflows, clients complete an onboarding questionnaire to assess their infrastructure readiness. Questions include: Do you have N8N? Cloud or self-hosted? Do you have a VPS? Which provider? Do you have required developer accounts?

**Acceptance Criteria:**
- [ ] Multi-step questionnaire form with progress indicator
- [ ] Questions: N8N availability (yes/no, cloud/self-hosted), VPS availability (yes/no, provider)
- [ ] Dynamic questions based on detected requirements (FR-010)
- [ ] For each required API: "Do you have a [Service] developer account?" (yes/no)
- [ ] Summary page showing all requirements and readiness status
- [ ] Option to add "+$100 customization call"
- [ ] Questionnaire responses saved to database

**Dependencies:** FR-010

---

### FR-012: Hire Service Checkout

**Priority:** Must Have

**Description:**
Checkout flow for hiring workflow implementation. Displays selected workflows, prices, requirements checklist, and total. Processes payment via Stripe. Creates a project record and notifies relevant Vibecoders.

**Acceptance Criteria:**
- [ ] Checkout page shows: workflow list, prices, discounts, requirements summary, total
- [ ] Stripe Checkout session handles payment processing
- [ ] On successful payment: create project record in database
- [ ] On successful payment: send confirmation email to client
- [ ] On successful payment: notify qualified Vibecoders via N8N workflow
- [ ] Platform fee (%) is captured via Stripe Connect
- [ ] Order history visible in client's dashboard

**Dependencies:** FR-009, FR-011, FR-029

---

### Module 5: Custom App Development (AI Onboarding)

### FR-013: AI Onboarding Chatbot

**Priority:** Must Have

**Description:**
An AI-powered chatbot (backed by N8N + Claude API) guides clients through project scoping for custom application development. The chatbot asks non-technical questions to identify functionalities, required APIs, infrastructure needs, and app complexity level (LV1/LV2/LV3). Conversation is stored for reference.

**Acceptance Criteria:**
- [ ] Chat interface embedded in the "App (Personalized)" section
- [ ] Chatbot asks structured questions: platform (web/iOS/Android), functionality needs, API requirements
- [ ] Questions are non-technical (e.g., "Does your app need to post on Instagram?" not "Do you need Meta Graph API?")
- [ ] Chatbot maps answers to technical requirements (APIs, tools, infrastructure)
- [ ] Determines app level: LV1 (backend agents only), LV2 (limited AI interaction), LV3 (infinite interaction)
- [ ] Conversation is stored in database for reference
- [ ] Anti-abuse: validate inputs, detect trolling, limit conversation length

**Dependencies:** FR-001

---

### FR-014: Automated Deliverable Generation

**Priority:** Must Have

**Description:**
After the onboarding chatbot completes its questionnaire, the system automatically generates: a PRD-style project scope document, a Mermaid architecture diagram, an API requirements list, an infrastructure checklist, and a preliminary cost estimation. These are delivered to the client before any human meeting.

**Acceptance Criteria:**
- [ ] System generates PRD document from chatbot conversation data
- [ ] System generates Mermaid architecture diagram (viewable in-app)
- [ ] System generates API requirements list with documentation links
- [ ] System generates infrastructure checklist (VPS, N8N, databases, etc.)
- [ ] System generates preliminary cost estimation based on app level and feature count
- [ ] All deliverables are stored as downloadable PDFs and viewable in-app
- [ ] Client receives email notification when deliverables are ready

**Dependencies:** FR-013

---

### FR-015: Consultation Meeting Scheduling

**Priority:** Must Have

**Description:**
After reviewing AI-generated deliverables, client can schedule a consultation meeting via integrated Google Calendar. Meeting link is created automatically. Custom apps do NOT checkout directly — a meeting is always required for final pricing.

**Acceptance Criteria:**
- [ ] "Schedule Meeting" button after deliverables are generated
- [ ] Google Calendar integration creates event with video meeting link
- [ ] Client selects available time slot from predefined availability windows
- [ ] Confirmation email sent to both client and admin
- [ ] Meeting context includes link to generated deliverables
- [ ] No direct checkout for custom apps — meeting is mandatory

**Dependencies:** FR-014

---

### Module 6: Developer Mission Board (Marketplace)

### FR-016: Vibecoder Onboarding & Skills Assessment

**Priority:** Must Have

**Description:**
Vibecoders complete a comprehensive onboarding process: video presentation upload, portfolio/GitHub links, resume/CV upload, and a detailed skills assessment. Skills assessment covers API proficiency (1-5 scale for 20+ APIs), tool proficiency, framework knowledge, and availability.

**Acceptance Criteria:**
- [ ] Multi-step onboarding form with progress tracking
- [ ] Video presentation upload (Supabase Storage, max 100MB)
- [ ] Portfolio URLs and GitHub profile link
- [ ] Resume/CV upload (PDF, max 10MB)
- [ ] Skills matrix: API proficiency ratings (1-5) for N8N, Meta, Google, OpenAI, Anthropic, Supabase, etc.
- [ ] Tools proficiency: Claude Code, Gemini CLI, N8N, Docker, etc.
- [ ] Frameworks: CrewAI, Claude SDK, OpenAI Agent SDK, LangChain, etc.
- [ ] Availability: hours/week, timezone, communication preferences
- [ ] Profile marked as "pending review" until admin approves

**Dependencies:** FR-001, FR-002

---

### FR-017: Mission Board (Project Feed)

**Priority:** Must Have

**Description:**
Marketplace-style feed of available projects displayed as cards with filters. Vibecoders browse projects filtered by required skills, budget range, complexity, and timeline. Each card shows project summary, required skills, budget, and client rating.

**Acceptance Criteria:**
- [ ] Project cards displayed in a responsive grid
- [ ] Each card shows: project title, brief description, required skills (tags), budget range, estimated duration, client rating
- [ ] Filter by: required skills/APIs, budget range, complexity level, project type (workflow install/custom app)
- [ ] Sort by: newest, budget (high/low), match percentage
- [ ] "Match percentage" calculated by comparing project requirements to Vibecoder's skills
- [ ] Only approved Vibecoders can view detailed project info

**Dependencies:** FR-016, FR-012 or FR-014

---

### FR-018: Project Bidding & Matching

**Priority:** Must Have

**Description:**
Vibecoders can express interest in or bid on projects. AI-powered matching suggests best-fit Vibecoders based on skills overlap. Admin reviews and approves matches. Client is notified of matched candidates.

**Acceptance Criteria:**
- [ ] "Express Interest" button on project cards
- [ ] Vibecoder can submit: proposed timeline, price (if negotiable), cover message
- [ ] AI matching scores candidates by skills overlap percentage
- [ ] Admin dashboard shows candidates ranked by match score
- [ ] Admin can approve/reject candidate assignments
- [ ] Client receives notification of assigned Vibecoder with profile summary
- [ ] Project status updates: Open → Matching → Assigned → In Progress → Completed

**Dependencies:** FR-016, FR-017

---

### Module 7: Client Project Management

### FR-019: Client Project Dashboard

**Priority:** Must Have

**Description:**
Clients see a dashboard of their projects with status tracking. Each project shows current status, assigned Vibecoder (if any), deliverables, timeline, and communication thread.

**Acceptance Criteria:**
- [ ] Dashboard lists all client projects with status badges
- [ ] Project statuses: Draft, Pending Payment, Matching, In Progress, Review, Completed
- [ ] Each project card shows: title, status, assigned Vibecoder, created date, last update
- [ ] Click project to see full detail view with deliverables, timeline, and messages
- [ ] Client can download all project deliverables (PDFs, architecture docs)

**Dependencies:** FR-001, FR-012 or FR-014

---

### FR-020: Project Status Tracking

**Priority:** Should Have

**Description:**
Milestone-based project tracking. Admin or assigned Vibecoder can update project milestones. Client receives notifications on status changes. Simple status progression (not full project management).

**Acceptance Criteria:**
- [ ] Admin/Vibecoder can update project status
- [ ] Milestone list with checkbox completion
- [ ] Status change triggers email/notification to client
- [ ] Timeline view showing projected vs actual completion dates
- [ ] Client can leave feedback on completed milestones

**Dependencies:** FR-019

---

### Module 8: Communication

### FR-021: Direct Messages (DMs)

**Priority:** Must Have

**Description:**
Real-time messaging between platform members using Supabase Realtime. Pro tier users can send DMs to other members. DMs support text messages, file attachments (images, PDFs), and message status (sent, delivered, read).

**Acceptance Criteria:**
- [ ] Authenticated Pro+ users can initiate DMs with other members
- [ ] Real-time message delivery via Supabase Realtime (WebSocket)
- [ ] Message types: text, image attachment, file attachment (PDF)
- [ ] Message statuses: sent, delivered, read
- [ ] Conversation list sidebar with unread count badges
- [ ] Typing indicator
- [ ] File attachments stored in Supabase Storage (max 10MB per file)
- [ ] Message persistence in database
- [ ] Gated: Free tier users see "Upgrade to Pro" prompt

**Dependencies:** FR-001, FR-003, FR-029

---

### FR-022: AI Agent Chat Interface

**Priority:** Must Have

**Description:**
Chat interface for conversing with pre-configured AI specialist agents. Agents are powered by N8N workflows connected to Claude API (already running on VPS). Available agents: N8N Expert, Claude Assistant, Supabase Specialist, Hostinger Helper, DigitalOcean Pro, and others. Chat history is persisted.

**Acceptance Criteria:**
- [ ] Sidebar lists all available AI agents with icons and descriptions
- [ ] Clicking an agent opens a chat interface
- [ ] Messages are sent to N8N webhook endpoint and response streamed back
- [ ] Chat history is stored per user per agent in database
- [ ] Previous conversations are loadable
- [ ] Agent context/personality persists across messages
- [ ] Supports markdown rendering in responses (code blocks, lists, etc.)
- [ ] Loading/typing indicator while agent processes

**Dependencies:** FR-001

---

### FR-023: Notification System

**Priority:** Should Have

**Description:**
In-app notification center plus email notifications for key events. Events include: new project match, project status update, new DM, payment confirmation, new mission posted. Users can configure notification preferences.

**Acceptance Criteria:**
- [ ] Bell icon in header with unread count badge
- [ ] Dropdown showing recent notifications with timestamps
- [ ] Notification types: project updates, DM received, payment events, new missions
- [ ] Email notifications sent via N8N workflow (Gmail integration)
- [ ] User can toggle email notifications per event type in settings
- [ ] Mark all as read functionality
- [ ] Click notification navigates to relevant page

**Dependencies:** FR-001

---

### Module 9: Payments & Subscriptions

### FR-024: Subscription Tiers (Stripe Billing)

**Priority:** Must Have

**Description:**
Three subscription tiers managed via Stripe Billing. Free (default): browse, download workflows, read blog. Pro ($X/month): DMs, hire services, project creation, AI agent chat. Business ($X/month): everything in Pro plus priority matching, extended AI usage, team accounts.

**Acceptance Criteria:**
- [ ] Pricing page displays tier comparison table
- [ ] Stripe Checkout for subscription purchase
- [ ] Stripe Customer Portal for managing subscription (cancel, upgrade, downgrade)
- [ ] Webhook syncs subscription status to Supabase `user_subscriptions` table
- [ ] Feature gating enforced via Supabase RLS based on subscription tier
- [ ] Free trial period (14 days) for Pro tier
- [ ] Subscription status displayed in user profile/settings

**Dependencies:** FR-001, FR-003

---

### FR-025: Marketplace Payments (Stripe Connect)

**Priority:** Must Have

**Description:**
Stripe Connect Express handles marketplace payments. When a client pays for a service (workflow install or custom app), the platform takes a percentage fee, and the remainder is transferred to the assigned Vibecoder's connected Stripe account.

**Acceptance Criteria:**
- [ ] Vibecoder connects Stripe account via Stripe Connect Express onboarding
- [ ] Client payment is split: platform fee (%) + Vibecoder payout
- [ ] Stripe handles KYC/compliance for Vibecoders
- [ ] Payout dashboard for Vibecoders showing earnings, pending, and paid amounts
- [ ] Platform fee configurable by admin (per service type)
- [ ] Refund handling for disputed projects
- [ ] Payment receipts sent to clients via email

**Dependencies:** FR-001, FR-016

---

### FR-026: Payment History & Invoices

**Priority:** Should Have

**Description:**
Users can view their payment history, download invoices, and see upcoming subscription charges. Vibecoders see their earnings summary.

**Acceptance Criteria:**
- [ ] Client payment history: subscriptions, service purchases, dates, amounts
- [ ] Vibecoder earnings: project payouts, pending amounts, payout schedule
- [ ] Downloadable PDF invoices for each transaction
- [ ] Stripe Customer Portal link for subscription management

**Dependencies:** FR-024, FR-025

---

### Module 10: Integrations

### FR-027: Google Calendar Integration

**Priority:** Must Have

**Description:**
Integration with Google Calendar (already pre-configured) for scheduling consultation meetings. Availability windows are defined by admin. Clients select from available slots. Calendar event created with meeting link and project context.

**Acceptance Criteria:**
- [ ] Admin defines availability windows in settings
- [ ] Client sees available time slots when scheduling
- [ ] Booking creates Google Calendar event with Google Meet link
- [ ] Confirmation email sent via Gmail to both parties
- [ ] Calendar event includes project context (link to deliverables)
- [ ] Cancellation/rescheduling support

**Dependencies:** FR-015

---

### FR-028: Gmail Integration

**Priority:** Must Have

**Description:**
Gmail integration (already pre-configured) for sending transactional emails via N8N workflows. Used for: registration confirmation, password reset, project notifications, payment receipts, meeting confirmations.

**Acceptance Criteria:**
- [ ] All transactional emails sent from branded Gmail account
- [ ] Email templates with Automatrix branding (green/white theme)
- [ ] Email types: welcome, verification, password reset, project updates, payment receipts, meeting confirmations
- [ ] Emails triggered by N8N workflows on relevant events
- [ ] Unsubscribe link in marketing emails (not transactional)

**Dependencies:** None (pre-configured)

---

### Module 11: Admin & Platform Management

### FR-029: Admin Dashboard

**Priority:** Must Have

**Description:**
Admin panel for platform management. View platform analytics (users, revenue, projects), manage users (approve/suspend Vibecoders, manage roles), manage content (blog posts via Payload CMS), configure pricing and platform fees, and moderate projects.

**Acceptance Criteria:**
- [ ] Dashboard with key metrics: total users, active subscriptions, MRR, active projects, GMV
- [ ] User management: list users, filter by role, approve Vibecoder applications, suspend accounts
- [ ] Project management: view all projects, assign Vibecoders, update statuses
- [ ] Revenue overview: subscription revenue, marketplace revenue, payout summary
- [ ] Platform configuration: subscription prices, platform fee %, bundle discounts
- [ ] Content moderation: flag/remove inappropriate content

**Dependencies:** FR-001, FR-003

---

### FR-030: Analytics & Reporting

**Priority:** Could Have

**Description:**
Detailed analytics dashboards for tracking platform performance. Workflow download stats, blog engagement, conversion funnels (free → pro), project lifecycle metrics, and revenue trends.

**Acceptance Criteria:**
- [ ] Workflow analytics: top downloads, category distribution, search trends
- [ ] Blog analytics: page views, read time, popular posts
- [ ] Conversion funnel: registration → free → pro → paying client
- [ ] Project metrics: average completion time, satisfaction ratings
- [ ] Revenue charts: MRR trend, marketplace GMV, payout ratios
- [ ] Exportable reports (CSV)

**Dependencies:** FR-029

---

### Module 12: Additional Services

### FR-031: Mentorship Booking

**Priority:** Could Have

**Description:**
Book AI Engineer mentorship sessions ($300/2h minimum). Calendar integration for scheduling, Stripe payment for session fee, and post-session deliverables (study guide).

**Acceptance Criteria:**
- [ ] Mentorship service page with description and pricing
- [ ] Calendar slot selection for booking
- [ ] Stripe payment for session fee
- [ ] Confirmation with meeting link and preparation instructions
- [ ] Post-session: study guide document delivered

**Dependencies:** FR-024, FR-027

---

### FR-032: Local Agent Setup Service

**Priority:** Could Have

**Description:**
Service for configuring local AI agents on client machines ($1,000+ starting). Includes LLM installation, MCP configurations, Claude Code/Augment/Gemini CLI setup. Checkout and scheduling flow.

**Acceptance Criteria:**
- [ ] Service listing page with pricing tiers
- [ ] Configuration checklist (which tools/agents the client wants)
- [ ] Stripe payment for service fee
- [ ] Scheduling for remote setup session
- [ ] Post-setup documentation delivered

**Dependencies:** FR-024, FR-027

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: Performance - Page Load

**Priority:** Must Have

**Description:**
All public pages (blog, workflow catalog, landing) must achieve good Core Web Vitals scores. Server-rendered pages should load in under 2 seconds. API responses should complete in under 500ms.

**Acceptance Criteria:**
- [ ] LCP (Largest Contentful Paint) < 2.5s for SSG/ISR pages
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] API endpoints respond in < 500ms (p95)
- [ ] Workflow search returns results in < 1 second for full-text queries

**Rationale:** SEO ranking, user experience, and conversion rates depend heavily on page load performance.

---

### NFR-002: Performance - Concurrent Users

**Priority:** Must Have

**Description:**
System must support 500 concurrent users without degradation. Database connection pooling and caching must be configured to handle peak loads.

**Acceptance Criteria:**
- [ ] 500 concurrent users with < 1s response time
- [ ] Database connection pooling configured (Supabase Supavisor)
- [ ] Static assets served via Next.js static optimization
- [ ] Workflow catalog supports pagination (no loading 4000+ records at once)

**Rationale:** Target scale of 500-5,000 users in first 6 months requires handling moderate concurrent load.

---

### NFR-003: Security - Authentication & Authorization

**Priority:** Must Have

**Description:**
All authentication handled by Supabase Auth with JWT tokens. RLS policies enforce data access at the database level. API routes validate authentication before processing. CSRF protection on all forms.

**Acceptance Criteria:**
- [ ] Supabase Auth handles all auth flows (JWT-based)
- [ ] RLS policies on all tables with sensitive data
- [ ] API routes check authentication via middleware
- [ ] CSRF tokens on all form submissions
- [ ] Rate limiting on auth endpoints (5 attempts per minute)
- [ ] Password requirements: minimum 8 characters, mixed case

**Rationale:** Financial transactions and personal data require robust security.

---

### NFR-004: Security - Payment Data

**Priority:** Must Have

**Description:**
No credit card data is stored or processed by the platform. All payment processing is handled by Stripe (PCI DSS compliant). Stripe Checkout and Customer Portal handle all sensitive payment interactions.

**Acceptance Criteria:**
- [ ] Zero credit card data touches platform servers
- [ ] Stripe Checkout handles all payment form rendering
- [ ] Stripe webhooks validated with webhook signing secret
- [ ] Stripe API keys stored in environment variables, never in code
- [ ] HTTPS enforced on all endpoints

**Rationale:** PCI compliance and user trust require payment data to be handled exclusively by Stripe.

---

### NFR-005: Security - Data Protection

**Priority:** Must Have

**Description:**
User data protected with encryption at rest (Supabase/Postgres) and in transit (TLS). File uploads scanned for size limits. Personal data accessible only by the owning user and admins.

**Acceptance Criteria:**
- [ ] All connections use TLS/HTTPS
- [ ] Database encryption at rest (Supabase default)
- [ ] File upload size limits enforced (10MB general, 100MB video)
- [ ] User data accessible only by owner and admin (RLS)
- [ ] API keys and secrets stored as environment variables
- [ ] No sensitive data in logs or error messages

**Rationale:** Trust and legal compliance require proper data protection.

---

### NFR-006: Scalability - Horizontal Growth

**Priority:** Should Have

**Description:**
Architecture supports scaling from 500 to 5,000+ users without re-architecture. Docker containers can be scaled. Database can handle growth with proper indexing.

**Acceptance Criteria:**
- [ ] Docker Compose with service isolation (Next.js, Supabase, N8N, Payload)
- [ ] Database indexes on frequently queried columns
- [ ] Stateless Next.js server (horizontally scalable)
- [ ] File storage in Supabase Storage (not local filesystem)
- [ ] Background jobs via N8N (not blocking web requests)

**Rationale:** Growth from 500 to 5,000 users should not require re-architecture.

---

### NFR-007: Reliability - Uptime

**Priority:** Must Have

**Description:**
Platform targets 99.5% uptime (approximately 1.8 days downtime per year). Health checks on all services. Automated restart on failure via Docker restart policies.

**Acceptance Criteria:**
- [ ] Docker restart policies: `restart: unless-stopped` on all services
- [ ] Health check endpoints for each service
- [ ] Uptime monitoring configured (external)
- [ ] Database backups: daily automated backups with 7-day retention
- [ ] N8N workflow error notifications to admin

**Rationale:** Marketplace platform requires high availability for client trust and revenue.

---

### NFR-008: Usability - Responsive Design

**Priority:** Must Have

**Description:**
All pages fully responsive across desktop (1920px), laptop (1366px), tablet (768px), and mobile (375px). Touch-friendly interactions on mobile. Chat interfaces work on all screen sizes.

**Acceptance Criteria:**
- [ ] All pages render correctly at 375px, 768px, 1366px, and 1920px widths
- [ ] Navigation collapses to hamburger menu on mobile
- [ ] Chat interfaces are usable on mobile screens
- [ ] Form inputs have appropriate mobile input types
- [ ] Touch targets minimum 44x44px on mobile

**Rationale:** Users access the platform from various devices; mobile-first is essential.

---

### NFR-009: Usability - Internationalization

**Priority:** Could Have

**Description:**
Platform initially in Portuguese (Brazil) with English support planned. Content (blog posts, workflow descriptions) supports both languages. UI strings are externalized for translation.

**Acceptance Criteria:**
- [ ] UI strings externalized in locale files (pt-BR, en)
- [ ] Language switcher in header
- [ ] Blog posts can be tagged with language
- [ ] Date/currency formatting respects locale
- [ ] URL structure supports language prefixes if needed

**Rationale:** Brazilian primary market with potential international expansion.

---

### NFR-010: Maintainability - Code Quality

**Priority:** Must Have

**Description:**
Consistent code style enforced by ESLint and Prettier. TypeScript strict mode. Component-based architecture with clear separation of concerns. All environment-specific values in environment variables.

**Acceptance Criteria:**
- [ ] ESLint + Prettier configuration with pre-commit hooks
- [ ] TypeScript strict mode enabled
- [ ] Consistent file/folder naming conventions
- [ ] Environment variables for all configuration (no hardcoded URLs, keys, etc.)
- [ ] README with setup instructions for new developers

**Rationale:** Maintainability enables rapid iteration and onboarding of contributors.

---

### NFR-011: Compatibility - Browser Support

**Priority:** Must Have

**Description:**
Support latest 2 versions of Chrome, Firefox, Safari, and Edge. Progressive enhancement for older browsers.

**Acceptance Criteria:**
- [ ] Tested on Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Core functionality works without JavaScript (SSR fallback)
- [ ] No browser-specific CSS hacks required

**Rationale:** Cross-browser support ensures maximum audience reach.

---

### NFR-012: Infrastructure - Self-Hosted Docker

**Priority:** Must Have

**Description:**
All services run as Docker containers on a single VPS (Hostinger KVM4). Docker Compose orchestrates: Next.js app, Supabase stack (Postgres, GoTrue, Storage, Realtime), N8N, and reverse proxy (Caddy/Nginx).

**Acceptance Criteria:**
- [ ] Single `docker-compose.yml` defines all services
- [ ] Caddy or Nginx reverse proxy with automatic HTTPS (Let's Encrypt)
- [ ] Environment variables managed via `.env` file (not in code)
- [ ] Persistent volumes for: Postgres data, N8N data, Supabase Storage, uploads
- [ ] Deployment can be done via `docker compose up -d`
- [ ] Resource usage within VPS limits (4 vCPU, 8GB RAM typical for KVM4)

**Rationale:** Self-hosted requirement from client; single VPS reduces operational complexity.

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: Foundation & Infrastructure

**Description:**
Set up the core infrastructure: Next.js project, Supabase integration, Docker configuration, Payload CMS, and authentication system. This is the foundation everything else builds on.

**Functional Requirements:**
- FR-001 (User Registration & Authentication)
- FR-002 (User Profiles)
- FR-003 (Role-Based Access Control)

**Non-Functional Requirements:**
- NFR-003 (Security - Auth)
- NFR-005 (Security - Data Protection)
- NFR-010 (Code Quality)
- NFR-012 (Docker Infrastructure)

**Story Count Estimate:** 8-10

**Priority:** Must Have

**Business Value:**
Without auth, profiles, and infrastructure, no other feature can function. This is the critical path.

---

### EPIC-002: Content & Blog

**Description:**
Implement the blog system using Payload CMS running inside Next.js. Admin can create/manage posts. Public-facing blog with SSG for SEO. Categories, tags, search.

**Functional Requirements:**
- FR-004 (Blog Content Management)
- FR-005 (Blog Content Display)

**Non-Functional Requirements:**
- NFR-001 (Performance - Page Load)
- NFR-008 (Responsive Design)

**Story Count Estimate:** 5-7

**Priority:** Must Have

**Business Value:**
Blog drives organic traffic via SEO, establishes thought leadership, and serves as the primary lead magnet alongside the workflow bank.

---

### EPIC-003: Workflow Bank

**Description:**
Migrate and enhance the N8N workflow catalog. Full-text search, filtering, pagination, and download tracking. Serve as both a free resource and an entry point for hiring services.

**Functional Requirements:**
- FR-006 (Workflow Catalog)
- FR-007 (Workflow Download)
- FR-008 (Workflow Detail Page)

**Non-Functional Requirements:**
- NFR-001 (Performance - Page Load)
- NFR-002 (Concurrent Users)

**Story Count Estimate:** 5-7

**Priority:** Must Have

**Business Value:**
4,343+ free workflows is the strongest lead magnet. High-volume free downloads drive registrations, and each workflow is an upsell opportunity for installation services.

---

### EPIC-004: Hire Services & Checkout

**Description:**
Build the managed implementation service: workflow selection with pricing, requirements detection, client questionnaire, and Stripe checkout with marketplace payment splitting.

**Functional Requirements:**
- FR-009 (Service Listing)
- FR-010 (Requirements Detection)
- FR-011 (Client Questionnaire)
- FR-012 (Hire Service Checkout)

**Non-Functional Requirements:**
- NFR-004 (Payment Security)

**Story Count Estimate:** 8-10

**Priority:** Must Have

**Business Value:**
Primary revenue driver. Converts free workflow downloaders into paying clients. Marketplace fees generate recurring platform revenue.

---

### EPIC-005: AI Onboarding & Custom Apps

**Description:**
Build the AI-powered client onboarding system for custom application development. Chatbot qualification, automated deliverable generation (PRD, architecture, cost estimation), and meeting scheduling.

**Functional Requirements:**
- FR-013 (AI Onboarding Chatbot)
- FR-014 (Automated Deliverable Generation)
- FR-015 (Consultation Meeting Scheduling)

**Non-Functional Requirements:**
- NFR-005 (Data Protection)

**Story Count Estimate:** 7-9

**Priority:** Must Have

**Business Value:**
Automates the most time-consuming part of the sales process (project scoping). Reduces pre-sales cost while delivering professional deliverables that build client confidence. High-value projects (LV1-LV3 apps) are the highest revenue per client.

---

### EPIC-006: Developer Marketplace

**Description:**
Build the Vibecoder onboarding, mission board, and project matching system. Includes skills assessment, project feed, bidding, AI-powered matching, and admin approval workflows.

**Functional Requirements:**
- FR-016 (Vibecoder Onboarding)
- FR-017 (Mission Board)
- FR-018 (Project Bidding & Matching)

**Non-Functional Requirements:**
- NFR-006 (Scalability)

**Story Count Estimate:** 8-10

**Priority:** Must Have

**Business Value:**
Supply side of the marketplace. Without qualified Vibecoders, services cannot be delivered. The matching system reduces admin overhead and improves project success rates.

---

### EPIC-007: Client Project Management

**Description:**
Build the client-facing project dashboard and status tracking. Clients see their projects, statuses, assigned developers, deliverables, and communication threads.

**Functional Requirements:**
- FR-019 (Client Project Dashboard)
- FR-020 (Project Status Tracking)

**Non-Functional Requirements:**
- NFR-008 (Responsive Design)

**Story Count Estimate:** 4-6

**Priority:** Must Have

**Business Value:**
Client transparency builds trust and reduces support requests. Status tracking keeps projects moving and holds Vibecoders accountable.

---

### EPIC-008: Communication

**Description:**
Implement real-time DMs using Supabase Realtime, AI agent chat interface (connected to existing N8N backends), and a notification system for platform events.

**Functional Requirements:**
- FR-021 (Direct Messages)
- FR-022 (AI Agent Chat)
- FR-023 (Notification System)

**Non-Functional Requirements:**
- NFR-002 (Concurrent Users)
- NFR-008 (Responsive Design)

**Story Count Estimate:** 8-10

**Priority:** Must Have

**Business Value:**
Communication is essential for marketplace trust. DMs enable client-Vibecoder coordination. AI agents provide immediate value to all users and reduce support burden.

---

### EPIC-009: Payments & Subscriptions

**Description:**
Implement Stripe Billing for subscriptions and Stripe Connect for marketplace payments. Webhook sync to Supabase, payment history, invoices, and Vibecoder payout tracking.

**Functional Requirements:**
- FR-024 (Subscription Tiers)
- FR-025 (Marketplace Payments)
- FR-026 (Payment History)

**Non-Functional Requirements:**
- NFR-004 (Payment Security)

**Story Count Estimate:** 7-9

**Priority:** Must Have

**Business Value:**
Direct revenue generation. Subscriptions provide predictable MRR. Marketplace payments enable the core business model of connecting clients with Vibecoders.

---

### EPIC-010: Integrations & Notifications

**Description:**
Connect Google Calendar and Gmail integrations (already pre-configured). Build email notification templates and transactional email flows via N8N.

**Functional Requirements:**
- FR-027 (Google Calendar)
- FR-028 (Gmail)

**Non-Functional Requirements:**
- NFR-007 (Reliability)

**Story Count Estimate:** 4-5

**Priority:** Must Have

**Business Value:**
Meeting scheduling is required for the custom app sales flow. Email notifications drive engagement and keep users informed. Both integrations are already pre-configured, reducing implementation effort.

---

### EPIC-011: Admin & Analytics

**Description:**
Build the admin dashboard for platform management, user moderation, project oversight, revenue tracking, and content management.

**Functional Requirements:**
- FR-029 (Admin Dashboard)
- FR-030 (Analytics & Reporting)

**Non-Functional Requirements:**
- NFR-010 (Code Quality)

**Story Count Estimate:** 5-7

**Priority:** Must Have (FR-029) / Could Have (FR-030)

**Business Value:**
Admin dashboard is essential for day-to-day operations. Analytics enable data-driven decisions about pricing, marketing, and feature prioritization.

---

### EPIC-012: Additional Services

**Description:**
Add mentorship booking and local agent setup service pages with checkout flows.

**Functional Requirements:**
- FR-031 (Mentorship Booking)
- FR-032 (Local Agent Setup Service)

**Non-Functional Requirements:**
- None specific

**Story Count Estimate:** 3-4

**Priority:** Could Have

**Business Value:**
Additional revenue streams. Lower priority than core marketplace features but high margin per transaction.

---

## User Stories (High-Level)

User stories follow the format: "As a [user type], I want [goal] so that [benefit]."

These are preliminary stories. Detailed stories will be created in Phase 4 (Implementation).

---

### EPIC-001: Foundation
- As a visitor, I want to register with my email or Google account so that I can access the platform.
- As a user, I want to complete my profile with role-specific information so that the platform personalizes my experience.
- As an admin, I want to manage user roles and permissions so that I can control platform access.

### EPIC-002: Content & Blog
- As an admin, I want to publish blog posts with rich content so that I can attract organic traffic.
- As a visitor, I want to browse and search blog posts so that I can learn about AI automation.

### EPIC-003: Workflow Bank
- As a learner, I want to search and filter 4,343+ workflows so that I can find automations relevant to me.
- As a registered user, I want to download workflow JSON files so that I can import them into my N8N instance.

### EPIC-004: Hire Services
- As a client, I want to select workflows and see what I need to provide so that I can prepare for implementation.
- As a client, I want to pay for workflow installation and receive a qualified developer so that my automation is set up correctly.

### EPIC-005: AI Onboarding
- As a client, I want to describe my app idea in simple terms so that the platform generates a technical scope and cost estimate.
- As a client, I want to schedule a meeting after reviewing my auto-generated project plan so that I can finalize the project details.

### EPIC-006: Developer Marketplace
- As a Vibecoder, I want to complete my skills profile so that I can be matched with relevant projects.
- As a Vibecoder, I want to browse a feed of available projects and express interest so that I can find work.

### EPIC-007: Client Project Management
- As a client, I want to see the status of all my projects in one place so that I can track progress.

### EPIC-008: Communication
- As a Pro user, I want to send direct messages to other members so that I can coordinate on projects.
- As a user, I want to chat with AI specialist agents so that I can get help with technical questions.

### EPIC-009: Payments
- As a user, I want to subscribe to a Pro plan so that I can access premium features.
- As a Vibecoder, I want to see my earnings and payout history so that I can track my income.

### EPIC-010: Integrations
- As a client, I want to schedule consultation meetings via integrated calendar so that I can book time conveniently.

### EPIC-011: Admin
- As an admin, I want to see platform metrics (users, revenue, projects) so that I can make data-driven decisions.

### EPIC-012: Additional Services
- As a client, I want to book a mentorship session so that I can get personalized guidance on my project.

---

## User Personas

### Persona 1: Carlos - The Startup Founder (Client)
**Age:** 32 | **Location:** São Paulo, Brazil | **Tech Level:** Low-Medium
**Goal:** Automate his small business operations without hiring a full dev team.
**Pain:** Knows automation is valuable but doesn't know where to start. Overwhelmed by technical options.
**Behavior:** Starts with free workflow downloads, explores the blog, eventually wants a custom automation solution. Appreciates the AI onboarding that speaks his language (non-technical).
**Subscription:** Free → Pro → Client tier

### Persona 2: Marina - The AI Engineer (Vibecoder)
**Age:** 28 | **Location:** Remote (Florianópolis, Brazil) | **Tech Level:** Expert
**Goal:** Find freelance projects building N8N workflows and AI integrations.
**Pain:** Hard to find clients who understand what she does. Spends too much time on sales/scoping.
**Behavior:** Completes comprehensive skills assessment, browses mission board daily, bids on matching projects. Appreciates that clients come pre-qualified with clear project scopes.
**Subscription:** Vibecoder tier

### Persona 3: Pedro - The Automation Learner
**Age:** 25 | **Location:** Belo Horizonte, Brazil | **Tech Level:** Beginner
**Goal:** Learn N8N and AI automation to transition careers.
**Behavior:** Downloads free workflow templates, reads blog tutorials, eventually aspires to become a Vibecoder. Uses AI agents to ask questions. Never pays initially but is a future Vibecoder recruit.
**Subscription:** Free

### Persona 4: Luciana - The Agency Owner (Client)
**Age:** 40 | **Location:** Rio de Janeiro, Brazil | **Tech Level:** Medium
**Goal:** Hire pre-made workflow implementations for her marketing agency clients.
**Pain:** Needs reliable automations quickly. Doesn't want to build from scratch every time.
**Behavior:** Browses workflow catalog, selects bundles of related workflows (social media pack), goes through hire flow, pays for implementation. Repeat customer.
**Subscription:** Pro → Business

---

## User Flows

### Flow 1: Free User → Workflow Download → Registration

```
Landing Page → Browse Workflows → Click Download
→ Registration Prompt → Sign Up (Email/Google)
→ Email Verification → Download Workflow
→ Explore Blog/AI Agents → Consider Pro Upgrade
```

### Flow 2: Client → Hire Workflow Implementation

```
Browse Workflows → Select Workflow(s) → View Requirements
→ Complete Questionnaire (N8N? VPS? APIs?)
→ Review Requirements Summary → Proceed to Checkout
→ Stripe Payment → Project Created
→ Vibecoder Matched → Implementation → Delivery
```

### Flow 3: Client → Custom App (AI Onboarding)

```
Click "App (Personalized)" → Start AI Chatbot
→ Answer Questions (non-technical) → AI Scopes Project
→ System Generates: PRD + Architecture + Cost Estimate
→ Review Deliverables → Schedule Meeting
→ Consultation → Final Pricing → Project Starts
```

### Flow 4: Vibecoder → Find & Bid on Project

```
Register → Complete Onboarding (skills, portfolio, video)
→ Admin Approval → Access Mission Board
→ Browse Projects (filtered by skills match)
→ Express Interest → Submit Bid
→ Admin Reviews → Assignment → Deliver Project
```

---

## Dependencies

### Internal Dependencies

| Dependency | Description | Blocker For |
|------------|-------------|-------------|
| Next.js project setup | Foundation for all frontend/backend | Everything |
| Supabase configuration | Database, auth, storage, realtime | Everything except static pages |
| Docker Compose | Orchestration for all services | Deployment |
| Payload CMS setup | Blog content management | FR-004, FR-005 |
| N8N webhook endpoints | AI agent backends, automations | FR-013, FR-022, FR-028 |
| Stripe account configuration | Payment processing | FR-024, FR-025 |

### External Dependencies

| Dependency | Description | Risk Level |
|------------|-------------|------------|
| Stripe API | Payment processing, subscriptions, connect | Low (stable, well-documented) |
| Google Calendar API | Meeting scheduling | Low (already configured) |
| Gmail API | Transactional emails | Low (already configured) |
| Claude API (via N8N) | AI agent responses | Medium (usage costs, rate limits) |
| GitHub (Zie619/n8n-workflows) | Workflow source repository | Low (MIT licensed, already cloned) |
| Supabase self-hosted | Database, auth, storage | Medium (self-hosted management) |
| VPS Provider (Hostinger) | Infrastructure hosting | Low (standard VPS) |

---

## Assumptions

1. **Infrastructure:** The VPS (Hostinger KVM4 or equivalent) has sufficient resources (4 vCPU, 8GB RAM) to run all Docker containers simultaneously.
2. **N8N agents:** The existing N8N AI agent workflows on VPS can be called via webhook endpoints from the Next.js frontend.
3. **Stripe Connect:** Express account onboarding is sufficient for Vibecoder payouts (no need for Custom accounts).
4. **Content volume:** Initial blog content (30 posts in 6 months) will be created by the platform owner, not user-generated.
5. **Vibecoder supply:** At least 10 qualified Vibecoders can be onboarded in the first 6 months to handle project demand.
6. **Single VPS:** All services can run on a single VPS for the initial 6-month growth phase before needing horizontal scaling.
7. **Workflow data:** The 4,343+ workflow JSON files are stable and don't require frequent updates from the source repository.
8. **Payment currency:** Primary currency is BRL (Brazilian Real) with USD support for international clients.
9. **Legal:** Platform terms of service and privacy policy will be created separately (legal review).
10. **Mobile app:** Native mobile apps (iOS/Android) are NOT in scope; responsive web is sufficient for MVP.

---

## Out of Scope

The following are explicitly **not** included in this version:

1. **Native mobile apps** (iOS/Android) — responsive web only
2. **Chat rooms / group messaging** — MVP includes DMs only; rooms planned for v3
3. **User-generated blog content** — only admin-created content
4. **Workflow marketplace (paid workflows)** — all workflows are free; revenue comes from implementation services
5. **Video hosting** — embedded YouTube/Vimeo only, no native video hosting
6. **Multi-tenancy / white-label** — single platform instance only
7. **Automated code generation** — AI generates documentation/scope, not code
8. **Cryptocurrency payments** — Stripe (fiat) only
9. **Real-time video/audio calls** — Google Meet via Calendar integration only
10. **Automated testing suite** — manual testing for MVP; automated tests in future sprints
11. **CDN / edge caching** — direct VPS serving for MVP
12. **Advanced fraud detection** — basic anti-abuse in questionnaires; advanced fraud detection not in scope

---

## Open Questions

| # | Question | Impact | Status |
|---|----------|--------|--------|
| 1 | What is the exact platform fee percentage for Stripe Connect transactions? | FR-025 pricing | Pending - admin configurable |
| 2 | What are the specific subscription tier prices (Pro, Business)? | FR-024 pricing page | Pending - market research |
| 3 | Should blog posts be in Portuguese only or bilingual (PT + EN) from launch? | FR-004, NFR-009 | Leaning PT-BR first |
| 4 | What is the maximum file size for Vibecoder video presentations? | FR-016 storage costs | Suggested: 100MB |
| 5 | Should the AI onboarding chatbot have a conversation turn limit (anti-abuse)? | FR-013 LLM costs | Suggested: 30 turns max |
| 6 | How are workflow installation base prices determined per workflow? | FR-009 pricing | Pending - by complexity level |
| 7 | What is the bundle discount structure? | FR-009 pricing | Suggested: 10% for 3+, 20% for 5+ |
| 8 | Is there a vetting process for Vibecoders beyond skills self-assessment? | FR-016 quality | Suggested: portfolio review + test project |

---

## Approval & Sign-off

### Stakeholders

| Role | Name | Responsibility |
|------|------|---------------|
| Product Owner | Lucas F. N. Alves | Final approval on all requirements |
| Lead Developer | TBD | Technical feasibility review |
| Designer | TBD | UX/UI review |

### Approval Status

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Design Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-06 | lucasautomatrix | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:
- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions
- Data models and APIs
- System components

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) |
|---------|-----------|-------------------------|-------------------|
| EPIC-001 | Foundation & Infrastructure | FR-001, FR-002, FR-003 | 8-10 |
| EPIC-002 | Content & Blog | FR-004, FR-005 | 5-7 |
| EPIC-003 | Workflow Bank | FR-006, FR-007, FR-008 | 5-7 |
| EPIC-004 | Hire Services & Checkout | FR-009, FR-010, FR-011, FR-012 | 8-10 |
| EPIC-005 | AI Onboarding & Custom Apps | FR-013, FR-014, FR-015 | 7-9 |
| EPIC-006 | Developer Marketplace | FR-016, FR-017, FR-018 | 8-10 |
| EPIC-007 | Client Project Management | FR-019, FR-020 | 4-6 |
| EPIC-008 | Communication | FR-021, FR-022, FR-023 | 8-10 |
| EPIC-009 | Payments & Subscriptions | FR-024, FR-025, FR-026 | 7-9 |
| EPIC-010 | Integrations & Notifications | FR-027, FR-028 | 4-5 |
| EPIC-011 | Admin & Analytics | FR-029, FR-030 | 5-7 |
| EPIC-012 | Additional Services | FR-031, FR-032 | 3-4 |
| **TOTAL** | | **32 FRs** | **72-94 stories** |

---

## Appendix B: Prioritization Details

### Functional Requirements by Priority

| Priority | Count | Percentage | FRs |
|----------|-------|------------|-----|
| **Must Have** | 25 | 78% | FR-001 to FR-022, FR-024, FR-025, FR-027, FR-028, FR-029 |
| **Should Have** | 4 | 13% | FR-008, FR-020, FR-023, FR-026 |
| **Could Have** | 3 | 9% | FR-030, FR-031, FR-032 |

### Non-Functional Requirements by Priority

| Priority | Count | Percentage | NFRs |
|----------|-------|------------|------|
| **Must Have** | 10 | 83% | NFR-001 to NFR-005, NFR-007, NFR-008, NFR-010, NFR-011, NFR-012 |
| **Should Have** | 1 | 8% | NFR-006 |
| **Could Have** | 1 | 8% | NFR-009 |

### Implementation Phase Recommendation

| Phase | Epics | Duration (Est.) | Focus |
|-------|-------|-----------------|-------|
| **Phase 1: Foundation** | EPIC-001, EPIC-009 (partial) | 3-4 weeks | Auth, profiles, Supabase, Stripe setup, Docker |
| **Phase 2: Content & Catalog** | EPIC-002, EPIC-003 | 2-3 weeks | Blog (Payload CMS), workflow catalog migration |
| **Phase 3: Core Marketplace** | EPIC-004, EPIC-006, EPIC-007 | 4-5 weeks | Hire flow, Vibecoder onboarding, project management |
| **Phase 4: AI & Communication** | EPIC-005, EPIC-008 | 3-4 weeks | AI onboarding, DMs, agent chat, notifications |
| **Phase 5: Payments & Polish** | EPIC-009 (complete), EPIC-010, EPIC-011 | 2-3 weeks | Full payments, integrations, admin dashboard |
| **Phase 6: Extras** | EPIC-012 | 1-2 weeks | Mentorship, local setup services |
| **TOTAL** | 12 Epics | **15-21 weeks** | Full platform |
