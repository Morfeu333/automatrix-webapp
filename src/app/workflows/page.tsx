import { createClient } from "@/lib/supabase/server"
import { WorkflowsClient } from "./workflows-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workflow Templates - Automatrix",
  description: "Explore 2,000+ automacoes N8N gratuitas. Baixe, importe e comece a automatizar.",
}

const PAGE_SIZE = 24

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkflowsPage({ searchParams }: Props) {
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q : ""
  const category = typeof params.category === "string" ? params.category : "All"
  const complexity = typeof params.complexity === "string" ? params.complexity : "All"
  const trigger = typeof params.trigger === "string" ? params.trigger : "All"
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1)

  const supabase = await createClient()

  // Build query
  let dbQuery = supabase
    .from("workflows")
    .select("id, filename, slug, name, description, category, trigger_type, complexity, node_count, integrations, tags, active, download_count, created_at", { count: "exact" })
    .eq("active", true)

  // Apply FTS search
  if (query) {
    dbQuery = dbQuery.textSearch("search_vector", query, { type: "websearch" })
  }

  // Apply filters
  if (category !== "All") {
    dbQuery = dbQuery.eq("category", category)
  }
  if (complexity !== "All") {
    dbQuery = dbQuery.eq("complexity", complexity as "beginner" | "intermediate" | "advanced")
  }
  if (trigger !== "All") {
    dbQuery = dbQuery.eq("trigger_type", trigger)
  }

  // Order and paginate
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  if (query) {
    // When searching, Supabase orders by relevance by default
    dbQuery = dbQuery.range(from, to)
  } else {
    dbQuery = dbQuery.order("download_count", { ascending: false }).range(from, to)
  }

  const { data: workflows, count, error: workflowsError } = await dbQuery

  if (workflowsError) console.error("Workflows fetch error:", workflowsError.message)

  // Fetch categories and trigger types for filters (separate lightweight queries)
  const { data: catRows } = await supabase
    .from("workflows")
    .select("category")
    .eq("active", true)
    .order("category")

  const categories = ["All", ...new Set((catRows ?? []).map(r => r.category).filter(Boolean))]

  const { data: triggerRows } = await supabase
    .from("workflows")
    .select("trigger_type")
    .eq("active", true)
    .not("trigger_type", "is", null)

  const triggerTypes = ["All", ...new Set((triggerRows ?? []).map(r => r.trigger_type).filter(Boolean) as string[])]

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <WorkflowsClient
      workflows={workflows ?? []}
      categories={categories}
      triggerTypes={triggerTypes}
      totalCount={count ?? 0}
      currentPage={page}
      totalPages={totalPages}
      currentQuery={query}
      currentCategory={category}
      currentComplexity={complexity}
      currentTrigger={trigger}
    />
  )
}
