import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminClient } from "./admin-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin - Automatrix",
  description: "Painel administrativo da plataforma Automatrix.",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Admin profile check error:", profileError.message)
    redirect("/dashboard")
  }

  if (profile?.role !== "admin") redirect("/dashboard")

  // Fetch stats in parallel
  const [usersRes, downloadsRes, projectsRes, subscriptionsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("workflow_downloads").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress", "review"]),
    supabase.from("user_subscriptions").select("id", { count: "exact", head: true }).neq("tier", "free").eq("status", "active"),
  ])

  if (usersRes.error) console.error("Admin users count error:", usersRes.error.message)
  if (downloadsRes.error) console.error("Admin downloads count error:", downloadsRes.error.message)
  if (projectsRes.error) console.error("Admin projects count error:", projectsRes.error.message)
  if (subscriptionsRes.error) console.error("Admin subscriptions count error:", subscriptionsRes.error.message)

  const stats = {
    totalUsers: usersRes.count ?? 0,
    totalDownloads: downloadsRes.count ?? 0,
    activeProjects: projectsRes.count ?? 0,
    paidSubscriptions: subscriptionsRes.count ?? 0,
  }

  // Fetch recent users (last 50)
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, subscription_tier, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(50)

  if (usersError) console.error("Admin users fetch error:", usersError.message)

  // Fetch recent blog posts for content tab
  const { data: blogPosts, error: blogError } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, category, author, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (blogError) console.error("Admin blog fetch error:", blogError.message)

  // Fetch recent workflows for content tab
  const { data: workflows, error: workflowsError } = await supabase
    .from("workflows")
    .select("id, name, category, active, download_count, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (workflowsError) console.error("Admin workflows fetch error:", workflowsError.message)

  // Fetch pending vibecoders for approval
  const { data: rawVibecoders, error: vibecodersError } = await supabase
    .from("vibecoders")
    .select("id, user_id, approval_status, tools, frameworks, hourly_rate, created_at")
    .in("approval_status", ["pending", "approved"])
    .order("created_at", { ascending: false })
    .limit(30)

  if (vibecodersError) console.error("Admin vibecoders fetch error:", vibecodersError.message)

  // Enrich vibecoders with profile data
  const vibecoderUserIds = (rawVibecoders ?? []).map((vc) => vc.user_id)
  let vibecoderProfiles: Record<string, { full_name: string | null; email: string | null }> = {}
  if (vibecoderUserIds.length > 0) {
    const { data: vcProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", vibecoderUserIds)

    if (vcProfiles) {
      vibecoderProfiles = Object.fromEntries(vcProfiles.map((p) => [p.id, { full_name: p.full_name, email: p.email }]))
    }
  }

  const vibecoders = (rawVibecoders ?? []).map((vc) => ({
    ...vc,
    profiles: vibecoderProfiles[vc.user_id] || null,
  }))

  return (
    <AdminClient
      stats={stats}
      users={users ?? []}
      blogPosts={blogPosts ?? []}
      workflows={workflows ?? []}
      vibecoders={vibecoders}
    />
  )
}
