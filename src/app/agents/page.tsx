import { AgentsClient } from "./agents-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agentes IA - Automatrix",
  description: "Converse com agentes IA especializados em N8N, Supabase, codigo e automacao.",
}

export default function AgentsPage() {
  return <AgentsClient />
}
