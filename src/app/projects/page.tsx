import { createClient } from "@/lib/supabase/server"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, title, description, client_id, status, budget_min, budget_max, deadline, category, required_skills, bid_count, created_at, updated_at")
    .in("status", ["open", "in_progress", "review"])
    .order("created_at", { ascending: false })

  if (projectsError) console.error("Projects fetch error:", projectsError.message)

  return <ProjectsClient projects={projects ?? []} />
}
