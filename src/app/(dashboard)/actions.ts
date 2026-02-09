"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const project_type = formData.get("project_type") as string | null
  const app_level = formData.get("app_level") as string | null
  const category = formData.get("category") as string | null
  const skillsRaw = formData.get("required_skills") as string | null
  const budget_min = formData.get("budget_min") ? Number(formData.get("budget_min")) : null
  const budget_max = formData.get("budget_max") ? Number(formData.get("budget_max")) : null
  const deadline = formData.get("deadline") as string | null
  const estimated_duration = formData.get("estimated_duration") as string | null

  if (!title?.trim()) return { error: "Titulo e obrigatorio." }
  if (!description?.trim()) return { error: "Descricao e obrigatoria." }
  if (budget_min && budget_max && budget_min > budget_max) return { error: "Orcamento minimo nao pode ser maior que o maximo." }

  const required_skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const insertData: {
    client_id: string
    title: string
    description: string
    project_type?: "workflow_install" | "custom_app" | null
    app_level?: "lv1" | "lv2" | "lv3" | null
    status: "open"
    category?: string | null
    required_skills: string[]
    budget_min: number | null
    budget_max: number | null
    deadline?: string | null
    estimated_duration?: string | null
  } = {
    client_id: user.id,
    title: title.trim(),
    description: description.trim(),
    project_type: (project_type as "workflow_install" | "custom_app") || null,
    app_level: (app_level as "lv1" | "lv2" | "lv3") || null,
    status: "open",
    category: category?.trim() || null,
    required_skills,
    budget_min,
    budget_max,
    deadline: deadline || null,
    estimated_duration: estimated_duration?.trim() || null,
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(insertData)
    .select("id")
    .single()

  if (error) {
    console.error("Create project error:", error.message)
    return { error: "Erro ao criar projeto. Tente novamente." }
  }

  revalidatePath("/projects")
  revalidatePath("/dashboard")
  redirect(`/projects/${data.id}`)
}

export async function submitBid(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const project_id = formData.get("project_id") as string
  const amount = Number(formData.get("amount"))
  const estimated_days = formData.get("estimated_days") ? Number(formData.get("estimated_days")) : null
  const proposal = formData.get("proposal") as string | null

  if (!project_id) return { error: "Projeto invalido." }
  if (!amount || amount <= 0) return { error: "Valor da proposta e obrigatorio." }

  // Look up vibecoder record for current user
  const { data: vibecoder, error: vcError } = await supabase
    .from("vibecoders")
    .select("id, approval_status")
    .eq("user_id", user.id)
    .single()

  if (vcError || !vibecoder) {
    return { error: "Voce precisa ter um perfil de Vibecoder para enviar propostas." }
  }

  if (vibecoder.approval_status !== "approved") {
    return { error: "Seu perfil de Vibecoder precisa estar aprovado para enviar propostas." }
  }

  const { error } = await supabase
    .from("bids")
    .insert({
      project_id,
      vibecoder_id: vibecoder.id,
      amount,
      estimated_days,
      proposal: proposal?.trim() || null,
      status: "pending",
    })

  if (error) {
    if (error.code === "23505") {
      return { error: "Voce ja enviou uma proposta para este projeto." }
    }
    console.error("Submit bid error:", error.message)
    return { error: "Erro ao enviar proposta. Tente novamente." }
  }

  revalidatePath(`/projects/${project_id}`)
  revalidatePath("/dashboard")
  return { error: null }
}

export async function updateBidStatus(bidId: string, newStatus: "accepted" | "rejected") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  // Fetch bid with project to verify ownership
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .select("id, project_id, vibecoder_id, projects(client_id)")
    .eq("id", bidId)
    .single()

  if (bidError || !bid) return { error: "Proposta nao encontrada." }

  const project = bid.projects as { client_id: string } | null
  if (!project || project.client_id !== user.id) {
    return { error: "Voce nao tem permissao para gerenciar esta proposta." }
  }

  const { error: updateError } = await supabase
    .from("bids")
    .update({ status: newStatus })
    .eq("id", bidId)

  if (updateError) {
    console.error("Update bid status error:", updateError.message)
    return { error: "Erro ao atualizar proposta." }
  }

  // If accepting, assign vibecoder to project and update status
  if (newStatus === "accepted") {
    const { error: projectError } = await supabase
      .from("projects")
      .update({
        assigned_vibecoder_id: bid.vibecoder_id,
        status: "assigned",
      })
      .eq("id", bid.project_id)

    if (projectError) {
      console.error("Assign vibecoder error:", projectError.message)
    }

    // Reject all other pending bids for this project
    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("project_id", bid.project_id)
      .eq("status", "pending")
      .neq("id", bidId)
  }

  revalidatePath(`/projects/${bid.project_id}`)
  revalidatePath("/dashboard")
  return { error: null }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const full_name = formData.get("full_name") as string | null
  const bio = formData.get("bio") as string | null
  const company = formData.get("company") as string | null
  const website = formData.get("website") as string | null
  const industry = formData.get("industry") as string | null
  const skillsRaw = formData.get("skills") as string | null

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name?.trim() || null,
      bio: bio?.trim() || null,
      company: company?.trim() || null,
      website: website?.trim() || null,
      industry: industry?.trim() || null,
      skills,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Update profile error:", error.message)
    return { error: "Erro ao atualizar perfil." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  return { error: null }
}

export async function markNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Mark notifications read error:", error.message)
    return { error: "Erro ao marcar notificacoes como lidas." }
  }

  revalidatePath("/dashboard")
  return { error: null }
}

export async function updateVibecoderProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const github_url = formData.get("github_url") as string | null
  const portfolioRaw = formData.get("portfolio_urls") as string | null
  const toolsRaw = formData.get("tools") as string | null
  const frameworksRaw = formData.get("frameworks") as string | null
  const hourly_rate = formData.get("hourly_rate") ? Number(formData.get("hourly_rate")) : null
  const hours_per_week = formData.get("hours_per_week") ? Number(formData.get("hours_per_week")) : null
  const timezone = formData.get("timezone") as string | null

  const portfolio_urls = portfolioRaw
    ? portfolioRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const tools = toolsRaw
    ? toolsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const frameworks = frameworksRaw
    ? frameworksRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from("vibecoders")
    .update({
      github_url: github_url?.trim() || null,
      portfolio_urls,
      tools,
      frameworks,
      hourly_rate,
      hours_per_week,
      timezone: timezone?.trim() || null,
    })
    .eq("user_id", user.id)

  if (error) {
    console.error("Update vibecoder profile error:", error.message)
    return { error: "Erro ao atualizar perfil de Vibecoder." }
  }

  revalidatePath("/dashboard/settings")
  return { error: null }
}
