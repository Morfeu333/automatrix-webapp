import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { Metadata } from "next"
import { ClientPortal } from "./client-portal"

export const metadata: Metadata = {
  title: "Portal do Cliente - Automatrix",
}

export default async function ClientPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Handle "me" alias
  let clientId = id
  if (id === "me") {
    const { data: myClient } = await supabase
      .from("agency_clients")
      .select("id")
      .eq("profile_id", user.id)
      .single()
    if (!myClient) redirect("/dashboard")
    clientId = myClient.id
  }

  const [clientRes, timelineRes, credsRes] = await Promise.all([
    supabase
      .from("agency_clients")
      .select("id, name, client_status, project_scope, comms_channel, website")
      .eq("id", clientId)
      .single(),
    supabase
      .from("project_build_timeline")
      .select("id, name, status, description, due_date, assigned_to, notes, sort_order")
      .eq("client_id", clientId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("client_login_creds")
      .select("id, software_name, email, password_encrypted")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true }),
  ])

  if (!clientRes.data) notFound()

  return (
    <ClientPortal
      client={{
        ...clientRes.data,
        project_scope: (clientRes.data.project_scope as Record<string, unknown>) ?? {},
      }}
      timeline={timelineRes.data ?? []}
      creds={credsRes.data ?? []}
    />
  )
}
