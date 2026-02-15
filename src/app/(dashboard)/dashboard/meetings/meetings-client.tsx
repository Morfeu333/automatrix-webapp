"use client"

import { Calendar, ExternalLink } from "lucide-react"

interface MeetingRow {
  id: string
  name: string
  type: string | null
  date: string | null
  notes: string | null
  recording_url: string | null
  client_id: string | null
  client_name: string | null
  created_at: string
}

export function MeetingsClient({ meetings }: { meetings: MeetingRow[] }) {
  const upcoming = meetings.filter((m) => m.date && new Date(m.date) >= new Date())
  const past = meetings.filter((m) => !m.date || new Date(m.date) < new Date())

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reunioes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {upcoming.length} proximas &middot; {past.length} passadas
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Proximas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                {m.type && (
                  <span className="mt-1 inline-block rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{m.type}</span>
                )}
                {m.date && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(m.date).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
                {m.client_name && <p className="mt-1 text-xs text-muted-foreground">{m.client_name}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Reuniao</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Gravacao</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{m.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.type ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {m.date ? new Date(m.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.client_name ?? "-"}</td>
                <td className="px-4 py-3">
                  {m.recording_url ? (
                    <a href={m.recording_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      Ver <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma reuniao.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
