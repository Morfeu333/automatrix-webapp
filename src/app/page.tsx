import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LandingPage } from "./landing-page"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()

    // Onboarding complete → go to dashboard
    if (profile?.onboarding_completed !== false) {
      redirect("/dashboard")
    }

    // Onboarding NOT complete → stay on landing/chat (the chat IS the onboarding)
  }

  return <LandingPage />
}
