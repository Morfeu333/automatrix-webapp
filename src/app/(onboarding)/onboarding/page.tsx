import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { LearnerWelcome } from "./learner-welcome"
import { VibecoderWizard } from "./vibecoder-wizard"
import { ClientOnboarding } from "./client-onboarding"

export const metadata: Metadata = {
  title: "Onboarding - Automatrix",
  description: "Configure seu perfil e comece a usar a Automatrix.",
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")
  if (profile.onboarding_completed) redirect("/dashboard")

  const displayName = profile.full_name || user.email?.split("@")[0] || "Usuario"

  switch (profile.role) {
    case "vibecoder": {
      const { data: vc } = await supabase
        .from("vibecoders")
        .select("github_url, portfolio_urls, tools, frameworks, hourly_rate, hours_per_week, timezone, skills, resume_url, video_url")
        .eq("user_id", user.id)
        .single()

      return (
        <VibecoderWizard
          displayName={displayName}
          userId={user.id}
          existingProfile={{
            full_name: profile.full_name,
            email: profile.email ?? user.email ?? "",
          }}
          existingVibecoder={vc ? { ...vc, skills: (vc.skills as Record<string, number> | null) } : null}
        />
      )
    }

    case "client":
      return (
        <ClientOnboarding
          displayName={displayName}
          userId={user.id}
          existingProfile={{
            full_name: profile.full_name,
            email: profile.email ?? user.email ?? "",
          }}
        />
      )

    default:
      return <LearnerWelcome displayName={displayName} />
  }
}
