import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { DailyReportClient } from "./daily-report-client"

export const metadata: Metadata = { title: "Daily Report - Automatrix" }

export default async function DailyReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("id, name, tags, report_date, created_by, created_at")
    .order("report_date", { ascending: false })
    .limit(30)

  return <DailyReportClient reports={reports ?? []} />
}
