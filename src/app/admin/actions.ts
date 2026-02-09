"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, error: "Nao autenticado." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") return { supabase: null, error: "Sem permissao." }
  return { supabase, error: null }
}

export async function changeUserRole(userId: string, newRole: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError || !supabase) return { error: authError ?? "Erro de autenticacao." }

  const validRoles = ["admin", "client", "vibecoder", "learner"] as const
  type ValidRole = typeof validRoles[number]
  if (!validRoles.includes(newRole as ValidRole)) return { error: "Role invalida." }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole as ValidRole })
    .eq("id", userId)

  if (error) {
    console.error("Change role error:", error.message)
    return { error: "Erro ao alterar role." }
  }

  revalidatePath("/admin")
  return { error: null }
}

export async function changeUserTier(userId: string, newTier: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError || !supabase) return { error: authError ?? "Erro de autenticacao." }

  const validTiers = ["free", "pro", "business"] as const
  type ValidTier = typeof validTiers[number]
  if (!validTiers.includes(newTier as ValidTier)) return { error: "Tier invalida." }

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_tier: newTier as ValidTier })
    .eq("id", userId)

  if (error) {
    console.error("Change tier error:", error.message)
    return { error: "Erro ao alterar tier." }
  }

  revalidatePath("/admin")
  return { error: null }
}

export async function approveVibecoder(vibecoderId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError || !supabase) return { error: authError ?? "Erro de autenticacao." }

  const { error } = await supabase
    .from("vibecoders")
    .update({ approval_status: "approved" })
    .eq("id", vibecoderId)

  if (error) {
    console.error("Approve vibecoder error:", error.message)
    return { error: "Erro ao aprovar vibecoder." }
  }

  revalidatePath("/admin")
  return { error: null }
}

export async function rejectVibecoder(vibecoderId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError || !supabase) return { error: authError ?? "Erro de autenticacao." }

  const { error } = await supabase
    .from("vibecoders")
    .update({ approval_status: "rejected" })
    .eq("id", vibecoderId)

  if (error) {
    console.error("Reject vibecoder error:", error.message)
    return { error: "Erro ao rejeitar vibecoder." }
  }

  revalidatePath("/admin")
  return { error: null }
}
