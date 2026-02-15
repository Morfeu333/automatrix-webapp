"use client"

import Link from "next/link"
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { StatusBadge } from "@/components/agency/status-badge"

interface ClientData {
  id: string
  name: string
  client_status: string
  project_scope: Record<string, unknown> | null
  comms_channel: string[]
  website: string | null
}

interface TimelinePhase {
  id: string
  name: string
  status: string
  description: string | null
  due_date: string | null
  assigned_to: string | null
  notes: string | null
  sort_order: number
}

interface LoginCred {
  id: string
  software_name: string
  email: string | null
  password_encrypted: string | null
}

export function ClientPortal({
  client,
  timeline,
  creds,
}: {
  client: ClientData
  timeline: TimelinePhase[]
  creds: LoginCred[]
}) {
  const scope = client.project_scope ?? {}

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/clients/${client.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Cliente
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{client.name} - Portal</h1>
        <StatusBadge status={client.client_status} variant="client" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stack Tecnologica / Project Scope */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Stack Tecnologica</h3>
          <dl className="flex flex-col gap-3">
            {[
              { label: "Projeto", value: scope.project_name },
              { label: "Frontend", value: scope.frontend },
              { label: "Backend", value: scope.backend },
              { label: "Database", value: scope.database },
              { label: "Plataforma", value: scope.platform },
              { label: "Timeline", value: scope.timeline },
              { label: "Budget", value: scope.budget },
            ].filter((item): item is { label: string; value: unknown } => !!item.value).map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="text-sm text-foreground">{String(item.value)}</dd>
              </div>
            ))}
            {Array.isArray(scope.llms) && scope.llms.length > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground">LLMs</dt>
                <dd className="flex flex-wrap gap-1">
                  {scope.llms.map((llm) => (
                    <span key={String(llm)} className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{String(llm)}</span>
                  ))}
                </dd>
              </div>
            )}
            {Array.isArray(scope.integrations) && scope.integrations.length > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground">Integracoes</dt>
                <dd className="flex flex-wrap gap-1">
                  {scope.integrations.map((item) => (
                    <span key={String(item)} className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400">{String(item)}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Software Access */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Acesso a Softwares</h3>
          {creds.length > 0 ? (
            <div className="flex flex-col gap-2">
              {creds.map((cred) => (
                <CredRow key={cred.id} cred={cred} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma credencial cadastrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Build Timeline */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Timeline do Projeto</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {timeline.map((phase, i) => {
            const completedCount = timeline.filter((p) => p.status === "Complete").length
            return (
              <div
                key={phase.id}
                className={`w-48 shrink-0 rounded-lg border p-4 ${
                  phase.status === "Complete"
                    ? "border-green-500/30 bg-green-500/5"
                    : phase.status === "In Progress"
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-border"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Fase {phase.sort_order}</span>
                  <StatusBadge status={phase.status} variant="phase" />
                </div>
                <p className="text-sm font-medium text-foreground">{phase.name}</p>
                {phase.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{phase.description}</p>
                )}
                {phase.due_date && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Prazo: {new Date(phase.due_date).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        {timeline.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{timeline.filter((p) => p.status === "Complete").length}/{timeline.length} fases</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${(timeline.filter((p) => p.status === "Complete").length / timeline.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CredRow({ cred }: { cred: LoginCred }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{cred.software_name}</p>
        {cred.email && <p className="text-xs text-muted-foreground">{cred.email}</p>}
      </div>
      {cred.password_encrypted && (
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <>
              <EyeOff className="h-3 w-3" />
              <span className="font-mono">{cred.password_encrypted}</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span>Mostrar senha</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
