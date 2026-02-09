export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_chat_sessions: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          created_at: string
          estimated_days: number | null
          id: string
          match_score: number | null
          project_id: string
          proposal: string | null
          status: Database["public"]["Enums"]["bid_status"]
          vibecoder_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          estimated_days?: number | null
          id?: string
          match_score?: number | null
          project_id: string
          proposal?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          vibecoder_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          estimated_days?: number | null
          id?: string
          match_score?: number | null
          project_id?: string
          proposal?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          vibecoder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_vibecoder_id_fkey"
            columns: ["vibecoder_id"]
            isOneToOne: false
            referencedRelation: "vibecoders"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          author_id: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          read_time: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          position: number
          project_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          project_id: string
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_sessions: {
        Row: {
          app_level: Database["public"]["Enums"]["app_level"] | null
          conversation: Json
          created_at: string
          deliverables: Json | null
          extracted_requirements: Json | null
          id: string
          status: Database["public"]["Enums"]["onboarding_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          app_level?: Database["public"]["Enums"]["app_level"] | null
          conversation?: Json
          created_at?: string
          deliverables?: Json | null
          extracted_requirements?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          app_level?: Database["public"]["Enums"]["app_level"] | null
          conversation?: Json
          created_at?: string
          deliverables?: Json | null
          extracted_requirements?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          project_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          industry: string | null
          profile_complete_pct: number | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          industry?: string | null
          profile_complete_pct?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          profile_complete_pct?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          app_level: Database["public"]["Enums"]["app_level"] | null
          assigned_vibecoder_id: string | null
          bid_count: number
          budget_max: number | null
          budget_min: number | null
          category: string | null
          client_id: string
          created_at: string
          deadline: string | null
          deliverables: Json | null
          description: string | null
          estimated_duration: string | null
          id: string
          project_type: Database["public"]["Enums"]["project_type"] | null
          questionnaire_responses: Json | null
          required_skills: string[] | null
          status: Database["public"]["Enums"]["project_status"]
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          app_level?: Database["public"]["Enums"]["app_level"] | null
          assigned_vibecoder_id?: string | null
          bid_count?: number
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          client_id: string
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          description?: string | null
          estimated_duration?: string | null
          id?: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          questionnaire_responses?: Json | null
          required_skills?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          app_level?: Database["public"]["Enums"]["app_level"] | null
          assigned_vibecoder_id?: string | null
          bid_count?: number
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          description?: string | null
          estimated_duration?: string | null
          id?: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          questionnaire_responses?: Json | null
          required_skills?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_vibecoder_id_fkey"
            columns: ["assigned_vibecoder_id"]
            isOneToOne: false
            referencedRelation: "vibecoders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vibecoder_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          platform_fee: number
          project_id: string | null
          status: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id: string | null
          vibecoder_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          platform_fee: number
          project_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
          vibecoder_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          platform_fee?: number
          project_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
          vibecoder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibecoder_payouts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibecoder_payouts_vibecoder_id_fkey"
            columns: ["vibecoder_id"]
            isOneToOne: false
            referencedRelation: "vibecoders"
            referencedColumns: ["id"]
          },
        ]
      }
      vibecoders: {
        Row: {
          approval_status: Database["public"]["Enums"]["vibecoder_approval"]
          communication_prefs: string[] | null
          connect_status: Database["public"]["Enums"]["connect_status"]
          created_at: string
          frameworks: string[] | null
          github_url: string | null
          hourly_rate: number | null
          hours_per_week: number | null
          id: string
          portfolio_urls: string[] | null
          resume_url: string | null
          skills: Json | null
          stripe_connect_id: string | null
          timezone: string | null
          tools: string[] | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["vibecoder_approval"]
          communication_prefs?: string[] | null
          connect_status?: Database["public"]["Enums"]["connect_status"]
          created_at?: string
          frameworks?: string[] | null
          github_url?: string | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          portfolio_urls?: string[] | null
          resume_url?: string | null
          skills?: Json | null
          stripe_connect_id?: string | null
          timezone?: string | null
          tools?: string[] | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["vibecoder_approval"]
          communication_prefs?: string[] | null
          connect_status?: Database["public"]["Enums"]["connect_status"]
          created_at?: string
          frameworks?: string[] | null
          github_url?: string | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          portfolio_urls?: string[] | null
          resume_url?: string | null
          skills?: Json | null
          stripe_connect_id?: string | null
          timezone?: string | null
          tools?: string[] | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      workflow_downloads: {
        Row: {
          downloaded_at: string
          id: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_downloads_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          active: boolean
          category: string
          complexity: Database["public"]["Enums"]["workflow_complexity"]
          created_at: string
          description: string | null
          download_count: number
          filename: string
          id: string
          install_price: number | null
          integrations: string[] | null
          name: string
          node_count: number | null
          required_apis: Json | null
          search_vector: unknown
          tags: string[] | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          complexity?: Database["public"]["Enums"]["workflow_complexity"]
          created_at?: string
          description?: string | null
          download_count?: number
          filename: string
          id?: string
          install_price?: number | null
          integrations?: string[] | null
          name: string
          node_count?: number | null
          required_apis?: Json | null
          search_vector?: unknown
          tags?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          complexity?: Database["public"]["Enums"]["workflow_complexity"]
          created_at?: string
          description?: string | null
          download_count?: number
          filename?: string
          id?: string
          install_price?: number | null
          integrations?: string[] | null
          name?: string
          node_count?: number | null
          required_apis?: Json | null
          search_vector?: unknown
          tags?: string[] | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tier: {
        Args: never
        Returns: Database["public"]["Enums"]["subscription_tier"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_participant: {
        Args: { conv_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_level: "lv1" | "lv2" | "lv3"
      bid_status: "pending" | "accepted" | "rejected" | "withdrawn"
      blog_status: "draft" | "scheduled" | "published"
      connect_status: "pending" | "active" | "disabled"
      message_status: "sent" | "delivered" | "read"
      message_type: "text" | "image" | "file"
      onboarding_status: "in_progress" | "completed" | "abandoned"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      payment_type: "subscription" | "service" | "mentorship"
      payout_status: "pending" | "paid" | "failed"
      project_status:
        | "draft"
        | "open"
        | "pending_payment"
        | "matching"
        | "assigned"
        | "in_progress"
        | "review"
        | "completed"
        | "cancelled"
      project_type: "workflow_install" | "custom_app"
      subscription_status: "active" | "past_due" | "canceled" | "trialing"
      subscription_tier: "free" | "pro" | "business"
      user_role: "client" | "vibecoder" | "learner" | "admin"
      vibecoder_approval: "pending" | "approved" | "rejected"
      workflow_complexity: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_level: ["lv1", "lv2", "lv3"],
      bid_status: ["pending", "accepted", "rejected", "withdrawn"],
      blog_status: ["draft", "scheduled", "published"],
      connect_status: ["pending", "active", "disabled"],
      message_status: ["sent", "delivered", "read"],
      message_type: ["text", "image", "file"],
      onboarding_status: ["in_progress", "completed", "abandoned"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      payment_type: ["subscription", "service", "mentorship"],
      payout_status: ["pending", "paid", "failed"],
      project_status: [
        "draft",
        "open",
        "pending_payment",
        "matching",
        "assigned",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
      project_type: ["workflow_install", "custom_app"],
      subscription_status: ["active", "past_due", "canceled", "trialing"],
      subscription_tier: ["free", "pro", "business"],
      user_role: ["client", "vibecoder", "learner", "admin"],
      vibecoder_approval: ["pending", "approved", "rejected"],
      workflow_complexity: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
