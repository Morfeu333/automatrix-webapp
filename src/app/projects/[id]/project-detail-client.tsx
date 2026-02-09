"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft, DollarSign, Clock, Users, Calendar, Layers,
  CheckCircle2, Circle, Send, ThumbsUp, ThumbsDown, User,
  Briefcase, GitBranch, ExternalLink
} from "lucide-react"
import { submitBid, updateBidStatus } from "@/app/(dashboard)/actions"

interface BidWithProfile {
  id: string
  project_id: string
  vibecoder_id: string
  amount: number
  proposal: string | null
  estimated_days: number | null
  match_score: number | null
  status: string
  created_at: string
  vibecoder: {
    id: string
    user_id: string
    skills: unknown
    tools: string[] | null
    frameworks: string[] | null
    hourly_rate: number | null
    github_url: string | null
    approval_status: string
  } | null
  profile: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface Props {
  project: {
    id: string
    client_id: string
    title: string
    description: string | null
    project_type: string | null
    app_level: string | null
    status: string
    category: string | null
    required_skills: string[] | null
    budget_min: number | null
    budget_max: number | null
    deadline: string | null
    estimated_duration: string | null
    bid_count: number
    created_at: string
  }
  clientProfile: {
    full_name: string | null
    avatar_url: string | null
    company: string | null
  } | null
  milestones: Array<{
    id: string
    title: string
    description: string | null
    position: number
    completed: boolean
    completed_at: string | null
  }>
  bids: BidWithProfile[]
  isOwner: boolean
  isAuthenticated: boolean
  isApprovedVibecoder: boolean
  userExistingBid: BidWithProfile | null
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  pending_payment: "bg-yellow-100 text-yellow-700",
  matching: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  open: "Aberto",
  pending_payment: "Aguardando Pagamento",
  matching: "Matching",
  assigned: "Atribuido",
  in_progress: "Em Progresso",
  review: "Em Revisao",
  completed: "Concluido",
  cancelled: "Cancelado",
}

const bidStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-700",
}

const bidStatusLabels: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
}

export function ProjectDetailClient({
  project, clientProfile, milestones, bids,
  isOwner, isAuthenticated, isApprovedVibecoder, userExistingBid,
}: Props) {
  const router = useRouter()
  const [bidLoading, setBidLoading] = useState(false)
  const [bidError, setBidError] = useState("")
  const [bidSuccess, setBidSuccess] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleBidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBidLoading(true)
    setBidError("")
    const form = new FormData(e.currentTarget)
    form.set("project_id", project.id)
    const result = await submitBid(form)
    setBidLoading(false)
    if (result?.error) {
      setBidError(result.error)
    } else {
      setBidSuccess(true)
      router.refresh()
    }
  }

  async function handleBidAction(bidId: string, status: "accepted" | "rejected") {
    setActionLoading(bidId)
    const result = await updateBidStatus(bidId, status)
    setActionLoading(null)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Back link */}
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Mission Board
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {statusLabels[project.status] ?? project.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                {project.project_type && (
                  <span className="rounded border border-border px-2 py-0.5 text-xs">
                    {project.project_type === "workflow_install" ? "Instalacao de Workflow" : "App Customizado"}
                  </span>
                )}
                {project.app_level && (
                  <span className="rounded border border-border px-2 py-0.5 text-xs uppercase">
                    {project.app_level}
                  </span>
                )}
                {project.category && (
                  <span className="rounded border border-border px-2 py-0.5 text-xs">
                    {project.category}
                  </span>
                )}
              </div>
            </div>

            {/* Client info */}
            {clientProfile && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{clientProfile.full_name ?? "Cliente"}</p>
                  {clientProfile.company && (
                    <p className="text-xs text-muted-foreground">{clientProfile.company}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Descricao</h2>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{project.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Orcamento</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {project.budget_min || project.budget_max
                ? `R$${(project.budget_min ?? 0).toLocaleString()} - R$${(project.budget_max ?? 0).toLocaleString()}`
                : "A combinar"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Prazo</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString("pt-BR")
                : "Sem prazo"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Duracao</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {project.estimated_duration ?? "A definir"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Propostas</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{project.bid_count}</p>
          </div>
        </div>

        {/* Skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills Necessarias</h2>
            <div className="flex flex-wrap gap-2">
              {project.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})
            </h2>
            <div className="flex flex-col gap-3">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  {m.completed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${m.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bids Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Propostas ({bids.length})
          </h2>

          {/* Owner view: all bids with action buttons */}
          {isOwner && bids.length > 0 && (
            <div className="flex flex-col gap-4">
              {bids.map((bid) => (
                <div key={bid.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {bid.profile?.full_name ?? "Vibecoder"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {bid.vibecoder?.hourly_rate && (
                            <span>R${bid.vibecoder.hourly_rate}/h</span>
                          )}
                          {bid.vibecoder?.github_url && (
                            <a href={bid.vibecoder.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-primary hover:underline">
                              <GitBranch className="h-3 w-3" /> GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${bidStatusColors[bid.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {bidStatusLabels[bid.status] ?? bid.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="font-semibold text-foreground">R${bid.amount.toLocaleString()}</span>
                    {bid.estimated_days && (
                      <span className="text-muted-foreground">{bid.estimated_days} dias</span>
                    )}
                  </div>

                  {bid.proposal && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{bid.proposal}</p>
                  )}

                  {bid.vibecoder?.tools && bid.vibecoder.tools.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {bid.vibecoder.tools.slice(0, 5).map((tool) => (
                        <span key={tool} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {bid.status === "pending" && (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleBidAction(bid.id, "accepted")}
                        disabled={actionLoading === bid.id}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleBidAction(bid.id, "rejected")}
                        disabled={actionLoading === bid.id}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isOwner && bids.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma proposta recebida ainda.</p>
            </div>
          )}

          {/* Vibecoder: existing bid */}
          {!isOwner && userExistingBid && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">Sua Proposta</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${bidStatusColors[userExistingBid.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {bidStatusLabels[userExistingBid.status] ?? userExistingBid.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="font-semibold text-foreground">R${userExistingBid.amount.toLocaleString()}</span>
                {userExistingBid.estimated_days && (
                  <span className="text-muted-foreground">{userExistingBid.estimated_days} dias</span>
                )}
              </div>
              {userExistingBid.proposal && (
                <p className="mt-2 text-sm text-muted-foreground">{userExistingBid.proposal}</p>
              )}
            </div>
          )}

          {/* Vibecoder: bid form */}
          {!isOwner && isApprovedVibecoder && !userExistingBid && project.status === "open" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Enviar Proposta</h3>
              {bidSuccess ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-600">
                  Proposta enviada com sucesso!
                </div>
              ) : (
                <form onSubmit={handleBidSubmit} className="flex flex-col gap-4">
                  {bidError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
                      {bidError}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Valor (R$) *</label>
                      <input
                        type="number"
                        name="amount"
                        required
                        min="1"
                        step="0.01"
                        placeholder="5000"
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Prazo Estimado (dias)</label>
                      <input
                        type="number"
                        name="estimated_days"
                        min="1"
                        placeholder="14"
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Sua Proposta *</label>
                    <textarea
                      name="proposal"
                      required
                      rows={4}
                      placeholder="Descreva sua experiencia relevante e como voce abordaria este projeto..."
                      className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {bidLoading ? "Enviando..." : "Enviar Proposta"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Not authenticated */}
          {!isAuthenticated && project.status === "open" && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                Faca login para enviar uma proposta para este projeto.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-automatrix-dark"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>

        {/* Created at */}
        <p className="text-xs text-muted-foreground">
          Publicado em {new Date(project.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  )
}
