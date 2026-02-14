-- Add project_scope JSONB column to onboarding_sessions
-- Stores progressively-filled tech stack / project scope data from AI chatbot

ALTER TABLE onboarding_sessions
  ADD COLUMN project_scope JSONB DEFAULT '{}';

COMMENT ON COLUMN onboarding_sessions.project_scope IS
  'Structured project scope data populated progressively during client onboarding chat';
