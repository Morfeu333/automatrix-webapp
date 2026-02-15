"use client"

import Link from "next/link"
import { useState } from "react"
import { Plus, Users, List, LayoutGrid } from "lucide-react"
import { StatusBadge } from "@/components/agency/status-badge"
import type { AgencyClientStatus } from "@/types"

const KANBAN_COLUMNS: AgencyClientStatus[] = [
  "Pre-Onboarding",
  "Onboarding Call",
  "Audit Process",
  "Kick Off Call",
  "Start Implementation",
  "End Implementation",
  "Train Team",
  "Optimisation",
  "Full Launch",
  "Monthly Optimisation",
]

interface ClientRow {
  id: string
  name: string
  client_status: string
  plan: string[]
  assigned_to: string | null
  country: string[]
  industry: string[]
  monthly_retainer: number | null
  created_at: string
  updated_at: string
}

export function ClientsKanban({ clients }: { clients: ClientRow[] }) {
  const [view, setView] = useState<"kanban" | "list">("kanban")

  const groupedByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = clients.filter((c) => c.client_status === status)
    return acc
  }, {} as Record<string, ClientRow[]>)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clients.length} clientes no total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("kanban")}
            className={`rounded-lg p-2 ${view === "kanban" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg p-2 ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => {
            const columnClients = groupedByStatus[status] ?? []
            return (
              <div key={status} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} variant="client" />
                    <span className="text-xs text-muted-foreground">{columnClients.length}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {columnClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
                    >
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      {client.plan.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {client.plan.map((p) => (
                            <span key={p} className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                      {client.monthly_retainer && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          ${client.monthly_retainer.toLocaleString()}/mo
                        </p>
                      )}
                    </Link>
                  ))}
                  {columnClients.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Retainer</th>
                <th className="px-4 py-3">Pais</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/clients/${client.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={client.client_status} variant="client" />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.plan.join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.monthly_retainer ? `$${client.monthly_retainer.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.country.join(", ") || "-"}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum cliente ainda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
