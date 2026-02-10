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
      // Revert bid status since project assignment failed
      await supabase.from("bids").update({ status: "pending" }).eq("id", bidId)
      return { error: "Proposta aceita, mas erro ao atribuir ao projeto. Tente novamente." }
    }

    // Reject all other pending bids for this project
    const { error: rejectError } = await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("project_id", bid.project_id)
      .eq("status", "pending")
      .neq("id", bidId)

    if (rejectError) {
      console.error("Bulk bid rejection error:", rejectError.message)
    }
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

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "Nenhum arquivo selecionado." }

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Formato invalido. Use JPG, PNG, WebP ou GIF." }
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "Imagem muito grande. Maximo 2MB." }
  }

  const ext = file.name.split(".").pop() || "jpg"
  const path = `${user.id}/avatar.${ext}`

  await supabase.storage.from("avatars").remove([
    `${user.id}/avatar.jpg`,
    `${user.id}/avatar.png`,
    `${user.id}/avatar.webp`,
    `${user.id}/avatar.gif`,
  ])

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error("Avatar upload error:", uploadError.message)
    return { error: "Erro ao fazer upload da imagem." }
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)

  if (updateError) {
    console.error("Profile avatar_url update error:", updateError.message)
    return { error: "Upload feito, mas erro ao salvar no perfil." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  return { url: avatarUrl, error: null }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const password = formData.get("password") as string
  const confirm = formData.get("confirm_password") as string

  if (!password || password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." }
  }
  if (password !== confirm) {
    return { error: "As senhas nao coincidem." }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    console.error("Change password error:", error.message)
    return { error: "Erro ao alterar senha. Tente novamente." }
  }

  return { error: null }
}

export async function updateVibecoderSkills(skillsJson: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  let skills: Record<string, number>
  try {
    skills = JSON.parse(skillsJson)
  } catch {
    return { error: "Dados de skills invalidos." }
  }

  const { error } = await supabase
    .from("vibecoders")
    .update({ skills })
    .eq("user_id", user.id)

  if (error) {
    console.error("Update vibecoder skills error:", error.message)
    return { error: "Erro ao salvar skills." }
  }

  revalidatePath("/dashboard/settings")
  return { error: null }
}

export async function markSingleNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Mark single notification read error:", error.message)
    return { error: "Erro ao marcar notificacao como lida." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/notifications")
  return { error: null }
}

export async function clearOldNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .eq("read", true)

  if (error) {
    console.error("Clear old notifications error:", error.message)
    return { error: "Erro ao limpar notificacoes." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/notifications")
  return { error: null }
}

// ── Chat Actions ──────────────────────────────────────────────────────

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Voce precisa estar logado." }

  // Get conversations where current user is a participant
  const { data: participations, error: pErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", user.id)

  if (pErr || !participations?.length) return { data: [], error: null }

  const conversationIds = participations.map((p) => p.conversation_id)

  const { data: conversations, error: cErr } = await supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  if (cErr) return { data: null, error: "Erro ao carregar conversas." }

  // For each conversation, get the other participant's profile + unread count
  const enriched = await Promise.all(
    (conversations ?? []).map(async (conv) => {
      const { data: members } = await supabase
        .from("conversation_participants")
        .select("user_id, last_read_at")
        .eq("conversation_id", conv.id)

      const otherUserId = members?.find((m) => m.user_id !== user.id)?.user_id
      const myLastRead = members?.find((m) => m.user_id === user.id)?.last_read_at

      let otherProfile = null
      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, email")
          .eq("id", otherUserId)
          .single()
        otherProfile = profile
      }

      // Count unread messages
      let unreadCount = 0
      if (myLastRead) {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .gt("created_at", myLastRead)
        unreadCount = count ?? 0
      } else {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
        unreadCount = count ?? 0
      }

      return {
        ...conv,
        other_user: otherProfile,
        unread_count: unreadCount,
      }
    })
  )

  return { data: enriched, error: null }
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Voce precisa estar logado." }

  // Verify user is participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!participant) return { data: null, error: "Voce nao participa desta conversa." }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) return { data: null, error: "Erro ao carregar mensagens." }

  // Update last_read_at
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)

  return { data: messages, error: null }
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  if (!content.trim()) return { error: "Mensagem vazia." }

  // Verify user is participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!participant) return { error: "Voce nao participa desta conversa." }

  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
    message_type: "text",
    status: "sent",
  })

  if (msgError) {
    console.error("Send message error:", msgError.message)
    return { error: "Erro ao enviar mensagem." }
  }

  // Update conversation last_message
  await supabase
    .from("conversations")
    .update({
      last_message: content.trim().slice(0, 100),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  // Update sender's last_read_at
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)

  return { error: null }
}

export async function createConversation(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Voce precisa estar logado." }

  if (otherUserId === user.id) return { data: null, error: "Nao pode conversar consigo mesmo." }

  // Check if conversation already exists between these two users
  const { data: myConvos } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id)

  if (myConvos?.length) {
    const myConvoIds = myConvos.map((c) => c.conversation_id)
    const { data: existing } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvoIds)

    if (existing?.length) {
      return { data: existing[0].conversation_id, error: null }
    }
  }

  // Create new conversation
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single()

  if (convErr || !conv) return { data: null, error: "Erro ao criar conversa." }

  // Add both participants
  const { error: partErr } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ])

  if (partErr) {
    console.error("Add participants error:", partErr.message)
    return { data: null, error: "Erro ao adicionar participantes." }
  }

  return { data: conv.id, error: null }
}

export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Voce precisa estar logado." }

  if (!query.trim() || query.trim().length < 2) return { data: [], error: null }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .neq("id", user.id)
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  if (error) return { data: null, error: "Erro ao buscar usuarios." }

  return { data: users, error: null }
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Voce precisa estar logado." }

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)

  return { error: null }
}

// ── Vibecoder Profile Actions ─────────────────────────────────────────

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
