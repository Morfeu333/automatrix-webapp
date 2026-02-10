import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { DashboardClient } from "./dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard - Automatrix",
  description: "Seu painel de controle. Gerencie projetos, workflows e mensagens.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, role, subscription_tier, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError) console.error("Dashboard profile fetch error:", profileError.message)

  const role = profile?.role ?? "learner"
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuario"
  let hasDataErrors = !!profileError

  // ─── CLIENT DASHBOARD ────────────────────────────
  if (role === "client") {
    const [projectsRes, completedRes, notificationsRes, downloadsRes] = await Promise.all([
      supabase.from("projects").select("id, title, status, bid_count, created_at").eq("client_id", user.id).in("status", ["open", "assigned", "in_progress", "review"]).order("created_at", { ascending: false }).limit(5),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "completed"),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      supabase.from("workflow_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ])

    // Fetch bids received on user's projects
    const { data: userProjectIds } = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", user.id)

    let receivedBids: Array<{ id: string; amount: number; status: string; vibecoder_name: string; project_title: string; project_id: string }> = []
    if (userProjectIds && userProjectIds.length > 0) {
      const projectIdList = userProjectIds.map((p) => p.id)
      const { data: bids } = await supabase
        .from("bids")
        .select("id, amount, status, project_id, vibecoder_id")
        .in("project_id", projectIdList)
        .order("created_at", { ascending: false })
        .limit(5)

      if (bids) {
        receivedBids = await Promise.all(
          bids.map(async (bid) => {
            const { data: vc } = await supabase.from("vibecoders").select("user_id").eq("id", bid.vibecoder_id).single()
            let vcName = "Vibecoder"
            if (vc) {
              const { data: p } = await supabase.from("profiles").select("full_name").eq("id", vc.user_id).single()
              vcName = p?.full_name ?? "Vibecoder"
            }
            const proj = userProjectIds.find((p) => p.id === bid.project_id)
            return {
              id: bid.id,
              amount: bid.amount,
              status: bid.status,
              vibecoder_name: vcName,
              project_title: proj?.title ?? "Projeto",
              project_id: bid.project_id,
            }
          })
        )
      }
    }

    hasDataErrors = hasDataErrors || !!(projectsRes.error || completedRes.error)

    return (
      <DashboardClient
        role="client"
        displayName={displayName}
        hasDataErrors={hasDataErrors}
        stats={[
          { label: "Projetos Ativos", value: String(projectsRes.data?.length ?? 0), icon: "FolderKanban", color: "text-purple-600 bg-purple-100" },
          { label: "Propostas Recebidas", value: String(receivedBids.length), icon: "Users", color: "text-blue-600 bg-blue-100" },
          { label: "Projetos Concluidos", value: String(completedRes.count ?? 0), icon: "Briefcase", color: "text-green-600 bg-green-100" },
          { label: "Downloads", value: String(downloadsRes.count ?? 0), icon: "Download", color: "text-orange-600 bg-orange-100" },
        ]}
        clientProjects={projectsRes.data ?? []}
        receivedBids={receivedBids}
      />
    )
  }

  // ─── VIBECODER DASHBOARD ─────────────────────────
  if (role === "vibecoder") {
    const { data: vibecoder } = await supabase
      .from("vibecoders")
      .select("id, approval_status")
      .eq("user_id", user.id)
      .single()

    const vibecoderId = vibecoder?.id
    const pendingApproval = vibecoder?.approval_status === "pending"

    const [openCountRes, notificationsRes] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
    ])

    let myBids: Array<{ id: string; amount: number; status: string; project_id: string; project_title: string }> = []
    let inProgressCount = 0

    if (vibecoderId) {
      const { data: bids } = await supabase
        .from("bids")
        .select("id, amount, status, project_id, projects(title)")
        .eq("vibecoder_id", vibecoderId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (bids) {
        myBids = bids.map((b) => ({
          id: b.id,
          amount: b.amount,
          status: b.status,
          project_id: b.project_id,
          project_title: (b.projects as { title: string } | null)?.title ?? "Projeto",
        }))
      }

      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("assigned_vibecoder_id", vibecoderId)
        .in("status", ["assigned", "in_progress", "review"])

      inProgressCount = count ?? 0
    }

    // Recommended open projects
    const { data: recommended } = await supabase
      .from("projects")
      .select("id, title, category, budget_max")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      <DashboardClient
        role="vibecoder"
        displayName={displayName}
        hasDataErrors={hasDataErrors}
        stats={[
          { label: "Missoes Disponiveis", value: String(openCountRes.count ?? 0), icon: "FolderKanban", color: "text-purple-600 bg-purple-100" },
          { label: "Propostas Enviadas", value: String(myBids.length), icon: "Briefcase", color: "text-blue-600 bg-blue-100" },
          { label: "Em Andamento", value: String(inProgressCount), icon: "Zap", color: "text-green-600 bg-green-100" },
          { label: "Notificacoes", value: String(notificationsRes.count ?? 0), icon: "Bell", color: "text-orange-600 bg-orange-100" },
        ]}
        myBids={myBids}
        recommendedProjects={recommended ?? []}
        pendingApproval={pendingApproval}
      />
    )
  }

  // ─── LEARNER / DEFAULT DASHBOARD ─────────────────
  const [downloadsRes, projectsRes, notificationsRes, workflowsRes] = await Promise.all([
    supabase.from("workflow_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("client_id", user.id).in("status", ["open", "in_progress", "review"]),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
    supabase.from("workflows").select("id", { count: "exact", head: true }).eq("active", true),
  ])

  const { data: recentDownloads, error: downloadsError } = await supabase
    .from("workflow_downloads")
    .select("downloaded_at, workflow_id, workflows(name)")
    .eq("user_id", user.id)
    .order("downloaded_at", { ascending: false })
    .limit(5)

  hasDataErrors = hasDataErrors || !!(downloadsRes.error || projectsRes.error || notificationsRes.error || workflowsRes.error || downloadsError)

  const recentActivity = (recentDownloads ?? []).map((item) => ({
    name: (item.workflows as { name: string } | null)?.name ?? "workflow",
    downloaded_at: typeof item.downloaded_at === "string" ? item.downloaded_at : null,
  }))

  return (
    <DashboardClient
      role="learner"
      displayName={displayName}
      hasDataErrors={hasDataErrors}
      stats={[
        { label: "Workflows Baixados", value: String(downloadsRes.count ?? 0), icon: "Download", color: "text-blue-600 bg-blue-100" },
        { label: "Projetos Ativos", value: String(projectsRes.count ?? 0), icon: "FolderKanban", color: "text-purple-600 bg-purple-100" },
        { label: "Notificacoes", value: String(notificationsRes.count ?? 0), icon: "Bell", color: "text-green-600 bg-green-100" },
        { label: "Templates Disponiveis", value: String(workflowsRes.count ?? 0), icon: "Zap", color: "text-orange-600 bg-orange-100" },
      ]}
      recentDownloads={recentActivity}
    />
  )
}
