"use client"

import type { ProjectScope } from "@/types"
import {
  Layers,
  FolderOpen,
  Monitor,
  Server,
  Database as DatabaseIcon,
  Globe,
  Cpu,
  Plug,
  Clock,
  DollarSign,
  Lock,
  Network,
  Rocket,
} from "lucide-react"

interface ClientPortalPreviewProps {
  scope: ProjectScope
  isComplete?: boolean
}

const DEFAULT_PHASES = [
  "Descoberta",
  "Planejamento",
  "Design",
  "Desenvolvimento",
  "Integracao",
  "Testes",
  "Lancamento",
]

const stackFields = [
  { key: "project_name", label: "Projeto", icon: FolderOpen },
  { key: "frontend", label: "Frontend", icon: Monitor },
  { key: "backend", label: "Backend", icon: Server },
  { key: "database", label: "Database", icon: DatabaseIcon },
  { key: "platform", label: "Plataforma", icon: Globe },
  { key: "timeline", label: "Prazo", icon: Clock },
  { key: "budget", label: "Orcamento", icon: DollarSign },
] as const

const appLevelLabels: Record<string, { label: string; dots: number }> = {
  lv1: { label: "Simples", dots: 1 },
  lv2: { label: "Medio", dots: 2 },
  lv3: { label: "Complexo", dots: 3 },
}

export function ClientPortalPreview({ scope, isComplete }: ClientPortalPreviewProps) {
  const hasAnyField = Object.values(scope).some(
    (v) => v !== undefined && v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)
  )

  const levelInfo = scope.app_level ? appLevelLabels[scope.app_level] : null

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-background p-6">
      {/* Top Row: Stack + Architecture */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Stack Tecnologica */}
        <div className="rounded-xl border border-emerald-500/20 bg-[#0a0a0a] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Stack Tecnologica
              </span>
            </div>
            {levelInfo && (
              <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < levelInfo.dots ? "bg-emerald-400" : "bg-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-emerald-400">{levelInfo.label}</span>
              </div>
            )}
          </div>

          <div className="divide-y divide-neutral-800/60">
            {stackFields.map((row) => {
              const value = scope[row.key as keyof ProjectScope]
              const hasValue =
                value !== undefined && value !== null && value !== "" &&
                (!Array.isArray(value) || value.length > 0)

              if (!hasValue && isComplete) return null

              const Icon = row.icon
              return (
                <div key={row.key} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex shrink-0 items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs text-neutral-500">{row.label}</span>
                  </div>
                  <div className="min-w-0 text-right">
                    {hasValue ? (
                      <span className="text-sm font-medium text-neutral-200">{String(value)}</span>
                    ) : (
                      <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
                    )}
                  </div>
                </div>
              )
            })}

            {/* LLMs */}
            {(Array.isArray(scope.llms) && scope.llms.length > 0) ? (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex shrink-0 items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500">LLMs</span>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {scope.llms.map((llm) => (
                    <span key={llm} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      {llm}
                    </span>
                  ))}
                </div>
              </div>
            ) : !isComplete ? (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex shrink-0 items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500">LLMs</span>
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
              </div>
            ) : null}

            {/* Integrations */}
            {(Array.isArray(scope.integrations) && scope.integrations.length > 0) ? (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex shrink-0 items-center gap-2">
                  <Plug className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500">Integracoes</span>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {scope.integrations.map((item) => (
                    <span key={item} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : !isComplete ? (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex shrink-0 items-center gap-2">
                  <Plug className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500">Integracoes</span>
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
              </div>
            ) : null}
          </div>
        </div>

        {/* System Architecture */}
        <div className="rounded-xl border border-border bg-[#0a0a0a] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Arquitetura
            </span>
          </div>
          {hasAnyField ? (
            <div className="flex flex-col items-center gap-3 py-4">
              {/* Simple architecture diagram */}
              <div className="flex items-center gap-2">
                {scope.frontend && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                    {scope.frontend}
                  </div>
                )}
                {scope.frontend && scope.backend && (
                  <div className="h-px w-6 bg-neutral-600" />
                )}
                {scope.backend && (
                  <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400">
                    {scope.backend}
                  </div>
                )}
                {scope.backend && scope.database && (
                  <div className="h-px w-6 bg-neutral-600" />
                )}
                {scope.database && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                    {scope.database}
                  </div>
                )}
              </div>

              {/* LLMs row */}
              {Array.isArray(scope.llms) && scope.llms.length > 0 && (
                <>
                  <div className="h-4 w-px bg-neutral-600" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {scope.llms.map((llm) => (
                      <div key={llm} className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400">
                        {llm}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Integrations row */}
              {Array.isArray(scope.integrations) && scope.integrations.length > 0 && (
                <>
                  <div className="h-4 w-px bg-neutral-600" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {scope.integrations.map((item) => (
                      <div key={item} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400">
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Network className="h-8 w-8 text-neutral-700" />
              <p className="text-xs text-neutral-600">Diagrama sera gerado conforme o escopo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Software Access */}
      <div className="rounded-xl border border-border bg-[#0a0a0a] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Acesso a Softwares
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {isComplete ? (
            <p className="py-3 text-center text-xs text-neutral-600">
              Credenciais serao adicionadas apos ativacao do projeto.
            </p>
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2.5">
                <div className="flex flex-col gap-1">
                  <div className={`h-3 rounded bg-neutral-800 ${i === 1 ? "w-24" : i === 2 ? "w-20" : "w-28"} animate-pulse`} />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-neutral-800/50" />
                </div>
                <div className="h-3 w-3 rounded-full bg-neutral-800 animate-pulse" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Launch Timeline */}
      <div className="rounded-xl border border-border bg-[#0a0a0a] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Timeline do Projeto
            </span>
          </div>
          {isComplete && (
            <span className="text-[10px] text-neutral-500">0/7 fases</span>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {DEFAULT_PHASES.map((phase, i) => (
            <div
              key={phase}
              className={`w-28 shrink-0 rounded-lg border p-3 ${
                isComplete
                  ? "border-neutral-800 bg-neutral-900"
                  : "border-neutral-800/50 bg-neutral-900/50"
              }`}
            >
              <span className="text-[10px] font-bold text-neutral-600">Fase {i + 1}</span>
              <p className={`mt-1 text-xs font-medium ${isComplete ? "text-neutral-400" : "text-neutral-500"}`}>
                {phase}
              </p>
              <div className="mt-2">
                {isComplete ? (
                  <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-500">
                    Pendente
                  </span>
                ) : (
                  <div className="h-3 w-12 animate-pulse rounded bg-neutral-800/50" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-neutral-600">
            <span>Progresso</span>
            <span>0%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-800">
            <div className="h-1.5 w-0 rounded-full bg-emerald-500 transition-all" />
          </div>
        </div>
      </div>

      {/* Complete indicator */}
      {isComplete && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Escopo definido — Portal pronto</span>
        </div>
      )}
    </div>
  )
}
