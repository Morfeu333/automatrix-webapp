import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Download, FolderKanban, MessageSquare, Zap, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Automatrix",
  description: "Seu painel de controle. Gerencie projetos, workflows e mensagens.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, role, subscription_tier, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Dashboard profile fetch error:", profileError.message)
  }

  // Fetch stats in parallel
  const [downloadsRes, projectsRes, notificationsRes, workflowsRes] = await Promise.all([
    supabase.from("workflow_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("client_id", user.id).in("status", ["open", "in_progress", "review"]),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
    supabase.from("workflows").select("id", { count: "exact", head: true }).eq("active", true),
  ])

  if (downloadsRes.error) console.error("Dashboard downloads count error:", downloadsRes.error.message)
  if (projectsRes.error) console.error("Dashboard projects count error:", projectsRes.error.message)
  if (notificationsRes.error) console.error("Dashboard notifications count error:", notificationsRes.error.message)
  if (workflowsRes.error) console.error("Dashboard workflows count error:", workflowsRes.error.message)

  const stats = [
    { label: "Workflows Baixados", value: String(downloadsRes.count ?? 0), icon: Download, color: "text-blue-600 bg-blue-100" },
    { label: "Projetos Ativos", value: String(projectsRes.count ?? 0), icon: FolderKanban, color: "text-purple-600 bg-purple-100" },
    { label: "Notificacoes", value: String(notificationsRes.count ?? 0), icon: Bell, color: "text-green-600 bg-green-100" },
    { label: "Templates Disponiveis", value: String(workflowsRes.count ?? 0), icon: Zap, color: "text-orange-600 bg-orange-100" },
  ]

  // Recent activity (last 5 downloads)
  const { data: recentDownloads, error: downloadsError } = await supabase
    .from("workflow_downloads")
    .select("downloaded_at, workflow_id, workflows(name)")
    .eq("user_id", user.id)
    .order("downloaded_at", { ascending: false })
    .limit(5)

  if (downloadsError) console.error("Dashboard recent downloads error:", downloadsError.message)

  const hasDataErrors = !!(downloadsRes.error || projectsRes.error || notificationsRes.error || workflowsRes.error || downloadsError || profileError)

  const quickActions = [
    { label: "Explorar Workflows", href: "/workflows", icon: Zap },
    { label: "Mission Board", href: "/projects", icon: FolderKanban },
    { label: "Mensagens", href: "/chat", icon: MessageSquare },
  ]

  return (
    <div>
      {hasDataErrors && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-600">
          Alguns dados podem estar indisponiveis no momento. Tente recarregar a pagina.
        </div>
      )}

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Ola, {profile?.full_name || user.email?.split("@")[0]}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aqui esta um resumo da sua atividade na Automatrix.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h2>
          <div className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Atividade Recente</h2>
          {recentDownloads && recentDownloads.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentDownloads.map((item, i) => {
                const wf = item.workflows as { name: string } | null
                const downloadedAt = typeof item.downloaded_at === "string" ? item.downloaded_at : null
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Download className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">
                        Baixou <span className="font-medium">{wf?.name ?? "workflow"}</span>
                      </p>
                      {downloadedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(downloadedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Zap className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
              <Link href="/workflows" className="mt-2 inline-block text-sm font-medium text-primary hover:text-automatrix-dark">
                Explorar workflows
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
