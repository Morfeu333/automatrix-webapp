import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn("STRIPE_SECRET_KEY not configured")
    return null
  }

  stripeInstance = new Stripe(key, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  })

  return stripeInstance
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3333"
}

export function getPriceIds() {
  return {
    pro: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
    business: process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY || "",
  }
}
