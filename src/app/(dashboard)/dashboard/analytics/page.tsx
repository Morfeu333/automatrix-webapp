import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AnalyticsClient } from "./analytics-client"

export const metadata: Metadata = { title: "Analytics - Automatrix" }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [clientsRes, tasksRes, meetingsRes, completedRes, blockedRes] = await Promise.all([
    supabase.from("agency_clients").select("id, client_status, created_at"),
    supabase.from("agency_tasks").select("id, status, type, person_id"),
    supabase.from("agency_meetings").select("id, type, date"),
    supabase.from("agency_tasks").select("id", { count: "exact", head: true }).eq("status", "Complete"),
    supabase.from("agency_tasks").select("id", { count: "exact", head: true }).eq("status", "BLOCKED"),
  ])

  const clients = clientsRes.data ?? []
  const tasks = tasksRes.data ?? []

  // Status distribution
  const clientsByStatus = clients.reduce((acc, c) => {
    acc[c.client_status] = (acc[c.client_status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tasksByStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AnalyticsClient
      stats={{
        totalClients: clients.length,
        totalTasks: tasks.length,
        completedTasks: completedRes.count ?? 0,
        blockedTasks: blockedRes.count ?? 0,
        totalMeetings: meetingsRes.data?.length ?? 0,
      }}
      clientsByStatus={clientsByStatus}
      tasksByStatus={tasksByStatus}
    />
  )
}
