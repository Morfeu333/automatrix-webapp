import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { TasksClient } from "./tasks-client"

export const metadata: Metadata = {
  title: "Tasks - Automatrix",
  description: "Gerenciamento de tarefas da agencia.",
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tasks } = await supabase
    .from("agency_tasks")
    .select("id, name, status, type, due_date, notes, person_id, client_id, created_at")
    .order("created_at", { ascending: false })

  const { data: clients } = await supabase
    .from("agency_clients")
    .select("id, name")

  const clientMap = (clients ?? []).reduce((acc, c) => {
    acc[c.id] = c.name
    return acc
  }, {} as Record<string, string>)

  const enrichedTasks = (tasks ?? []).map((t) => ({
    ...t,
    client_name: t.client_id ? clientMap[t.client_id] ?? null : null,
    is_overdue: t.due_date ? new Date(t.due_date) < new Date() && t.status !== "Complete" : false,
  }))

  return <TasksClient tasks={enrichedTasks} />
}
