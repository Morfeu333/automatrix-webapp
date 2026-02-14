"use client"

import type { ProjectScope } from "@/types"
import {
  Layers,
  FolderOpen,
  FileText,
  Monitor,
  Server,
  Database as DatabaseIcon,
  Globe,
  Cpu,
  Plug,
  Clock,
  DollarSign,
} from "lucide-react"

interface ProjectScopeCardProps {
  scope: ProjectScope
  isComplete?: boolean
}

const appLevelLabels: Record<string, { label: string; dots: number }> = {
  lv1: { label: "Simples", dots: 1 },
  lv2: { label: "Medio", dots: 2 },
  lv3: { label: "Complexo", dots: 3 },
}

const fieldRows = [
  { key: "project_name", label: "Projeto", icon: FolderOpen },
  { key: "description", label: "Descricao", icon: FileText },
  { key: "frontend", label: "Frontend", icon: Monitor },
  { key: "backend", label: "Backend", icon: Server },
  { key: "database", label: "Database", icon: DatabaseIcon },
  { key: "platform", label: "Plataforma", icon: Globe },
  { key: "llms", label: "LLMs", icon: Cpu, isArray: true },
  { key: "integrations", label: "Integracoes", icon: Plug, isArray: true },
  { key: "timeline", label: "Prazo", icon: Clock },
  { key: "budget", label: "Orcamento", icon: DollarSign },
] as const

export function ProjectScopeCard({ scope, isComplete }: ProjectScopeCardProps) {
  const hasAnyField = Object.values(scope).some(
    (v) => v !== undefined && v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)
  )

  if (!hasAnyField) return null

  const levelInfo = scope.app_level ? appLevelLabels[scope.app_level] : null

  return (
    <div className="w-full max-w-md rounded-2xl border border-emerald-500/20 bg-[#0a0a0a] p-5 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Stack Tecnologica
          </span>
        </div>
        {levelInfo && (
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
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
            <span className="text-[10px] font-medium text-emerald-400">
              {levelInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Field rows */}
      <div className="divide-y divide-neutral-800/60">
        {fieldRows.map((row) => {
          const value = scope[row.key as keyof ProjectScope]
          const hasValue =
            value !== undefined &&
            value !== null &&
            value !== "" &&
            (!Array.isArray(value) || value.length > 0)

          if (!hasValue && isComplete) return null

          const Icon = row.icon

          return (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              {/* Label */}
              <div className="flex shrink-0 items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-500">{row.label}</span>
              </div>

              {/* Value */}
              <div className="min-w-0 text-right">
                {hasValue ? (
                  "isArray" in row && row.isArray && Array.isArray(value) ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {(value as string[]).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 transition-all duration-500"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-medium text-neutral-200 transition-all duration-500 ${
                        row.key === "description" ? "line-clamp-2 text-xs text-neutral-400" : ""
                      }`}
                    >
                      {String(value)}
                    </span>
                  )
                ) : (
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Complete indicator */}
      {isComplete && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 py-2 border border-emerald-500/20">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            Escopo definido
          </span>
        </div>
      )}
    </div>
  )
}
