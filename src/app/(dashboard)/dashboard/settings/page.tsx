import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { SettingsClient } from "./settings-client"

export const metadata: Metadata = {
  title: "Configuracoes - Automatrix",
  description: "Edite seu perfil e configuracoes da sua conta Automatrix.",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  let vibecoderProfile = null
  if (profile?.role === "vibecoder") {
    const { data: vc } = await supabase
      .from("vibecoders")
      .select("*")
      .eq("user_id", user.id)
      .single()
    vibecoderProfile = vc
  }

  return (
    <SettingsClient
      profile={profile}
      vibecoderProfile={vibecoderProfile}
      email={user.email ?? ""}
    />
  )
}
