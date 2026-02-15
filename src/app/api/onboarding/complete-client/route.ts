import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Json } from "@/types/supabase-generated"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    projectScope?: Record<string, unknown>
  }

  // Get profile for name/company info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company, website, role, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Only clients should auto-create agency_client
  if (profile.role !== "client") {
    // Just mark onboarding complete for non-client roles
    if (!profile.onboarding_completed) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id)
    }
    return NextResponse.json({ success: true })
  }

  // Mark onboarding as complete
  if (!profile.onboarding_completed) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id)
  }

  const scopeAsJson = (body.projectScope ?? {}) as unknown as Json

  // Check if agency_client already exists for this user
  const { data: existing } = await supabase
    .from("agency_clients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle()

  if (existing) {
    // Update project_scope if provided
    if (body.projectScope && Object.keys(body.projectScope).length > 0) {
      await supabase
        .from("agency_clients")
        .update({ project_scope: scopeAsJson })
        .eq("id", existing.id)
    }
    return NextResponse.json({ success: true, clientId: existing.id })
  }

  // Create new agency_client
  const { data: newClient, error: insertError } = await supabase
    .from("agency_clients")
    .insert({
      profile_id: user.id,
      name: profile.company || profile.full_name || user.email?.split("@")[0] || "Novo Cliente",
      client_status: "Pre-Onboarding",
      project_scope: scopeAsJson,
      website: profile.website,
      comms_channel: ["email"],
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("Failed to create agency_client:", insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // The trigger auto-creates 7 project_build_timeline phases

  return NextResponse.json({ success: true, clientId: newClient.id })
}
