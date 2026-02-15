import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AudiencesClient } from "./audiences-client"

export const metadata: Metadata = { title: "Audiences - Automatrix" }

export default async function AudiencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: audiences } = await supabase
    .from("audiences")
    .select("id, audience_name, date, geo, company_keywords_broad, titles_broad, links, gpt_url, client_id, created_at")
    .order("created_at", { ascending: false })

  const { data: clients } = await supabase.from("agency_clients").select("id, name")
  const clientMap = (clients ?? []).reduce((acc, c) => { acc[c.id] = c.name; return acc }, {} as Record<string, string>)

  const enriched = (audiences ?? []).map((a) => ({
    ...a,
    client_name: a.client_id ? clientMap[a.client_id] ?? null : null,
  }))

  return <AudiencesClient audiences={enriched} />
}
