import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard, Calendar, AlertCircle } from "lucide-react"
import type { Metadata } from "next"
import { ManageSubscriptionButton } from "./manage-subscription-button"

export const metadata: Metadata = {
  title: "Assinatura - Automatrix",
  description: "Gerencie sua assinatura e pagamentos.",
}

const tierLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
}

const statusLabels: Record<string, string> = {
  active: "Ativa",
  past_due: "Pagamento Pendente",
  canceled: "Cancelada",
  trialing: "Periodo de Teste",
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  past_due: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  canceled: "bg-red-500/10 text-red-500 border-red-500/20",
  trialing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("tier, status, current_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, status, created_at")
    .eq("user_id", user.id)
    .eq("payment_type", "subscription")
    .order("created_at", { ascending: false })
    .limit(10)

  const tier = subscription?.tier ?? "free"
  const status = subscription?.status ?? "active"
  const periodEnd = subscription?.current_period_end
  const hasStripeCustomer = !!subscription?.stripe_customer_id

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Assinatura</h1>

      <div className="max-w-2xl rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-xl font-bold text-foreground">{tierLabels[tier] ?? "Free"}</p>
            </div>
          </div>

          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[status] ?? statusColors.active}`}>
            {statusLabels[status] ?? "Ativa"}
          </span>
        </div>

        {periodEnd && tier !== "free" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Proxima cobranca: {new Date(periodEnd).toLocaleDateString("pt-BR")}</span>
          </div>
        )}

        {status === "past_due" && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Seu pagamento esta pendente. Atualize seu metodo de pagamento para evitar interrupcao do servico.</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {hasStripeCustomer && tier !== "free" && (
            <ManageSubscriptionButton />
          )}
          {tier === "free" && (
            <a
              href="/pricing"
              className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
            >
              Fazer Upgrade
            </a>
          )}
        </div>
      </div>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <div className="mt-8 max-w-2xl">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Historico de Pagamentos</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Valor</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      R$ {Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : payment.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : payment.status === "failed"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-muted text-muted-foreground"
                      }`}>
                        {payment.status === "completed" ? "Pago" :
                         payment.status === "pending" ? "Pendente" :
                         payment.status === "failed" ? "Falhou" : "Reembolsado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
