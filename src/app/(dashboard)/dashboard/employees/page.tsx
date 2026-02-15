import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { EmployeesClient } from "./employees-client"

export const metadata: Metadata = { title: "Equipe - Automatrix" }

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employees } = await supabase
    .from("employees")
    .select("id, profile_id, job_title, department, location, start_date, phone_number, created_at")
    .order("created_at", { ascending: false })

  // Get profile info for each employee
  const profileIds = (employees ?? []).map((e) => e.profile_id).filter(Boolean)
  const { data: profiles } = profileIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", profileIds)
    : { data: [] }

  const profileMap = (profiles ?? []).reduce((acc, p) => { acc[p.id] = p; return acc }, {} as Record<string, { full_name: string | null; email: string; avatar_url: string | null }>)

  const enriched = (employees ?? []).map((e) => ({
    ...e,
    full_name: profileMap[e.profile_id]?.full_name ?? null,
    email: profileMap[e.profile_id]?.email ?? null,
    avatar_url: profileMap[e.profile_id]?.avatar_url ?? null,
  }))

  return <EmployeesClient employees={enriched} />
}
