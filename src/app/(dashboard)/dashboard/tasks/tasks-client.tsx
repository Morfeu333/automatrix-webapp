"use client"

import { useState } from "react"
import { CheckSquare, LayoutGrid, List, AlertTriangle } from "lucide-react"
import { StatusBadge } from "@/components/agency/status-badge"
import type { AgencyTaskStatus } from "@/types"

const TASK_COLUMNS: AgencyTaskStatus[] = ["BLOCKED", "Not Started", "In Progress", "Complete"]

interface TaskRow {
  id: string
  name: string
  status: string
  type: string | null
  due_date: string | null
  notes: string | null
  person_id: string | null
  client_id: string | null
  client_name: string | null
  is_overdue: boolean
  created_at: string
}

export function TasksClient({ tasks }: { tasks: TaskRow[] }) {
  const [view, setView] = useState<"kanban" | "list">("list")
  const [filter, setFilter] = useState<string>("all")

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length} tarefas total &middot; {tasks.filter((t) => t.is_overdue).length} atrasadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
          >
            <option value="all">Todos</option>
            {TASK_COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
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

      {view === "list" ? (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {task.is_overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                      <span className="text-sm font-medium text-foreground">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} variant="task" /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{task.type ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{task.client_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${task.is_overdue ? "font-medium text-red-500" : "text-muted-foreground"}`}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "-"}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma task encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TASK_COLUMNS.map((status) => {
            const columnTasks = filtered.filter((t) => t.status === status)
            return (
              <div key={status} className="w-72 shrink-0">
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge status={status} variant="task" />
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-start gap-2">
                        {task.is_overdue && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
                        <p className="text-sm font-medium text-foreground">{task.name}</p>
                      </div>
                      {task.client_name && <p className="mt-1 text-xs text-muted-foreground">{task.client_name}</p>}
                      {task.due_date && (
                        <p className={`mt-1 text-xs ${task.is_overdue ? "text-red-500" : "text-muted-foreground"}`}>
                          {new Date(task.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
