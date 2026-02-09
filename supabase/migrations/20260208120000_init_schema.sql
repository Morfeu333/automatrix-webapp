-- ============================================================
-- AUTOMATRIX PLATFORM v2 - Initial Schema
-- Migration: 20260208120000_init_schema.sql
-- Description: All tables, enums, indexes
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'vibecoder', 'learner', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE vibecoder_approval AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE connect_status AS ENUM ('pending', 'active', 'disabled');
CREATE TYPE project_status AS ENUM ('draft', 'open', 'pending_payment', 'matching', 'assigned', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE project_type AS ENUM ('workflow_install', 'custom_app');
CREATE TYPE app_level AS ENUM ('lv1', 'lv2', 'lv3');
CREATE TYPE workflow_complexity AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE payment_type AS ENUM ('subscription', 'service', 'mentorship');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE onboarding_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE blog_status AS ENUM ('draft', 'scheduled', 'published');

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'learner',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  bio TEXT,
  company TEXT,
  website TEXT,
  industry TEXT,
  skills TEXT[] DEFAULT '{}',
  profile_complete_pct INTEGER DEFAULT 0 CHECK (profile_complete_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================
-- 2. USER SUBSCRIPTIONS
-- ============================================================

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON user_subscriptions(tier);

-- ============================================================
-- 3. VIBECODERS
-- ============================================================

CREATE TABLE vibecoders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_url TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  resume_url TEXT,
  video_url TEXT,
  skills JSONB DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  hours_per_week INTEGER,
  timezone TEXT,
  communication_prefs TEXT[] DEFAULT '{}',
  stripe_connect_id TEXT,
  connect_status connect_status NOT NULL DEFAULT 'pending',
  approval_status vibecoder_approval NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_vibecoders_approval ON vibecoders(approval_status);
CREATE INDEX idx_vibecoders_skills ON vibecoders USING GIN(skills);
CREATE INDEX idx_vibecoders_user ON vibecoders(user_id);

-- ============================================================
-- 4. WORKFLOWS
-- ============================================================

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  trigger_type TEXT,
  complexity workflow_complexity NOT NULL DEFAULT 'beginner',
  node_count INTEGER DEFAULT 0,
  integrations TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  required_apis JSONB DEFAULT '[]',
  install_price DECIMAL(10,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflows_search ON workflows USING GIN(search_vector);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_complexity ON workflows(complexity);
CREATE INDEX idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX idx_workflows_active ON workflows(active) WHERE active = TRUE;

-- ============================================================
-- 5. WORKFLOW DOWNLOADS
-- ============================================================

CREATE TABLE workflow_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_workflow ON workflow_downloads(workflow_id);
CREATE INDEX idx_downloads_user ON workflow_downloads(user_id);
CREATE INDEX idx_downloads_composite ON workflow_downloads(workflow_id, user_id, downloaded_at);

-- ============================================================
-- 6. PROJECTS
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type project_type,
  app_level app_level,
  status project_status NOT NULL DEFAULT 'draft',
  category TEXT,
  required_skills TEXT[] DEFAULT '{}',
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  deadline TIMESTAMPTZ,
  estimated_duration TEXT,
  assigned_vibecoder_id UUID REFERENCES vibecoders(id),
  stripe_payment_intent_id TEXT,
  deliverables JSONB DEFAULT '[]',
  questionnaire_responses JSONB,
  bid_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_skills ON projects USING GIN(required_skills);
CREATE INDEX idx_projects_category ON projects(category);

-- ============================================================
-- 7. MILESTONES
-- ============================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);

-- ============================================================
-- 8. BIDS
-- ============================================================

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vibecoder_id UUID NOT NULL REFERENCES vibecoders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  proposal TEXT,
  estimated_days INTEGER,
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  status bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, vibecoder_id)
);

CREATE INDEX idx_bids_project ON bids(project_id);
CREATE INDEX idx_bids_vibecoder ON bids(vibecoder_id);
CREATE INDEX idx_bids_status ON bids(status);

-- ============================================================
-- 9. CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. CONVERSATION PARTICIPANTS
-- ============================================================

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_participants_user ON conversation_participants(user_id);

-- ============================================================
-- 11. MESSAGES
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type message_type NOT NULL DEFAULT 'text',
  attachment_url TEXT,
  status message_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================
-- 12. AGENT CHAT SESSIONS
-- ============================================================

CREATE TABLE agent_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_chats_user_agent ON agent_chat_sessions(user_id, agent_id);

-- ============================================================
-- 13. ONBOARDING SESSIONS
-- ============================================================

CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation JSONB NOT NULL DEFAULT '[]',
  extracted_requirements JSONB,
  app_level app_level,
  deliverables JSONB DEFAULT '[]',
  status onboarding_status NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_user ON onboarding_sessions(user_id);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ============================================================
-- 15. PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  payment_type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- 16. VIBECODER PAYOUTS
-- ============================================================

CREATE TABLE vibecoder_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vibecoder_id UUID NOT NULL REFERENCES vibecoders(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_vibecoder ON vibecoder_payouts(vibecoder_id);
CREATE INDEX idx_payouts_status ON vibecoder_payouts(status);

-- ============================================================
-- 17. BLOG POSTS (temporary - will be managed by Payload CMS)
-- ============================================================

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT NOT NULL DEFAULT 'Automatrix Team',
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status blog_status NOT NULL DEFAULT 'draft',
  read_time TEXT,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_category ON blog_posts(category);
