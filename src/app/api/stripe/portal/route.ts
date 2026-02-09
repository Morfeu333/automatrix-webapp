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

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Nenhuma assinatura ativa encontrada" },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Stripe indisponivel" }, { status: 503 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getAppUrl()}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Stripe portal error:", err)
    return NextResponse.json(
      { error: "Erro ao acessar portal de pagamento" },
      { status: 500 }
    )
  }
}
