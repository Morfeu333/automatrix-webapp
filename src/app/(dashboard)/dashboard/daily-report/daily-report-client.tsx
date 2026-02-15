"use client"

import { FileText } from "lucide-react"

interface ReportRow {
  id: string
  name: string
  tags: string[]
  report_date: string
  created_by: string | null
  created_at: string
}

export function DailyReportClient({ reports }: { reports: ReportRow[] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Daily Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reports.length} relatorios</p>
      </div>

      {reports.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.report_date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.map((tag) => (
                    <span key={tag} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">Nenhum relatorio diario.</p>
        </div>
      )}
    </div>
  )
}
