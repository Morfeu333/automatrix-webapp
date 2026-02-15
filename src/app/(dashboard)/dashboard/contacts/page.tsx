import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ContactsClient } from "./contacts-client"

export const metadata: Metadata = { title: "Contatos - Automatrix" }

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: contacts } = await supabase
    .from("agency_contacts")
    .select("id, name, type, email, phone, role_title, time_zone, created_at")
    .order("name", { ascending: true })

  return <ContactsClient contacts={contacts ?? []} />
}
