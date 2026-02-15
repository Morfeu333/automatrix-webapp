"use client"

import Link from "next/link"
import {
  Users,
  CheckSquare,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Phone,
  Target,
  UserCog,
  GraduationCap,
  BarChart3,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { StatusBadge } from "@/components/agency/status-badge"

interface Stats {
  totalClients: number
  activeTasks: number
  overdueTasks: number
  upcomingMeetings: number
}

interface ClientRow {
  id: string
  name: string
  client_status: string
  plan: string[]
  assigned_to: string | null
  created_at: string
}

interface TaskRow {
  id: string
  name: string
  status: string
  type: string | null
  due_date: string | null
  client_id: string | null
  person_id: string | null
}

interface MeetingRow {
  id: string
  name: string
  type: string | null
  date: string | null
  client_id: string | null
}

interface DirectoryItem {
  name: string
  href: string
  icon: LucideIcon
  description: string
}

const directoryItems: DirectoryItem[] = [
  { name: "Clientes", href: "/dashboard/clients", icon: Users, description: "Kanban de clientes" },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, description: "Todas as tarefas" },
  { name: "Contatos", href: "/dashboard/contacts", icon: Phone, description: "Lista de contatos" },
  { name: "Reunioes", href: "/dashboard/meetings", icon: Calendar, description: "Agenda de reunioes" },
  { name: "Audiences", href: "/dashboard/audiences", icon: Target, description: "Segmentacao" },
  { name: "Equipe", href: "/dashboard/employees", icon: UserCog, description: "Membros da equipe" },
  { name: "Treinamento", href: "/dashboard/training", icon: GraduationCap, description: "Recursos" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, description: "Metricas" },
  { name: "Daily Report", href: "/dashboard/daily-report", icon: FileText, description: "Relatorio diario" },
]

export function AgencyHomeClient({
  displayName,
  stats,
  recentClients,
  pendingTasks,
  upcomingMeetings,
}: {
  displayName: string
  stats: Stats
  recentClients: ClientRow[]
  pendingTasks: TaskRow[]
  upcomingMeetings: MeetingRow[]
}) {
  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Ola, {displayName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aqui esta o resumo da sua agencia hoje.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Clientes", value: stats.totalClients, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Tasks Ativas", value: stats.activeTasks, icon: CheckSquare, color: "text-purple-500 bg-purple-500/10" },
          { label: "Atrasadas", value: stats.overdueTasks, icon: AlertTriangle, color: stats.overdueTasks > 0 ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10" },
          { label: "Proximas Reunioes", value: stats.upcomingMeetings, icon: Calendar, color: "text-yellow-500 bg-yellow-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Acesso Rapido</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {directoryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two columns: Tasks + Meetings/Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Tasks */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Tasks Pendentes</h2>
            <Link href="/dashboard/tasks" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {pendingTasks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{task.name}</p>
                    {task.due_date && (
                      <p className={`text-xs ${
                        new Date(task.due_date) < new Date() ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={task.status} variant="task" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma task pendente.</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Meetings */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Proximas Reunioes</h2>
              <Link href="/dashboard/meetings" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {upcomingMeetings.length > 0 ? (
              <div className="flex flex-col gap-2">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{meeting.name}</p>
                      {meeting.date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(meeting.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    {meeting.type && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                        {meeting.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Nenhuma reuniao agendada.</p>
              </div>
            )}
          </div>

          {/* Recent Clients */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Clientes Recentes</h2>
              <Link href="/dashboard/clients" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentClients.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent"
                  >
                    <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
                    <StatusBadge status={client.client_status} variant="client" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Nenhum cliente ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
