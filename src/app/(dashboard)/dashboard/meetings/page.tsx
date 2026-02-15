import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { MeetingsClient } from "./meetings-client"

export const metadata: Metadata = { title: "Reunioes - Automatrix" }

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: meetings } = await supabase
    .from("agency_meetings")
    .select("id, name, type, date, notes, recording_url, client_id, created_at")
    .order("date", { ascending: false })

  const { data: clients } = await supabase.from("agency_clients").select("id, name")
  const clientMap = (clients ?? []).reduce((acc, c) => { acc[c.id] = c.name; return acc }, {} as Record<string, string>)

  const enriched = (meetings ?? []).map((m) => ({
    ...m,
    client_name: m.client_id ? clientMap[m.client_id] ?? null : null,
  }))

  return <MeetingsClient meetings={enriched} />
}
