import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase-generated"

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} environment variable`)
  return value
}

export function createClient() {
  return createBrowserClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  )
}
