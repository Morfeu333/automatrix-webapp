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

    if (vc) {
      vibecoderProfile = {
        github_url: vc.github_url,
        portfolio_urls: vc.portfolio_urls,
        tools: vc.tools,
        frameworks: vc.frameworks,
        hourly_rate: vc.hourly_rate,
        hours_per_week: vc.hours_per_week,
        timezone: vc.timezone,
        approval_status: vc.approval_status,
        connect_status: vc.connect_status,
        skills: (vc.skills as Record<string, number> | null) ?? null,
      }
    }
  }

  return (
    <SettingsClient
      profile={profile}
      vibecoderProfile={vibecoderProfile}
      email={user.email ?? ""}
      userId={user.id}
    />
  )
}
