import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { Metadata } from "next"
import { ClientDetail } from "./client-detail"

export const metadata: Metadata = {
  title: "Detalhe do Cliente - Automatrix",
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Handle "me" alias for client role
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

  const [clientRes, tasksRes, contactsRes, meetingsRes, timelineRes] = await Promise.all([
    supabase
      .from("agency_clients")
      .select("*")
      .eq("id", clientId)
      .single(),
    supabase
      .from("agency_tasks")
      .select("id, name, status, type, due_date, notes, person_id")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("agency_client_contacts")
      .select("contact_id, agency_contacts(id, name, type, email, phone, role_title)")
      .eq("client_id", clientId),
    supabase
      .from("agency_meetings")
      .select("id, name, type, date, notes, recording_url")
      .eq("client_id", clientId)
      .order("date", { ascending: false }),
    supabase
      .from("project_build_timeline")
      .select("id, name, status, description, due_date, sort_order")
      .eq("client_id", clientId)
      .order("sort_order", { ascending: true }),
  ])

  if (!clientRes.data) notFound()

  // Extract contacts from the join
  const contacts = (contactsRes.data ?? [])
    .map((row) => (row as { agency_contacts: unknown }).agency_contacts)
    .filter(Boolean) as Array<{ id: string; name: string; type: string[]; email: string | null; phone: string | null; role_title: string | null }>

  return (
    <ClientDetail
      client={clientRes.data}
      tasks={tasksRes.data ?? []}
      contacts={contacts}
      meetings={meetingsRes.data ?? []}
      timeline={timelineRes.data ?? []}
    />
  )
}
