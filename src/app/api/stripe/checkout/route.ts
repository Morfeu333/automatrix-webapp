import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe, isStripeConfigured, getAppUrl, getPriceIds } from "@/lib/stripe"

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe nao configurado. Entre em contato com suporte." },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }
  const tier = body.tier as string

  if (tier !== "pro" && tier !== "business") {
    return NextResponse.json({ error: "Plano invalido" }, { status: 400 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Stripe indisponivel" }, { status: 503 })
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single()

    const customer = await stripe.customers.create({
      email: profile?.email || user.email || undefined,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    })

    customerId = customer.id

    const { error: upsertErr } = await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      tier: "free",
      status: "active",
    })

    if (upsertErr) {
      console.error("Checkout subscription upsert error:", upsertErr.message)
      return NextResponse.json({ error: "Erro ao preparar assinatura" }, { status: 500 })
    }
  }

  const priceIds = getPriceIds()
  const priceId = tier === "pro" ? priceIds.pro : priceIds.business

  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID para plano ${tier} nao configurado` },
      { status: 500 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getAppUrl()}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/pricing?canceled=true`,
      metadata: { user_id: user.id, tier },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json(
      { error: "Erro ao criar sessao de pagamento" },
      { status: 500 }
    )
  }
}
