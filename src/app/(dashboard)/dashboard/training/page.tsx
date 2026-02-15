import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { TrainingClient } from "./training-client"

export const metadata: Metadata = { title: "Treinamento - Automatrix" }

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: resources } = await supabase
    .from("training_resources")
    .select("id, name, video_url, description, category, created_at")
    .order("created_at", { ascending: false })

  return <TrainingClient resources={resources ?? []} />
}
