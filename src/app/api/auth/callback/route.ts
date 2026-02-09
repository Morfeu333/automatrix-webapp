import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SAFE_REDIRECT_PATHS = [
  "/dashboard",
  "/chat",
  "/settings",
  "/admin",
  "/workflows",
  "/projects",
  "/agents",
  "/blog",
  "/pricing",
]

function isValidRedirect(path: string): boolean {
  return SAFE_REDIRECT_PATHS.some((safe) => path === safe || path.startsWith(safe + "/"))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next = isValidRedirect(rawNext) ? rawNext : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("OAuth code exchange error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Codigo de autenticacao ausente")}`)
}
