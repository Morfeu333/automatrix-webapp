"use client"

import { useState } from "react"
import { Search, Filter, Download, Grid3X3, List, Zap } from "lucide-react"

interface WorkflowRow {
  id: string
  filename: string
  name: string
  description: string | null
  category: string
  trigger_type: string | null
  complexity: string
  node_count: number | null
  integrations: string[] | null
  tags: string[] | null
  active: boolean | null
  download_count: number | null
  created_at: string
}

const complexityLevels = ["All", "beginner", "intermediate", "advanced"]

export function WorkflowsClient({
  workflows,
  categories,
}: {
  workflows: WorkflowRow[]
  categories: string[]
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [complexity, setComplexity] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = workflows.filter((w) => {
    const matchesSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.description ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || w.category === category
    const matchesComplexity = complexity === "All" || w.complexity === complexity
    return matchesSearch && matchesCategory && matchesComplexity
  })

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Workflow Templates</h1>
          <p className="mt-2 text-muted-foreground">
            Explore {workflows.length.toLocaleString()}+ automacoes N8N gratuitas. Baixe, importe e comece a automatizar.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar workflows..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${showFilters ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-muted"}`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <div className="flex rounded-lg border border-border">
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Complexidade</label>
                <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  {complexityLevels.map((c) => <option key={c} value={c}>{c === "All" ? "Todas" : c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-muted-foreground">
          {filtered.length} workflows encontrados
        </div>

        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
          {filtered.map((workflow) => (
            <div key={workflow.id} className={`group rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md ${viewMode === "list" ? "flex items-center gap-4 p-4" : "p-5"}`}>
              <div className={viewMode === "list" ? "flex-1" : ""}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{workflow.name}</h3>
                      <span className="text-xs text-muted-foreground">{workflow.category}</span>
                    </div>
                  </div>
                </div>

                {viewMode === "grid" && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{workflow.description}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    workflow.complexity === "beginner" ? "bg-green-100 text-green-700" :
                    workflow.complexity === "intermediate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {workflow.complexity}
                  </span>
                  <span className="text-xs text-muted-foreground">{workflow.node_count} nodes</span>
                  <span className="text-xs text-muted-foreground">{workflow.download_count} downloads</span>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:mt-3 md:w-auto">
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Nenhum workflow encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
