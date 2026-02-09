import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getStripe } from "@/lib/stripe"
import type { Database } from "@/types/supabase-generated"
import type Stripe from "stripe"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) throw new Error("Missing Supabase env vars for webhook")

  return createClient<Database>(url, key)
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "active" | "past_due" | "canceled" | "trialing" {
  switch (status) {
    case "active":
      return "active"
    case "trialing":
      return "trialing"
    case "past_due":
      return "past_due"
    default:
      return "canceled"
  }
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    console.error("Stripe webhook config missing")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = getAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.user_id
          const tier = session.metadata?.tier as "pro" | "business" | undefined

          if (!userId || !tier) break

          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier,
            status: "active",
          })

          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId)
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end?: number
        }
        const dbStatus = mapStripeStatus(subscription.status)

        // Find user by subscription ID
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (!sub) break

        const tier = dbStatus === "canceled" ? "free" : undefined
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : undefined

        await supabase
          .from("user_subscriptions")
          .update({
            status: dbStatus,
            ...(tier && { tier }),
            ...(periodEnd && { current_period_end: periodEnd }),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (tier) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", sub.user_id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | null
          billing_reason?: string | null
          payment_intent?: string | null
          amount_paid?: number
        }

        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          const { data: sub } = await supabase
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single()

          if (sub) {
            await supabase.from("payments").insert({
              user_id: sub.user_id,
              stripe_payment_id: (invoice.payment_intent as string) || null,
              amount: (invoice.amount_paid ?? 0) / 100,
              currency: "brl",
              payment_type: "subscription",
              status: "completed",
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | null
        }

        if (invoice.subscription) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string)
        }
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        const vibecoderId = account.metadata?.vibecoder_id

        if (!vibecoderId) break

        const isActive = account.charges_enabled && account.payouts_enabled
        const connectStatus = isActive
          ? "active"
          : account.requirements?.disabled_reason
            ? "disabled"
            : "pending"

        await supabase
          .from("vibecoders")
          .update({ connect_status: connectStatus })
          .eq("id", vibecoderId)
        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ received: true })
  }
}
