# Sprint Plan: Automatrix Platform v2

**Date:** 2026-02-06
**Scrum Master:** lucasautomatrix
**Total Epics:** 12 | **Estimated Stories:** 72-94 | **Sprint Duration:** 1 week

---

## Sprint 1: Foundation & Infrastructure (Week 1)
**Goal:** Next.js project running with basic layout and navigation

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Initialize Next.js 14+ with App Router, TypeScript, Tailwind | EPIC-001 | Must | 3 |
| Configure shadcn/ui component library | EPIC-001 | Must | 2 |
| Create root layout, header, footer, mobile nav | EPIC-001 | Must | 3 |
| Set up project directory structure per architecture | EPIC-001 | Must | 2 |
| Create landing page (hero, features, CTA) | EPIC-002 | Must | 5 |
| Create .env.example with all config variables | EPIC-001 | Must | 1 |
| Set up Docker Compose (Next.js + Supabase + Caddy) | EPIC-012 | Must | 5 |
| Create Dockerfile for Next.js app | EPIC-012 | Must | 3 |

**Sprint Total:** ~24 points

---

## Sprint 2: Authentication & User Management (Week 2)
**Goal:** Users can register, login, and manage profiles

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Configure Supabase client (browser + server) | EPIC-001 | Must | 3 |
| Create login page (email + OAuth) | EPIC-001 | Must | 3 |
| Create register page with role selection | EPIC-001 | Must | 5 |
| Implement auth middleware for protected routes | EPIC-001 | Must | 3 |
| Create user profile page (view/edit) | EPIC-001 | Must | 5 |
| Set up Supabase database schema (profiles, roles) | EPIC-001 | Must | 3 |
| Create RLS policies for user data | EPIC-001 | Must | 3 |
| Create auth context/hooks | EPIC-001 | Must | 2 |

**Sprint Total:** ~27 points

---

## Sprint 3: Workflow Catalog & Content (Week 3)
**Goal:** 4,343+ workflows browsable with search/filter, blog functional

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Create workflow browse page with grid/list view | EPIC-003 | Must | 5 |
| Implement workflow search with PostgreSQL FTS | EPIC-003 | Must | 5 |
| Create workflow detail page | EPIC-003 | Must | 3 |
| Implement workflow download functionality | EPIC-003 | Must | 3 |
| Create workflow category filters | EPIC-003 | Must | 3 |
| Migrate workflow data from SQLite to PostgreSQL | EPIC-003 | Must | 5 |
| Configure Payload CMS 3.x inside Next.js | EPIC-002 | Must | 5 |
| Create blog collection and listing page | EPIC-002 | Must | 5 |
| Create blog post detail page | EPIC-002 | Must | 3 |

**Sprint Total:** ~37 points

---

## Sprint 4: Dashboard & Project Management (Week 4)
**Goal:** Role-based dashboards, project creation, mission board

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Create dashboard layout with sidebar nav | EPIC-005 | Must | 5 |
| Create Client dashboard view | EPIC-005 | Must | 5 |
| Create Vibecoder dashboard view | EPIC-005 | Must | 5 |
| Create project creation form | EPIC-006 | Must | 5 |
| Create mission board (project feed for vibecoders) | EPIC-006 | Must | 8 |
| Create project detail page | EPIC-006 | Must | 5 |
| Create bidding system UI | EPIC-006 | Must | 5 |
| Database schema for projects, bids, milestones | EPIC-006 | Must | 5 |

**Sprint Total:** ~43 points

---

## Sprint 5: Payments & Subscriptions (Week 5)
**Goal:** Stripe Connect marketplace payments, subscription tiers

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Create pricing page with subscription tiers | EPIC-008 | Must | 5 |
| Integrate Stripe Billing for subscriptions | EPIC-008 | Must | 8 |
| Set up Stripe Connect Express for vibecoders | EPIC-007 | Must | 8 |
| Create Stripe webhook handlers | EPIC-007 | Must | 5 |
| Create payment flow for project milestones | EPIC-007 | Must | 5 |
| Subscription tier gating (middleware) | EPIC-008 | Must | 3 |

**Sprint Total:** ~34 points

---

## Sprint 6: Chat & Communication (Week 6)
**Goal:** Real-time DMs, AI agent chat interface

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Set up Supabase Realtime for messaging | EPIC-009 | Must | 5 |
| Create conversation list UI | EPIC-009 | Must | 5 |
| Create message thread UI | EPIC-009 | Must | 5 |
| Implement online/typing indicators | EPIC-009 | Should | 3 |
| Create AI agent chat interface | EPIC-010 | Must | 5 |
| Integrate N8N webhook for AI agents | EPIC-010 | Must | 5 |
| Create notification system | EPIC-009 | Must | 5 |

**Sprint Total:** ~33 points

---

## Sprint 7: AI Onboarding & Admin (Week 7)
**Goal:** AI-powered client onboarding, admin dashboard

| Story | Epic | Priority | Points |
|-------|------|----------|--------|
| Create onboarding questionnaire flow | EPIC-004 | Must | 8 |
| Integrate N8N AI agent for scope generation | EPIC-004 | Must | 8 |
| Create generated project scope view | EPIC-004 | Must | 5 |
| Create admin dashboard with stats | EPIC-011 | Must | 5 |
| Create admin user management | EPIC-011 | Must | 5 |
| Create admin content moderation | EPIC-011 | Should | 3 |
| Create admin analytics page | EPIC-011 | Should | 5 |

**Sprint Total:** ~39 points

---

## Implementation Priority (MVP First)

**Phase 1 - MVP (Sprints 1-3):** Foundation + Auth + Workflows + Blog
**Phase 2 - Marketplace (Sprints 4-5):** Dashboard + Projects + Payments
**Phase 3 - Communication (Sprint 6):** Chat + AI Agents
**Phase 4 - Polish (Sprint 7):** Onboarding + Admin + Testing

---

**This document was created using BMAD Method v6 - Phase 4 (Sprint Planning)**
