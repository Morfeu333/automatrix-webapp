"use client"

import { Users, CheckSquare, Calendar, AlertTriangle, TrendingUp } from "lucide-react"

interface Stats {
  totalClients: number
  totalTasks: number
  completedTasks: number
  blockedTasks: number
  totalMeetings: number
}

export function AnalyticsClient({
  stats,
  clientsByStatus,
  tasksByStatus,
}: {
  stats: Stats
  clientsByStatus: Record<string, number>
  tasksByStatus: Record<string, number>
}) {
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visao geral da agencia</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Clientes", value: stats.totalClients, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Tasks", value: stats.totalTasks, icon: CheckSquare, color: "text-purple-500 bg-purple-500/10" },
          { label: "Concluidas", value: stats.completedTasks, icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
          { label: "Bloqueadas", value: stats.blockedTasks, icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
          { label: "Reunioes", value: stats.totalMeetings, icon: Calendar, color: "text-yellow-500 bg-yellow-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Taxa de Conclusao de Tasks</h3>
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 rounded-full bg-border">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-lg font-bold text-foreground">{completionRate}%</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clients by Status */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Clientes por Status</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(clientsByStatus)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm text-foreground">{status}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{count}</span>
                </div>
              ))}
            {Object.keys(clientsByStatus).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Sem dados.</p>
            )}
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Tasks por Status</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(tasksByStatus)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm text-foreground">{status}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{count}</span>
                </div>
              ))}
            {Object.keys(tasksByStatus).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Sem dados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
