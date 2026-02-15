"use client"

import { GraduationCap, ExternalLink } from "lucide-react"

interface ResourceRow {
  id: string
  name: string
  video_url: string | null
  description: string | null
  category: string | null
  created_at: string
}

export function TrainingClient({ resources }: { resources: ResourceRow[] }) {
  const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Treinamento</h1>
        <p className="mt-1 text-sm text-muted-foreground">{resources.length} recursos</p>
      </div>

      {categories.length > 0 ? (
        categories.map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resources.filter((r) => r.category === cat).map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  {r.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                  {r.video_url && (
                    <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      Assistir <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : resources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">{r.name}</p>
              {r.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
              {r.video_url && (
                <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Assistir <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">Nenhum recurso de treinamento.</p>
        </div>
      )}
    </div>
  )
}
