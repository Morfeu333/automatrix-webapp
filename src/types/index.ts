// ============================================================
// Automatrix Platform v2 - Type Definitions
// Matches Supabase database schema
// ============================================================

// -- Enums --

export type UserRole = "client" | "vibecoder" | "learner" | "admin"
export type SubscriptionTier = "free" | "pro" | "business"
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing"
export type VibecoderApproval = "pending" | "approved" | "rejected"
export type ConnectStatus = "pending" | "active" | "disabled"
export type ProjectStatus = "draft" | "open" | "pending_payment" | "matching" | "assigned" | "in_progress" | "review" | "completed" | "cancelled"
export type ProjectType = "workflow_install" | "custom_app"
export type AppLevel = "lv1" | "lv2" | "lv3"
export type WorkflowComplexity = "beginner" | "intermediate" | "advanced"
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn"
export type MessageType = "text" | "image" | "file"
export type MessageStatus = "sent" | "delivered" | "read"
export type PaymentType = "subscription" | "service" | "mentorship"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export type PayoutStatus = "pending" | "paid" | "failed"
export type OnboardingStatus = "in_progress" | "completed" | "abandoned"
export type BlogStatus = "draft" | "scheduled" | "published"

// -- Agency OS Enums --

export type AgencyClientStatus =
  | "Pre-Onboarding" | "Onboarding Call" | "Onboarding Email"
  | "Audit Process" | "Kick Off Call" | "Start Implementation"
  | "End Implementation" | "Train Team" | "Optimisation"
  | "Full Launch" | "Monthly Optimisation"

export type AgencyTaskStatus = "BLOCKED" | "Not Started" | "In Progress" | "Complete"
export type AgencyTaskType = "Internal" | "Client Action" | "Automation"

export type AgencyMeetingType =
  | "Sales" | "Onboarding" | "Kickoff" | "Progress"
  | "Team Sync" | "Client Meeting" | "Planning" | "Retrospective"

export type EmployeeDepartment =
  | "Campaign Management" | "Account Management"
  | "Marketing" | "Sales" | "Operations"

export type ProjectPhaseStatus = "Blocked" | "Not Started" | "In Progress" | "Complete"

export interface ProjectScope {
  project_name?: string
  description?: string
  app_level?: AppLevel
  frontend?: string
  database?: string
  backend?: string
  llms?: string[]
  integrations?: string[]
  platform?: string
  timeline?: string
  budget?: string
}

// -- Tables --

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  subscription_tier: SubscriptionTier
  bio: string | null
  company: string | null
  website: string | null
  industry: string | null
  skills: string[]
  profile_complete_pct: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: SubscriptionTier
  status: SubscriptionStatus
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface Vibecoder {
  id: string
  user_id: string
  github_url: string | null
  portfolio_urls: string[]
  resume_url: string | null
  video_url: string | null
  skills: Record<string, number>
  tools: string[]
  frameworks: string[]
  hourly_rate: number | null
  hours_per_week: number | null
  timezone: string | null
  communication_prefs: string[]
  stripe_connect_id: string | null
  connect_status: ConnectStatus
  approval_status: VibecoderApproval
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  filename: string
  name: string
  description: string | null
  category: string
  trigger_type: string | null
  complexity: WorkflowComplexity
  node_count: number
  integrations: string[]
  tags: string[]
  required_apis: Array<{ name: string; required: boolean }>
  install_price: number | null
  active: boolean
  download_count: number
  created_at: string
  updated_at: string
}

export interface WorkflowDownload {
  id: string
  workflow_id: string
  user_id: string
  downloaded_at: string
}

export interface Project {
  id: string
  client_id: string
  title: string
  description: string | null
  project_type: ProjectType | null
  app_level: AppLevel | null
  status: ProjectStatus
  category: string | null
  required_skills: string[]
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  estimated_duration: string | null
  assigned_vibecoder_id: string | null
  stripe_payment_intent_id: string | null
  deliverables: unknown[]
  questionnaire_responses: unknown | null
  bid_count: number
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  position: number
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface Bid {
  id: string
  project_id: string
  vibecoder_id: string
  amount: number
  proposal: string | null
  estimated_days: number | null
  match_score: number | null
  status: BidStatus
  created_at: string
}

export interface Conversation {
  id: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  conversation_id: string
  user_id: string
  last_read_at: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: MessageType
  attachment_url: string | null
  status: MessageStatus
  created_at: string
  read_at: string | null
}

export interface AgentChatSession {
  id: string
  user_id: string
  agent_id: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export interface OnboardingSession {
  id: string
  user_id: string
  conversation: Array<{
    sender: "user" | "ai"
    message: string
    timestamp: string
  }>
  extracted_requirements: {
    platform?: string[]
    features?: string[]
    required_apis?: string[]
    infrastructure?: string[]
    app_level?: AppLevel
  } | null
  app_level: AppLevel | null
  deliverables: Array<{
    type: string
    url?: string
    generated_at?: string
    data?: unknown
  }>
  project_scope: ProjectScope
  status: OnboardingStatus
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  stripe_payment_id: string | null
  amount: number
  currency: string
  payment_type: PaymentType
  status: PaymentStatus
  project_id: string | null
  created_at: string
}

export interface VibecoderPayout {
  id: string
  vibecoder_id: string
  project_id: string | null
  amount: number
  platform_fee: number
  stripe_transfer_id: string | null
  status: PayoutStatus
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author: string
  author_id: string | null
  category: string | null
  tags: string[]
  status: BlogStatus
  read_time: string | null
  published_at: string | null
  scheduled_for: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

// -- Agency OS Tables --

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
  // Computed (from views)
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
  // Computed (from views)
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

// -- Query helpers --

export interface WorkflowSearchParams {
  query?: string
  category?: string
  trigger_type?: string
  complexity?: string
  page?: number
  page_size?: number
  sort_by?: string
}

export interface SearchResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// -- Composite types for UI --

export interface ConversationWithParticipants extends Conversation {
  participants: Array<Profile>
  unread_count?: number
}

export interface ProjectWithClient extends Project {
  client: Profile
}

export interface BidWithVibecoder extends Bid {
  vibecoder: Vibecoder & { profile: Profile }
}
