"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, CheckSquare, Phone, Calendar, ExternalLink } from "lucide-react"
import { StatusBadge } from "@/components/agency/status-badge"

interface ClientData {
  id: string
  name: string
  client_status: string
  plan: string[]
  assigned_to: string | null
  country: string[]
  industry: string[]
  website: string | null
  linkedin_page: string | null
  address: string | null
  notes: string | null
  monthly_retainer: number | null
  comms_channel: string[]
  created_at: string
}

interface TaskData {
  id: string
  name: string
  status: string
  type: string | null
  due_date: string | null
  notes: string | null
  person_id: string | null
}

interface ContactData {
  id: string
  name: string
  type: string[]
  email: string | null
  phone: string | null
  role_title: string | null
}

interface MeetingData {
  id: string
  name: string
  type: string | null
  date: string | null
  notes: string | null
  recording_url: string | null
}

interface TimelineData {
  id: string
  name: string
  status: string
  description: string | null
  due_date: string | null
  sort_order: number
}

const tabs = [
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "contacts", label: "Contatos", icon: Phone },
  { id: "meetings", label: "Reunioes", icon: Calendar },
] as const

type TabId = (typeof tabs)[number]["id"]

export function ClientDetail({
  client,
  tasks,
  contacts,
  meetings,
  timeline,
}: {
  client: ClientData
  tasks: TaskData[]
  contacts: ContactData[]
  meetings: MeetingData[]
  timeline: TimelineData[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>("company")

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/clients" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={client.client_status} variant="client" />
              {client.plan.map((p) => (
                <span key={p} className="rounded bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400">{p}</span>
              ))}
            </div>
          </div>
          <Link
            href={`/dashboard/clients/${client.id}/portal`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ver Portal
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "company" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Informacoes</h3>
            <dl className="flex flex-col gap-3">
              {[
                { label: "Pais", value: client.country.join(", ") },
                { label: "Industria", value: client.industry.join(", ") },
                { label: "Retainer Mensal", value: client.monthly_retainer ? `$${client.monthly_retainer.toLocaleString()}` : null },
                { label: "Canais", value: client.comms_channel.join(", ") },
                { label: "Endereco", value: client.address },
              ].map((item) => item.value && (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="text-sm text-foreground">{item.value}</dd>
                </div>
              ))}
              {client.website && (
                <div>
                  <dt className="text-xs text-muted-foreground">Website</dt>
                  <dd>
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      {client.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Notas</h3>
            {client.notes ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{client.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50">Nenhuma nota.</p>
            )}
          </div>

          {/* Timeline Preview */}
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Timeline do Projeto</h3>
              <Link href={`/dashboard/clients/${client.id}/portal`} className="text-xs text-primary hover:underline">
                Ver portal completo
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {timeline.map((phase) => (
                <div key={phase.id} className="w-40 shrink-0 rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-foreground">{phase.name}</p>
                  <StatusBadge status={phase.status} variant="phase" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{task.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} variant="task" /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{task.type ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "-"}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma task para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{contact.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.role_title ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.email ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.type.join(", ") || "-"}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum contato vinculado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "meetings" && (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Reuniao</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Gravacao</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{meeting.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{meeting.type ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {meeting.date ? new Date(meeting.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {meeting.recording_url ? (
                      <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Ver
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {meetings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma reuniao registrada.
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
