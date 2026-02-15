-- ============================================================
-- Agency OS Schema Migration
-- Sprint 1: Enums, Tables, Junction Tables, Indexes, Triggers, Views, RLS
-- ============================================================

-- ============================
-- 1. ENUMS
-- ============================

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

-- ============================
-- 2. MAIN TABLES
-- ============================

-- 2.1 Agency Clients (separate from profiles, optional 1:1)
CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  client_status agency_client_status DEFAULT 'Pre-Onboarding',
  plan TEXT[] DEFAULT '{}',
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
  comms_channel TEXT[] DEFAULT '{}',
  poc_id UUID,
  project_scope JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Agency Contacts
CREATE TABLE agency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT[] DEFAULT '{}',
  email TEXT,
  phone TEXT,
  role_title TEXT,
  time_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Agency Tasks
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

-- 2.4 Agency Meetings
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

-- 2.5 Audiences
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

-- 2.6 Employees (extra metadata, links to profiles)
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

-- 2.7 Training Resources
CREATE TABLE training_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  video_url TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.8 Daily Reports
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  report_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.9 Project Build Timeline (per-client, 7 phases)
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

-- 2.10 Client Login Credentials (software access per-client)
CREATE TABLE client_login_creds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  software_name TEXT NOT NULL,
  email TEXT,
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- 3. JUNCTION TABLES
-- ============================

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

-- ============================
-- 4. FOREIGN KEYS (deferred)
-- ============================

ALTER TABLE agency_tasks ADD CONSTRAINT fk_agency_tasks_daily_report
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE SET NULL;

ALTER TABLE agency_meetings ADD CONSTRAINT fk_agency_meetings_daily_report
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE SET NULL;

ALTER TABLE agency_clients ADD CONSTRAINT fk_agency_clients_poc
  FOREIGN KEY (poc_id) REFERENCES agency_contacts(id) ON DELETE SET NULL;

-- ============================
-- 5. INDEXES
-- ============================

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

-- ============================
-- 6. TRIGGERS
-- ============================

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
CREATE TRIGGER tr_audiences_updated BEFORE UPDATE ON audiences
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

-- ============================
-- 7. VIEWS
-- ============================

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

-- ============================
-- 8. ROW LEVEL SECURITY
-- ============================

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
ALTER TABLE agency_client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_client_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_meeting_internals ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is staff (admin or vibecoder)
CREATE OR REPLACE FUNCTION is_agency_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'vibecoder')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: get agency_client id for the current user
CREATE OR REPLACE FUNCTION get_my_agency_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM agency_clients WHERE profile_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---- agency_clients ----
CREATE POLICY "staff_full_access" ON agency_clients
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_data" ON agency_clients
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- ---- agency_tasks ----
CREATE POLICY "staff_full_access" ON agency_tasks
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_tasks" ON agency_tasks
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- agency_contacts ----
CREATE POLICY "staff_full_access" ON agency_contacts
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_contacts" ON agency_contacts
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT contact_id FROM agency_client_contacts
      WHERE client_id = get_my_agency_client_id()
    )
  );

-- ---- agency_meetings ----
CREATE POLICY "staff_full_access" ON agency_meetings
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_meetings" ON agency_meetings
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- audiences ----
CREATE POLICY "staff_full_access" ON audiences
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_audiences" ON audiences
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- employees ----
CREATE POLICY "staff_full_access" ON employees
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

-- Clients don't see employees (no client policy)

-- ---- training_resources ----
CREATE POLICY "staff_full_access" ON training_resources
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

-- Clients don't see training resources

-- ---- daily_reports ----
CREATE POLICY "staff_full_access" ON daily_reports
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

-- Clients don't see daily reports

-- ---- project_build_timeline ----
CREATE POLICY "staff_full_access" ON project_build_timeline
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_timeline" ON project_build_timeline
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- client_login_creds ----
CREATE POLICY "staff_full_access" ON client_login_creds
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_creds" ON client_login_creds
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- agency_client_contacts ----
CREATE POLICY "staff_full_access" ON agency_client_contacts
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_client_contacts" ON agency_client_contacts
  FOR SELECT TO authenticated
  USING (client_id = get_my_agency_client_id());

-- ---- agency_client_daily_reports ----
CREATE POLICY "staff_full_access" ON agency_client_daily_reports
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

-- Clients don't see daily reports junction

-- ---- agency_meeting_participants ----
CREATE POLICY "staff_full_access" ON agency_meeting_participants
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_meeting_participants" ON agency_meeting_participants
  FOR SELECT TO authenticated
  USING (
    meeting_id IN (
      SELECT id FROM agency_meetings WHERE client_id = get_my_agency_client_id()
    )
  );

-- ---- agency_meeting_internals ----
CREATE POLICY "staff_full_access" ON agency_meeting_internals
  FOR ALL TO authenticated
  USING (is_agency_staff())
  WITH CHECK (is_agency_staff());

CREATE POLICY "client_own_meeting_internals" ON agency_meeting_internals
  FOR SELECT TO authenticated
  USING (
    meeting_id IN (
      SELECT id FROM agency_meetings WHERE client_id = get_my_agency_client_id()
    )
  );
