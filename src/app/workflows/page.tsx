import { createClient } from "@/lib/supabase/server"
import { WorkflowsClient } from "./workflows-client"

export default async function WorkflowsPage() {
  const supabase = await createClient()

  const { data: workflows, error: workflowsError } = await supabase
    .from("workflows")
    .select("id, filename, name, description, category, trigger_type, complexity, node_count, integrations, tags, active, download_count, created_at")
    .eq("active", true)
    .order("download_count", { ascending: false })

  if (workflowsError) console.error("Workflows fetch error:", workflowsError.message)

  // Get unique categories from data
  const categories = ["All", ...new Set((workflows ?? []).map(w => w.category).filter(Boolean))]

  return <WorkflowsClient workflows={workflows ?? []} categories={categories} />
}
