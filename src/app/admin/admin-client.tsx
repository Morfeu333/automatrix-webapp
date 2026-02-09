"use client"

import { useState, useTransition } from "react"
import { Users, Zap, DollarSign, TrendingUp, BarChart3, Settings, FileText, Shield, Check, X, UserCheck } from "lucide-react"
import { changeUserRole, changeUserTier, approveVibecoder, rejectVibecoder } from "./actions"

interface AdminStats {
  totalUsers: number
  totalDownloads: number
  activeProjects: number
  paidSubscriptions: number
}

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  role: string
  subscription_tier: string
  created_at: string
  updated_at: string
}

interface BlogPostRow {
  id: string
  title: string
  slug: string
  status: string
  category: string | null
  author: string | null
  published_at: string | null
  created_at: string
}

interface WorkflowRow {
  id: string
  name: string
  category: string | null
  active: boolean
  download_count: number
  created_at: string
}

interface VibecoderRow {
  id: string
  user_id: string
  approval_status: string
  tools: string[] | null
  frameworks: string[] | null
  hourly_rate: number | null
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

const roleColors: Record<string, string> = {
  admin: "bg-red-500/10 text-red-400",
  client: "bg-blue-500/10 text-blue-400",
  vibecoder: "bg-purple-500/10 text-purple-400",
  learner: "bg-green-500/10 text-green-400",
}

const tierColors: Record<string, string> = {
  free: "bg-zinc-500/10 text-zinc-400",
  pro: "bg-primary/10 text-primary",
  business: "bg-purple-500/10 text-purple-400",
}

const postStatusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-400",
  published: "bg-green-500/10 text-green-400",
  archived: "bg-zinc-500/10 text-zinc-400",
}

const approvalColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
}

const tabs = [
  { id: "users", name: "Usuarios", icon: Users },
  { id: "vibecoders", name: "Vibecoders", icon: UserCheck },
  { id: "content", name: "Conteudo", icon: FileText },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "settings", name: "Config", icon: Settings },
]

export function AdminClient({
  stats,
  users,
  blogPosts,
  workflows,
  vibecoders,
}: {
  stats: AdminStats
  users: UserRow[]
  blogPosts: BlogPostRow[]
  workflows: WorkflowRow[]
  vibecoders: VibecoderRow[]
}) {
  const [activeTab, setActiveTab] = useState("users")
  const [isPending, startTransition] = useTransition()

  const statCards = [
    { label: "Total Usuarios", value: stats.totalUsers.toLocaleString(), icon: Users, color: "bg-blue-500/10 text-blue-400" },
    { label: "Total Downloads", value: stats.totalDownloads.toLocaleString(), icon: Zap, color: "bg-green-500/10 text-green-400" },
    { label: "Assinaturas Pagas", value: stats.paidSubscriptions.toLocaleString(), icon: DollarSign, color: "bg-purple-500/10 text-purple-400" },
    { label: "Projetos Ativos", value: stats.activeProjects.toLocaleString(), icon: TrendingUp, color: "bg-orange-500/10 text-orange-400" },
  ]

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole)
      if (result.error) console.error(result.error)
    })
  }

  function handleTierChange(userId: string, newTier: string) {
    startTransition(async () => {
      const result = await changeUserTier(userId, newTier)
      if (result.error) console.error(result.error)
    })
  }

  function handleApprove(vibecoderId: string) {
    startTransition(async () => {
      const result = await approveVibecoder(vibecoderId)
      if (result.error) console.error(result.error)
    })
  }

  function handleReject(vibecoderId: string) {
    startTransition(async () => {
      const result = await rejectVibecoder(vibecoderId)
      if (result.error) console.error(result.error)
    })
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Gerenciar plataforma Automatrix</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "users" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Desde</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{u.full_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={isPending}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${roleColors[u.role] ?? "bg-zinc-500/10 text-zinc-400"}`}
                        >
                          <option value="learner">learner</option>
                          <option value="client">client</option>
                          <option value="vibecoder">vibecoder</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.subscription_tier}
                          onChange={(e) => handleTierChange(u.id, e.target.value)}
                          disabled={isPending}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${tierColors[u.subscription_tier] ?? "bg-zinc-500/10 text-zinc-400"}`}
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="business">business</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhum usuario cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "vibecoders" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tools</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">R$/h</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {vibecoders.map((vc) => {
                    const profile = vc.profiles as { full_name: string | null; email: string | null } | null
                    return (
                      <tr key={vc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {profile?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {profile?.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {vc.tools?.slice(0, 3).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {vc.hourly_rate ? `R$${vc.hourly_rate}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${approvalColors[vc.approval_status] ?? "bg-zinc-500/10 text-zinc-400"}`}>
                            {vc.approval_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {vc.approval_status === "pending" && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleApprove(vc.id)}
                                disabled={isPending}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                                title="Aprovar"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(vc.id)}
                                disabled={isPending}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                title="Rejeitar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {vc.approval_status === "approved" && (
                            <span className="text-xs text-muted-foreground">Aprovado</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {vibecoders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhum vibecoder cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Blog Posts ({blogPosts.length})</h3>
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Titulo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Autor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Publicado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{post.title}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{post.category ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${postStatusColors[post.status] ?? "bg-zinc-500/10 text-zinc-400"}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{post.author ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "—"}
                          </td>
                        </tr>
                      ))}
                      {blogPosts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Nenhum post ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Workflows ({workflows.length})</h3>
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ativo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Downloads</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Criado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflows.map((wf) => (
                        <tr key={wf.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{wf.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{wf.category ?? "—"}</td>
                          <td className="px-4 py-3">
                            {wf.active ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{wf.download_count}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(wf.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                      {workflows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Nenhum workflow ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4">Analytics com graficos sera integrado em breve.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4">Configuracoes da plataforma.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
