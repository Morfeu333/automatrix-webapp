"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// ─── LEARNER ──────────────────────────────────────
export async function completeLearnerOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id)

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ─── CLIENT ───────────────────────────────────────
export async function completeClientOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nao autenticado" }

  const fullName = formData.get("full_name") as string
  const company = formData.get("company") as string
  const industry = formData.get("industry") as string
  const website = formData.get("website") as string

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || undefined,
      company: company || null,
      industry: industry || null,
      website: website || null,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath("/dashboard")
  return { success: true }
}

// Save AI chat session data
export async function saveOnboardingSession(conversationJson: string, sessionId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nao autenticado" }

  const conversation = JSON.parse(conversationJson)

  if (sessionId) {
    // Update existing session
    const { error } = await supabase
      .from("onboarding_sessions")
      .update({ conversation, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) return { error: error.message }
    return { data: sessionId }
  }

  // Create new session
  const { data, error } = await supabase
    .from("onboarding_sessions")
    .insert({ user_id: user.id, conversation, status: "in_progress" })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { data: data.id }
}

export async function completeOnboardingSession(sessionId: string, requirements: string, appLevel: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nao autenticado" }

  const { error } = await supabase
    .from("onboarding_sessions")
    .update({
      status: "completed",
      extracted_requirements: JSON.parse(requirements),
      app_level: appLevel as "lv1" | "lv2" | "lv3",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ─── VIBECODER ────────────────────────────────────
export async function completeVibecoderOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nao autenticado" }

  const fullName = formData.get("full_name") as string
  const bio = formData.get("bio") as string
  const company = formData.get("company") as string
  const website = formData.get("website") as string
  const githubUrl = formData.get("github_url") as string
  const portfolioUrlsRaw = formData.get("portfolio_urls") as string
  const videoUrl = formData.get("video_url") as string
  const resumeUrl = formData.get("resume_url") as string
  const skillsJson = formData.get("skills_json") as string
  const toolsRaw = formData.get("tools") as string
  const frameworksRaw = formData.get("frameworks") as string
  const hourlyRate = formData.get("hourly_rate") as string
  const hoursPerWeek = formData.get("hours_per_week") as string
  const timezone = formData.get("timezone") as string

  const portfolioUrls = portfolioUrlsRaw
    ? portfolioUrlsRaw.split(",").map((u) => u.trim()).filter(Boolean)
    : []
  const tools = toolsRaw ? toolsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const frameworks = frameworksRaw ? frameworksRaw.split(",").map((f) => f.trim()).filter(Boolean) : []

  let skills: Record<string, number> = {}
  try {
    skills = JSON.parse(skillsJson || "{}")
  } catch {
    // ignore parse errors
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || undefined,
      bio: bio || null,
      company: company || null,
      website: website || null,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) return { error: profileError.message }

  // Update vibecoders row
  const { error: vcError } = await supabase
    .from("vibecoders")
    .update({
      github_url: githubUrl || null,
      portfolio_urls: portfolioUrls,
      video_url: videoUrl || null,
      resume_url: resumeUrl || null,
      skills,
      tools,
      frameworks,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      hours_per_week: hoursPerWeek ? parseInt(hoursPerWeek) : null,
      timezone: timezone || null,
    })
    .eq("user_id", user.id)

  if (vcError) return { error: vcError.message }

  // Notify admins
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins && admins.length > 0) {
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: "vibecoder_registration",
      title: "Novo Desenvolvedor registrado",
      body: `${fullName || "Um desenvolvedor"} completou o onboarding e aguarda aprovacao.`,
      link: "/admin",
    }))
    await supabase.from("notifications").insert(notifications)
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// ─── FILE UPLOADS ─────────────────────────────────
export async function uploadResumeAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nao autenticado" }

  const file = formData.get("file") as File
  if (!file) return { error: "Nenhum arquivo selecionado" }
  if (file.size > 10 * 1024 * 1024) return { error: "Arquivo muito grande (max 10MB)" }
  if (file.type !== "application/pdf") return { error: "Apenas PDF e aceito" }

  const ext = file.name.split(".").pop() || "pdf"
  const filePath = `${user.id}/resume.${ext}`

  const { error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, { upsert: true })

  if (error) return { error: error.message }

  const { data: publicUrl } = supabase.storage.from("resumes").getPublicUrl(filePath)

  // Update vibecoders row
  await supabase
    .from("vibecoders")
    .update({ resume_url: publicUrl.publicUrl })
    .eq("user_id", user.id)

  return { url: publicUrl.publicUrl }
}
