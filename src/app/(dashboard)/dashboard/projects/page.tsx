import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ProjectsDashboardClient } from "./projects-dashboard-client"

export const metadata: Metadata = {
  title: "Meus Projetos - Automatrix",
  description: "Gerencie seus projetos e propostas na Automatrix.",
}

export default async function MyProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role ?? "learner"

  if (role === "client" || role === "admin") {
    // Fetch client's own projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, description, status, category, budget_min, budget_max, deadline, bid_count, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    return <ProjectsDashboardClient role="client" projects={projects ?? []} bids={[]} />
  }

  if (role === "vibecoder") {
    // Fetch vibecoder record
    const { data: vibecoder } = await supabase
      .from("vibecoders")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!vibecoder) {
      return <ProjectsDashboardClient role="vibecoder" projects={[]} bids={[]} />
    }

    // Fetch vibecoder's bids with project info
    const { data: bids } = await supabase
      .from("bids")
      .select("id, amount, estimated_days, status, created_at, project_id, projects(id, title, status, category, deadline)")
      .eq("vibecoder_id", vibecoder.id)
      .order("created_at", { ascending: false })

    // Fetch assigned projects
    const { data: assignedProjects } = await supabase
      .from("projects")
      .select("id, title, description, status, category, budget_min, budget_max, deadline, bid_count, created_at")
      .eq("assigned_vibecoder_id", vibecoder.id)
      .order("created_at", { ascending: false })

    return <ProjectsDashboardClient role="vibecoder" projects={assignedProjects ?? []} bids={bids ?? []} />
  }

  // Learner — no projects
  return <ProjectsDashboardClient role="learner" projects={[]} bids={[]} />
}
