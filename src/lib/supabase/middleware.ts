import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/supabase-generated"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables")
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          )
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // If getUser fails due to a server error (not auth error), allow the request through
  if (userError && userError.status !== 401 && userError.status !== 403) {
    console.error("Middleware getUser error:", userError.message)
    return supabaseResponse
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/chat", "/settings", "/admin"]
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin-only routes - check role
  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // DB error — don't deny admin access, let the page handle it
      console.error("Middleware admin profile check error:", profileError.message)
      return supabaseResponse
    }

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // Subscription tier gating - Pro+ required for certain routes
  const proRequiredPaths = ["/dashboard/projects/new"]
  const isProRequired = proRequiredPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProRequired && user) {
    const { data: tierProfile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const tier = tierProfile?.subscription_tier ?? "free"

    if (tier === "free") {
      const url = request.nextUrl.clone()
      url.pathname = "/pricing"
      url.searchParams.set("upgrade", "pro")
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/register"]
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
