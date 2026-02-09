import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UpgradeGate } from "@/components/ui/upgrade-gate"
import ChatClient from "./chat-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mensagens - Automatrix",
  description: "Converse com outros usuarios da plataforma Automatrix.",
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single()

  const tier = profile?.subscription_tier ?? "free"

  return (
    <UpgradeGate requiredTier="pro" currentTier={tier} featureName="Mensagens Diretas">
      <ChatClient />
    </UpgradeGate>
  )
}
