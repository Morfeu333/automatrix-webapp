import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ClientsKanban } from "./clients-kanban"

export const metadata: Metadata = {
  title: "Clientes - Automatrix",
  description: "Kanban de clientes da agencia.",
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // Client role: redirect to their own client page
  if (profile?.role === "client") {
    const { data: myClient } = await supabase
      .from("agency_clients")
      .select("id")
      .eq("profile_id", user.id)
      .single()
    if (myClient) redirect(`/dashboard/clients/${myClient.id}`)
    redirect("/dashboard")
  }

  const { data: clients } = await supabase
    .from("agency_clients")
    .select("id, name, client_status, plan, assigned_to, country, industry, monthly_retainer, created_at, updated_at")
    .order("created_at", { ascending: false })

  return <ClientsKanban clients={clients ?? []} />
}
