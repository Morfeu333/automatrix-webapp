import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe, isStripeConfigured, getAppUrl } from "@/lib/stripe"

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe nao configurado" },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const { data: vibecoder } = await supabase
    .from("vibecoders")
    .select("id, stripe_connect_id, connect_status, approval_status")
    .eq("user_id", user.id)
    .single()

  if (!vibecoder) {
    return NextResponse.json(
      { error: "Perfil de Vibecoder nao encontrado" },
      { status: 404 }
    )
  }

  if (vibecoder.approval_status !== "approved") {
    return NextResponse.json(
      { error: "Seu perfil de Vibecoder precisa ser aprovado primeiro" },
      { status: 403 }
    )
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Stripe indisponivel" }, { status: 503 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single()

  let accountId = vibecoder.stripe_connect_id

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: profile?.email || user.email || undefined,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          supabase_user_id: user.id,
          vibecoder_id: vibecoder.id,
        },
      })

      accountId = account.id

      const { error: updateErr } = await supabase.from("vibecoders").update({
        stripe_connect_id: accountId,
        connect_status: "pending",
      }).eq("id", vibecoder.id)

      if (updateErr) {
        console.error("Stripe Connect vibecoder update error:", updateErr.message)
        return NextResponse.json(
          { error: "Erro ao vincular conta Stripe ao perfil" },
          { status: 500 }
        )
      }
    } catch (err) {
      console.error("Stripe Connect create error:", err)
      return NextResponse.json(
        { error: "Erro ao criar conta Stripe Connect" },
        { status: 500 }
      )
    }
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${getAppUrl()}/dashboard/settings?tab=vibecoder&connect=refresh`,
      return_url: `${getAppUrl()}/dashboard/settings?tab=vibecoder&connect=success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error("Stripe account link error:", err)
    return NextResponse.json(
      { error: "Erro ao gerar link de configuracao" },
      { status: 500 }
    )
  }
}
