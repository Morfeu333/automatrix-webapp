"use client"

import Link from "next/link"
import { Download, FolderKanban, MessageSquare, Zap, ArrowRight, Bell, Users, DollarSign, Briefcase, Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Download, FolderKanban, MessageSquare, Zap, Bell, Users, DollarSign, Briefcase,
}

interface StatCard {
  label: string
  value: string
  icon: string
  color: string
}

interface ProjectRow {
  id: string
  title: string
  status: string
  bid_count: number
  created_at: string
}

interface BidRow {
  id: string
  amount: number
  status: string
  project_id: string
  project_title: string
}

interface RecentDownload {
  name: string
  downloaded_at: string | null
}

interface Props {
  role: string
  displayName: string
  stats: StatCard[]
  // Client
  clientProjects?: ProjectRow[]
  receivedBids?: Array<{
    id: string
    amount: number
    status: string
    vibecoder_name: string
    project_title: string
    project_id: string
  }>
  // Vibecoder
  myBids?: BidRow[]
  recommendedProjects?: Array<{ id: string; title: string; category: string | null; budget_max: number | null }>
  // Learner
  recentDownloads?: RecentDownload[]
  hasDataErrors?: boolean
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  open: "Aberto", assigned: "Atribuido", in_progress: "Em Progresso",
  review: "Revisao", completed: "Concluido", pending: "Pendente",
  accepted: "Aceita", rejected: "Rejeitada",
}

export function DashboardClient({
  role, displayName, stats, clientProjects, receivedBids,
  myBids, recommendedProjects, recentDownloads, hasDataErrors,
}: Props) {
  return (
    <div>
      {hasDataErrors && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-600">
          Alguns dados podem estar indisponiveis no momento. Tente recarregar a pagina.
        </div>
      )}

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Ola, {displayName}!</h1>
        <p className="mt-1 text-muted-foreground">
          {role === "client" && "Gerencie seus projetos e propostas recebidas."}
          {role === "vibecoder" && "Encontre missoes e acompanhe suas propostas."}
          {role !== "client" && role !== "vibecoder" && "Aqui esta um resumo da sua atividade na Automatrix."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] ?? Zap
          return (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        )})}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CLIENT: My Projects */}
        {role === "client" && (
          <>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Meus Projetos</h2>
                <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">Ver todos</Link>
              </div>
              {clientProjects && clientProjects.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {clientProjects.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm font-medium text-foreground truncate">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {statusLabels[p.status] ?? p.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.bid_count} prop.</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum projeto ainda.</p>
                  <Link href="/dashboard/projects/new" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Criar projeto
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Propostas Recentes</h2>
              {receivedBids && receivedBids.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {receivedBids.slice(0, 5).map((b) => (
                    <Link
                      key={b.id}
                      href={`/projects/${b.project_id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{b.vibecoder_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{b.project_title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-foreground">R${b.amount.toLocaleString()}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {statusLabels[b.status] ?? b.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma proposta recebida ainda.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* VIBECODER: My Bids + Recommended */}
        {role === "vibecoder" && (
          <>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Minhas Propostas</h2>
                <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">Ver todas</Link>
              </div>
              {myBids && myBids.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {myBids.slice(0, 5).map((b) => (
                    <Link
                      key={b.id}
                      href={`/projects/${b.project_id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{b.project_title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-foreground">R${b.amount.toLocaleString()}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {statusLabels[b.status] ?? b.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma proposta enviada.</p>
                  <Link href="/projects" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                    Explorar Mission Board
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Missoes Recomendadas</h2>
              {recommendedProjects && recommendedProjects.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recommendedProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                          {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                        </div>
                      </div>
                      {p.budget_max && (
                        <span className="shrink-0 text-sm text-muted-foreground">ate R${p.budget_max.toLocaleString()}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma missao disponivel no momento.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* LEARNER: Quick Actions + Recent Activity */}
        {role !== "client" && role !== "vibecoder" && (
          <>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Explorar Workflows", href: "/workflows", icon: Zap },
                  { label: "Mission Board", href: "/projects", icon: FolderKanban },
                  { label: "Mensagens", href: "/chat", icon: MessageSquare },
                ].map((action) => (
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

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Atividade Recente</h2>
              {recentDownloads && recentDownloads.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentDownloads.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Download className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">
                          Baixou <span className="font-medium">{item.name}</span>
                        </p>
                        {item.downloaded_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.downloaded_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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
          </>
        )}
      </div>
    </div>
  )
}
