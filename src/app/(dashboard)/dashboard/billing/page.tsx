import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Assinatura - Automatrix",
  description: "Gerencie sua assinatura e pagamentos.",
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single()

  const tier = profile?.subscription_tier ?? "free"
  const tierLabels: Record<string, string> = { free: "Free", pro: "Pro", business: "Business" }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Assinatura</h1>

      <div className="max-w-lg rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plano Atual</p>
            <p className="text-lg font-bold text-foreground">{tierLabels[tier] ?? "Free"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Em breve: integração com Stripe para gerenciar sua assinatura.
          </p>
        </div>
      </div>
    </div>
  )
}
