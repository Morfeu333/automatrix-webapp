"use client"

import { Target, ExternalLink } from "lucide-react"

interface AudienceRow {
  id: string
  audience_name: string
  date: string | null
  geo: string | null
  company_keywords_broad: string | null
  titles_broad: string | null
  links: string | null
  gpt_url: string | null
  client_id: string | null
  client_name: string | null
  created_at: string
}

export function AudiencesClient({ audiences }: { audiences: AudienceRow[] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audiences</h1>
        <p className="mt-1 text-sm text-muted-foreground">{audiences.length} audiences</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Geo</th>
              <th className="px-4 py-3">Keywords</th>
              <th className="px-4 py-3">Titulos</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">GPT</th>
            </tr>
          </thead>
          <tbody>
            {audiences.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{a.audience_name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{a.geo ?? "-"}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">{a.company_keywords_broad ?? "-"}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">{a.titles_broad ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{a.client_name ?? "-"}</td>
                <td className="px-4 py-3">
                  {a.gpt_url ? (
                    <a href={a.gpt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {audiences.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma audience.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
