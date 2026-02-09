-- ============================================================
-- AUTOMATRIX PLATFORM v2 - RLS Policies
-- Migration: 20260208120001_rls_policies.sql
-- Description: Row Level Security for all tables
-- ============================================================

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check subscription tier
CREATE OR REPLACE FUNCTION get_user_tier()
RETURNS subscription_tier AS $$
  SELECT COALESCE(
    (SELECT tier FROM user_subscriptions WHERE user_id = auth.uid() AND status = 'active'),
    'free'::subscription_tier
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is conversation participant
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Profile is created on signup via trigger"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- USER SUBSCRIPTIONS
-- ============================================================
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Service role manages subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VIBECODERS
-- ============================================================
ALTER TABLE vibecoders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vibecoders are publicly viewable"
  ON vibecoders FOR SELECT
  TO authenticated
  USING (approval_status = 'approved' OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create own vibecoder profile"
  ON vibecoders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vibecoder profile"
  ON vibecoders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any vibecoder"
  ON vibecoders FOR UPDATE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- WORKFLOWS
-- ============================================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflows are viewable by everyone"
  ON workflows FOR SELECT
  TO authenticated
  USING (active = true OR is_admin());

CREATE POLICY "Admins manage workflows"
  ON workflows FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow anon users to browse workflows (public catalog)
CREATE POLICY "Public can browse active workflows"
  ON workflows FOR SELECT
  TO anon
  USING (active = true);

-- ============================================================
-- WORKFLOW DOWNLOADS
-- ============================================================
ALTER TABLE workflow_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own downloads"
  ON workflow_downloads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can download"
  ON workflow_downloads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- PROJECTS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR assigned_vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid())
    OR (status = 'open' AND EXISTS (SELECT 1 FROM vibecoders WHERE user_id = auth.uid() AND approval_status = 'approved'))
    OR is_admin()
  );

CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR is_admin());

-- Allow anon to see open projects (public mission board)
CREATE POLICY "Public can see open projects"
  ON projects FOR SELECT
  TO anon
  USING (status = 'open');

-- ============================================================
-- MILESTONES
-- ============================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND (
        projects.client_id = auth.uid()
        OR projects.assigned_vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid())
        OR is_admin()
      )
    )
  );

CREATE POLICY "Project participants can manage milestones"
  ON milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND (projects.client_id = auth.uid() OR is_admin())
    )
  );

-- ============================================================
-- BIDS
-- ============================================================
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibecoders see own bids, clients see bids on own projects"
  ON bids FOR SELECT
  TO authenticated
  USING (
    vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid())
    OR project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Approved vibecoders can submit bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid() AND approval_status = 'approved')
  );

CREATE POLICY "Vibecoders can update own bids"
  ON bids FOR UPDATE
  TO authenticated
  USING (vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid()))
  WITH CHECK (vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid()));

-- ============================================================
-- CONVERSATIONS
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (is_conversation_participant(id) OR is_admin());

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (is_conversation_participant(id));

-- ============================================================
-- CONVERSATION PARTICIPANTS
-- ============================================================
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (is_conversation_participant(conversation_id) OR is_admin());

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (is_conversation_participant(conversation_id) OR is_admin());

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND is_conversation_participant(conversation_id)
  );

CREATE POLICY "Senders can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- ============================================================
-- AGENT CHAT SESSIONS
-- ============================================================
ALTER TABLE agent_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own agent chats"
  ON agent_chat_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create agent chats"
  ON agent_chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own agent chats"
  ON agent_chat_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- ONBOARDING SESSIONS
-- ============================================================
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own onboarding sessions"
  ON onboarding_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create onboarding sessions"
  ON onboarding_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding sessions"
  ON onboarding_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role creates notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also allow authenticated for in-app notification creation
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- PAYMENTS
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Service role manages payments"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VIBECODER PAYOUTS
-- ============================================================
ALTER TABLE vibecoder_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibecoders see own payouts"
  ON vibecoder_payouts FOR SELECT
  TO authenticated
  USING (
    vibecoder_id IN (SELECT id FROM vibecoders WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Service role manages payouts"
  ON vibecoder_payouts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- BLOG POSTS
-- ============================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are public"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Authenticated see published posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (status = 'published' AND published_at <= NOW() OR is_admin());

CREATE POLICY "Admins manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
