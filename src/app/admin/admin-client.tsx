"use client"

import { useState } from "react"
import { Users, Zap, DollarSign, TrendingUp, BarChart3, Settings, FileText, Shield, Check, X } from "lucide-react"

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

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  client: "bg-blue-100 text-blue-700",
  vibecoder: "bg-purple-100 text-purple-700",
  learner: "bg-green-100 text-green-700",
}

const tierColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  business: "bg-purple-100 text-purple-700",
}

const postStatusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
}

const tabs = [
  { id: "users", name: "Usuarios", icon: Users },
  { id: "content", name: "Conteudo", icon: FileText },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "settings", name: "Config", icon: Settings },
]

export function AdminClient({
  stats,
  users,
  blogPosts,
  workflows,
}: {
  stats: AdminStats
  users: UserRow[]
  blogPosts: BlogPostRow[]
  workflows: WorkflowRow[]
}) {
  const [activeTab, setActiveTab] = useState("users")

  const statCards = [
    { label: "Total Usuarios", value: stats.totalUsers.toLocaleString(), icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Downloads", value: stats.totalDownloads.toLocaleString(), icon: Zap, color: "bg-green-100 text-green-600" },
    { label: "Assinaturas Pagas", value: stats.paidSubscriptions.toLocaleString(), icon: DollarSign, color: "bg-purple-100 text-purple-600" },
    { label: "Projetos Ativos", value: stats.activeProjects.toLocaleString(), icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  ]

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
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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
            <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[u.role] ?? "bg-gray-100 text-gray-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColors[u.subscription_tier] ?? "bg-gray-100 text-gray-700"}`}>
                          {u.subscription_tier}
                        </span>
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

          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Blog Posts */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Blog Posts ({blogPosts.length})</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${postStatusColors[post.status] ?? "bg-gray-100 text-gray-700"}`}>
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

              {/* Workflows */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Workflows ({workflows.length})</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
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
