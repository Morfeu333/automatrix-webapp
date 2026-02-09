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
          const validTiers = ["pro", "business"] as const

          if (!userId || !tier || !validTiers.includes(tier)) {
            console.error(`Webhook ${event.id}: checkout.session.completed missing/invalid metadata`, {
              userId, tier, sessionId: session.id,
            })
            return NextResponse.json({ error: "Missing metadata" }, { status: 500 })
          }

          const { error: upsertErr } = await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier,
            status: "active",
          })

          if (upsertErr) {
            console.error(`Webhook ${event.id}: user_subscriptions upsert failed:`, upsertErr.message)
            return NextResponse.json({ error: "DB write failed" }, { status: 500 })
          }

          const { error: profileErr } = await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId)

          if (profileErr) {
            console.error(`Webhook ${event.id}: profiles tier update failed:`, profileErr.message)
            return NextResponse.json({ error: "DB write failed" }, { status: 500 })
          }
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end?: number
        }
        const dbStatus = mapStripeStatus(subscription.status)

        const { data: sub, error: subLookupErr } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subLookupErr || !sub) {
          console.error(`Webhook ${event.id}: subscription ${subscription.id} not found in DB`, subLookupErr?.message)
          return NextResponse.json({ error: "Subscription not found" }, { status: 500 })
        }

        const tier = dbStatus === "canceled" ? "free" : undefined
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : undefined

        const { error: subUpdateErr } = await supabase
          .from("user_subscriptions")
          .update({
            status: dbStatus,
            ...(tier && { tier }),
            ...(periodEnd && { current_period_end: periodEnd }),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (subUpdateErr) {
          console.error(`Webhook ${event.id}: subscription update failed:`, subUpdateErr.message)
          return NextResponse.json({ error: "DB write failed" }, { status: 500 })
        }

        if (tier) {
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", sub.user_id)

          if (profileErr) {
            console.error(`Webhook ${event.id}: profile tier downgrade failed:`, profileErr.message)
            return NextResponse.json({ error: "DB write failed" }, { status: 500 })
          }
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
            const { error: paymentErr } = await supabase.from("payments").insert({
              user_id: sub.user_id,
              stripe_payment_id: (invoice.payment_intent as string) || null,
              amount: (invoice.amount_paid ?? 0) / 100,
              currency: "usd",
              payment_type: "subscription",
              status: "completed",
            })

            if (paymentErr) {
              console.error(`Webhook ${event.id}: payment insert failed:`, paymentErr.message)
              return NextResponse.json({ error: "DB write failed" }, { status: 500 })
            }
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | null
        }

        if (invoice.subscription) {
          const { error: updateErr } = await supabase
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string)

          if (updateErr) {
            console.error(`Webhook ${event.id}: past_due update failed:`, updateErr.message)
            return NextResponse.json({ error: "DB write failed" }, { status: 500 })
          }
        }
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        const vibecoderId = account.metadata?.vibecoder_id

        if (!vibecoderId) {
          console.warn(`Webhook ${event.id}: account.updated missing vibecoder_id metadata`)
          break
        }

        const isActive = account.charges_enabled && account.payouts_enabled
        const connectStatus = isActive
          ? "active"
          : account.requirements?.disabled_reason
            ? "disabled"
            : "pending"

        const { error: connectErr } = await supabase
          .from("vibecoders")
          .update({ connect_status: connectStatus })
          .eq("id", vibecoderId)

        if (connectErr) {
          console.error(`Webhook ${event.id}: vibecoder connect_status update failed:`, connectErr.message)
          return NextResponse.json({ error: "DB write failed" }, { status: 500 })
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`Webhook ${event.id} handler error:`, err)
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 })
  }
}
