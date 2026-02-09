import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsClient } from "./notifications-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notificacoes - Automatrix",
  description: "Suas notificacoes e alertas da plataforma.",
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, read, link, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) console.error("Notifications fetch error:", error.message)

  return <NotificationsClient notifications={notifications ?? []} />
}
