"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Filter, Download, Grid3X3, List, Zap, ChevronLeft, ChevronRight } from "lucide-react"

interface WorkflowRow {
  id: string
  filename: string
  slug: string
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

interface WorkflowsClientProps {
  workflows: WorkflowRow[]
  categories: string[]
  triggerTypes: string[]
  totalCount: number
  currentPage: number
  totalPages: number
  currentQuery: string
  currentCategory: string
  currentComplexity: string
  currentTrigger: string
}

export function WorkflowsClient({
  workflows,
  categories,
  triggerTypes,
  totalCount,
  currentPage,
  totalPages,
  currentQuery,
  currentCategory,
  currentComplexity,
  currentTrigger,
}: WorkflowsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentQuery)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(
    currentCategory !== "All" || currentComplexity !== "All" || currentTrigger !== "All"
  )

  // Build URL with params
  const buildUrl = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    const values = {
      q: currentQuery,
      category: currentCategory,
      complexity: currentComplexity,
      trigger: currentTrigger,
      page: String(currentPage),
      ...overrides,
    }
    for (const [key, value] of Object.entries(values)) {
      if (value && value !== "All" && value !== "1" && !(key === "q" && !value)) {
        params.set(key, value)
      }
    }
    const qs = params.toString()
    return `/workflows${qs ? `?${qs}` : ""}`
  }, [currentQuery, currentCategory, currentComplexity, currentTrigger, currentPage])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== currentQuery) {
        router.push(buildUrl({ q: search, page: "1" }))
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search, currentQuery, router, buildUrl])

  function handleFilterChange(key: string, value: string) {
    router.push(buildUrl({ [key]: value, page: "1" }))
  }

  function handlePageChange(newPage: number) {
    router.push(buildUrl({ page: String(newPage) }))
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Workflow Templates</h1>
          <p className="mt-2 text-muted-foreground">
            Explore {totalCount.toLocaleString()} automacoes N8N gratuitas. Baixe, importe e comece a automatizar.
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
              placeholder="Buscar workflows (ex: slack, gmail, webhook)..."
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
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Categoria</label>
                <select
                  value={currentCategory}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Complexidade</label>
                <select
                  value={currentComplexity}
                  onChange={(e) => handleFilterChange("complexity", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {complexityLevels.map((c) => <option key={c} value={c}>{c === "All" ? "Todas" : c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Tipo de Trigger</label>
                <select
                  value={currentTrigger}
                  onChange={(e) => handleFilterChange("trigger", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {triggerTypes.map((t) => <option key={t} value={t}>{t === "All" ? "Todos" : t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} workflows encontrados
            {currentQuery && <span className="ml-1">para &quot;{currentQuery}&quot;</span>}
          </span>
          {totalPages > 1 && (
            <span className="text-sm text-muted-foreground">
              Pagina {currentPage} de {totalPages}
            </span>
          )}
        </div>

        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.slug}`} className={`group rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md ${viewMode === "list" ? "flex items-center gap-4 p-4" : "block p-5"}`}>
              <div className={viewMode === "list" ? "flex-1" : ""}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary">{workflow.name}</h3>
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

              <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground md:mt-3 md:w-auto">
                <Download className="h-3.5 w-3.5" />
                Ver Detalhes
              </div>
            </Link>
          ))}
        </div>

        {workflows.length === 0 && (
          <div className="py-16 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Nenhum workflow encontrado.</p>
            {currentQuery && (
              <button
                onClick={() => { setSearch(""); router.push("/workflows") }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (currentPage <= 4) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = currentPage - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proximo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
