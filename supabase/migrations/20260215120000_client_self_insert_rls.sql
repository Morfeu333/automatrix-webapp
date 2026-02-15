-- Allow clients to INSERT their own agency_clients row (profile_id = auth.uid())
-- This is needed for /api/onboarding/complete-client which runs as the authenticated client user
CREATE POLICY "client_self_insert" ON agency_clients
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Allow clients to UPDATE their own agency_clients row (e.g. project_scope updates)
CREATE POLICY "client_self_update" ON agency_clients
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
