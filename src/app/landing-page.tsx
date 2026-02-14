"use client"

import { useState, useEffect } from "react"
import { LandingHero } from "./landing-hero"
import { LandingChat } from "./landing-chat"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/types"

export function LandingPage() {
  const [view, setView] = useState<"landing" | "chat">("landing")
  const [firstMessage, setFirstMessage] = useState("")
  const [initialRole, setInitialRole] = useState<UserRole>("client")

  // If user is already authenticated (e.g. came back from OAuth or page refresh),
  // go straight to the chat view so they can continue onboarding
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setInitialRole((user.user_metadata?.role as UserRole) ?? "client")
        setView("chat")
      }
    })
  }, [])

  function handleFirstMessage(message: string, role: UserRole) {
    setFirstMessage(message)
    setInitialRole(role)
    setView("chat")
  }

  if (view === "chat") {
    return <LandingChat initialMessage={firstMessage || undefined} initialRole={initialRole} />
  }

  return <LandingHero onSubmit={handleFirstMessage} />
}
