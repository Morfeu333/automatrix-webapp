import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AgencyHomeClient } from "./agency-home-client"

export const metadata: Metadata = {
  title: "Agency Home - Automatrix",
  description: "Painel principal da agencia. Visao geral de clientes, tasks e metricas.",
}

export default async function AgencyHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "vibecoder")) {
    redirect("/dashboard")
  }

  const displayName = profile.full_name || user.email?.split("@")[0] || "Usuario"

  // Fetch summary data in parallel
  const [clientsRes, tasksRes, meetingsRes, overdueRes] = await Promise.all([
    supabase
      .from("agency_clients")
      .select("id, name, client_status, plan, assigned_to, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("agency_tasks")
      .select("id, name, status, type, due_date, client_id, person_id")
      .neq("status", "Complete")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(10),
    supabase
      .from("agency_meetings")
      .select("id, name, type, date, client_id")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(5),
    supabase
      .from("agency_tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", new Date().toISOString().split("T")[0])
      .neq("status", "Complete"),
  ])

  // Count stats
  const { count: totalClients } = await supabase
    .from("agency_clients")
    .select("id", { count: "exact", head: true })

  const { count: totalTasks } = await supabase
    .from("agency_tasks")
    .select("id", { count: "exact", head: true })
    .neq("status", "Complete")

  return (
    <AgencyHomeClient
      displayName={displayName}
      stats={{
        totalClients: totalClients ?? 0,
        activeTasks: totalTasks ?? 0,
        overdueTasks: overdueRes.count ?? 0,
        upcomingMeetings: meetingsRes.data?.length ?? 0,
      }}
      recentClients={clientsRes.data ?? []}
      pendingTasks={tasksRes.data ?? []}
      upcomingMeetings={meetingsRes.data ?? []}
    />
  )
}
