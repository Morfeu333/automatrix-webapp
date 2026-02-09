import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProjectDetailClient } from "./project-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from("projects")
    .select("title, description, category")
    .eq("id", id)
    .single()

  if (!project) return { title: "Projeto Nao Encontrado - Automatrix" }

  return {
    title: `${project.title} - Automatrix Projetos`,
    description: project.description ?? `Projeto ${project.title} na categoria ${project.category}`,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (projectError) {
    if (projectError.code === "PGRST116") notFound()
    throw new Error(`Failed to load project: ${projectError.message}`)
  }
  if (!project) notFound()

  // Fetch client profile
  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, company")
    .eq("id", project.client_id)
    .single()

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true })

  // Fetch bids with vibecoder info
  const { data: bids } = await supabase
    .from("bids")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  // For each bid, fetch vibecoder + profile
  const bidsWithProfiles = await Promise.all(
    (bids ?? []).map(async (bid) => {
      const { data: vibecoder } = await supabase
        .from("vibecoders")
        .select("id, user_id, skills, tools, frameworks, hourly_rate, github_url, approval_status")
        .eq("id", bid.vibecoder_id)
        .single()

      let profile = null
      if (vibecoder) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", vibecoder.user_id)
          .single()
        profile = p
      }

      return { ...bid, vibecoder, profile }
    })
  )

  // Check current user context
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === project.client_id

  let isApprovedVibecoder = false
  let userVibecoderId: string | null = null
  let userExistingBid = null

  if (user && !isOwner) {
    const { data: vc } = await supabase
      .from("vibecoders")
      .select("id, approval_status")
      .eq("user_id", user.id)
      .single()

    if (vc) {
      isApprovedVibecoder = vc.approval_status === "approved"
      userVibecoderId = vc.id
      userExistingBid = bidsWithProfiles.find((b) => b.vibecoder_id === vc.id) ?? null
    }
  }

  return (
    <ProjectDetailClient
      project={project}
      clientProfile={clientProfile}
      milestones={milestones ?? []}
      bids={bidsWithProfiles}
      isOwner={isOwner}
      isAuthenticated={!!user}
      isApprovedVibecoder={isApprovedVibecoder}
      userExistingBid={userExistingBid}
    />
  )
}
