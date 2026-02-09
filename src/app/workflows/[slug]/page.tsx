import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Zap, Clock, Tag, Layers, GitBranch, Calendar } from "lucide-react"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: workflow } = await supabase
    .from("workflows")
    .select("name, description, category")
    .eq("slug", slug)
    .single()

  if (!workflow) return { title: "Workflow Not Found" }

  return {
    title: `${workflow.name} - Automatrix Workflows`,
    description: workflow.description ?? `${workflow.name} - N8N workflow template in ${workflow.category}`,
  }
}

export default async function WorkflowDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      notFound()
    }
    throw new Error(`Failed to load workflow: ${error.message}`)
  }
  if (!workflow) notFound()

  // Fetch related workflows (same category, exclude current)
  const { data: related } = await supabase
    .from("workflows")
    .select("id, slug, name, category, complexity, node_count, download_count")
    .eq("category", workflow.category)
    .neq("id", workflow.id)
    .eq("active", true)
    .order("download_count", { ascending: false })
    .limit(4)

  const complexityColor =
    workflow.complexity === "beginner" ? "bg-green-100 text-green-700" :
    workflow.complexity === "intermediate" ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700"

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Back link */}
        <Link
          href="/workflows"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Workflows
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{workflow.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                  {workflow.category}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${complexityColor}`}>
                  {workflow.complexity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mb-8">
          <a
            href={`/api/workflows/${workflow.id}/download`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
          >
            <Download className="h-4 w-4" />
            Download Workflow JSON
          </a>
          <span className="ml-3 text-sm text-muted-foreground">
            {workflow.download_count} downloads
          </span>
        </div>

        {/* Description */}
        {workflow.description && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Descricao</h2>
            <p className="text-sm leading-relaxed text-foreground">{workflow.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium">Nodes</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{workflow.node_count}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span className="text-xs font-medium">Trigger</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{workflow.trigger_type ?? "Manual"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span className="text-xs font-medium">Downloads</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{workflow.download_count}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Adicionado</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {new Date(workflow.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Integrations */}
        {workflow.integrations && workflow.integrations.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Integracoes</h2>
            <div className="flex flex-wrap gap-2">
              {workflow.integrations.map((integration: string) => (
                <span
                  key={integration}
                  className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {workflow.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Workflows */}
        {related && related.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Workflows Relacionados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((rw) => (
                <Link
                  key={rw.id}
                  href={`/workflows/${rw.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                        {rw.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{rw.complexity}</span>
                        <span>{rw.node_count} nodes</span>
                        <span>{rw.download_count} downloads</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
