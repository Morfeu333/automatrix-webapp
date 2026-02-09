"use client"

import Link from "next/link"
import { useState } from "react"
import { Plus, FolderKanban, Clock, DollarSign, Users } from "lucide-react"

interface ProjectRow {
  id: string
  title: string
  description?: string | null
  status: string
  category?: string | null
  budget_min?: number | null
  budget_max?: number | null
  deadline?: string | null
  bid_count?: number
  created_at: string
}

interface BidRow {
  id: string
  amount: number
  estimated_days: number | null
  status: string
  created_at: string
  project_id: string
  projects: {
    id: string
    title: string
    status: string
    category: string | null
    deadline: string | null
  } | null
}

interface Props {
  role: "client" | "vibecoder" | "learner"
  projects: ProjectRow[]
  bids: BidRow[]
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  open: "Aberto",
  pending_payment: "Pagamento",
  matching: "Matching",
  assigned: "Atribuido",
  in_progress: "Em Progresso",
  review: "Revisao",
  completed: "Concluido",
  cancelled: "Cancelado",
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
}

const clientTabs = ["Todos", "Ativos", "Concluidos", "Rascunhos"]
const vibecoderTabs = ["Propostas", "Em Andamento", "Concluidos"]

export function ProjectsDashboardClient({ role, projects, bids }: Props) {
  const tabs = role === "vibecoder" ? vibecoderTabs : clientTabs
  const [activeTab, setActiveTab] = useState(tabs[0])

  // Client filtering
  const filteredProjects = role !== "vibecoder" ? projects.filter((p) => {
    if (activeTab === "Todos") return true
    if (activeTab === "Ativos") return ["open", "assigned", "in_progress", "review"].includes(p.status)
    if (activeTab === "Concluidos") return p.status === "completed"
    if (activeTab === "Rascunhos") return p.status === "draft"
    return true
  }) : projects

  // Vibecoder filtering
  const filteredBids = role === "vibecoder" ? bids.filter((b) => {
    if (activeTab === "Propostas") return true
    if (activeTab === "Em Andamento") return b.status === "accepted"
    if (activeTab === "Concluidos") return false // assigned projects shown below
    return true
  }) : []

  const filteredAssigned = role === "vibecoder" ? projects.filter((p) => {
    if (activeTab === "Em Andamento") return ["assigned", "in_progress", "review"].includes(p.status)
    if (activeTab === "Concluidos") return p.status === "completed"
    return false
  }) : []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {role === "vibecoder" ? "Meus Trabalhos" : "Meus Projetos"}
        </h1>
        {role !== "vibecoder" && (
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Client projects */}
      {role !== "vibecoder" && (
        <div className="flex flex-col gap-3">
          {filteredProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">{p.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[p.status] ?? p.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  {p.category && <span>{p.category}</span>}
                  {(p.budget_min || p.budget_max) && (
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3" />
                      R${(p.budget_min ?? 0).toLocaleString()} - R${(p.budget_max ?? 0).toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    {p.bid_count ?? 0} propostas
                  </span>
                  {p.deadline && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(p.deadline).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                {projects.length === 0
                  ? "Voce ainda nao criou nenhum projeto."
                  : "Nenhum projeto nesta categoria."}
              </p>
              {projects.length === 0 && (
                <Link
                  href="/dashboard/projects/new"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-automatrix-dark"
                >
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Projeto
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vibecoder bids */}
      {role === "vibecoder" && activeTab === "Propostas" && (
        <div className="flex flex-col gap-3">
          {filteredBids.map((b) => {
            const proj = b.projects as BidRow["projects"]
            return (
              <Link
                key={b.id}
                href={`/projects/${b.project_id}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                      {proj?.title ?? "Projeto"}
                    </h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">R${b.amount.toLocaleString()}</span>
                    {b.estimated_days && <span>{b.estimated_days} dias</span>}
                    {proj?.category && <span>{proj.category}</span>}
                    <span>{new Date(b.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </Link>
            )
          })}

          {filteredBids.length === 0 && (
            <div className="py-12 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Voce ainda nao enviou nenhuma proposta.</p>
              <Link
                href="/projects"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Explorar Mission Board
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Vibecoder assigned projects */}
      {role === "vibecoder" && (activeTab === "Em Andamento" || activeTab === "Concluidos") && (
        <div className="flex flex-col gap-3">
          {[...filteredAssigned, ...(activeTab === "Em Andamento" ? filteredBids : [])].map((item) => {
            const isProject = "title" in item
            return (
              <Link
                key={item.id}
                href={`/projects/${"project_id" in item ? item.project_id : item.id}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                    {isProject ? (item as ProjectRow).title : ((item as BidRow).projects?.title ?? "Projeto")}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}

          {filteredAssigned.length === 0 && filteredBids.length === 0 && (
            <div className="py-12 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhum projeto nesta categoria.</p>
            </div>
          )}
        </div>
      )}

      {/* Learner empty state */}
      {role === "learner" && (
        <div className="py-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            Explore o Mission Board para encontrar projetos interessantes.
          </p>
          <Link
            href="/projects"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Ver Mission Board
          </Link>
        </div>
      )}
    </div>
  )
}
